/* ──────────────────────────────────────────
   Vehicle Engine
   Moves vehicles along their assigned routes.
   Handles rerouting when roads flood.
   ────────────────────────────────────────── */

import type { Vehicle, LngLat } from './types';

/**
 * Linear interpolation between two coordinates.
 */
function lerp(a: LngLat, b: LngLat, t: number): LngLat {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
  ];
}

/**
 * Calculate bearing (heading) between two points in degrees.
 */
function bearing(from: LngLat, to: LngLat): number {
  const dLng = to[0] - from[0];
  const dLat = to[1] - from[1];
  const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
  return (angle + 360) % 360;
}

/**
 * Advance all vehicles one simulation tick.
 * Vehicles move along their route at their configured speed.
 */
export function tickVehicles(vehicles: Vehicle[]): Vehicle[] {
  return vehicles.map((vehicle) => {
    // Idle or on_scene vehicles don't move
    if (vehicle.status === 'idle' || vehicle.status === 'on_scene') {
      return vehicle;
    }

    // No route = nothing to follow
    if (vehicle.route.length < 2) {
      return { ...vehicle, status: 'idle' as const };
    }

    const nextProgress = vehicle.routeProgress + vehicle.speed;

    // Check if vehicle has reached end of route
    if (nextProgress >= vehicle.route.length - 1) {
      const finalPos = vehicle.route[vehicle.route.length - 1];
      return {
        ...vehicle,
        position: finalPos,
        routeProgress: vehicle.route.length - 1,
        status: vehicle.status === 'en_route' ? 'on_scene' as const : 'idle' as const,
      };
    }

    // Interpolate position along route
    const segIndex = Math.floor(nextProgress);
    const segFraction = nextProgress - segIndex;
    const from = vehicle.route[segIndex];
    const to = vehicle.route[Math.min(segIndex + 1, vehicle.route.length - 1)];
    const newPos = lerp(from, to, segFraction);
    const newHeading = bearing(from, to);

    return {
      ...vehicle,
      position: newPos,
      heading: newHeading,
      routeProgress: nextProgress,
    };
  });
}

/**
 * Assign a vehicle to a route (dispatch).
 */
export function dispatchVehicle(
  vehicle: Vehicle,
  route: LngLat[],
  missionId: string,
): Vehicle {
  return {
    ...vehicle,
    route,
    routeProgress: 0,
    status: 'en_route',
    assignedMission: missionId,
  };
}

/**
 * Generate a simple route between two points with intermediate waypoints.
 * Creates a realistic-looking L-shaped path (simulating city grid).
 */
export function generateCityRoute(from: LngLat, to: LngLat): LngLat[] {
  const midLng = from[0] + (to[0] - from[0]) * 0.6;
  const midLat = from[1];

  // Generate points along each segment for smoother animation
  const points: LngLat[] = [];
  const segments = 12;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    if (i <= segments / 2) {
      // First leg: horizontal
      const tt = (i / (segments / 2));
      points.push(lerp(from, [midLng, midLat], tt));
    } else {
      // Second leg: vertical
      const tt = ((i - segments / 2) / (segments / 2));
      points.push(lerp([midLng, midLat], to, tt));
    }
  }

  return points;
}
