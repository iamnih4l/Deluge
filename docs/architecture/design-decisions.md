# Design Decisions

## Purpose
Chronicles major architectural trade-offs.

## 1. NetworkX vs. PostGIS/pgRouting
- **Decision**: NetworkX (In-Memory).
- **Reason**: Database queries introduce 50-200ms latency. NetworkX operates in <5ms.
- **Trade-off**: Memory constrained. MVP must be limited to a specific city bounding box.

## 2. MapLibre GL vs. Google Maps
- **Decision**: MapLibre GL JS.
- **Reason**: Hackathon rules forbid commercial APIs. MapLibre allows complete control over data-driven styling without cost.
- **Trade-off**: Requires manual extraction and hosting of OSM vector data.

## 3. Deterministic A* vs. AI Routing
- **Decision**: Deterministic A*.
- **Reason**: AI hallucinates and is non-deterministic. Rescue routes must be mathematically verifiable.
- **Trade-off**: Less "buzzword" heavy, but infinitely more reliable.
