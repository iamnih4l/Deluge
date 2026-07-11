# Component Library

The Deluge UI is constructed from reusable, purpose-built components. Every component must adhere to the design system and avoid ad-hoc styling.

## Layout Components

### `CommandCenterLayout`
The master wrapper for the application. It handles the fixed positioning of the Top Navigation, Left Sidebar, Right Panel, Bottom Timeline, and the Center Map.

### `Panel`
A standard container (`Dark Graphite` background, subtle border) used in sidebars and overlays. Supports an optional title and scrollable content area.

## Map Overlays & Floating UI

### `FloatingToolbar`
A semi-transparent, blurred container that floats over the map, used for map layer controls (e.g., toggle 3D, toggle shelters).

### `MapLegend`
A collapsible panel explaining the colors and markers currently visible on the map.

### `NotificationCenter`
A dropdown or sliding panel accessible from the top nav to review a timeline of system alerts.

## Data & Intelligence Components

### `AlertBanner`
Displays critical system or environmental alerts across the top of the screen or right panel.
- **Variants**: `Critical` (Red), `Warning` (Amber), `Info` (Cyan).

### `MissionCard`
A concise card displaying a rescue mission.
- **Data**: Mission ID, Status (Active, Pending, Completed), Priority, Assigned Unit, ETA.
- **Interaction**: Click to focus the map on the mission.

### `RecommendationCard`
An AI-generated recommendation prompting the operator to take action.
- **Content**: Situation summary, suggested action (e.g., "Reroute Unit Alpha"), and primary action buttons ("Approve", "Dismiss").

### `ShelterMarker` / `VehicleMarker`
Custom MapLibre markers.
- Must display status visually (e.g., a green shelter icon turns amber if capacity reaches 90%).

### `StatusBadge`
Small, pill-shaped indicators for quick status reads.
- Examples: `[ONLINE]`, `[AT RISK]`, `[IN PROGRESS]`.

### `RiskGauge`
A minimal, circular or linear progress bar showing the risk level of a specific zone or the capacity of a shelter.

## Controls

### `SimulationControls`
Play, Pause, Fast Forward, and Rewind buttons for the Flood Simulation Mode.

### `Timeline`
A horizontal scrubber located at the bottom of the screen. Shows the progression of the flood event. Operators can drag the playhead to view past states or projected future states.

### `CommandPalette`
A keyboard-accessible (Cmd+K / Ctrl+K) search and command interface allowing operators to quickly jump to a specific mission, unit, or location without using the mouse.
