# Map Rendering Architecture

The core of the Deluge frontend is the map. We use **MapLibre GL JS** for rendering high-performance vector tiles. It is open-source, highly customizable, and capable of handling complex data visualizations at 60 FPS.

## Map Configuration

### Base Style
The base map style should be a customized dark theme.
- **Background**: Deep Slate (`#0F1115`).
- **Roads**: Dark gray, low contrast against the background unless highlighted.
- **Water bodies (Natural)**: Very dark, desaturated blue.
- **Labels**: High contrast (white/light gray) with a subtle dark halo to ensure readability over varied backgrounds.

### Layers Hierarchy

Z-index management is critical in MapLibre. Layers must be ordered logically from bottom to top:

1. **Base Terrain**: Satellite or minimal vector background.
2. **Water Bodies**: Static rivers, lakes, oceans.
3. **Road Network**: The static infrastructure.
4. **Flood Polygons (Dynamic)**: Semi-transparent blue/amber/red polygons indicating flood depth/risk.
5. **Dynamic Routes**: Highlighted lines showing active vehicle paths.
6. **3D Extrusions**: Buildings (when tilted).
7. **Markers**: Shelters, Hospitals, Power Stations (Icons).
8. **Live Assets**: Emergency vehicles (Icons with directional arrows).
9. **Labels**: City names, street names (must float above everything else for readability).

## Handling Dynamic Data (GeoJSON)

Deluge relies heavily on real-time data.
- **Static Data**: Loaded once (e.g., initial road network, building footprints).
- **Dynamic Data**: Streamed via WebSockets.
  - When an update arrives, we update the `GeoJSONSource` using `setData()`.
  - To prevent performance bottlenecks, only update the features that have changed, or use specific property updates if supported.
  - **Avoid**: Re-rendering the entire map component in React when data changes. Use `useRef` to maintain the map instance and update it imperatively.

## Layer Styling based on Data Properties

Use MapLibre's data-driven styling capabilities heavily.

```javascript
// Example: Styling a road based on its risk score
'line-color': [
  'interpolate',
  ['linear'],
  ['get', 'riskScore'],
  0, '#3B82F6', // Safe (Blue or Dark Gray)
  0.5, '#F59E0B', // Warning (Amber)
  1.0, '#EF4444'  // Critical / Flooded (Red)
]
```
