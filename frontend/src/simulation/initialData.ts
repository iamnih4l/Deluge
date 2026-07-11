import type {
  FloodCell,
  RoadSegment,
  Vehicle,
  Shelter,
  Infrastructure,
  Mission,
  SimAlert,
} from './types';

/* ──────────────────────────────────────────
   Initial Data — Empty State
   All real data is sourced from the Python backend via WebSocket.
   These empty arrays prevent undefined errors during initial render
   before the backend connection is established.
   ────────────────────────────────────────── */

export const INITIAL_FLOOD_CELLS: FloodCell[] = [];
export const INITIAL_ROADS: RoadSegment[] = [];
export const INITIAL_VEHICLES: Vehicle[] = [];

export const INITIAL_SHELTERS: Shelter[] = [];
export const INITIAL_INFRASTRUCTURE: Infrastructure[] = [];
export const INITIAL_MISSIONS: Mission[] = [];

export const INITIAL_ALERTS: SimAlert[] = [
  {
    id: 'alert-init',
    severity: 'info',
    title: 'System Online',
    body: 'Deluge Emergency Response Platform initialized. Waiting for backend connection.',
    timestamp: 0,
    acknowledged: false,
  },
];
