"use client";

import React from 'react';
import { MissionCard } from '@/components/ui/MissionCard';
import { SectionHeader, IntelCard, InfraRow } from '@/components/ui/DashboardComponents';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Missions Section */}
      <SectionHeader title="Active Missions" count={4} />
      <div style={{ padding: '0 12px', overflow: 'auto', flex: 1 }}>
        <MissionCard
          id="MSN-104"
          title="Evacuate Shelter Alpha — Sector 5"
          status="info"
          statusLabel="IN PROGRESS"
          eta="4m"
          assignedUnit="Rescue 3"
          priority="P1"
        />
        <MissionCard
          id="MSN-105"
          title="Bridge Structural Collapse — Sector 7"
          status="critical"
          statusLabel="CRITICAL"
          priority="P1"
        />
        <MissionCard
          id="MSN-103"
          title="Medical Supply Drop — Zone B"
          status="success"
          statusLabel="COMPLETE"
          assignedUnit="Drone 1"
          priority="P2"
        />
        <MissionCard
          id="MSN-106"
          title="Road Blockage Clearance — I-95"
          status="warning"
          statusLabel="DELAYED"
          eta="18m"
          assignedUnit="Eng. Unit 2"
          priority="P2"
        />

        {/* Divider */}
        <div
          style={{
            height: '1px',
            backgroundColor: 'var(--border-slate-gray)',
            margin: '8px 0 4px',
          }}
        />

        {/* Intelligence */}
        <SectionHeader title="Decision Intelligence" count={3} />
        <IntelCard
          type="recommendation"
          title="AI Recommendation"
          body="Reroute Unit Alpha to Sector 7 via I-278. Current route shows 85% flood probability within 10 minutes."
          timestamp="2m ago"
        />
        <IntelCard
          type="alert"
          title="Flood Warning"
          body="Water levels at Gauge Station #4 exceeded 3.2m threshold. Residential zone B evacuation recommended."
          timestamp="6m ago"
        />
        <IntelCard
          type="update"
          title="Mission Complete"
          body="MSN-103 medical supply airdrop to Zone B confirmed delivered. All 240 units accounted for."
          timestamp="12m ago"
        />

        {/* Divider */}
        <div
          style={{
            height: '1px',
            backgroundColor: 'var(--border-slate-gray)',
            margin: '8px 0 4px',
          }}
        />

        {/* Infrastructure */}
        <SectionHeader title="Infrastructure Status" />
        <InfraRow iconType="hospital" name="Memorial Hospital" status="success" detail="Cap. 84% · Power OK" />
        <InfraRow iconType="power" name="Grid Station Delta" status="critical" detail="Submerged · 0 MW" />
        <InfraRow iconType="shelter" name="Shelter Echo" status="warning" detail="Cap. 96% · Overflow" />
        <InfraRow iconType="bridge" name="Highway Bridge I-95" status="critical" detail="Structural risk" />
        <InfraRow iconType="hospital" name="St. Mary Clinic" status="success" detail="Cap. 42% · Stable" />

        {/* Bottom spacer */}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
