"use client";

import React from 'react';
import { SectionHeader, InfraRow } from '@/components/ui/DashboardComponents';
import { ShieldCheck } from 'lucide-react';

export default function ZonesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-slate-gray)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-safe-green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} /> Safe Zones
        </h2>
      </div>

      <div style={{ padding: '0 12px', overflow: 'auto', flex: 1, paddingTop: '12px' }}>
        <SectionHeader title="Primary Shelters" />
        <InfraRow iconType="shelter" name="Shelter Alpha" status="success" detail="Cap. 45% · Safe" />
        <InfraRow iconType="shelter" name="Shelter Bravo" status="success" detail="Cap. 72% · Safe" />
        <InfraRow iconType="shelter" name="Shelter Charlie" status="warning" detail="Cap. 96% · Nearing Max" />
        
        <SectionHeader title="Emergency Points" />
        <InfraRow iconType="shelter" name="Stadium Rally Point" status="success" detail="Active · Supplying" />
        <InfraRow iconType="shelter" name="High-School Gym" status="critical" detail="Compromised · Flooding" />

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
