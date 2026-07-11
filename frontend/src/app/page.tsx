"use client";

import React from 'react';
import { MissionCard } from '@/components/ui/MissionCard';
import { SectionHeader, IntelCard, InfraRow } from '@/components/ui/DashboardComponents';
import { useSimulationStore } from '@/simulation';

/** Map simulation mission status to UI badge status */
function mapMissionStatus(status: string): 'success' | 'warning' | 'critical' | 'info' {
  switch (status) {
    case 'complete': return 'success';
    case 'delayed': return 'warning';
    case 'critical': return 'critical';
    case 'in_progress': return 'info';
    case 'pending': return 'info';
    default: return 'info';
  }
}

function mapMissionStatusLabel(status: string): string {
  switch (status) {
    case 'complete': return 'COMPLETE';
    case 'delayed': return 'DELAYED';
    case 'critical': return 'CRITICAL';
    case 'in_progress': return 'IN PROGRESS';
    case 'pending': return 'PENDING';
    default: return status.toUpperCase();
  }
}

function mapInfraType(type: string): 'hospital' | 'power' | 'shelter' | 'bridge' {
  switch (type) {
    case 'hospital': return 'hospital';
    case 'power_station': return 'power';
    case 'bridge': return 'bridge';
    case 'shelter': return 'shelter';
    default: return 'hospital';
  }
}

function mapFacilityStatus(status: string): 'success' | 'warning' | 'critical' {
  switch (status) {
    case 'operational': return 'success';
    case 'at_capacity': return 'warning';
    case 'compromised': return 'warning';
    case 'offline': return 'critical';
    default: return 'success';
  }
}

export default function Home() {
  const missions = useSimulationStore((s) => s.missions);
  const alerts = useSimulationStore((s) => s.alerts);
  const infrastructure = useSimulationStore((s) => s.infrastructure);
  const shelters = useSimulationStore((s) => s.shelters);

  const activeMissions = missions.filter((m) => m.status !== 'complete');
  const recentAlerts = alerts.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Missions Section */}
      <SectionHeader title="Active Missions" count={activeMissions.length} />
      <div style={{ padding: '0 12px', overflow: 'auto', flex: 1 }}>
        {activeMissions.map((mission) => (
          <MissionCard
            key={mission.id}
            id={mission.id}
            title={mission.title}
            status={mapMissionStatus(mission.status)}
            statusLabel={mapMissionStatusLabel(mission.status)}
            eta={mission.eta !== null && mission.eta > 0 ? `${Math.ceil(mission.eta)}m` : undefined}
            assignedUnit={mission.assignedUnit || undefined}
            priority={mission.priority}
          />
        ))}

        {/* Divider */}
        <div
          style={{
            height: '1px',
            backgroundColor: 'var(--border-slate-gray)',
            margin: '8px 0 4px',
          }}
        />

        {/* Intelligence */}
        <SectionHeader title="Decision Intelligence" count={recentAlerts.length} />
        {recentAlerts.map((alert) => (
          <IntelCard
            key={alert.id}
            type={
              alert.severity === 'info'
                ? 'recommendation'
                : alert.severity === 'critical'
                ? 'alert'
                : 'update'
            }
            title={alert.title}
            body={alert.body}
            timestamp={
              alert.timestamp === 0
                ? 'Start'
                : `T+${Math.floor((alert.timestamp / 100) * 60)}m`
            }
          />
        ))}

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
        {infrastructure.map((inf) => (
          <InfraRow
            key={inf.id}
            iconType={mapInfraType(inf.type)}
            name={inf.name}
            status={mapFacilityStatus(inf.status)}
            detail={inf.detail}
          />
        ))}

        {/* Shelters */}
        <SectionHeader title="Shelters" />
        {shelters.map((s) => (
          <InfraRow
            key={s.id}
            iconType="shelter"
            name={s.name}
            status={
              s.status === 'at_capacity'
                ? 'warning'
                : s.status === 'compromised'
                ? 'critical'
                : 'success'
            }
            detail={`Cap. ${Math.round((s.currentOccupancy / s.capacity) * 100)}% · ${
              s.accessible ? 'Accessible' : 'Blocked'
            }`}
          />
        ))}

        {/* Bottom spacer */}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
