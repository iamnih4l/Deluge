from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import asyncio
import uuid
import logging
from app.simulation.state import sim_state
from app.simulation.engine import simulation_engine
from app.schemas.simulation import Mission, Vehicle, SimAlert

logger = logging.getLogger(__name__)

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        state_dict = sim_state.get_state().model_dump()
        if "roads" in state_dict:
            road_statuses = {r["id"]: r["status"] for r in state_dict["roads"] if r["status"] != "open"}
            state_dict["roadStatuses"] = road_statuses
            del state_dict["roads"]
        await websocket.send_json({"type": "FULL_STATE", "payload": state_dict})

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_state(self):
        state_dict = sim_state.get_state().model_dump()
        if "roads" in state_dict:
            road_statuses = {r["id"]: r["status"] for r in state_dict["roads"] if r["status"] != "open"}
            state_dict["roadStatuses"] = road_statuses
            del state_dict["roads"]
            
        for connection in self.active_connections:
            try:
                await connection.send_json({"type": "TICK", "payload": state_dict})
            except Exception:
                pass

manager = ConnectionManager()

def _normalize_lnglat(value) -> tuple[float, float]:
    coords = tuple(value) if isinstance(value, list) else value
    return (float(coords[0]), float(coords[1]))



def _calculate_route(origin: tuple[float, float], destination: tuple[float, float]) -> list[tuple[float, float]]:
    if not simulation_engine.routing_engine:
        return []

    route = simulation_engine.routing_engine.calculate_route(origin, destination)
    if not route or len(route) < 2:
        return []
    return route

def handle_dispatch_mission(data: dict):
    """
    Creates a Mission, calculates a route, spawns a Vehicle, and updates the state.
    Called when the frontend sends a dispatch_mission WebSocket command.
    """
    state = sim_state.get_state()
    
    origin = data.get("origin")
    destination = data.get("destination")
    vehicle_type = data.get("type", "ground_unit")
    
    if not origin or not destination:
        logger.warning("dispatch_mission: missing origin or destination")
        return
    
    # Ensure origin/destination are tuples
    origin = _normalize_lnglat(origin)
    destination = _normalize_lnglat(destination)
    
    mission_id = f"mission-{uuid.uuid4().hex[:8]}"
    callsign_map = {
        "rescue_boat": "RB",
        "ambulance": "AMB",
        "engineering": "ENG",
        "drone": "DRN",
        "command": "CMD",
        "ground_unit": "GU",
    }
    prefix = callsign_map.get(vehicle_type, "UNIT")
    callsign = f"{prefix}-{len(state.vehicles) + 1:03d}"
    
    # Calculate route using the routing engine
    route = _calculate_route(origin, destination)
    
    if not route:
        logger.warning("dispatch_mission: routing failed, aborting dispatch")
        state.alerts.insert(0, SimAlert(
            id=str(uuid.uuid4()),
            severity="critical",
            title="Dispatch Failed",
            body=f"Cannot route to {destination}. Area may be disconnected by floods.",
            timestamp=state.time,
            acknowledged=False
        ))
        sim_state.update_state(state)
        return
    
    # Estimate ETA based on route length (rough: count nodes * speed factor)
    eta_minutes = max(1.0, len(route) * 0.5)
    
    # Create Mission
    mission = Mission(
        id=mission_id,
        title=f"Dispatch {callsign}",
        status='in_progress',
        priority='P1',
        assignedUnit=callsign,
        eta=eta_minutes,
        targetLocation=destination,
        startedAt=state.time,
        completedAt=None
    )
    state.missions.append(mission)
    
    # Create Vehicle
    vehicle = Vehicle(
        id=f"veh-{mission_id}",
        callsign=callsign,
        type=vehicle_type,
        position=route[0],
        heading=0.0,
        route=route,
        routeProgress=0.0,
        speed=0.5,
        assignedMission=mission_id,
        status='en_route'
    )
    state.vehicles.append(vehicle)
    
    # Create Alert
    state.alerts.insert(0, SimAlert(
        id=str(uuid.uuid4()),
        severity="info",
        title="Unit Dispatched",
        body=f"Dispatched {callsign} ({vehicle_type}) for {mission.title}",
        timestamp=state.time,
        acknowledged=False
    ))
    
    sim_state.update_state(state)
    logger.info(f"Dispatched {callsign} with {len(route)} route nodes from {origin} to {destination}")

def _coords_to_json(coords) -> list[float]:
    return [float(coords[0]), float(coords[1])]

def _route_to_json(route: list) -> list[list[float]]:
    return [_coords_to_json(point) for point in route]

def _mission_plan_payload(plan: dict) -> dict:
    return {
        "route": _route_to_json(plan["route"]),
        "snapped_origin": _coords_to_json(plan["snapped_origin"]),
        "snapped_destination": _coords_to_json(plan["snapped_destination"]),
        "distance": float(plan["distance"]),
    }

async def handle_plan_mission(data: dict, websocket: WebSocket):
    origin = data.get("origin")
    destination = data.get("destination")
    
    if not origin or not destination:
        return
        
    origin = _normalize_lnglat(origin)
    destination = _normalize_lnglat(destination)
    
    try:
        plan = None
        if simulation_engine.routing_engine:
            plan = await asyncio.to_thread(
                simulation_engine.routing_engine.plan_route,
                origin,
                destination,
            )

        if not plan:
            plan = {
                "route": [],
                "snapped_origin": origin,
                "snapped_destination": destination,
                "distance": 0.0,
            }
            logger.warning("plan_mission: routing failed, returning empty plan")

        await websocket.send_json({
            "type": "MISSION_PLAN_RESULT",
            "payload": _mission_plan_payload(plan),
        })
    except Exception as e:
        logger.error(f"plan_mission failed: {e}")
        await websocket.send_json({
            "type": "MISSION_PLAN_RESULT",
            "payload": _mission_plan_payload({
                "route": [],
                "snapped_origin": origin,
                "snapped_destination": destination,
                "distance": 0.0,
            }),
        })

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            logger.info(f"Received websocket action: {action}")
            
            if action == "set_running":
                sim_state.set_running(data.get("state", False))
            elif action == "reset":
                sim_state.reset()
            elif action == "seek":
                sim_state.set_time(float(data.get("time", 0)))
            elif action == "set_speed":
                sim_state.set_speed(float(data.get("speed", 1.0)))
            elif action == "plan_mission":
                logger.info(f"plan_mission received: {data}")
                await handle_plan_mission(data, websocket)
            elif action == "dispatch_mission":
                logger.info(f"dispatch_mission received: {data}")
                await asyncio.to_thread(handle_dispatch_mission, data)
                await manager.broadcast_state()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
