# Sequence Diagram

## Purpose
Visualizes the synchronous and asynchronous interactions between system components during a flood event.

```text
Actor        Simulator       Backend (FastAPI)       Graph Engine      WebSocket       Frontend
  |              |                   |                    |                |               |
  |              |--- 1. Flood Event(GeoJSON) ------------>|               |               |
  |              |                   |                    |                |               |
  |              |                   |-- 2. Map Event to Edges             |               |
  |              |                   |                    |                |               |
  |              |                   |--- 3. Update Edge Weights --------->|               |
  |              |                   |                    |                |               |
  |              |                   |<-- 4. Acknowledge Update -----------|               |
  |              |                   |                    |                |               |
  |              |                   |-- 5. Trigger Route Recalculation    |               |
  |              |                   |--- (For affected missions) -------->|               |
  |              |                   |<-- New Routes (A*) -----------------|               |
  |              |                   |                    |                |               |
  |              |                   |-- 6. Trigger Safe Zone Eval         |               |
  |              |                   |                    |                |               |
  |              |                   |--- 7. Broadcast Deltas ------------>|               |
  |              |                   |                    |                |--- 8. Push -->|
  |              |                   |                    |                |               |
  |              |                   |                    |                |    9. Re-render UI
```
