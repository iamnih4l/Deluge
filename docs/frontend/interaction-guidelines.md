# Interaction Guidelines

Every interaction in Deluge must improve situational awareness. The interface must feel tactile, highly responsive, and alive.

## Map Interactions

### Hover
Hovering over a map element (vehicle, shelter, route, flooded road) should immediately provide context without requiring a click.
- **Visual Feedback**: The element highlights, slightly scales up, or glows (using a cyan or amber stroke depending on context).
- **Data Feedback**: A small, minimalist tooltip appears near the cursor displaying critical identifiers (e.g., "Unit Alpha - ETA 4m", "Shelter 4 - 85% Cap").

### Select (Click)
Selecting an element pins its detailed information to the interface.
- **Visual Feedback**: The element locks into an active state. The map may smoothly pan to center the element if it's near the edge of the viewport. Other non-related elements may slightly dim to increase focus.
- **Data Feedback**: The Right Intelligence Panel opens or updates with full details (e.g., unit cargo, mission logs, shelter contact info).

### Deselect
Clicking on an empty area of the map clears the current selection and returns the map and panels to their default state.

## Digital Twin Manipulations

### Pan and Zoom
- Must be perfectly smooth (60 FPS).
- Zooming in reveals more granular data (Progressive Disclosure).
- Zooming out aggregates data into clusters to prevent visual clutter.

### Rotate and Tilt (3D Mode)
- Operators can right-click and drag (or use specific UI controls) to tilt the camera into a 3D perspective.
- This is crucial for viewing elevation data, assessing flood depth against extruded buildings, and understanding topography.
- The UI floating panels must remain 2D and readable regardless of camera rotation.

## General UI Interactions

- **Keyboard Shortcuts**: Power users in an EOC need to navigate without a mouse.
  - `Space`: Play/Pause simulation.
  - `Esc`: Clear selection / close panels.
  - `1`, `2`, `3`: Switch map layers (e.g., Default, Topo, Satellite).
- **Focus States**: Every interactive element must have a clear, distinct `focus-visible` state (usually a 2px solid cyan outline) for keyboard navigation.
