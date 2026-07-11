import math
import logging
from typing import List
from app.schemas.simulation import Vehicle, LngLat
from app.simulation.flood import is_point_flooded

logger = logging.getLogger(__name__)

def lerp(a: LngLat, b: LngLat, t: float) -> LngLat:
    return (
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t
    )

def bearing(fr: LngLat, to: LngLat) -> float:
    d_lng = to[0] - fr[0]
    d_lat = to[1] - fr[1]
    angle = math.atan2(d_lng, d_lat) * (180.0 / math.pi)
    return (angle + 360) % 360

def tick_vehicles(vehicles: List[Vehicle], routing_engine=None, roads=None, flood_cells=None) -> List[Vehicle]:
    for vehicle in vehicles:
        if vehicle.status in ('idle', 'on_scene'):
            continue
            
        if not vehicle.route or len(vehicle.route) < 2:
            vehicle.status = 'idle'
            continue
            
        next_progress = vehicle.routeProgress + (vehicle.speed * 0.1)
        
        if next_progress >= len(vehicle.route) - 1:
            final_pos = vehicle.route[-1]
            vehicle.position = final_pos
            vehicle.routeProgress = float(len(vehicle.route) - 1)
            vehicle.status = 'on_scene' if vehicle.status == 'en_route' else 'idle'
            continue
            
        seg_index = math.floor(next_progress)
        
        # --- DYNAMIC REROUTING ---
        # Check if any remaining route point is inside a flood cell
        if routing_engine and flood_cells and len(flood_cells) > 0:
            route_obstructed = False
            # Sample every 3rd point ahead for performance
            for i in range(seg_index + 1, len(vehicle.route), 3):
                pt = vehicle.route[i]
                if is_point_flooded(pt, flood_cells):
                    route_obstructed = True
                    break
                    
            if route_obstructed:
                logger.info(f"Vehicle {vehicle.callsign} path obstructed by flood. Rerouting...")
                try:
                    destination = vehicle.route[-1]
                    new_route = routing_engine.calculate_route(vehicle.position, destination)
                    if new_route and len(new_route) > 1:
                        vehicle.route = new_route
                        vehicle.routeProgress = 0.0
                        next_progress = vehicle.speed * 0.1
                        seg_index = 0
                        logger.info(f"Vehicle {vehicle.callsign} rerouted with {len(new_route)} nodes.")
                    else:
                        logger.warning(f"Vehicle {vehicle.callsign} rerouting returned no valid path.")
                except Exception as e:
                    logger.error(f"Rerouting failed for {vehicle.callsign}: {e}")
        # ---
        
        seg_fraction = next_progress - seg_index
        fr_pt = vehicle.route[seg_index]
        to_pt = vehicle.route[min(seg_index + 1, len(vehicle.route) - 1)]
        
        new_pos = lerp(fr_pt, to_pt, seg_fraction)
        new_heading = bearing(fr_pt, to_pt)
        
        vehicle.position = new_pos
        vehicle.heading = new_heading
        vehicle.routeProgress = next_progress
        
    return vehicles
