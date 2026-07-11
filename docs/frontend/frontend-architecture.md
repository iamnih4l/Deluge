# Frontend Architecture

Deluge uses a feature-based architecture to maintain a clean, scalable codebase. This prevents the "spaghetti code" common in large React applications.

## Core Technology Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Map Engine**: MapLibre GL JS
- **3D Engine**: Three.js / React Three Fiber (R3F)
- **Client State**: Zustand
- **Server/Async State**: TanStack Query (React Query)
- **Styling**: Tailwind CSS / CSS Modules
- **Real-time**: WebSockets

## Feature-Based Structure

Instead of grouping files by type (e.g., all components in one folder, all hooks in another), we group files by **feature**. A feature is a distinct domain or capability of the application.

### Example Feature: `missions`
```text
src/features/missions/
├── components/          # Components specific to missions (MissionCard.tsx, MissionList.tsx)
├── hooks/               # Custom hooks (useMissions.ts, useAssignUnit.ts)
├── store/               # Local slice of state if needed (missionStore.ts)
├── api/                 # API calls / TanStack queries (fetchMissions.ts)
├── types.ts             # TypeScript interfaces for missions
└── index.ts             # Public API for this feature (exports)
```

## Global vs. Feature-Specific

- **Global Components (`src/components/ui/`)**: Reusable UI elements that belong to the design system (e.g., `Button`, `Panel`, `StatusBadge`). These do not contain domain logic.
- **Feature Components (`src/features/.../components/`)**: Components tied to specific business logic or data structures (e.g., `MissionCard`).

## State Management Strategy

1. **Server State (TanStack Query)**: Used for data fetched from the backend (initial network graph, active missions, historical alerts). Handles caching, loading states, and refetching.
2. **Real-time State (WebSockets + Zustand)**: The backend streams high-frequency delta updates (flood progression). A global Zustand store listens to the WebSocket and updates the in-memory map state instantly without triggering heavy React re-renders.
3. **UI State (Zustand or `useState`)**: Local component state (e.g., "is this panel open?") uses React `useState`. Global UI state (e.g., "which mission is currently selected on the map?") uses Zustand.

## Map vs. React Integration

React and WebGL/Canvas (MapLibre) have fundamentally different rendering paradigms. 
- Avoid managing rapidly changing map coordinates directly in React state, as this will destroy performance.
- Use React to mount the map instance, but use native MapLibre API calls (via refs or a map manager class) to update layers, source data, and animate features dynamically.
