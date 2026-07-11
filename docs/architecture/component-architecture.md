# Component Architecture

## Purpose
Defines the responsibilities, inputs, and outputs of major modules within Deluge.

### 1. In-Memory Graph Module
- **Purpose**: Holds the entire road network topology in RAM for instant access.
- **Responsibilities**: Provide constant-time access to edge weights and node connectivity.
- **Inputs**: Edge attribute updates.
- **Outputs**: Current graph state, shortest paths.
- **Dependencies**: NetworkX.

### 2. Routing Engine
- **Purpose**: Deterministic pathfinding.
- **Responsibilities**: Calculate the lowest-cost path between origin and destination.
- **Inputs**: Start node, end node, active graph.
- **Outputs**: Ordered list of nodes/coordinates representing the route, total travel time.
- **Internal Logic**: A* algorithm with a heuristic based on physical distance and risk factor.

### 3. Event Processor
- **Purpose**: Ingest and normalize external data.
- **Responsibilities**: Map geographic flood polygons to specific graph edges.
- **Inputs**: GeoJSON flood polygons.
- **Outputs**: List of edge IDs and new weight metrics.

### 4. Mission Manager
- **Purpose**: Track active rescue units.
- **Responsibilities**: Maintain unit state, destination, and current route.
- **Inputs**: Unit telemetry, route updates from Routing Engine.
- **Outputs**: Mission status payloads.

### 5. AI Recommendation Engine (Async)
- **Purpose**: Provide explainability and strategic advice.
- **Responsibilities**: Generate natural language explanations for sudden reroutes or shelter evacuations.
- **Inputs**: Mission context, flood event context.
- **Outputs**: Short, actionable insights.
- **Communication Pattern**: Runs strictly asynchronously to avoid blocking the main event loop.
