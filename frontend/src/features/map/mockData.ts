/* ──────────────────────────────────────────
   Mock GeoJSON Data for the Digital Twin
   Centered on Aluva, Kerala (76.35, 10.10)
   ────────────────────────────────────────── */

import { INITIAL_INFRASTRUCTURE, INITIAL_SHELTERS } from '../../simulation/initialData';

function buildingFeature(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number,
  height: number,
  type: string = 'standard'
): GeoJSON.Feature {
  let color = '#252A35'; // standard dark gray
  if (type === 'hospital') color = '#3B82F6'; // Blue
  else if (type === 'shelter') color = '#10B981'; // Green
  else if (type === 'power_station') color = '#8B5CF6'; // Purple
  else if (type === 'bridge') color = '#64748B'; // Slate
  else if (type === 'police') color = '#1E3A8A'; // Dark Blue
  else if (type === 'fire') color = '#F97316'; // Orange

  return {
    type: 'Feature',
    properties: { height, base_height: 0, color, type },
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
  features: [],
};

// Generate standard city blocks around Aluva
const centerLng = 76.3500;
const centerLat = 10.1000;
const blockSize = 0.001;
const gap = 0.0002;

for (let i = -3; i <= 3; i++) {
  for (let j = -3; j <= 3; j++) {
    const baselng = centerLng + i * (blockSize + gap);
    const baselat = centerLat + j * (blockSize + gap);
    const h = 20 + Math.random() * 80;
    
    // Skip some blocks for roads
    if (Math.random() > 0.8) continue;
    
    MOCK_BUILDINGS.features.push(
      buildingFeature(baselng, baselat, baselng + blockSize, baselat + blockSize, h)
    );
  }
}

// Add Critical Infrastructure as specific colored buildings
INITIAL_INFRASTRUCTURE.forEach((infra) => {
  MOCK_BUILDINGS.features.push(
    buildingFeature(
      infra.position[0] - 0.0005,
      infra.position[1] - 0.0005,
      infra.position[0] + 0.0005,
      infra.position[1] + 0.0005,
      120, // Taller
      infra.type
    )
  );
});

INITIAL_SHELTERS.forEach((shelter) => {
  MOCK_BUILDINGS.features.push(
    buildingFeature(
      shelter.position[0] - 0.0005,
      shelter.position[1] - 0.0005,
      shelter.position[0] + 0.0005,
      shelter.position[1] + 0.0005,
      60,
      'shelter'
    )
  );
});
