"use client";

import React from 'react';
import { SectionHeader, IntelCard } from '@/components/ui/DashboardComponents';
import { AlertOctagon } from 'lucide-react';

export default function AlertsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-slate-gray)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-critical-red)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertOctagon size={18} /> Alert Feed
        </h2>
      </div>

      <div style={{ padding: '0 12px', overflow: 'auto', flex: 1, paddingTop: '12px' }}>
        <SectionHeader title="Critical (1)" />
        <IntelCard type="alert" title="Flood Warning" body="Water levels at Gauge Station #4 exceeded 3.2m threshold. Immediate evacuation of Residential zone B is required." timestamp="Just now" />
        
        <SectionHeader title="Warnings (2)" />
        <IntelCard type="alert" title="Power Grid Instability" body="Substation Alpha reporting voltage fluctuations. Backup generators should be primed." timestamp="14m ago" />
        <IntelCard type="alert" title="Wind Shear Detected" body="High wind speeds may affect Drone Unit stability in Sector 9." timestamp="22m ago" />

        <SectionHeader title="AI Insights" />
        <IntelCard type="recommendation" title="Route Optimization" body="Reroute ground units from I-95 due to structural stress detected on highway bridge." timestamp="1hr ago" />
        
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
