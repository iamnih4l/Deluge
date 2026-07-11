# Responsive Design Guidelines

Deluge is designed for **Desktop First**. Emergency Operations Centers (EOCs) rely on large, multi-monitor setups. 

While the application must remain functional on smaller screens (laptops and tablets for field commanders), we **do not compromise the desktop experience** to cater to mobile devices.

## Breakpoints

We use standard Tailwind/CSS breakpoints, but our focus is primarily on `lg` and above.

- `sm` (640px) - Mobile (Unsupported/Minimal fallback).
- `md` (768px) - Tablet (Portrait). Panels may stack or require explicit toggling.
- `lg` (1024px) - Laptop. Default minimum target.
- `xl` (1280px) - Desktop. Standard EOC monitor.
- `2xl` (1536px) - Ultra-wide / 4K. Provide expanded map views and multi-panel layouts.

## Layout Adaptations

### Ultra-Wide (2xl+)
- All panels (Left Sidebar, Right Intelligence Panel) can remain permanently open without obscuring the map.
- The bottom timeline stretches to provide granular control.

### Standard Desktop (xl)
- The Left Sidebar is permanently visible.
- The Right Panel may slide out over the map when an item is selected.

### Laptop (lg)
- UI elements must be compact to maximize map space.
- The Left Sidebar might collapse into an icon-only rail.
- The Right Panel overlays a significant portion of the map when active.

## Responsive Map Handling
The map component (`MapLibre GL`) naturally fills its container. When panels slide in or out, use the `map.resize()` or `map.easeTo({ padding: ... })` methods to ensure the "center" of the map shifts so the active focal point is not hidden behind the newly opened panel.
