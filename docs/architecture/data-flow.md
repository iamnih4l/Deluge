# Data Flow Diagram

## Purpose
Explains how raw data transitions into actionable intelligence.

## Pipeline
1. **Incoming Data**: Raw coordinates and flood depths (GeoJSON) from the Simulator.
2. **Processing (Spatial Join)**: The backend converts physical coordinates into logical Graph Edges.
3. **State Mutation**: The global graph state is mutated in memory.
4. **Decision Engine**: 
   - Routing: Deterministic algorithms recalculate shortest paths.
   - Safe Zones: Heuristics calculate risk-to-capacity ratios.
5. **Output Formatting**: The system generates a compact Delta Payload (e.g., `{"modified_edges": {"e1": {"risk": 99}}}`).
6. **User Interface (MapLibre)**: The frontend merges the delta payload with its local state, triggering native WebGL color changes on the map without re-fetching geometry.
