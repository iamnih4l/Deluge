/* ──────────────────────────────────────────
   Simulation Store
   Central Zustand store that drives the entire Deluge UI.
   Orchestrates flood engine, vehicle engine, and derived stats.
   ────────────────────────────────────────── */

import { create } from 'zustand';
import type { SimulationState, FloodCell, RoadSegment, Vehicle, Shelter, Infrastructure, Mission, SimAlert, VehicleType, LngLat } from './types';
import { tickFloodCells, updateRoadStatuses, generateFloodAlerts } from './floodEngine';
import { tickVehicles } from './vehicleEngine';
import { systemEventBus, SimEvent } from './eventBus';
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
  /** Initialize EventBus Listeners */
  initEventBusListeners: () => void;
  /** Select an entity on the map */
  setSelectedEntity: (entity: { type: 'flood' | 'road' | 'vehicle' | 'shelter' | 'infrastructure', id: string } | null) => void;
  /** Connect to the Python FastAPI backend */
  connectToServer: () => void;
  /** Send message to backend */
  sendCommand: (action: string, payload?: any) => void;
  /** Update Draft Mission */
  setDraftMission: (payload: Partial<{ type: VehicleType | null; origin: LngLat | null; destination: LngLat | null }>) => void;
  /** Set Proposed Mission */
  setProposedMission: (payload: any) => void;
  /** Toggle Layer Visibility */
  setLayerVisibility: (layer: keyof SimulationState['layerVisibility'], visible: boolean) => void;
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
  selectedEntity: null,
  draftMission: {
    type: null,
    origin: null,
    destination: null,
  },
  proposedMission: null,
  layerVisibility: {
    roads: true,
    buildings: true,
    floods: true,
    vehicles: true,
    shelters: true,
    routes: true,
  },
};

export let wsInstance: WebSocket | null = null;

export const useSimulationStore = create<SimulationState & SimulationActions>((set, get) => ({
  ...initialState,

  tick: () => {
    // Ticking is handled by the backend
  },

  setRunning: (val) => {
    get().sendCommand("set_running", { state: val });
    set({ isRunning: val }); // Optimistic update
  },

  setSpeed: (speed) => {
    get().sendCommand("set_speed", { speed });
    set({ speed });
  },

  seekTo: (time) => {
    get().sendCommand("seek", { time });
    set({ time });
  },

  reset: () => {
    get().sendCommand("reset");
  },

  acknowledgeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a,
      ),
    })),

  initEventBusListeners: () => {
    systemEventBus.subscribe('InfrastructureFailure', (event) => {
      set((state) => {
        const { infrastructureId, failureType } = event.payload;
        return {
          infrastructure: state.infrastructure.map((inf) =>
            inf.id === infrastructureId
              ? {
                  ...inf,
                  status: failureType === 'power_loss' ? 'offline' : 'compromised',
                  detail: `Failure detected via ${event.source} (Conf: ${(event.confidence * 100).toFixed(0)}%)`
                }
              : inf
          ),
          alerts: [
            {
              id: `evt-${event.id}`,
              severity: 'critical',
              title: `Infrastructure Failure: ${failureType.toUpperCase()}`,
              body: `Sensor/feed reported failure at ${infrastructureId}. Confidence: ${(event.confidence * 100).toFixed(0)}%`,
              timestamp: event.timestamp,
              acknowledged: false,
            },
            ...state.alerts,
          ]
        };
      });
    });

    systemEventBus.subscribe('RoadClosed', (event) => {
      set((state) => {
        return {
          roads: state.roads.map((r) =>
            r.id === event.payload.roadId
              ? { ...r, status: 'flooded' as const, capacity: 0 }
              : r
          ),
        };
      });
    });

    systemEventBus.subscribe('FloodDetected', (event) => {
      set((state) => {
         // Create a new flood cell based on the detection
         const newFloodCell: FloodCell = {
           id: `flood-${event.id}`,
           center: event.payload.polygon[0] as [number, number],
           currentRadius: 50, // rough approx
           maxRadius: 300,
           waterDepth: event.payload.depth,
           activationTime: state.time,
           growthRate: 0.05,
           polygon: event.payload.polygon
         };

         return {
           floodCells: [...state.floodCells, newFloodCell],
           alerts: [
             {
               id: `evt-f-${event.id}`,
               severity: 'warning',
               title: 'New Flood Zone Detected',
               body: `Satellite SAR detected ${event.payload.depth}m flood. Confidence: ${(event.confidence * 100).toFixed(0)}%`,
               timestamp: event.timestamp,
               acknowledged: false,
             },
             ...state.alerts,
           ]
         };
      });
    });
  },

  setSelectedEntity: (entity) => {
    set({ selectedEntity: entity });
  },

  connectToServer: () => {
    console.log("Connecting to Deluge Backend...");
    const ws = new WebSocket("ws://localhost:8000/ws");
    wsInstance = ws;
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "FULL_STATE" || data.type === "TICK") {
          const payload = data.payload;
          set((state) => {
            let updatedRoads = payload.roads !== undefined ? payload.roads : state.roads;
            if (payload.roadStatuses && updatedRoads) {
              let changed = false;
              const newRoads = updatedRoads.map((r: any) => {
                const newStatus = payload.roadStatuses[r.id];
                if (newStatus && r.status !== newStatus) {
                  changed = true;
                  return { ...r, status: newStatus };
                } else if (!newStatus && r.status !== 'open') {
                  changed = true;
                  return { ...r, status: 'open' };
                }
                return r;
              });
              if (changed) {
                updatedRoads = newRoads;
              }
            }

            return {
              time: payload.time !== undefined ? payload.time : state.time,
              isRunning: payload.isRunning !== undefined ? payload.isRunning : state.isRunning,
              speed: payload.speed !== undefined ? payload.speed : state.speed,
              severity: payload.severity !== undefined ? payload.severity : state.severity,
              floodCells: payload.floodCells !== undefined ? payload.floodCells : state.floodCells,
              roads: updatedRoads,
              vehicles: payload.vehicles !== undefined ? payload.vehicles : state.vehicles,
              shelters: payload.shelters !== undefined ? payload.shelters : state.shelters,
              infrastructure: payload.infrastructure !== undefined ? payload.infrastructure : state.infrastructure,
              missions: payload.missions !== undefined ? payload.missions : state.missions,
              alerts: payload.alerts !== undefined ? payload.alerts : state.alerts,
              stats: computeStats({
                vehicles: payload.vehicles !== undefined ? payload.vehicles : state.vehicles,
                missions: payload.missions !== undefined ? payload.missions : state.missions,
                roads: updatedRoads,
                shelters: payload.shelters !== undefined ? payload.shelters : state.shelters,
              }),
            };
          });
        } else if (data.type === "MISSION_PLAN_RESULT") {
          set({
            proposedMission: {
              route: data.payload.route,
              snappedOrigin: data.payload.snapped_origin,
              snappedDestination: data.payload.snapped_destination,
              distance: data.payload.distance,
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    };
    
    ws.onopen = () => console.log("Connected to Backend.");
    ws.onclose = () => {
      console.log("Disconnected from Backend. Retrying in 3s...");
      wsInstance = null;
      setTimeout(() => get().connectToServer(), 3000);
    };
  },

  sendCommand: (action: string, payload: any = {}) => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      wsInstance.send(JSON.stringify({ action, ...payload }));
    } else {
      console.warn("Cannot send command, WebSocket not connected.");
    }
  },

  setDraftMission: (payload) => set((state) => ({ draftMission: { ...state.draftMission, ...payload } })),
  
  setProposedMission: (payload) => set({ proposedMission: payload }),
  
  setLayerVisibility: (layer, visible) => set((state) => ({ layerVisibility: { ...state.layerVisibility, [layer]: visible } })),
}));

// Initialize EventBus integration automatically
useSimulationStore.getState().initEventBusListeners();
// Connect to the backend
useSimulationStore.getState().connectToServer();
