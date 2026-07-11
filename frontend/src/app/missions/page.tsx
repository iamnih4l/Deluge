"use client";

import React from 'react';
import { MissionCard } from '@/components/ui/MissionCard';
import { SectionHeader } from '@/components/ui/DashboardComponents';
import { Filter } from 'lucide-react';

export default function MissionsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-slate-gray)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Mission Log</h2>
        <button style={{ color: 'var(--text-secondary)', display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.75rem' }}>
          <Filter size={14} /> FILTER
        </button>
      </div>

      <div style={{ padding: '0 12px', overflow: 'auto', flex: 1, paddingTop: '12px' }}>
        <SectionHeader title="Active (4)" />
        <MissionCard id="MSN-104" title="Evacuate Shelter Alpha" status="info" eta="4m" assignedUnit="Rescue 3" priority="P1" />
        <MissionCard id="MSN-105" title="Bridge Structural Collapse" status="critical" priority="P1" />
        <MissionCard id="MSN-106" title="Road Blockage Clearance" status="warning" eta="18m" assignedUnit="Eng. Unit 2" priority="P2" />
        <MissionCard id="MSN-107" title="Deploy Comm Array" status="info" eta="25m" assignedUnit="Drone 2" priority="P3" />

        <div style={{ height: '1px', backgroundColor: 'var(--border-slate-gray)', margin: '12px 0' }} />

        <SectionHeader title="Completed (2)" />
        <MissionCard id="MSN-103" title="Medical Supply Drop" status="success" assignedUnit="Drone 1" priority="P2" />
        <MissionCard id="MSN-102" title="Reconnaissance Sweep" status="success" assignedUnit="Drone 4" priority="P3" />
        
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
