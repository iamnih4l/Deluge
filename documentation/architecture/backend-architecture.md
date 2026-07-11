# Backend Architecture

The Deluge backend is a high-performance Python application built with FastAPI. It serves as the authoritative state engine for the Live Digital Twin.

## Execution Model

The backend runs an asynchronous tick loop (`SimulationEngine`) that operates at approximately 10Hz. During each tick, it:

1. Evaluates environmental changes (e.g., expanding flood radiuses and depths).
2. Updates vehicle positions along their calculated routes.
3. Analyzes risk (e.g., identifying newly flooded roads or compromised infrastructure).
4. Emits a `TICK` broadcast to all connected WebSocket clients.

## Modular Services

The backend is organized into distinct feature modules:

- **`routing/`**: Houses the NetworkX engine responsible for A* pathfinding.
- **`simulation/`**: Contains the state machine that manages the tick loop and entity updates.
- **`websocket/`**: Manages the persistent connections with the frontend, broadcasting states and handling inbound commands.
- **`events/`**: A planned module to handle external webhooks and third-party data ingestion.

## Data Persistence

Currently, Deluge V2 operates entirely in-memory for maximum performance during the Historical Incident Replay. 

- Graph data is cached locally via `osm_graph_cache.graphml` to prevent expensive OSM API calls on startup.
- State is maintained in the `SimState` singleton and lost upon server restart.

Future iterations (see `roadmap.md`) will introduce PostgreSQL/PostGIS for persistent state and spatial queries.
