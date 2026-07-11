# Deluge System Functional Audit

**Date:** 2026-07-11
**Objective:** Audit the complete Deluge platform to verify real-time, dynamic emergency routing capabilities.

## Executive Summary
The frontend architecture and historical replay event ingestion are functioning well. However, the **Dynamic Routing Engine is fundamentally broken**. While roads accurately change visual states when intersecting flood cells, this data is *not* fed back into the NetworkX pathfinding graph. Vehicles dispatch on static routes calculated at $T=0$ and blindly drive through flooded roads without rerouting.

---

## 1. Core Systems Checklist

| System | Status | Notes |
|---|---|---|
| **Road Network** | ✅ Working | Loaded from OpenStreetMap, cached properly. |
| **Buildings** | ✅ Working | Rendered in 3D via MapLibre on the frontend. |
| **Flood Layer** | ✅ Working | Generated dynamically from historical payloads. |
| **Mission Planner** | ✅ Working | Successfully dispatches missions with origins/destinations. |
| **Vehicle Engine** | ⚠ Partially Working | Interpolates visually, but does not track current graph edge. |
| **Routing Engine** | ❌ Broken | Graph weights do not update dynamically when roads flood. |
| **Replay Engine** | ✅ Working | Accurately fires historical events based on tick loop. |
| **Risk Engine** | 🚧 Placeholder | Road 'at_risk' statuses exist but don't influence routing logic. |
| **Terrain Engine** | 🚧 Placeholder | Elevation data (DEM) is entirely absent from flood calculations. |
| **WebSockets** | ✅ Working | Reliable 10Hz `TICK` and `FULL_STATE` broadcasts. |
| **Historical Loader**| ✅ Working | Properly parses `historical_events.json`. |

---

## 2. Detailed Verification

### A. Road Network & Flood Interaction
- **Are roads converted into a graph?** Yes (`nx.MultiDiGraph`).
- **Do routes avoid flooded edges?** **NO.** The `flood.py` engine successfully marks roads as `flooded` in the global state, but the `RoutingEngine` maintains a separate `operational_graph` whose edge weights are never updated.

### B. Dynamic Routing Pipeline
When a road floods:
- Road Risk -> ✅ (Updated in State)
- Edge Weight -> ❌ (Graph remains unchanged)
- Shortest Path Recalculated -> ❌ (Vehicles don't reroute)
- Mission Updated -> ❌ (Vehicle unaware of flood)

### C. Vehicle System
- **Vehicle Movement**: Vehicles interpolate smoothly, but they do not re-request routes if the road ahead is flooded. They will currently clip directly through flooded geometry.

---

## 3. Required Implementation Fixes

### Backend Corrections
1. **Synchronize Graph with State**: Modify the tick loop in `engine.py` to call `routing_engine.update_edge_weights()` whenever a road's status changes to `flooded` or `blocked`.
2. **Vehicle Rerouting Loop**: Inside `tick_vehicles()`, vehicles must look ahead on their `route`. If an upcoming node/edge is now flagged as impassable, they must halt, request a new route from `RoutingEngine` via their current coordinate, and resume.

### Frontend Corrections
1. **Historical Incident Analysis Module**: An entirely new Next.js page (`/analysis`) must be created to explore the dataset interactively as per the new requirements, completely separate from the active EOC layout.

---

## 4. Future Improvements (Out of Scope for Immediate Fix)
- Real DEM integration for gravity-based flood pooling instead of expanding circles.
- Database persistence (PostgreSQL/PostGIS) to remove the fragile in-memory singleton.
