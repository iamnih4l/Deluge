"use client";

import React from 'react';
import { SectionHeader } from '@/components/ui/DashboardComponents';
import { MissionTypeSelector } from './MissionTypeSelector';
import { LocationSearch } from './LocationSearch';
import { MissionCard } from '@/components/ui/MissionCard';
import { useSimulationStore } from '@/simulation';
import { Send } from 'lucide-react';

export const MissionPlanner: React.FC = () => {
  const missions = useSimulationStore((s) => s.missions);
  const draftMission = useSimulationStore((s) => s.draftMission);
  const proposedMission = useSimulationStore((s) => s.proposedMission);
  const setDraftMission = useSimulationStore((s) => s.setDraftMission);
  const setProposedMission = useSimulationStore((s) => s.setProposedMission);
  const sendCommand = useSimulationStore((s) => s.sendCommand);

  const activeMissions = missions.filter((m) => m.status !== 'complete');
  
  const canDispatch = draftMission.type && proposedMission?.snappedOrigin && proposedMission?.snappedDestination;

  const handleDispatch = () => {
    if (!canDispatch) return;
    
    sendCommand('dispatch_mission', {
      type: draftMission.type,
      origin: proposedMission.snappedOrigin,
      destination: proposedMission.snappedDestination
    });
    
    // Reset draft and proposed
    setDraftMission({ type: null, origin: null, destination: null });
    setProposedMission(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Create Mission Section */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-slate-gray)' }}>
        <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '1px' }}>
          NEW MISSION
        </h2>
        
        <MissionTypeSelector />
        <LocationSearch />
        
        {proposedMission && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>MISSION SUMMARY</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Est. Distance:</span>
              <span style={{ fontWeight: 600 }}>{(proposedMission.distance / 1000).toFixed(2)} km</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span>Est. Time (Nominal):</span>
              <span style={{ fontWeight: 600 }}>{Math.round(proposedMission.distance / (40 * 1000 / 60))} mins</span>
            </div>
          </div>
        )}

        <button
          onClick={handleDispatch}
          disabled={!canDispatch}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: canDispatch ? 'var(--color-primary-blue)' : 'var(--bg-panel)',
            color: canDispatch ? '#fff' : 'var(--text-tertiary)',
            border: `1px solid ${canDispatch ? 'var(--color-primary-blue)' : 'var(--border-slate-gray)'}`,
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: canDispatch ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
        >
          <Send size={16} />
          DISPATCH UNIT
        </button>
      </div>

      {/* Mission Queue Section */}
      <SectionHeader title="Active Missions" count={activeMissions.length} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {activeMissions.map((mission) => (
          <MissionCard
            key={mission.id}
            id={mission.id}
            title={mission.title}
            status={
              mission.status === 'complete' ? 'success' :
              mission.status === 'delayed' ? 'warning' :
              mission.status === 'critical' ? 'critical' : 'info'
            }
            statusLabel={mission.status.toUpperCase().replace('_', ' ')}
            eta={mission.eta !== null && mission.eta > 0 ? `${Math.ceil(mission.eta)}m` : undefined}
            assignedUnit={mission.assignedUnit || undefined}
            priority={mission.priority}
          />
        ))}
      </div>
    </div>
  );
};
