# Performance Optimization

Deluge must maintain a fluid 60 FPS under heavy data loads. Stuttering UI during an emergency is unacceptable.

## 1. Rendering Optimization

### Avoid Unnecessary Re-renders
React is fast, but re-rendering deep component trees on every WebSocket tick will freeze the UI.
- Use `React.memo` for pure components (e.g., `MissionCard`, `StatusBadge`).
- Use Zustand selectively. Only subscribe components to the specific slice of state they need.
  - *Bad*: `const state = useStore()` (Updates component on ANY state change).
  - *Good*: `const activeMissionId = useStore((state) => state.activeMissionId)`.

### List Virtualization
If a sidebar contains hundreds of missions or historical alerts, use list virtualization (e.g., `@tanstack/react-virtual`). This only renders the DOM nodes currently visible in the viewport.

## 2. Map Performance

The MapLibre GL instance is the heaviest element in the app.
- **Data-Driven Styling**: Rely entirely on MapLibre's internal WebGL engine for styling features based on data properties rather than manipulating features manually in JS.
- **Imperative Updates**: As mentioned in the Architecture doc, update map sources imperatively (`source.setData(geojsonData)`) outside of the React render cycle.
- **GeoJSON Tiling**: If the raw GeoJSON data is massive (entire state road network), use tools like `geojson-vt` on the client or server to slice the data into vector tiles on the fly.

## 3. Asset Loading

- **Lazy Loading**: Use `React.lazy` and Next.js dynamic imports (`next/dynamic`) for components that aren't immediately visible (e.g., Settings panels, complex historical charts).
- **Asset Optimization**: Compress fonts, icons, and 3D models. A large Three.js model must be optimized (e.g., Draco compression for glTF files).
