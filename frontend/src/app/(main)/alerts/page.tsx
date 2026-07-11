"use client";

import React from 'react';
import { SectionHeader, IntelCard } from '@/components/ui/DashboardComponents';
import { AlertOctagon } from 'lucide-react';
import { useSimulationStore } from '@/simulation';

export default function AlertsPage() {
  const alerts = useSimulationStore((s) => s.alerts);
  const time = useSimulationStore((s) => s.time);

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');
  const infoAlerts = alerts.filter(a => a.severity === 'info');

  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return 'Start';
    const elapsed = time - timestamp;
    if (elapsed < 1) return 'Just now';
    return `${Math.floor((elapsed / 100) * 60)}m ago`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-slate-gray)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-critical-red)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertOctagon size={18} /> Alert Feed
        </h2>
      </div>

      <div style={{ padding: '0 12px', overflow: 'auto', flex: 1, paddingTop: '12px' }}>
        {criticalAlerts.length > 0 && (
          <>
            <SectionHeader title={`Critical (${criticalAlerts.length})`} />
            {criticalAlerts.map(alert => (
              <IntelCard key={alert.id} type="alert" title={alert.title} body={alert.body} timestamp={formatTime(alert.timestamp)} />
            ))}
          </>
        )}
        
        {warningAlerts.length > 0 && (
          <>
            <SectionHeader title={`Warnings (${warningAlerts.length})`} />
            {warningAlerts.map(alert => (
              <IntelCard key={alert.id} type="alert" title={alert.title} body={alert.body} timestamp={formatTime(alert.timestamp)} />
            ))}
          </>
        )}

        {infoAlerts.length > 0 && (
          <>
            <SectionHeader title={`AI Insights (${infoAlerts.length})`} />
            {infoAlerts.map(alert => (
              <IntelCard key={alert.id} type="recommendation" title={alert.title} body={alert.body} timestamp={formatTime(alert.timestamp)} />
            ))}
          </>
        )}

        {alerts.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
            No active alerts at this time.
          </div>
        )}
        
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
