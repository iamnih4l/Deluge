# Historical Incident Replay

Deluge is built as an Emergency Routing Platform. To demonstrate its capabilities without requiring a live disaster, the system operates in **Historical Incident Replay** mode.

## Concept

Unlike a "simulation game" where the environment is generated procedurally or manipulated arbitrarily by the user, the Historical Incident Replay feeds real-world, timestamped disaster data into the routing engine. The system behaves exactly as it would during a live event.

## Current Dataset: 2018 Kerala Flood

The primary dataset bundled with Deluge V2 replicates the catastrophic 2018 Kerala floods in Ernakulam. 

- **Geospatial Context**: The map focuses on the Ernakulam district, rendering real building footprints and road networks.
- **Environmental Data**: The backend replay engine interpolates water level rises based on historical rainfall and dam release data, accurately flooding specific road segments at historically accurate times.
- **Operator Role**: The user (acting as the Emergency Coordinator) interacts with the system strictly by dispatching missions (e.g., sending an Ambulance or Rescue Boat) to navigate this dynamic, pre-recorded environment.
