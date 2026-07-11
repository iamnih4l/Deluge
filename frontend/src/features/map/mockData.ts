/* ──────────────────────────────────────────
   Mock GeoJSON Data for the Digital Twin
   Centered on NYC (Lower Manhattan) for demo
   ────────────────────────────────────────── */

function buildingFeature(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number,
  height: number,
): GeoJSON.Feature {
  return {
    type: 'Feature',
    properties: { height, base_height: 0, color: '#1C2029' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [lng1, lat1],
          [lng2, lat1],
          [lng2, lat2],
          [lng1, lat2],
          [lng1, lat1],
        ],
      ],
    },
  };
}

export const MOCK_BUILDINGS: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // ── Block A (West) ──
    buildingFeature(-74.0095, 40.7140, -74.0088, 40.7135, 180),
    buildingFeature(-74.0095, 40.7132, -74.0088, 40.7127, 120),
    buildingFeature(-74.0095, 40.7124, -74.0090, 40.7120, 90),
    buildingFeature(-74.0085, 40.7140, -74.0078, 40.7135, 250),
    buildingFeature(-74.0085, 40.7132, -74.0078, 40.7127, 160),
    buildingFeature(-74.0085, 40.7124, -74.0080, 40.7120, 70),

    // ── Block B (Center) ──
    buildingFeature(-74.0072, 40.7142, -74.0065, 40.7136, 300),
    buildingFeature(-74.0072, 40.7133, -74.0066, 40.7128, 200),
    buildingFeature(-74.0072, 40.7125, -74.0068, 40.7121, 140),
    buildingFeature(-74.0062, 40.7142, -74.0055, 40.7137, 220),
    buildingFeature(-74.0062, 40.7134, -74.0056, 40.7129, 170),
    buildingFeature(-74.0062, 40.7126, -74.0058, 40.7122, 100),

    // ── Block C (East) ──
    buildingFeature(-74.0050, 40.7143, -74.0044, 40.7138, 280),
    buildingFeature(-74.0050, 40.7135, -74.0045, 40.7130, 190),
    buildingFeature(-74.0050, 40.7127, -74.0046, 40.7123, 110),
    buildingFeature(-74.0040, 40.7143, -74.0034, 40.7138, 260),
    buildingFeature(-74.0040, 40.7135, -74.0035, 40.7131, 150),
    buildingFeature(-74.0040, 40.7128, -74.0036, 40.7124, 80),

    // ── Block D (Far East) ──
    buildingFeature(-74.0030, 40.7141, -74.0024, 40.7136, 230),
    buildingFeature(-74.0030, 40.7133, -74.0025, 40.7129, 170),
    buildingFeature(-74.0022, 40.7141, -74.0016, 40.7137, 190),
    buildingFeature(-74.0022, 40.7134, -74.0017, 40.7130, 130),

    // ── Scattered low-rise ──
    buildingFeature(-74.0098, 40.7148, -74.0092, 40.7144, 50),
    buildingFeature(-74.0052, 40.7115, -74.0047, 40.7112, 45),
    buildingFeature(-74.0035, 40.7115, -74.0030, 40.7112, 35),
    buildingFeature(-74.0070, 40.7115, -74.0065, 40.7112, 55),
  ],
};

export const MOCK_FLOOD_ZONE: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-74.0105, 40.7155],
            [-74.0010, 40.7155],
            [-74.0010, 40.7108],
            [-74.0105, 40.7108],
            [-74.0105, 40.7155],
          ],
        ],
      },
    },
  ],
};
