"use client";

import React from 'react';
import { SectionHeader, InfraRow } from '@/components/ui/DashboardComponents';
import { ShieldCheck } from 'lucide-react';
import { useSimulationStore } from '@/simulation';

export default function ZonesPage() {
  const shelters = useSimulationStore((s) => s.shelters);

  const getStatus = (status: string) => {
    switch (status) {
      case 'operational': return 'success';
      case 'at_capacity': return 'warning';
      case 'compromised': return 'critical';
      case 'offline': return 'critical';
      default: return 'success';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-slate-gray)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-safe-green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} /> Safe Zones
        </h2>
      </div>

      <div style={{ padding: '0 12px', overflow: 'auto', flex: 1, paddingTop: '12px' }}>
        <SectionHeader title={`Shelters & Rally Points (${shelters.length})`} />
        {shelters.map(shelter => {
          const capPercent = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);
          const detailStr = `Cap. ${capPercent}% · ${shelter.accessible ? 'Accessible' : 'Blocked'}`;
          
          return (
            <InfraRow 
              key={shelter.id} 
              iconType="shelter" 
              name={shelter.name} 
              status={getStatus(shelter.status)} 
              detail={detailStr} 
            />
          );
        })}

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
