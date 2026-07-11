"use client";

import React from 'react';
import { SectionHeader } from '@/components/ui/DashboardComponents';
import { Crosshair, Navigation, Ship, Truck, Command } from 'lucide-react';
import { useSimulationStore } from '@/simulation';

export default function UnitsPage() {
  const vehicles = useSimulationStore((s) => s.vehicles);

  const drones = vehicles.filter(v => v.type === 'drone');
  const rescue = vehicles.filter(v => v.type === 'rescue_boat');
  const medical = vehicles.filter(v => v.type === 'ambulance');
  const engineering = vehicles.filter(v => v.type === 'engineering');
  const command = vehicles.filter(v => v.type === 'command');

  const renderVehicleRow = (v: typeof vehicles[0], Icon: React.ElementType, color: string) => {
    let statusText = v.status.replace('_', ' ').toUpperCase();
    if (v.status === 'en_route') statusText = 'EN ROUTE';
    
    return (
      <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: '1px solid var(--border-slate-gray)' }}>
        <Icon size={18} style={{ color }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 500 }}>{v.callsign}</div>
          <div style={{ fontSize: '0.65rem', color: v.status === 'idle' ? 'var(--text-tertiary)' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {statusText} {v.assignedMission ? `· ${v.assignedMission}` : ''}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-slate-gray)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crosshair size={18} /> Active Units
        </h2>
      </div>

      <div style={{ padding: '0 12px', overflow: 'auto', flex: 1, paddingTop: '12px' }}>
        {drones.length > 0 && (
          <>
            <SectionHeader title="Aerial Drones" />
            {drones.map(v => renderVehicleRow(v, Navigation, 'var(--color-primary-blue)'))}
          </>
        )}

        {rescue.length > 0 && (
          <>
            <SectionHeader title="Marine Rescue" />
            {rescue.map(v => renderVehicleRow(v, Ship, 'var(--color-info-cyan)'))}
          </>
        )}

        {medical.length > 0 && (
          <>
            <SectionHeader title="Medical Transport" />
            {medical.map(v => renderVehicleRow(v, Truck, 'var(--color-safe-green)'))}
          </>
        )}

        {engineering.length > 0 && (
          <>
            <SectionHeader title="Engineering" />
            {engineering.map(v => renderVehicleRow(v, Truck, 'var(--color-warning-amber)'))}
          </>
        )}

        {command.length > 0 && (
          <>
            <SectionHeader title="Command & Control" />
            {command.map(v => renderVehicleRow(v, Command, 'var(--text-primary)'))}
          </>
        )}

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
