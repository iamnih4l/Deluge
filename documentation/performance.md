# Performance Optimizations

Deluge processes massive amounts of spatial data in real-time. To ensure 60fps rendering and sub-second pathfinding, several critical optimizations are implemented.

## Backend Optimizations

1. **In-Memory Graph**: The NetworkX road graph is loaded entirely into memory on startup. This prevents expensive disk or database I/O during critical A* routing operations.
2. **OSM Caching**: To circumvent OpenStreetMap rate limits and drastically reduce startup time, the downloaded road graph is cached locally as `osm_graph_cache.graphml`.
3. **Tick Throttling**: The Replay Engine operates at 10Hz. This provides a smooth visual experience without overwhelming the WebSocket connection or CPU.
4. **Asynchronous I/O**: FastAPI and `asyncio` ensure that the tick loop and WebSocket broadcasting do not block incoming HTTP/WebSocket connections.

## Frontend Optimizations

1. **Zustand over Context**: React Context causes full tree re-renders on every update. Zustand allows individual components to subscribe *only* to the exact slices of state they need (e.g., `useSimulationStore((s) => s.vehicles)`), effectively preventing React from rendering unnecessary DOM nodes 10 times a second.
2. **MapLibre GeoJSON Sources**: Instead of managing thousands of React components for vehicles and flood cells, the frontend offloads rendering entirely to MapLibre's WebGL engine by updating a single `GeoJSON` source object per layer.
3. **Memoization**: Heavy layout components like the `CommandCenterLayout` and `MissionPlanner` use standard React memoization patterns to avoid recalculations during WebSocket ticks.
