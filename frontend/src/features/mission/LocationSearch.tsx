"use client";

import React from 'react';
import { useSimulationStore } from '@/simulation';
import { MapPin, Target, X } from 'lucide-react';

export const LocationSearch: React.FC = () => {
  const draftMission = useSimulationStore((s) => s.draftMission);
  const setDraftMission = useSimulationStore((s) => s.setDraftMission);

  const formatCoord = (coord: [number, number] | null): string => {
    if (!coord || !Array.isArray(coord) || typeof coord[0] !== 'number' || typeof coord[1] !== 'number') return '';
    return `${coord[1].toFixed(5)}°N, ${coord[0].toFixed(5)}°E`;
  };

  const isWaiting = draftMission.type !== null;
  const waitingForOrigin = isWaiting && !draftMission.origin;
  const waitingForDest = isWaiting && draftMission.origin !== null && !draftMission.destination;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
      <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block' }}>
        2. Set Locations {isWaiting && <span style={{ color: 'var(--color-primary-blue)' }}>(Click on Map)</span>}
      </label>
      
      {/* Origin */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          backgroundColor: waitingForOrigin ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-panel)',
          border: `1px solid ${waitingForOrigin ? 'var(--color-primary-blue)' : 'var(--border-slate-gray)'}`,
          borderRadius: 'var(--radius-md)',
          transition: 'all 0.3s',
        }}
      >
        <MapPin size={16} color="var(--color-primary-blue)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>ORIGIN</div>
          <div style={{ 
            fontSize: '0.8rem', 
            color: draftMission.origin ? 'var(--text-primary)' : 'var(--text-tertiary)',
            fontFamily: draftMission.origin ? 'var(--font-mono)' : 'inherit',
          }}>
            {draftMission.origin ? formatCoord(draftMission.origin) : (waitingForOrigin ? '⏳ Click map to select origin...' : 'Select unit type first')}
          </div>
        </div>
        {draftMission.origin && (
          <button onClick={() => setDraftMission({ origin: null, destination: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Destination */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          backgroundColor: waitingForDest ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-panel)',
          border: `1px solid ${waitingForDest ? 'var(--color-critical-red)' : 'var(--border-slate-gray)'}`,
          borderRadius: 'var(--radius-md)',
          transition: 'all 0.3s',
        }}
      >
        <Target size={16} color="var(--color-critical-red)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>DESTINATION</div>
          <div style={{ 
            fontSize: '0.8rem', 
            color: draftMission.destination ? 'var(--text-primary)' : 'var(--text-tertiary)',
            fontFamily: draftMission.destination ? 'var(--font-mono)' : 'inherit',
          }}>
            {draftMission.destination ? formatCoord(draftMission.destination) : (waitingForDest ? '⏳ Click map to select destination...' : 'Set origin first')}
          </div>
        </div>
        {draftMission.destination && (
          <button onClick={() => setDraftMission({ destination: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px' }}>
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
