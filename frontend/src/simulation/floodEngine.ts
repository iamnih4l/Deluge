/* ──────────────────────────────────────────
   Flood Engine
   Pure functions that compute flood propagation.
   No side effects — suitable for Web Workers in the future.
   ────────────────────────────────────────── */

import type { FloodCell, RoadSegment, LngLat, SimAlert } from './types';

/** Degrees per meter at NYC latitude (approx) */
const DEG_PER_METER_LNG = 0.0000135;
const DEG_PER_METER_LAT = 0.000009;

/**
 * Generate a rough circular polygon from a center point and radius.
 * Uses 24 segments for smooth-looking circles on the map.
 */
export function generateFloodPolygon(center: LngLat, radiusMeters: number): LngLat[] {
  const segments = 24;
  const coords: LngLat[] = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const lng = center[0] + Math.cos(angle) * radiusMeters * DEG_PER_METER_LNG;
    const lat = center[1] + Math.sin(angle) * radiusMeters * DEG_PER_METER_LAT;
    coords.push([lng, lat]);
  }

  return coords;
}

/**
 * Advance flood cells based on simulation time.
 * Each cell grows from 0 to maxRadius after its activation time.
 */
export function tickFloodCells(cells: FloodCell[], simTime: number): FloodCell[] {
  return cells.map((cell) => {
    if (simTime < cell.activationTime) {
      return { ...cell, currentRadius: 0, waterDepth: 0, polygon: [] };
    }

    const elapsed = simTime - cell.activationTime;
    const progress = Math.min(elapsed * cell.growthRate, 1);
    const currentRadius = cell.maxRadius * progress;
    const waterDepth = progress * 4.5; // Max ~4.5m depth

    return {
      ...cell,
      currentRadius,
      waterDepth,
      polygon: generateFloodPolygon(cell.center, currentRadius),
    };
  });
}

/**
 * Check if a coordinate is inside any active flood zone.
 * Uses simple distance-based check (sufficient for simulation).
 */
export function isPointFlooded(point: LngLat, floodCells: FloodCell[]): boolean {
  for (const cell of floodCells) {
    if (cell.currentRadius <= 0) continue;

    const dLng = (point[0] - cell.center[0]) / DEG_PER_METER_LNG;
    const dLat = (point[1] - cell.center[1]) / DEG_PER_METER_LAT;
    const dist = Math.sqrt(dLng * dLng + dLat * dLat);

    if (dist < cell.currentRadius) return true;
  }
  return false;
}

/**
 * Update road statuses based on current flood state.
 * A road is "at_risk" if flood is within 50m, "flooded" if within the zone.
 */
export function updateRoadStatuses(
  roads: RoadSegment[],
  floodCells: FloodCell[],
  simTime: number,
): RoadSegment[] {
  return roads.map((road) => {
    if (road.status === 'blocked') return road; // manually blocked stays blocked

    // Check if any point on the road path is flooded
    const flooded = road.path.some((pt) => isPointFlooded(pt, floodCells));

    if (flooded) {
      return {
        ...road,
        status: 'flooded' as const,
        capacity: 0,
        floodTime: road.floodTime === -1 ? simTime : road.floodTime,
      };
    }

    // Check if road is at risk (any path point near flood)
    const atRisk = road.path.some((pt) => {
      for (const cell of floodCells) {
        if (cell.currentRadius <= 0) continue;
        const dLng = (pt[0] - cell.center[0]) / DEG_PER_METER_LNG;
        const dLat = (pt[1] - cell.center[1]) / DEG_PER_METER_LAT;
        const dist = Math.sqrt(dLng * dLng + dLat * dLat);
        if (dist < cell.currentRadius + 50) return true;
      }
      return false;
    });

    return {
      ...road,
      status: atRisk ? 'at_risk' : 'open',
      capacity: atRisk ? 0.5 : 1.0,
    };
  });
}

/**
 * Generate alerts based on flood progression events.
 * Returns new alerts that should be appended to the alert list.
 */
export function generateFloodAlerts(
  cells: FloodCell[],
  roads: RoadSegment[],
  prevRoads: RoadSegment[],
  simTime: number,
): SimAlert[] {
  const alerts: SimAlert[] = [];

  // Check for newly flooded roads
  roads.forEach((road, i) => {
    const prev = prevRoads[i];
    if (prev && prev.status !== 'flooded' && road.status === 'flooded') {
      alerts.push({
        id: `alert-road-${road.id}-${simTime.toFixed(0)}`,
        severity: 'critical',
        title: 'Road Flooded',
        body: `${road.name} is now impassable. Active units rerouting.`,
        timestamp: simTime,
        acknowledged: false,
      });
    }
    if (prev && prev.status === 'open' && road.status === 'at_risk') {
      alerts.push({
        id: `alert-risk-${road.id}-${simTime.toFixed(0)}`,
        severity: 'warning',
        title: 'Road At Risk',
        body: `${road.name} is approaching flood threshold. Consider rerouting.`,
        timestamp: simTime,
        acknowledged: false,
      });
    }
  });

  // Check for flood cell depth milestones
  cells.forEach((cell) => {
    if (Math.abs(cell.waterDepth - 2.0) < 0.1 && cell.waterDepth > 0) {
      alerts.push({
        id: `alert-depth-${cell.id}-2m`,
        severity: 'warning',
        title: 'Water Level Warning',
        body: `Flood zone ${cell.id} has reached 2.0m depth. Evacuation recommended.`,
        timestamp: simTime,
        acknowledged: false,
      });
    }
    if (Math.abs(cell.waterDepth - 3.5) < 0.1 && cell.waterDepth > 0) {
      alerts.push({
        id: `alert-depth-${cell.id}-3m`,
        severity: 'critical',
        title: 'Critical Water Level',
        body: `Flood zone ${cell.id} has exceeded 3.5m. Immediate evacuation required.`,
        timestamp: simTime,
        acknowledged: false,
      });
    }
  });

  return alerts;
}
