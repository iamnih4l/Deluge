# GIS Engine

Geographic Information Systems (GIS) capabilities are heavily utilized on both the frontend and backend of Deluge to process, analyze, and render spatial data.

## Backend Spatial Logic

The backend uses standard geographic math (e.g., Haversine formula) and computational geometry (e.g., `Shapely`) to:
1. Interpolate vehicle positions smoothly along coordinate paths based on unit speed.
2. Calculate the expanding multi-point polygons of flood cells.
3. Perform intersection testing between road line-strings and flood polygons.

## Frontend Rendering (MapLibre GL)

The frontend uses `MapLibre GL` to translate raw coordinate data into a high-performance interactive map.

- **Data Sources**: The frontend defines multiple GeoJSON sources (`buildings`, `flood`, `vehicles`, `road-network`).
- **Layers**: Rendering rules are strictly defined to separate concerns. For instance, flood polygons are rendered as filled layers (`fill-color`), while roads are rendered as lines (`line-color`).
- **Real-time Updates**: When the backend broadcasts a new state, the frontend transforms the internal model (e.g., `Vehicle[]`) into a valid GeoJSON `FeatureCollection` and updates the MapLibre source data dynamically, achieving smooth 60fps animations without full React re-renders.
