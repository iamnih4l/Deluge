# Failure Handling

## Purpose
Strategies for maintaining operational capacity during degraded states.

## Disconnected Frontend
If the WebSocket connection drops, Zustand immediately changes the UI border to Amber, alerting the operator that data is stale. The WS client attempts exponential backoff reconnection.

## Routing Engine Failure
If an isolated node (completely surrounded by water) causes A* to fail (no path exists), the system gracefully degrades by assigning the mission status to `ISOLATED` and triggering an immediate AI Recommendation for aerial rescue, rather than crashing the backend.
