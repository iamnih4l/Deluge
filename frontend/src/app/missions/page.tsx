"use client";

import React, { useState } from 'react';
import { MissionCard } from '@/components/ui/MissionCard';
import { SectionHeader } from '@/components/ui/DashboardComponents';
import { Filter } from 'lucide-react';
import { useSimulationStore } from '@/simulation';

export default function MissionsPage() {
  const missions = useSimulationStore((s) => s.missions);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const activeMissions = missions.filter((m) => m.status !== 'complete');
  const completedMissions = missions.filter((m) => m.status === 'complete');

  const showActive = filter === 'all' || filter === 'active';
  const showCompleted = filter === 'all' || filter === 'completed';

  const mapMissionStatus = (status: string): 'success' | 'warning' | 'critical' | 'info' => {
    switch (status) {
      case 'complete': return 'success';
      case 'delayed': return 'warning';
      case 'critical': return 'critical';
      case 'in_progress': return 'info';
      case 'pending': return 'info';
      default: return 'info';
    }
  };

  const mapMissionStatusLabel = (status: string) => {
    switch (status) {
      case 'complete': return 'COMPLETE';
      case 'delayed': return 'DELAYED';
      case 'critical': return 'CRITICAL';
      case 'in_progress': return 'IN PROGRESS';
      case 'pending': return 'PENDING';
      default: return status.toUpperCase();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-slate-gray)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Mission Log</h2>
        <button 
          onClick={() => setFilter(filter === 'all' ? 'active' : filter === 'active' ? 'completed' : 'all')}
          style={{ color: 'var(--text-secondary)', display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.75rem', cursor: 'pointer' }}
        >
          <Filter size={14} /> {filter.toUpperCase()}
        </button>
      </div>

      <div style={{ padding: '0 12px', overflow: 'auto', flex: 1, paddingTop: '12px' }}>
        {showActive && activeMissions.length > 0 && (
          <>
            <SectionHeader title={`Active (${activeMissions.length})`} />
            {activeMissions.map((m) => (
              <MissionCard 
                key={m.id}
                id={m.id} 
                title={m.title} 
                status={mapMissionStatus(m.status)} 
                statusLabel={mapMissionStatusLabel(m.status)}
                eta={m.eta !== null && m.eta > 0 ? `${Math.ceil(m.eta)}m` : undefined} 
                assignedUnit={m.assignedUnit || undefined} 
                priority={m.priority} 
              />
            ))}
          </>
        )}

        {showActive && showCompleted && activeMissions.length > 0 && completedMissions.length > 0 && (
          <div style={{ height: '1px', backgroundColor: 'var(--border-slate-gray)', margin: '12px 0' }} />
        )}

        {showCompleted && completedMissions.length > 0 && (
          <>
            <SectionHeader title={`Completed (${completedMissions.length})`} />
            {completedMissions.map((m) => (
              <MissionCard 
                key={m.id}
                id={m.id} 
                title={m.title} 
                status={mapMissionStatus(m.status)} 
                statusLabel={mapMissionStatusLabel(m.status)}
                assignedUnit={m.assignedUnit || undefined} 
                priority={m.priority} 
              />
            ))}
          </>
        )}
        
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
