"use client";

import React from 'react';
import { SectionHeader, InfraRow } from '@/components/ui/DashboardComponents';
import { Activity } from 'lucide-react';

export default function InfraPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-slate-gray)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} /> Infrastructure
        </h2>
      </div>

      <div style={{ padding: '0 12px', overflow: 'auto', flex: 1, paddingTop: '12px' }}>
        <SectionHeader title="Power Grid" />
        <InfraRow iconType="power" name="Main Substation" status="success" detail="100 MW · Stable" />
        <InfraRow iconType="power" name="Grid Station Delta" status="critical" detail="Submerged · 0 MW" />
        <InfraRow iconType="power" name="Generator Array 1" status="warning" detail="Fuel Low (12%)" />

        <div style={{ height: '1px', backgroundColor: 'var(--border-slate-gray)', margin: '12px 0' }} />

        <SectionHeader title="Medical Facilities" />
        <InfraRow iconType="hospital" name="Memorial Hospital" status="success" detail="Cap. 84% · Power OK" />
        <InfraRow iconType="hospital" name="St. Mary Clinic" status="warning" detail="Cap. 102% · Overflow" />

        <div style={{ height: '1px', backgroundColor: 'var(--border-slate-gray)', margin: '12px 0' }} />

        <SectionHeader title="Transportation" />
        <InfraRow iconType="bridge" name="Highway Bridge I-95" status="critical" detail="Structural risk · Closed" />
        <InfraRow iconType="bridge" name="Route 9 Tunnel" status="warning" detail="Minor flooding" />
        
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
