import math
from typing import List, Tuple
from app.schemas.simulation import FloodCell, RoadSegment, SimAlert, LngLat

DEG_PER_METER_LNG = 0.0000135
DEG_PER_METER_LAT = 0.000009

def generate_flood_polygon(center: LngLat, radius_meters: float) -> List[LngLat]:
    segments = 24
    coords = []
    for i in range(segments + 1):
        angle = (i / segments) * math.pi * 2
        lng = center[0] + math.cos(angle) * radius_meters * DEG_PER_METER_LNG
        lat = center[1] + math.sin(angle) * radius_meters * DEG_PER_METER_LAT
        coords.append((lng, lat))
    return coords

def tick_flood_cells(cells: List[FloodCell], sim_time: float) -> List[FloodCell]:
    for cell in cells:
        if sim_time < cell.activationTime:
            cell.currentRadius = 0
            cell.waterDepth = 0
            cell.polygon = []
            continue

        elapsed = sim_time - cell.activationTime
        progress = min(elapsed * cell.growthRate, 1.0)
        current_radius = cell.maxRadius * progress
        water_depth = progress * 4.5

        cell.currentRadius = current_radius
        cell.waterDepth = water_depth
        cell.polygon = generate_flood_polygon(cell.center, current_radius)
        
    return cells

def is_point_flooded(point: LngLat, flood_cells: List[FloodCell]) -> bool:
    for cell in flood_cells:
        if cell.currentRadius <= 0:
            continue
        d_lng = (point[0] - cell.center[0]) / DEG_PER_METER_LNG
        d_lat = (point[1] - cell.center[1]) / DEG_PER_METER_LAT
        dist = math.sqrt(d_lng * d_lng + d_lat * d_lat)
        if dist < cell.currentRadius:
            return True
    return False

def _compute_flood_bboxes(flood_cells: List[FloodCell], buffer_meters: float = 50.0):
    """Pre-compute bounding boxes for each active flood cell for fast road filtering."""
    bboxes = []
    for cell in flood_cells:
        if cell.currentRadius <= 0:
            continue
        reach = cell.currentRadius + buffer_meters
        min_lng = cell.center[0] - reach * DEG_PER_METER_LNG
        max_lng = cell.center[0] + reach * DEG_PER_METER_LNG
        min_lat = cell.center[1] - reach * DEG_PER_METER_LAT
        max_lat = cell.center[1] + reach * DEG_PER_METER_LAT
        bboxes.append((min_lng, min_lat, max_lng, max_lat, cell))
    return bboxes

def _road_intersects_any_bbox(road: RoadSegment, bboxes) -> bool:
    """Quick check: does any point on this road fall within any flood bbox?"""
    for pt in road.path:
        for (min_lng, min_lat, max_lng, max_lat, _) in bboxes:
            if min_lng <= pt[0] <= max_lng and min_lat <= pt[1] <= max_lat:
                return True
    return False

def update_road_statuses(roads: List[RoadSegment], flood_cells: List[FloodCell], sim_time: float) -> List[RoadSegment]:
    # If there are no active flood cells, skip the expensive iteration entirely
    active_cells = [c for c in flood_cells if c.currentRadius > 0]
    if not active_cells:
        return roads

    # Pre-compute bounding boxes for spatial filtering
    bboxes = _compute_flood_bboxes(active_cells, buffer_meters=50.0)
    
    for road in roads:
        if road.status == 'blocked':
            continue
        
        # Quick spatial filter: skip roads far from any flood zone
        if not _road_intersects_any_bbox(road, bboxes):
            # Road is far from all floods — if it was previously affected, reset it
            if road.status in ('flooded', 'at_risk'):
                road.status = 'open'
                road.capacity = 1.0
            continue
        
        # Detailed check for roads near a flood zone
        flooded = any(is_point_flooded(pt, active_cells) for pt in road.path)
        if flooded:
            road.status = 'flooded'
            road.capacity = 0.0
            if road.floodTime == -1:
                road.floodTime = sim_time
            continue
            
        # check at risk (within buffer zone)
        at_risk = False
        for pt in road.path:
            for cell in active_cells:
                d_lng = (pt[0] - cell.center[0]) / DEG_PER_METER_LNG
                d_lat = (pt[1] - cell.center[1]) / DEG_PER_METER_LAT
                dist = math.sqrt(d_lng * d_lng + d_lat * d_lat)
                if dist < cell.currentRadius + 50:
                    at_risk = True
                    break
            if at_risk:
                break
                
        if at_risk:
            road.status = 'at_risk'
            road.capacity = 0.5
        else:
            road.status = 'open'
            road.capacity = 1.0
            
    return roads

def generate_flood_alerts(cells: List[FloodCell], roads: List[RoadSegment], prev_status_map: dict, sim_time: float) -> List[SimAlert]:
    """Generate alerts when road statuses transition.
    prev_status_map is a dict of {road_id: previous_status_string}.
    """
    alerts = []
    
    for road in roads:
        prev_status = prev_status_map.get(road.id)
        if prev_status and prev_status != 'flooded' and road.status == 'flooded':
            alerts.append(SimAlert(
                id=f"alert-road-{road.id}-{int(sim_time)}",
                severity="critical",
                title="Road Flooded",
                body=f"{road.name} is now impassable. Active units rerouting.",
                timestamp=sim_time,
                acknowledged=False
            ))
        elif prev_status and prev_status == 'open' and road.status == 'at_risk':
            alerts.append(SimAlert(
                id=f"alert-risk-{road.id}-{int(sim_time)}",
                severity="warning",
                title="Road At Risk",
                body=f"{road.name} is at risk of flooding. Consider alternate routes.",
                timestamp=sim_time,
                acknowledged=False
            ))
            
    return alerts

