# System Workflow

## Purpose
Traces a single event from ingestion to visualization, demonstrating the zero-pipeline, event-driven nature of Deluge.

## Detailed Event Workflow

1. **Flood Update (Ingestion)**
   - The simulation engine or external sensor pushes a payload containing geographic coordinates and flood depth.
2. **Event Detection**
   - The Event Processor validates the payload and identifies the bounding box of the flood.
3. **Graph Update**
   - The system queries a spatial index (e.g., R-Tree) to find affected road segments (edges).
4. **Edge Weight Update**
   - The affected edges in the NetworkX graph have their `risk_score` and `travel_time` exponentially increased. Extremely deep floods set `travel_time` to infinity (impassable).
5. **Affected Road Identification**
   - A list of modified edge IDs is generated (`delta_payload`).
6. **Route Recalculation**
   - The Routing Engine checks if any active mission routes traverse the modified edges.
   - If yes, a new A* shortest-path calculation is executed immediately.
7. **Safe Zone Evaluation**
   - The Safe Zone Engine checks if the flood isolates or threatens any active safe zones. Scores are updated.
8. **Mission Update**
   - The Mission Manager updates active missions with new ETAs and revised routing paths.
9. **WebSocket Broadcast**
   - The backend bundles the `delta_payload`, `mission_updates`, and `safe_zone_updates` into a single, compact JSON message.
10. **Dashboard Update**
    - The frontend receives the WebSocket message.
    - MapLibre uses data-driven styling to turn flooded roads red instantly.
    - The Mission Panel updates ETAs without a page reload.
