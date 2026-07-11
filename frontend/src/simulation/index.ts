/* ──────────────────────────────────────────
   Simulation Store
   Central Zustand store that drives the entire Deluge UI.
   Orchestrates flood engine, vehicle engine, and derived stats.
   ────────────────────────────────────────── */

import { create } from 'zustand';
import type { SimulationState, FloodCell, RoadSegment, Vehicle, Shelter, Infrastructure, Mission, SimAlert } from './types';
import { tickFloodCells, updateRoadStatuses, generateFloodAlerts } from './floodEngine';
import { tickVehicles } from './vehicleEngine';
import {
  INITIAL_FLOOD_CELLS,
  INITIAL_ROADS,
  INITIAL_VEHICLES,
  INITIAL_SHELTERS,
  INITIAL_INFRASTRUCTURE,
  INITIAL_MISSIONS,
  INITIAL_ALERTS,
} from './initialData';

function computeStats(state: {
  vehicles: Vehicle[];
  missions: Mission[];
  roads: RoadSegment[];
  shelters: Shelter[];
}) {
  const activeUnits = state.vehicles.filter(
    (v) => v.status === 'en_route' || v.status === 'on_scene',
  ).length;
  const openMissions = state.missions.filter(
    (m) => m.status !== 'complete',
  ).length;
  const roadsFlooded = state.roads.filter(
    (r) => r.status === 'flooded' || r.status === 'blocked',
  ).length;
  const atRisk = state.roads.filter((r) => r.status === 'at_risk').length + roadsFlooded;
  const totalCapacity = state.shelters.reduce((sum, s) => sum + s.capacity, 0);
  const totalOccupancy = state.shelters.reduce((sum, s) => sum + s.currentOccupancy, 0);
  const shelterCapacity = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  return {
    activeUnits,
    openMissions,
    atRisk,
    evacuated: totalOccupancy,
    roadsFlooded,
    shelterCapacity,
  };
}

function computeSeverity(time: number): 'nominal' | 'elevated' | 'critical' {
  if (time > 75) return 'critical';
  if (time > 40) return 'elevated';
  return 'nominal';
}

interface SimulationActions {
  /** Advance the simulation by one tick */
  tick: () => void;
  /** Start/stop simulation */
  setRunning: (val: boolean) => void;
  /** Set simulation speed */
  setSpeed: (speed: number) => void;
  /** Jump to a specific time */
  seekTo: (time: number) => void;
  /** Reset to initial state */
  reset: () => void;
  /** Acknowledge an alert */
  acknowledgeAlert: (id: string) => void;
}

const initialState: SimulationState = {
  time: 0,
  isRunning: false,
  speed: 1,
  severity: 'nominal',
  floodCells: INITIAL_FLOOD_CELLS,
  roads: INITIAL_ROADS,
  vehicles: INITIAL_VEHICLES,
  shelters: INITIAL_SHELTERS,
  infrastructure: INITIAL_INFRASTRUCTURE,
  missions: INITIAL_MISSIONS,
  alerts: INITIAL_ALERTS,
  stats: computeStats({
    vehicles: INITIAL_VEHICLES,
    missions: INITIAL_MISSIONS,
    roads: INITIAL_ROADS,
    shelters: INITIAL_SHELTERS,
  }),
};

export const useSimulationStore = create<SimulationState & SimulationActions>((set, get) => ({
  ...initialState,

  tick: () => {
    const state = get();
    if (!state.isRunning || state.time >= 100) {
      if (state.time >= 100) set({ isRunning: false });
      return;
    }

    const newTime = Math.min(state.time + 0.5 * state.speed, 100);

    // 1. Advance flood cells
    const newFloodCells = tickFloodCells(state.floodCells, newTime);

    // 2. Update road statuses
    const prevRoads = state.roads;
    const newRoads = updateRoadStatuses(state.roads, newFloodCells, newTime);

    // 3. Move vehicles
    const newVehicles = tickVehicles(state.vehicles);

    // 4. Update shelters (intake simulation)
    const newShelters = state.shelters.map((s) => {
      if (s.status === 'at_capacity' || !s.accessible) return s;
      const newOccupancy = Math.min(s.currentOccupancy + s.intakeRate * 0.1, s.capacity);
      const newStatus = newOccupancy >= s.capacity * 0.95 ? 'at_capacity' as const : s.status;
      return { ...s, currentOccupancy: Math.round(newOccupancy), status: newStatus };
    });

    // 5. Update mission ETAs
    const newMissions = state.missions.map((m) => {
      if (m.status === 'complete') return m;
      if (m.eta !== null && m.eta > 0) {
        const newEta = Math.max(0, m.eta - 0.05 * state.speed);
        if (newEta <= 0) {
          return { ...m, eta: 0, status: 'complete' as const, completedAt: newTime };
        }
        return { ...m, eta: Math.round(newEta * 10) / 10 };
      }
      return m;
    });

    // 6. Generate new alerts
    const newAlerts = generateFloodAlerts(newFloodCells, newRoads, prevRoads, newTime);
    const existingAlertIds = new Set(state.alerts.map((a) => a.id));
    const uniqueNewAlerts = newAlerts.filter((a) => !existingAlertIds.has(a.id));

    // 7. Update infrastructure based on flood
    const newInfra = state.infrastructure.map((inf) => {
      if (inf.id === 'infra-grid-delta' && newTime > 15) {
        return { ...inf, status: 'offline' as const, detail: 'Submerged · 0 MW' };
      }
      if (inf.id === 'infra-bridge' && newTime > 45) {
        return { ...inf, status: 'offline' as const, detail: 'Collapsed · Impassable' };
      }
      return inf;
    });

    const severity = computeSeverity(newTime);
    const stats = computeStats({
      vehicles: newVehicles,
      missions: newMissions,
      roads: newRoads,
      shelters: newShelters,
    });

    set({
      time: newTime,
      severity,
      floodCells: newFloodCells,
      roads: newRoads,
      vehicles: newVehicles,
      shelters: newShelters,
      infrastructure: newInfra,
      missions: newMissions,
      alerts: [...uniqueNewAlerts, ...state.alerts],
      stats,
    });
  },

  setRunning: (val) => {
    const state = get();
    if (val && state.time >= 100) {
      // Reset if trying to play at end
      get().reset();
    }
    set({ isRunning: val });
  },

  setSpeed: (speed) => set({ speed }),

  seekTo: (time) => {
    // Re-run simulation from scratch to the target time
    const resetState = { ...initialState };
    let currentState = resetState;

    // Quick forward to desired time
    for (let t = 0; t < time; t += 0.5) {
      const newFloodCells = tickFloodCells(currentState.floodCells, t);
      const newRoads = updateRoadStatuses(currentState.roads, newFloodCells, t);
      currentState = {
        ...currentState,
        time: t,
        floodCells: newFloodCells,
        roads: newRoads,
      };
    }

    set({
      ...currentState,
      time,
      severity: computeSeverity(time),
      isRunning: false,
      stats: computeStats(currentState),
    });
  },

  reset: () => set({ ...initialState }),

  acknowledgeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a,
      ),
    })),
}));
