import asyncio
import logging
from app.simulation.state import sim_state
from app.simulation.flood import tick_flood_cells, update_road_statuses, generate_flood_alerts
from app.simulation.vehicle import tick_vehicles
from app.simulation.historical_adapter import HistoricalReplayAdapter
from app.simulation.routing_engine import RoutingEngine
from app.schemas.simulation import FloodCell, SimAlert, Mission, Vehicle
import uuid

logger = logging.getLogger(__name__)

class SimulationEngine:
    def __init__(self):
        self.tick_rate_ms = 100 
        self.replay_adapter = HistoricalReplayAdapter()
        try:
            self.routing_engine = RoutingEngine()
        except Exception as e:
            logger.error(f"Failed to initialize routing engine: {e}")
            self.routing_engine = None
        
    async def start_simulation_loop(self):
        from app.websocket.routes import manager
        
        while True:
            state = sim_state.get_state()
            if state.isRunning and state.time < 100:
                if state.time <= 0.1:
                    self.replay_adapter.reset()
                
                # 1. Advance Time
                new_time = min(state.time + (0.5 * state.speed), 100.0)
                if new_time >= 100:
                    state.isRunning = False
                state.time = new_time
                
                # 2. Process Historical Events
                events = self.replay_adapter.get_events_for_time(new_time)
                for event in events:
                    event_type = event.get('event_type')
                    payload = event.get('payload', {})
                    logger.info(f"Processing Event: {event_type} at T={new_time}")
                    
                    if event_type == "flood_initiated":
                        cell = FloodCell(
                            id=payload.get("id"),
                            center=payload.get("center"),
                            currentRadius=50.0,
                            maxRadius=payload.get("maxRadius", 1000.0),
                            waterDepth=0.0,
                            activationTime=new_time,
                            growthRate=payload.get("growthRate", 0.1),
                            polygon=[]
                        )
                        state.floodCells.append(cell)
                        
                        raw_sev = payload.get("severity", "warning")
                        alert_sev = "warning" if raw_sev == "elevated" else raw_sev
                        # Add a global alert
                        state.alerts.insert(0, SimAlert(
                            id=str(uuid.uuid4()),
                            severity=alert_sev,
                            title="New Flood Event",
                            body=f"Flood initiated at {payload.get('center')}",
                            timestamp=new_time,
                            acknowledged=False
                        ))
                    
                    elif event_type == "road_closed":
                        road_name = payload.get("name_contains", "")
                        if self.routing_engine:
                            self.routing_engine.apply_road_closure(road_name)
                        state.alerts.insert(0, SimAlert(
                            id=str(uuid.uuid4()),
                            severity="critical",
                            title="Road Closed",
                            body=f"Road closure enacted for {road_name}",
                            timestamp=new_time,
                            acknowledged=False
                        ))
                        # Find matching roads in state and mark them closed
                        for r in state.roads:
                            if road_name.lower() in r.name.lower():
                                r.status = 'closed'

                    elif event_type == "ai_recommendation":
                        state.alerts.insert(0, SimAlert(
                            id=str(uuid.uuid4()),
                            severity="info",
                            title=payload.get("title", "AI Recommendation"),
                            body=payload.get("body", "Recommended action available."),
                            timestamp=new_time,
                            acknowledged=False,
                            confidence=payload.get("confidence", 0.95),
                            action=payload.get("action")
                        ))
                                
                    elif event_type == "dispatch_mission":
                        mission_id = payload.get("id")
                        origin = tuple(payload.get("origin"))
                        destination = tuple(payload.get("destination"))
                        
                        # 1. Create Mission
                        mission = Mission(
                            id=mission_id,
                            title=payload.get("title", "Dispatch"),
                            status='in_progress',
                            priority='P1',
                            assignedUnit=payload.get("vehicle_callsign"),
                            eta=30.0,
                            targetLocation=destination,
                            startedAt=new_time,
                            completedAt=None
                        )
                        state.missions.append(mission)
                        
                        # 2. Calculate Route
                        route = []
                        if self.routing_engine:
                            route = self.routing_engine.calculate_route(origin, destination)
                        else:
                            route = [origin, destination]
                            
                        # 3. Create Vehicle
                        vehicle = Vehicle(
                            id=f"veh-{mission_id}",
                            callsign=payload.get("vehicle_callsign"),
                            type=payload.get("vehicle_type", "ground_unit"),
                            position=origin,
                            heading=0.0,
                            route=route,
                            routeProgress=0.0,
                            speed=0.5,
                            assignedMission=mission_id,
                            status='en_route'
                        )
                        state.vehicles.append(vehicle)
                        
                        state.alerts.insert(0, SimAlert(
                            id=str(uuid.uuid4()),
                            severity="info",
                            title="Unit Dispatched",
                            body=f"Dispatched {vehicle.callsign} for {mission.title}",
                            timestamp=new_time,
                            acknowledged=False
                        ))

                # 3. Advance Flood Cells
                state.floodCells = tick_flood_cells(state.floodCells, new_time)
                
                # 4. Update Road Statuses (optimized: snapshot statuses, not full copy)
                prev_status_map = {r.id: r.status for r in state.roads}
                active_flood_cells = [c for c in state.floodCells if c.currentRadius > 0]
                if active_flood_cells:
                    state.roads = await asyncio.to_thread(
                        update_road_statuses, state.roads, state.floodCells, new_time
                    )
                
                if self.routing_engine and active_flood_cells:
                    # Sync graph weights with real-time flood statuses
                    await asyncio.to_thread(self.routing_engine.update_edge_weights, state.roads)                

                # 8. Generate Alerts based on flood overlaps (uses lightweight status diff)
                new_alerts = generate_flood_alerts(state.floodCells, state.roads, prev_status_map, new_time)
                existing_ids = {a.id for a in state.alerts}
                unique_alerts = [a for a in new_alerts if a.id not in existing_ids]
                state.alerts = unique_alerts + state.alerts
                
                # 9. Update Infrastructure
                for inf in state.infrastructure:
                    if inf.status == 'offline':
                        continue
                    if any(c.currentRadius > 100 for c in state.floodCells):
                        import random
                        if random.random() < 0.001:
                            inf.status = 'offline'
                            inf.detail = 'Power failure due to flooding'

            is_frozen = not state.isRunning and state.time > 0
            
            if not is_frozen:
                # 5. Move Vehicles
                state.vehicles = await asyncio.to_thread(tick_vehicles, state.vehicles, self.routing_engine, state.roads, state.floodCells)
                
                # 6. Update Shelters
                for s in state.shelters:
                    if s.status == 'at_capacity' or not s.accessible:
                        continue
                    new_occ = min(s.currentOccupancy + s.intakeRate * 0.1, float(s.capacity))
                    s.currentOccupancy = int(new_occ)
                    if s.currentOccupancy >= s.capacity * 0.95:
                        s.status = 'at_capacity'
                
                # 7. Update Mission ETAs
                for m in state.missions:
                    if m.status == 'complete':
                        continue
                    if m.eta is not None and m.eta > 0:
                        new_eta = max(0.0, m.eta - 0.05 * state.speed)
                        if new_eta <= 0:
                            m.eta = 0.0
                            m.status = 'complete'
                            m.completedAt = state.time
                        else:
                            m.eta = round(new_eta * 10) / 10.0
                
                sim_state.update_state(state)
                await manager.broadcast_state()
                
            await asyncio.sleep(self.tick_rate_ms / 1000.0)

simulation_engine = SimulationEngine()
