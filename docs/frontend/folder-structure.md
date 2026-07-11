# Folder Structure

Deluge uses a feature-based folder architecture. This keeps domain logic grouped together, making the codebase scalable and easier to navigate under pressure.

## `src/` Directory Overview

```text
src/
├── app/                  # Next.js App Router layout and pages
├── components/           # Global, reusable UI components (Design System)
├── features/             # Feature-specific logic, components, and state
├── hooks/                # Global utility hooks (e.g., useWindowSize, useTheme)
├── lib/                  # Third-party library configurations (e.g., MapLibre init)
├── store/                # Global Zustand stores (e.g., mapStore, uiStore)
├── styles/               # Global CSS, CSS Modules, or Tailwind configuration
├── types/                # Global TypeScript definitions
└── utils/                # Pure utility functions (e.g., formatTime, calculateDistance)
```

## Deep Dive: `src/features/`

A feature encapsulates a specific business domain.

Example features in Deluge:
- `map/` - Core map instance, layer definitions, and 3D terrain logic.
- `missions/` - Displaying and managing rescue missions.
- `alerts/` - System notifications and environmental warnings.
- `simulation/` - The flood playback and timeline scrubbing logic.

### Inside a Feature (`src/features/missions/`)
```text
missions/
├── components/           # MissionCard, MissionList, MissionDetailsPanel
├── hooks/                # useMissions, useAssignMission
├── store/                # (Optional) missionStore for complex local state
├── api/                  # TanStack Query fetchers (fetchActiveMissions)
├── types.ts              # Mission, Vehicle, Status enums
└── index.ts              # Public API - ONLY export what the rest of the app needs
```

## Strict Import Rules

1. **Feature isolation**: A feature should not reach directly into another feature's internal components. If `alerts` needs a `MissionCard`, `MissionCard` should be exported from `missions/index.ts`.
2. **Global dependencies**: Features can import from `src/components`, `src/utils`, and `src/store`.
3. **No circular dependencies**: Use `index.ts` files carefully to avoid circular imports.
