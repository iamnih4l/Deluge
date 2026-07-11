# Performance Strategy

## Purpose
Details how Deluge achieves sub-second latency and zero-pipeline constraints.

## Optimizations
1. **Memory Pre-loading**: The entire OSM bounding box is parsed into a NetworkX `DiGraph` on server boot. No disk I/O occurs during an emergency event.
2. **Delta Payloads**: We never send full GeoJSON geometries over WebSockets. We only send the IDs of the edges that changed. The frontend already holds the geometry.
3. **Bypassing React for Maps**: MapLibre GL JS operates outside the React Virtual DOM. When a WS event arrives, we call `map.setFeatureState()` directly. This prevents React from attempting to diff thousands of SVG elements.
4. **Selective Pathfinding**: We only recalculate routes if the affected graph edge intersects with an active mission route.
