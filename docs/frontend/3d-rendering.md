# 3D Rendering & The Digital Twin

To fulfill the vision of a "Living Digital Twin," Deluge incorporates 3D elements to visualize elevation, urban density, and dynamic flood propagation. 

*Rule: 3D is for situational awareness, not a gimmick. It must clarify data, not obscure it.*

## Technology Stack

For rendering 3D over standard maps, we have several options:
1. **MapLibre GL native 3D**: Supports 3D terrain and extruded polygons (buildings). This is the most performant baseline.
2. **Three.js / Threebox**: Integrates a Three.js scene synchronized with the MapLibre camera. Ideal for advanced particle systems (rain) or complex custom meshes.
3. **React Three Fiber (R3F)**: A React wrapper for Three.js. Powerful, but synchronizing it perfectly with MapLibre's camera can be complex.

**Recommendation**: Start with **MapLibre native 3D** for terrain and buildings. If complex animated water shaders are required, layer a Three.js canvas over the map synchronized to the camera matrix.

## Core 3D Features

### 1. 3D Terrain (Elevation)
Floods are entirely dependent on elevation. The operator must be able to tilt the camera and see valleys, hills, and topological bowls.
- Utilize a DEM (Digital Elevation Model) source.
- Configure MapLibre's `terrain` property.

### 2. Extruded Buildings
Urban environments require understanding building height and density to plan evacuations or drone flight paths.
- Use OpenStreetMap building data.
- Extrude polygons using the `height` property.
- Apply a semi-transparent, dark glassmorphism material or solid dark gray with edge highlights to maintain the "mission control" aesthetic.

### 3. Animated Water (Flood Simulation Mode)
This is the **Signature Feature**.
- **Visuals**: Rising water should look dynamic. Instead of a flat blue polygon, use a custom shader or semi-transparent extruded layer that visually represents depth. Deeper water appears darker or more opaque.
- **Animation**: When the operator clicks "Start Simulation," the water level property (`z-height` or `depth`) animates upward over time based on the backend simulator timeline.

## Performance Optimization

- 3D rendering is expensive.
- Provide an easy UI toggle to switch between `2D Tactical View` and `3D Simulation View`.
- Only render 3D buildings within a certain zoom threshold (e.g., zoom > 14).
- Use fog to obscure distant 3D elements and reduce rendering load.
