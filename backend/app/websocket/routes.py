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
        await websocket.send_json({"type": "FULL_STATE", "payload": sim_state.get_state().dict()})

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_state(self):
        state_dict = sim_state.get_state().dict()
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
    origin = tuple(origin) if isinstance(origin, list) else origin
    destination = tuple(destination) if isinstance(destination, list) else destination
    
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
    route = []
    if simulation_engine.routing_engine:
        route = simulation_engine.routing_engine.calculate_route(origin, destination)
    
    if not route or len(route) < 2:
        route = [origin, destination]
        logger.warning(f"dispatch_mission: routing failed, using straight line fallback")
    
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

async def handle_plan_mission(data: dict, websocket: WebSocket):
    from app.simulation.engine import simulation_engine
    origin = data.get("origin")
    destination = data.get("destination")
    
    if not origin or not destination:
        return
        
    origin = tuple(origin) if isinstance(origin, list) else origin
    destination = tuple(destination) if isinstance(destination, list) else destination
    
    plan = None
    if simulation_engine.routing_engine:
        plan = simulation_engine.routing_engine.plan_route(origin, destination)
        
    if plan:
        await websocket.send_json({
            "type": "MISSION_PLAN_RESULT",
            "payload": {
                "route": plan["route"],
                "snapped_origin": plan["snapped_origin"],
                "snapped_destination": plan["snapped_destination"],
                "distance": plan["distance"]
            }
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
                handle_dispatch_mission(data)
                await manager.broadcast_state()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
