# Frontend Architecture

The Deluge frontend is a React application built on Next.js. It is designed as a strict, production-grade Emergency Operations Platform.

## Core Layout

The layout is defined in `CommandCenterLayout.tsx` and operates on a 3-panel CSS Grid architecture:

1. **Mission Planner (Left)**: Allows operators to define mission types, origins, and destinations. Displays a queue of active and completed missions.
2. **GIS Map (Center)**: The core visualization viewport rendered via MapLibre GL. It utilizes a layered approach to superimpose dynamic GeoJSON data (floods, vehicles, infrastructure) over OpenStreetMap raster tiles.
3. **Operational Intelligence (Right)**: Displays a chronological event log, high-level infrastructure status, and seamlessly swaps to a detailed `EntityInspector` when a map element is selected.

## State Management

The frontend eschews complex component-level state in favor of a centralized Zustand store (`src/simulation/index.ts`). 

### Store Responsibilities:
- **WebSocket Synchronization**: The store automatically connects to the backend WebSocket and listens for `FULL_STATE` and `TICK` events.
- **State Hydration**: When a `TICK` is received, the store updates its internal arrays (e.g., `floodCells`, `vehicles`, `alerts`) without requiring React to re-render the entire component tree—only the components observing those specific state slices.
- **Command Dispatch**: User actions (e.g., dispatching a mission, toggling layers) are sent to the backend via `sendCommand()`.

## Map Rendering

The `Interactive3DMap.tsx` component is the visual heart of the system.

- **Data Binding**: It observes the Zustand store and dynamically generates GeoJSON `FeatureCollection`s on every render tick.
- **Layer Strictness**: To maintain a professional EOC (Emergency Operations Center) aesthetic, map overlays use strict solid colors (e.g., Red for flooded, Amber for at-risk) with minimal blur.

## Event Bus

An internal `systemEventBus` is used for non-state UI triggers, such as dispatching ephemeral toast notifications for critical alerts, ensuring the UI remains highly responsive during heavy state updates.
