# Routing Engine

Deluge's routing engine is designed to handle rapidly changing environmental constraints, allowing emergency vehicles to navigate safely through evolving disaster zones.

## NetworkX Integration

The routing engine is powered by Python's `NetworkX` library.

1. **Graph Ingestion**: On startup, the backend downloads the road network for the operational bounding box from OpenStreetMap via `osmnx` and caches it locally as an undirected graph.
2. **Pathfinding Algorithm**: The engine uses the A* algorithm (a variant of Dijkstra's algorithm optimized with a heuristic) to compute the shortest path between a mission's origin and destination.
3. **Weight Adjustments**: Pathfinding minimizes "weight." The weight of an edge is primarily its geographic length, but the engine applies severe penalties or complete blockages to edges affected by floods.

## Flood Interaction

The system continuously cross-references the geographic coordinates of road edges (from the graph) against active flood cells.

- **At Risk**: If a flood radius nears a road, the road status changes to `at_risk`.
- **Flooded**: If a road edge intersects with a flood cell's polygon and the water depth exceeds a critical threshold, the road status is updated to `flooded`.
- **Dynamic Recalculation**: If an active vehicle's calculated route includes a newly `flooded` road segment, the routing engine instantly re-runs A* with the affected edge marked as impassable (infinite weight), forcing a reroute.
