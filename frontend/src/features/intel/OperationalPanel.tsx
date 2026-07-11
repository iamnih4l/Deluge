"use client";

import React from 'react';
import { SectionHeader, IntelCard, InfraRow } from '@/components/ui/DashboardComponents';
import { EntityInspector } from '@/components/ui/EntityInspector';
import { useSimulationStore } from '@/simulation';

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

export const OperationalPanel: React.FC = () => {
  const alerts = useSimulationStore((s) => s.alerts);
  const infrastructure = useSimulationStore((s) => s.infrastructure);
  const shelters = useSimulationStore((s) => s.shelters);
  const selectedEntity = useSimulationStore((s) => s.selectedEntity);
  
  const recentAlerts = alerts.slice(0, 5);

  if (selectedEntity) {
    return <EntityInspector />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Intelligence */}
      <SectionHeader title="Live Operations Log" count={recentAlerts.length} />
      <div style={{ padding: '0 12px', overflow: 'auto', flex: 1 }}>
        {recentAlerts.map((alert) => {
          const totalMinutes = Math.floor((alert.timestamp / 100) * 60);
          const h = 8 + Math.floor(totalMinutes / 60);
          const m = totalMinutes % 60;
          const timeString = `[${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}]`;
          
          return (
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
              timestamp={timeString}
              onApprove={() => {
                if (alert.action) {
                  useSimulationStore.getState().sendCommand(alert.action.type, alert.action.payload);
                }
                useSimulationStore.getState().acknowledgeAlert(alert.id);
              }}
              onDismiss={() => {
                useSimulationStore.getState().acknowledgeAlert(alert.id);
              }}
            />
          );
        })}

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

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
};
