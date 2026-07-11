"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '@/store';
import { useSimulationStore } from '@/simulation';
import { MOCK_BUILDINGS } from '@/features/map/mockData';
import { SimulationPanel } from '@/components/ui/SimulationPanel';
import {
  Building2,
  Waves,
  Truck,
  Route,
  ShieldCheck,
  Activity,
  MapPin,
  Layers,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

/* ──────────────────────────────────────────
   Styles
   ────────────────────────────────────────── */
const overlayBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '5px 10px',
  borderRadius: 'var(--radius-md)',
  color: active ? 'var(--color-primary-blue)' : 'var(--text-secondary)',
  fontSize: '0.65rem',
  fontWeight: 500,
  letterSpacing: '0.3px',
  backgroundColor: active ? 'var(--color-primary-blue-dim)' : 'transparent',
  border: `1px solid ${active ? 'var(--color-primary-blue)' : 'var(--border-slate-gray)'}`,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  transition: 'all var(--transition-fast)',
});

/* ──────────────────────────────────────────
   GeoJSON Builders
   Convert simulation state to map-renderable GeoJSON
   ────────────────────────────────────────── */
function buildFloodGeoJSON(
  floodCells: ReturnType<typeof useSimulationStore.getState>['floodCells'],
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: floodCells
      .filter((c) => c.polygon.length > 0)
      .map((cell) => ({
        type: 'Feature' as const,
        properties: {
          id: cell.id,
          depth: cell.waterDepth,
          radius: cell.currentRadius,
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [cell.polygon],
        },
      })),
  };
}

function buildVehicleGeoJSON(
  vehicles: ReturnType<typeof useSimulationStore.getState>['vehicles'],
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: vehicles.map((v) => ({
      type: 'Feature' as const,
      properties: {
        id: v.id,
        callsign: v.callsign,
        type: v.type,
        status: v.status,
        heading: v.heading,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: v.position,
      },
    })),
  };
}

function buildRouteGeoJSON(
  vehicles: ReturnType<typeof useSimulationStore.getState>['vehicles'],
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: vehicles
      .filter((v) => v.route.length >= 2 && v.status === 'en_route')
      .map((v) => ({
        type: 'Feature' as const,
        properties: { id: v.id, callsign: v.callsign },
        geometry: {
          type: 'LineString' as const,
          coordinates: v.route,
        },
      })),
  };
}

function buildRoadGeoJSON(
  roads: ReturnType<typeof useSimulationStore.getState>['roads'],
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: roads.map((r) => ({
      type: 'Feature' as const,
      properties: {
        id: r.id,
        name: r.name,
        status: r.status,
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: r.path,
      },
    })),
  };
}

function buildMarkerGeoJSON(
  shelters: ReturnType<typeof useSimulationStore.getState>['shelters'],
  infrastructure: ReturnType<typeof useSimulationStore.getState>['infrastructure'],
): GeoJSON.FeatureCollection {
  const shelterFeatures: GeoJSON.Feature[] = shelters.map((s) => ({
    type: 'Feature',
    properties: {
      id: s.id,
      name: s.name,
      markerType: 'shelter',
      status: s.status,
      detail: `Cap. ${Math.round((s.currentOccupancy / s.capacity) * 100)}%`,
    },
    geometry: { type: 'Point', coordinates: s.position },
  }));

  const infraFeatures: GeoJSON.Feature[] = infrastructure.map((inf) => ({
    type: 'Feature',
    properties: {
      id: inf.id,
      name: inf.name,
      markerType: inf.type,
      status: inf.status,
      detail: inf.detail,
    },
    geometry: { type: 'Point', coordinates: inf.position },
  }));

  return {
    type: 'FeatureCollection',
    features: [...shelterFeatures, ...infraFeatures],
  };
}

/* ──────────────────────────────────────────
   Component
   ────────────────────────────────────────── */
export const Interactive3DMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const { viewState, setViewState, layers, toggleLayer } = useMapStore();
  const [mapReady, setMapReady] = useState(false);
  const [layerPanelOpen, setLayerPanelOpen] = useState(true);

  // Subscribe to simulation state for updates
  const simTime = useSimulationStore((s) => s.time);
  const severity = useSimulationStore((s) => s.severity);
  const floodCells = useSimulationStore((s) => s.floodCells);
  const vehicles = useSimulationStore((s) => s.vehicles);
  const roads = useSimulationStore((s) => s.roads);
  const shelters = useSimulationStore((s) => s.shelters);
  const infrastructure = useSimulationStore((s) => s.infrastructure);

  /* ── Initialize Map ── */
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
          },
          buildings: { type: 'geojson', data: MOCK_BUILDINGS },
          flood: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
          vehicles: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
          routes: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
          'road-network': { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
          markers: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            paint: {
              'raster-brightness-max': 0.22,
              'raster-saturation': -0.95,
              'raster-contrast': 0.18,
            },
          },
          // 3D Buildings
          {
            id: '3d-buildings',
            source: 'buildings',
            type: 'fill-extrusion',
            paint: {
              'fill-extrusion-color': [
                'interpolate', ['linear'], ['get', 'height'],
                0, '#171B22',
                150, '#1C2029',
                300, '#252A35',
              ],
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'base_height'],
              'fill-extrusion-opacity': 0.88,
            },
          },
          // Road Network
          {
            id: 'road-network-layer',
            source: 'road-network',
            type: 'line',
            paint: {
              'line-color': [
                'match', ['get', 'status'],
                'open', '#10B981',
                'at_risk', '#F59E0B',
                'flooded', '#EF4444',
                'blocked', '#7F1D1D',
                '#475569',
              ],
              'line-width': 3,
              'line-opacity': 0.7,
            },
          },
          // Flood zones (3D extrusion for water depth)
          {
            id: 'flood-layer',
            source: 'flood',
            type: 'fill-extrusion',
            paint: {
              'fill-extrusion-color': [
                'interpolate', ['linear'], ['get', 'depth'],
                0, '#3B82F6',
                2, '#F59E0B',
                4, '#EF4444',
              ],
              'fill-extrusion-height': ['*', ['get', 'depth'], 25],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.5,
            },
          },
          // Routes (dashed lines)
          {
            id: 'routes-layer',
            source: 'routes',
            type: 'line',
            paint: {
              'line-color': '#06B6D4',
              'line-width': 2.5,
              'line-dasharray': [2, 2],
              'line-opacity': 0.8,
            },
          },
          // Vehicle markers (circles)
          {
            id: 'vehicles-layer',
            source: 'vehicles',
            type: 'circle',
            paint: {
              'circle-radius': [
                'match', ['get', 'type'],
                'drone', 5,
                'command', 8,
                6,
              ],
              'circle-color': [
                'match', ['get', 'status'],
                'en_route', '#06B6D4',
                'on_scene', '#10B981',
                'returning', '#F59E0B',
                '#64748B',
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#0B0D11',
              'circle-opacity': 0.95,
            },
          },
          // Vehicle labels
          {
            id: 'vehicle-labels',
            source: 'vehicles',
            type: 'symbol',
            layout: {
              'text-field': ['get', 'callsign'],
              'text-size': 10,
              'text-offset': [0, 1.5],
              'text-font': ['Open Sans Regular'],
            },
            paint: {
              'text-color': '#F1F5F9',
              'text-halo-color': '#0B0D11',
              'text-halo-width': 1.5,
            },
          },
          // Infrastructure / Shelter markers
          {
            id: 'markers-layer',
            source: 'markers',
            type: 'circle',
            paint: {
              'circle-radius': 7,
              'circle-color': [
                'match', ['get', 'markerType'],
                'shelter', '#10B981',
                'hospital', '#F1F5F9',
                'power_station', '#F59E0B',
                'bridge', '#EF4444',
                '#64748B',
              ],
              'circle-stroke-width': 2.5,
              'circle-stroke-color': '#0B0D11',
            },
          },
          // Marker labels
          {
            id: 'marker-labels',
            source: 'markers',
            type: 'symbol',
            layout: {
              'text-field': ['get', 'name'],
              'text-size': 10,
              'text-offset': [0, 1.8],
              'text-font': ['Open Sans Regular'],
            },
            paint: {
              'text-color': '#94A3B8',
              'text-halo-color': '#0B0D11',
              'text-halo-width': 1.2,
            },
          },
        ],
      },
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing,
      attributionControl: false,
    });

    map.current.addControl(
      new maplibregl.NavigationControl({ showCompass: true }),
      'bottom-right',
    );

    map.current.on('load', () => setMapReady(true));

    map.current.on('moveend', () => {
      if (!map.current) return;
      setViewState({
        longitude: map.current.getCenter().lng,
        latitude: map.current.getCenter().lat,
        zoom: map.current.getZoom(),
        pitch: map.current.getPitch(),
        bearing: map.current.getBearing(),
      });
    });

    return () => {
      map.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Update map data from simulation state ── */
  const updateMapData = useCallback(() => {
    if (!map.current || !mapReady) return;

    const m = map.current;

    // Update flood zones
    const floodSrc = m.getSource('flood') as maplibregl.GeoJSONSource | undefined;
    if (floodSrc) floodSrc.setData(buildFloodGeoJSON(floodCells));

    // Update vehicles
    const vehSrc = m.getSource('vehicles') as maplibregl.GeoJSONSource | undefined;
    if (vehSrc) vehSrc.setData(buildVehicleGeoJSON(vehicles));

    // Update routes
    const routeSrc = m.getSource('routes') as maplibregl.GeoJSONSource | undefined;
    if (routeSrc) routeSrc.setData(buildRouteGeoJSON(vehicles));

    // Update road network
    const roadSrc = m.getSource('road-network') as maplibregl.GeoJSONSource | undefined;
    if (roadSrc) roadSrc.setData(buildRoadGeoJSON(roads));

    // Update markers
    const markerSrc = m.getSource('markers') as maplibregl.GeoJSONSource | undefined;
    if (markerSrc) markerSrc.setData(buildMarkerGeoJSON(shelters, infrastructure));
  }, [mapReady, floodCells, vehicles, roads, shelters, infrastructure]);

  useEffect(() => {
    updateMapData();
  }, [updateMapData]);

  /* ── Layer visibility ── */
  useEffect(() => {
    if (!map.current || !mapReady) return;
    const m = map.current;
    const layerMap: Record<string, string[]> = {
      buildings: ['3d-buildings'],
      flood: ['flood-layer'],
      vehicles: ['vehicles-layer', 'vehicle-labels'],
      routes: ['routes-layer'],
      shelters: ['markers-layer', 'marker-labels'],
      infrastructure: ['markers-layer', 'marker-labels'],
      roads: ['road-network-layer'],
    };

    Object.entries(layers).forEach(([key, visible]) => {
      const mapLayers = layerMap[key];
      if (mapLayers) {
        mapLayers.forEach((layerId) => {
          if (m.getLayer(layerId)) {
            m.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
          }
        });
      }
    });
  }, [layers, mapReady]);

  /* ── Severity border effect ── */
  const borderColor =
    severity === 'critical'
      ? 'rgba(239, 68, 68, 0.4)'
      : severity === 'elevated'
      ? 'rgba(245, 158, 11, 0.25)'
      : 'transparent';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Severity border glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 15,
          boxShadow: `inset 0 0 40px ${borderColor}`,
          transition: 'box-shadow 1s ease',
          borderRadius: '0',
        }}
      />

      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* ── Layer Control Panel ── */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          padding: '8px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-lg)',
          minWidth: '130px',
        }}
      >
        <button
          onClick={() => setLayerPanelOpen(!layerPanelOpen)}
          style={{
            ...overlayBtnStyle(false),
            border: 'none',
            justifyContent: 'space-between',
            color: 'var(--text-primary)',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.8px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Layers size={14} /> LAYERS
          </span>
          {layerPanelOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {layerPanelOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, animation: 'fade-in 0.2s ease' }}>
            <button onClick={() => toggleLayer('buildings')} style={overlayBtnStyle(layers.buildings)}>
              <Building2 size={14} /> Buildings
            </button>
            <button onClick={() => toggleLayer('flood')} style={overlayBtnStyle(layers.flood)}>
              <Waves size={14} /> Flood
            </button>
            <button onClick={() => toggleLayer('vehicles')} style={overlayBtnStyle(layers.vehicles)}>
              <Truck size={14} /> Vehicles
            </button>
            <button onClick={() => toggleLayer('routes')} style={overlayBtnStyle(layers.routes)}>
              <Route size={14} /> Routes
            </button>
            <button onClick={() => toggleLayer('roads')} style={overlayBtnStyle(layers.roads)}>
              <MapPin size={14} /> Roads
            </button>
            <button onClick={() => toggleLayer('shelters')} style={overlayBtnStyle(layers.shelters)}>
              <ShieldCheck size={14} /> Shelters
            </button>
            <button onClick={() => toggleLayer('infrastructure')} style={overlayBtnStyle(layers.infrastructure)}>
              <Activity size={14} /> Infra
            </button>
          </div>
        )}
      </div>

      {/* ── Coordinates HUD ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          zIndex: 10,
          fontSize: '0.6rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-tertiary)',
          backgroundColor: 'var(--glass-bg)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          backdropFilter: 'var(--glass-blur-light)',
          WebkitBackdropFilter: 'var(--glass-blur-light)',
          border: '1px solid var(--glass-border)',
        }}
      >
        {viewState.latitude.toFixed(4)}°N, {Math.abs(viewState.longitude).toFixed(4)}°W
        &nbsp;|&nbsp; Zoom {viewState.zoom.toFixed(1)}
        &nbsp;|&nbsp; Pitch {viewState.pitch.toFixed(0)}°
      </div>

      {/* ── Simulation Control Panel ── */}
      <SimulationPanel />
    </div>
  );
};
