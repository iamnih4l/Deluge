# State Management Strategy

Deluge deals with multiple types of state: persistent server data, high-frequency real-time updates, and complex UI interactions. A single unified state solution is an anti-pattern here. We separate concerns.

## 1. Server State (TanStack Query)

Used for asynchronous operations, data fetching, and caching static or slow-changing data.

- **Examples**:
  - Initial road network topology.
  - Historical alerts log.
  - Shelter static details (name, capacity, location).
- **Why TanStack Query?**
  - Handles caching, deduplication, and loading/error states automatically.
  - Removes boilerplate `useEffect` fetching code.

## 2. Real-Time Application State (Zustand)

Used for data that updates rapidly and needs to be accessed globally, particularly data streamed via WebSockets.

- **Examples**:
  - Current positions of emergency vehicles.
  - Live flood depth values on specific road segments.
  - Active timeline scrubber position.
- **Why Zustand?**
  - Minimal boilerplate.
  - Allows updating state without forcing React to re-render the entire component tree. We can subscribe to specific state slices.
  - Can be used outside of React components (e.g., inside a MapLibre event listener or WebSocket handler).

### Example Zustand Store (WebSocket Data)

```typescript
import { create } from 'zustand';

interface MapState {
  vehicles: Record<string, VehicleData>;
  updateVehicle: (id: string, data: VehicleData) => void;
  floodLevels: Record<string, number>;
  updateFloodLevel: (edgeId: string, level: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  vehicles: {},
  updateVehicle: (id, data) => set((state) => ({ 
    vehicles: { ...state.vehicles, [id]: data } 
  })),
  floodLevels: {},
  updateFloodLevel: (edgeId, level) => set((state) => ({
    floodLevels: { ...state.floodLevels, [edgeId]: level }
  })),
}));
```

## 3. Local UI State (React `useState`)

Used for isolated, component-level interactions.

- **Examples**:
  - Is a dropdown menu open?
  - What is typed in a search input?
  - Which tab is currently active in the right panel?
- **Rule**: If state is only needed by a component and its immediate children, keep it local. Do not pollute the global Zustand store.

## State and the Map

**CRITICAL**: Do not pass rapidly changing state (like vehicle coordinates) as React props to a Map component if it causes the map wrapper to re-render. Instead, the map component should imperatively listen to the Zustand store or a raw event emitter to update MapLibre sources directly via `map.current.getSource('vehicles').setData(...)`.
