/* ──────────────────────────────────────────
   Initial Scenario Data
   Pre-configured entities for the NYC Lower Manhattan demo.
   This defines the starting state of the simulation.
   ────────────────────────────────────────── */

import type {
  FloodCell,
  RoadSegment,
  Vehicle,
  Shelter,
  Infrastructure,
  Mission,
  SimAlert,
} from './types';
import { generateCityRoute } from './vehicleEngine';

/* ── Flood Cells ── */
export const INITIAL_FLOOD_CELLS: FloodCell[] = [
  {
    id: 'flood-east-river',
    center: [-74.0020, 40.7108],
    currentRadius: 0,
    maxRadius: 280,
    waterDepth: 0,
    activationTime: 5,
    growthRate: 0.025,
    polygon: [],
  },
  {
    id: 'flood-canal-st',
    center: [-74.0060, 40.7145],
    currentRadius: 0,
    maxRadius: 200,
    waterDepth: 0,
    activationTime: 15,
    growthRate: 0.035,
    polygon: [],
  },
  {
    id: 'flood-battery',
    center: [-74.0105, 40.7115],
    currentRadius: 0,
    maxRadius: 160,
    waterDepth: 0,
    activationTime: 30,
    growthRate: 0.040,
    polygon: [],
  },
];

/* ── Road Segments ── */
export const INITIAL_ROADS: RoadSegment[] = [
  {
    id: 'road-broadway',
    name: 'Broadway',
    path: [
      [-74.0060, 40.7155],
      [-74.0060, 40.7145],
      [-74.0060, 40.7135],
      [-74.0060, 40.7125],
      [-74.0060, 40.7115],
    ],
    status: 'open',
    floodTime: -1,
    capacity: 1.0,
  },
  {
    id: 'road-water-st',
    name: 'Water Street',
    path: [
      [-74.0025, 40.7108],
      [-74.0035, 40.7112],
      [-74.0045, 40.7116],
      [-74.0055, 40.7120],
      [-74.0065, 40.7124],
    ],
    status: 'open',
    floodTime: -1,
    capacity: 1.0,
  },
  {
    id: 'road-fulton',
    name: 'Fulton Street',
    path: [
      [-74.0095, 40.7130],
      [-74.0080, 40.7130],
      [-74.0065, 40.7130],
      [-74.0050, 40.7130],
      [-74.0035, 40.7130],
    ],
    status: 'open',
    floodTime: -1,
    capacity: 1.0,
  },
  {
    id: 'road-wall-st',
    name: 'Wall Street',
    path: [
      [-74.0095, 40.7120],
      [-74.0080, 40.7120],
      [-74.0065, 40.7120],
      [-74.0050, 40.7120],
      [-74.0035, 40.7120],
    ],
    status: 'open',
    floodTime: -1,
    capacity: 1.0,
  },
  {
    id: 'road-bridge',
    name: 'Brooklyn Bridge Approach',
    path: [
      [-74.0010, 40.7130],
      [-74.0020, 40.7128],
      [-74.0030, 40.7126],
      [-74.0040, 40.7124],
    ],
    status: 'open',
    floodTime: -1,
    capacity: 1.0,
  },
];

/* ── Vehicles ── */
const rescueRoute = generateCityRoute(
  [-74.0092, 40.7148],
  [-74.0040, 40.7120],
);

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'v-rescue-1',
    callsign: 'Rescue 1',
    type: 'rescue_boat',
    position: [-74.0092, 40.7148],
    heading: 135,
    route: rescueRoute,
    routeProgress: 0,
    speed: 0.08,
    assignedMission: 'MSN-104',
    status: 'en_route',
  },
  {
    id: 'v-rescue-3',
    callsign: 'Rescue 3',
    type: 'ambulance',
    position: [-74.0050, 40.7142],
    heading: 220,
    route: generateCityRoute([-74.0050, 40.7142], [-74.0070, 40.7125]),
    routeProgress: 0,
    speed: 0.06,
    assignedMission: 'MSN-105',
    status: 'en_route',
  },
  {
    id: 'v-eng-2',
    callsign: 'Eng. Unit 2',
    type: 'engineering',
    position: [-74.0075, 40.7135],
    heading: 90,
    route: [],
    routeProgress: 0,
    speed: 0.05,
    assignedMission: 'MSN-106',
    status: 'on_scene',
  },
  {
    id: 'v-drone-1',
    callsign: 'Drone 1',
    type: 'drone',
    position: [-74.0055, 40.7150],
    heading: 0,
    route: generateCityRoute([-74.0055, 40.7150], [-74.0030, 40.7118]),
    routeProgress: 0,
    speed: 0.12,
    assignedMission: null,
    status: 'idle',
  },
  {
    id: 'v-cmd-1',
    callsign: 'Command 1',
    type: 'command',
    position: [-74.0088, 40.7140],
    heading: 45,
    route: [],
    routeProgress: 0,
    speed: 0,
    assignedMission: null,
    status: 'on_scene',
  },
];

/* ── Shelters ── */
export const INITIAL_SHELTERS: Shelter[] = [
  {
    id: 'shelter-alpha',
    name: 'Shelter Alpha',
    position: [-74.0088, 40.7148],
    capacity: 500,
    currentOccupancy: 225,
    status: 'operational',
    intakeRate: 3,
    accessible: true,
  },
  {
    id: 'shelter-bravo',
    name: 'Shelter Bravo',
    position: [-74.0045, 40.7145],
    capacity: 300,
    currentOccupancy: 216,
    status: 'operational',
    intakeRate: 2,
    accessible: true,
  },
  {
    id: 'shelter-echo',
    name: 'Shelter Echo',
    position: [-74.0068, 40.7118],
    capacity: 200,
    currentOccupancy: 192,
    status: 'at_capacity',
    intakeRate: 0,
    accessible: true,
  },
];

/* ── Infrastructure ── */
export const INITIAL_INFRASTRUCTURE: Infrastructure[] = [
  {
    id: 'infra-memorial',
    name: 'Memorial Hospital',
    type: 'hospital',
    position: [-74.0078, 40.7140],
    status: 'operational',
    detail: 'Cap. 84% · Power OK',
  },
  {
    id: 'infra-stmary',
    name: 'St. Mary Clinic',
    type: 'hospital',
    position: [-74.0035, 40.7148],
    status: 'operational',
    detail: 'Cap. 42% · Stable',
  },
  {
    id: 'infra-grid-delta',
    name: 'Grid Station Delta',
    type: 'power_station',
    position: [-74.0025, 40.7115],
    status: 'offline',
    detail: 'Submerged · 0 MW',
  },
  {
    id: 'infra-bridge',
    name: 'Highway Bridge I-95',
    type: 'bridge',
    position: [-74.0020, 40.7128],
    status: 'compromised',
    detail: 'Structural risk',
  },
];

/* ── Missions ── */
export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'MSN-104',
    title: 'Evacuate Shelter Alpha — Sector 5',
    status: 'in_progress',
    priority: 'P1',
    assignedUnit: 'Rescue 1',
    eta: 4,
    createdAt: 0,
    completedAt: -1,
    target: [-74.0088, 40.7148],
  },
  {
    id: 'MSN-105',
    title: 'Bridge Structural Collapse — Sector 7',
    status: 'critical',
    priority: 'P1',
    assignedUnit: 'Rescue 3',
    eta: null,
    createdAt: 0,
    completedAt: -1,
    target: [-74.0020, 40.7128],
  },
  {
    id: 'MSN-103',
    title: 'Medical Supply Drop — Zone B',
    status: 'complete',
    priority: 'P2',
    assignedUnit: 'Drone 1',
    eta: null,
    createdAt: 0,
    completedAt: 5,
    target: [-74.0040, 40.7125],
  },
  {
    id: 'MSN-106',
    title: 'Road Blockage Clearance — I-95',
    status: 'delayed',
    priority: 'P2',
    assignedUnit: 'Eng. Unit 2',
    eta: 18,
    createdAt: 0,
    completedAt: -1,
    target: [-74.0075, 40.7135],
  },
];

/* ── Initial Alerts ── */
export const INITIAL_ALERTS: SimAlert[] = [
  {
    id: 'alert-init-0',
    severity: 'critical',
    title: 'Catastrophic Failure Imminent',
    body: 'Grid Station Delta offline. Immediate rescue of Hospital patients required before backup generators fail.',
    timestamp: 0,
    acknowledged: false,
  },
  {
    id: 'alert-init-1',
    severity: 'warning',
    title: 'Flood Warning',
    body: 'Water levels at East River gauges rising rapidly. Sector 7 residential evacuation advisory issued.',
    timestamp: 0,
    acknowledged: false,
  },
  {
    id: 'alert-init-2',
    severity: 'info',
    title: 'AI Recommendation',
    body: 'Reroute Unit Alpha to Sector 7 via I-278. Current route shows 85% flood probability within 10 minutes.',
    timestamp: 0,
    acknowledged: false,
  },
];
