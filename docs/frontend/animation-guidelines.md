# Animation Guidelines

In a mission control environment, **avoid decorative animation entirely**. Every animation must communicate information.

## Meaningful Motion Principles

1. **Draw Attention**: Use animation to guide the operator's eye to something that has changed or requires attention.
2. **Explain Change**: Use transition animations to explain how a state changed from A to B.
3. **Subtle & Fast**: Emergency operators do not have time for slow, sweeping animations. UI animations should be extremely fast (150ms - 250ms max).

## Map Animations

### Flood Propagation
When water levels rise or spread, the polygon layer should smoothly interpolate to its new shape and color intensity. Do not abruptly "snap" from dry to flooded.

### Route Recalculation (Morphing)
When a route is recalculated due to a blocked road, the old route line should visually morph into the new route line, or visually "erase" the blocked segment and "draw" the detour. This explicitly communicates *what* changed about the route.

### Vehicle Movement
Vehicle markers should animate smoothly along their route lines between data polling intervals. Use linear interpolation (or Bezier curves for smooth turns) so vehicles don't teleport.

## UI Animations

### Panel Expansion
When the Right Intelligence Panel opens, it should slide in smoothly from the right edge, pushing the map center slightly to the left to maintain the object of interest in the center of the available viewport.

### Alert Appearance
Critical alerts (`AlertBanner`) should slide down from the top. If it's a `Critical` (Red) alert, a subtle pulse animation on the border can be used briefly to ensure it is seen.

### Micro-interactions
- **Buttons**: A fast, subtle scale-down (`0.97`) on click (`:active`) provides tactile feedback.
- **Numbers**: When a critical metric changes (e.g., "At Risk Individuals: 450" -> "520"), the number should briefly flash amber or red, or "roll" to the new value to highlight the delta.
