"use client";

import React from 'react';
import { SectionHeader, InfraRow } from '@/components/ui/DashboardComponents';
import { Activity } from 'lucide-react';
import { useSimulationStore } from '@/simulation';

export default function InfraPage() {
  const infrastructure = useSimulationStore((s) => s.infrastructure);

  const powerGrid = infrastructure.filter(i => i.type === 'power_station');
  const medical = infrastructure.filter(i => i.type === 'hospital');
  const transit = infrastructure.filter(i => i.type === 'bridge');

  const getStatus = (status: string) => {
    switch (status) {
      case 'operational': return 'success';
      case 'at_capacity': return 'warning';
      case 'compromised': return 'warning';
      case 'offline': return 'critical';
      default: return 'success';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-slate-gray)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} /> Infrastructure
        </h2>
      </div>

      <div style={{ padding: '0 12px', overflow: 'auto', flex: 1, paddingTop: '12px' }}>
        {powerGrid.length > 0 && (
          <>
            <SectionHeader title="Power Grid" />
            {powerGrid.map(inf => (
              <InfraRow key={inf.id} iconType="power" name={inf.name} status={getStatus(inf.status)} detail={inf.detail} />
            ))}
            <div style={{ height: '1px', backgroundColor: 'var(--border-slate-gray)', margin: '12px 0' }} />
          </>
        )}

        {medical.length > 0 && (
          <>
            <SectionHeader title="Medical Facilities" />
            {medical.map(inf => (
              <InfraRow key={inf.id} iconType="hospital" name={inf.name} status={getStatus(inf.status)} detail={inf.detail} />
            ))}
            <div style={{ height: '1px', backgroundColor: 'var(--border-slate-gray)', margin: '12px 0' }} />
          </>
        )}

        {transit.length > 0 && (
          <>
            <SectionHeader title="Transportation" />
            {transit.map(inf => (
              <InfraRow key={inf.id} iconType="bridge" name={inf.name} status={getStatus(inf.status)} detail={inf.detail} />
            ))}
          </>
        )}
        
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
