# Safe Zone Algorithm

## Purpose
Explains the heuristic used to dynamically rank and evaluate evacuation shelters.

## Evaluation Criteria
Every safe zone is continuously evaluated on five vectors:
1. **Capacity**: `current_occupancy / max_capacity`
2. **Flood Risk**: Proximity to current flood polygons.
3. **Connectivity**: Does a valid path still exist from major population centers to this zone?
4. **Accessibility**: Number of unflooded arterial roads leading to the zone.

## Dynamic Ranking Formula
`Zone Score = (w1 * Capacity_Available) - (w2 * Flood_Risk) + (w3 * Connectivity)`

When a flood event severs the last major road to a safe zone, its Connectivity score drops to 0, triggering an automatic status change to `AT_RISK` and prompting an evacuation recommendation.
