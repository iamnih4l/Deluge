"use client";

import React from 'react';
import { SectionHeader, InfraRow } from '@/components/ui/DashboardComponents';
import { Crosshair, Navigation } from 'lucide-react';

export default function UnitsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-slate-gray)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crosshair size={18} /> Active Units
        </h2>
      </div>

      <div style={{ padding: '0 12px', overflow: 'auto', flex: 1, paddingTop: '12px' }}>
        <SectionHeader title="Aerial Drones" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: '1px solid var(--border-slate-gray)' }}>
          <Navigation size={18} style={{ color: 'var(--color-primary-blue)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 500 }}>Drone 1 (Recon)</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>Alt: 400ft · Bat: 82%</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: '1px solid var(--border-slate-gray)' }}>
          <Navigation size={18} style={{ color: 'var(--color-primary-blue)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 500 }}>Drone 2 (Comm)</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-warning-amber)', fontFamily: 'var(--font-mono)' }}>Alt: 200ft · Bat: 18% (RTB)</div>
          </div>
        </div>

        <SectionHeader title="Ground Rescue" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: '1px solid var(--border-slate-gray)' }}>
          <Crosshair size={18} style={{ color: 'var(--color-safe-green)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 500 }}>Rescue Team Alpha</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>Sector 5 · Engaged</div>
          </div>
        </div>

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
