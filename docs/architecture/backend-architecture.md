# Backend Architecture

## Purpose
Details the FastAPI modular structure.

## Folder Structure
```text
backend/
├── main.py                 # FastAPI entry point & WS setup
├── api/
│   ├── routes.py           # REST endpoints
│   └── websockets.py       # WS connection manager
├── core/
│   ├── config.py           # Environment vars
│   └── events.py           # Event bus / pub-sub
├── engine/
│   ├── graph.py            # NetworkX singleton wrapper
│   ├── routing.py          # A* implementation
│   └── safe_zones.py       # Scoring algorithms
├── models/
│   ├── domain.py           # Pydantic data models
│   └── payloads.py         # WS message schemas
└── simulation/
    └── flood_generator.py  # Mock event emitter
```

## Dependencies
- `fastapi`: API framework.
- `uvicorn`: ASGI server.
- `networkx`: Graph mathematics.
- `osmnx` (optional): For initial OSM data loading.
- `pydantic`: Type safety and payload validation.
