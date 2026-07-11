# Routing Engine Design

## Purpose
Explains the deterministic pathfinding system that guarantees sub-second response times.

## Graph Representation
- **Nodes**: Intersections (Lat/Lng).
- **Edges**: Road segments.
- **Attributes per Edge**: 
  - `length` (meters)
  - `base_speed` (km/h)
  - `travel_time` (seconds)
  - `flood_depth` (meters)
  - `risk_score` (0-100)

## Dynamic Edge Weighting
The "cost" of an edge is calculated as:
`Cost = travel_time + (risk_score * penalty_multiplier)`
When `flood_depth` exceeds a safe threshold (e.g., 0.5m), `risk_score` becomes 100 and `travel_time` becomes infinity.

## Selective Route Recalculation
To maintain < 1s latency, we do not recalculate all routes when a flood occurs.
1. We maintain a set of edges currently utilized by active missions.
2. When a flood event updates Edge X, we intersect Edge X with the active mission edges.
3. If there is an intersection, we recalculate *only* the affected mission.

## Why Deterministic?
We explicitly reject LLMs or AI for routing. AI introduces latency, non-determinism, and hallucinations. A* is mathematically proven, instantaneous in-memory, and 100% reliable.
