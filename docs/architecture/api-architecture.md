# API Architecture

## Purpose
Documents the REST and WebSocket contracts.

## REST Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/network/initial` | Returns the base GeoJSON road network and safe zones. Called exactly once on startup. |
| GET | `/api/v1/missions` | Returns active missions. |
| POST | `/api/v1/simulate/flood` | Ingests a mock flood polygon (Hackathon specific). |

## WebSocket Protocol
**Endpoint**: `ws://{host}/ws/stream`

### Downstream Payload (Server to Client)
```json
{
  "type": "DELTA_UPDATE",
  "timestamp": "2026-07-11T12:00:00Z",
  "payload": {
    "modified_edges": {
      "edge_8472": {"risk": 100, "status": "flooded"}
    },
    "mission_updates": [
      {"id": "m1", "new_eta": 450, "route_geometry": "..."}
    ]
  }
}
```
