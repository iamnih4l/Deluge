/* ──────────────────────────────────────────
   Simulation Domain Types
   Core type definitions for the Deluge simulation engine.
   ────────────────────────────────────────── */

/** Geographic coordinate pair [longitude, latitude] */
export type LngLat = [number, number];

/** Status of a road segment relative to flood conditions */
export type RoadStatus = 'open' | 'at_risk' | 'flooded' | 'blocked';

/** Operational status of a shelter or infrastructure node */
export type FacilityStatus = 'operational' | 'at_capacity' | 'compromised' | 'offline';

/** Mission operational status */
export type MissionStatus = 'pending' | 'in_progress' | 'delayed' | 'complete' | 'critical';

/** Priority levels for missions */
export type Priority = 'P1' | 'P2' | 'P3';

/** Alert severity */
export type AlertSeverity = 'critical' | 'warning' | 'info';

/** Vehicle type */
export type VehicleType = 'rescue_boat' | 'ambulance' | 'engineering' | 'drone' | 'command';

/* ── Core Entities ── */

export interface FloodCell {
  id: string;
  center: LngLat;
  /** Radius of the flood zone in meters (grows over time) */
  currentRadius: number;
  maxRadius: number;
  /** Water depth in meters */
  waterDepth: number;
  /** Simulation time (0-100) when this cell activates */
  activationTime: number;
  /** Rate of growth per simulation tick */
  growthRate: number;
  /** Polygon coordinates for map rendering */
  polygon: LngLat[];
}

export interface RoadSegment {
  id: string;
  name: string;
  path: LngLat[];
  status: RoadStatus;
  /** Simulation time when this road becomes flooded (-1 = never) */
  floodTime: number;
  /** Traffic capacity multiplier (1.0 = normal, 0 = impassable) */
  capacity: number;
}

export interface Vehicle {
  id: string;
  callsign: string;
  type: VehicleType;
  position: LngLat;
  heading: number;
  /** Current route as array of coordinates */
  route: LngLat[];
  /** Index of current position along route */
  routeProgress: number;
  /** Speed in coordinate units per tick */
  speed: number;
  assignedMission: string | null;
  status: 'idle' | 'en_route' | 'on_scene' | 'returning';
}

export interface Shelter {
  id: string;
  name: string;
  position: LngLat;
  capacity: number;
  currentOccupancy: number;
  status: FacilityStatus;
  /** Intake rate: people per simulation tick */
  intakeRate: number;
  /** Is this shelter accessible via non-flooded roads? */
  accessible: boolean;
}

export interface Infrastructure {
  id: string;
  name: string;
  type: 'hospital' | 'power_station' | 'bridge' | 'shelter';
  position: LngLat;
  status: FacilityStatus;
  detail: string;
}

export interface Mission {
  id: string;
  title: string;
  status: MissionStatus;
  priority: Priority;
  assignedUnit: string | null;
  eta: number | null;
  /** Simulation time this mission was created */
  createdAt: number;
  /** Simulation time this mission was completed (-1 = not complete) */
  completedAt: number;
  /** Target location */
  target: LngLat;
}

export interface SimAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  body: string;
  /** Simulation time when this alert was generated */
  timestamp: number;
  /** Has the operator acknowledged this alert? */
  acknowledged: boolean;
}

export interface SimulationState {
  /** Simulation progress: 0 to 100 */
  time: number;
  /** Is simulation currently advancing? */
  isRunning: boolean;
  /** Simulation speed multiplier */
  speed: number;
  /** Current severity level derived from simulation state */
  severity: 'nominal' | 'elevated' | 'critical';

  /* ── Entity Collections ── */
  floodCells: FloodCell[];
  roads: RoadSegment[];
  vehicles: Vehicle[];
  shelters: Shelter[];
  infrastructure: Infrastructure[];
  missions: Mission[];
  alerts: SimAlert[];

  /* ── Derived Stats (updated each tick) ── */
  stats: {
    activeUnits: number;
    openMissions: number;
    atRisk: number;
    evacuated: number;
    roadsFlooded: number;
    shelterCapacity: number;
  };
}
