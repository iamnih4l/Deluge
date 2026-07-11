"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '@/store';
import { MOCK_BUILDINGS, MOCK_FLOOD_ZONE } from '@/features/map/mockData';
import { Building2, Waves } from 'lucide-react';

/* ──────────────────────────────────────────
   Map overlay button styles
   ────────────────────────────────────────── */
const overlayBtnBase: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontSize: '0.7rem',
  fontWeight: 500,
  letterSpacing: '0.3px',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  transition: 'all var(--transition-fast)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

export const Interactive3DMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const { viewState, setViewState, simulationTime } = useMapStore();
  const [showBuildings, setShowBuildings] = useState(true);
  const [showFlood, setShowFlood] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // ── Initialize Map ──
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
          buildings: {
            type: 'geojson',
            data: MOCK_BUILDINGS,
          },
          flood: {
            type: 'geojson',
            data: MOCK_FLOOD_ZONE,
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            paint: {
              'raster-brightness-max': 0.25,
              'raster-saturation': -0.9,
              'raster-contrast': 0.15,
            },
          },
          {
            id: '3d-buildings',
            source: 'buildings',
            type: 'fill-extrusion',
            paint: {
              'fill-extrusion-color': '#1C2029',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'base_height'],
              'fill-extrusion-opacity': 0.85,
            },
          },
          {
            id: 'flood-layer',
            source: 'flood',
            type: 'fill-extrusion',
            paint: {
              'fill-extrusion-color': '#3B82F6',
              'fill-extrusion-height': 0,
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.55,
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

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

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

  // ── Flood animation ──
  useEffect(() => {
    if (!map.current || !mapReady || !map.current.getLayer('flood-layer')) return;

    const time = Number(simulationTime) || 0;
    const waterHeight = (time / 100) * 120;

    let color = '#3B82F6';
    if (time > 50) color = '#F59E0B';
    if (time > 80) color = '#EF4444';

    if (!isNaN(waterHeight)) {
      map.current.setPaintProperty('flood-layer', 'fill-extrusion-height', waterHeight);
      map.current.setPaintProperty('flood-layer', 'fill-extrusion-color', color);
      map.current.setPaintProperty(
        'flood-layer',
        'fill-extrusion-opacity',
        0.35 + (time / 100) * 0.35,
      );
    }
  }, [simulationTime, mapReady]);

  // ── Toggles ──
  useEffect(() => {
    if (!map.current || !mapReady || !map.current.getLayer('3d-buildings')) return;
    map.current.setLayoutProperty('3d-buildings', 'visibility', showBuildings ? 'visible' : 'none');
  }, [showBuildings, mapReady]);

  useEffect(() => {
    if (!map.current || !mapReady || !map.current.getLayer('flood-layer')) return;
    map.current.setLayoutProperty('flood-layer', 'visibility', showFlood ? 'visible' : 'none');
  }, [showFlood, mapReady]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* ── Floating Toolbar (Glassmorphism) ── */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '8px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(18, 21, 27, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-slate-gray)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <button
          onClick={() => setShowBuildings(!showBuildings)}
          style={{
            ...overlayBtnBase,
            backgroundColor: showBuildings ? 'var(--color-primary-blue-dim)' : 'transparent',
            border: `1px solid ${
              showBuildings ? 'var(--color-primary-blue)' : 'var(--border-slate-gray)'
            }`,
          }}
        >
          <Building2 size={16} />
          Buildings
        </button>
        <button
          onClick={() => setShowFlood(!showFlood)}
          style={{
            ...overlayBtnBase,
            backgroundColor: showFlood ? 'var(--color-primary-blue-dim)' : 'transparent',
            border: `1px solid ${
              showFlood ? 'var(--color-primary-blue)' : 'var(--border-slate-gray)'
            }`,
          }}
        >
          <Waves size={16} />
          Flood Layer
        </button>
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
          backgroundColor: 'rgba(18, 21, 27, 0.65)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        {viewState.latitude.toFixed(4)}°N, {Math.abs(viewState.longitude).toFixed(4)}°W &nbsp;|&nbsp; Zoom{' '}
        {viewState.zoom.toFixed(1)} &nbsp;|&nbsp; Pitch {viewState.pitch.toFixed(0)}°
      </div>
    </div>
  );
};
