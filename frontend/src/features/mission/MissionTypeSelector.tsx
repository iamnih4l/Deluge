"use client";

import React from 'react';
import { useSimulationStore } from '@/simulation';
import { Truck, Activity, ShieldCheck, Crosshair, HelpCircle } from 'lucide-react';

const options = [
  { id: 'rescue_boat', label: 'Rescue Boat', icon: Truck },
  { id: 'ambulance', label: 'Ambulance', icon: Activity },
  { id: 'engineering', label: 'Engineering', icon: ShieldCheck },
  { id: 'drone', label: 'Drone', icon: Crosshair },
  { id: 'command', label: 'Command', icon: HelpCircle },
];

export const MissionTypeSelector: React.FC = () => {
  const draftType = useSimulationStore((s) => s.draftMission.type);
  const setDraftMission = useSimulationStore((s) => s.setDraftMission);

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
        1. Select Unit Type
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = draftType === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setDraftMission({ type: opt.id as any })}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 8px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--color-primary-blue-dim)' : 'var(--bg-panel)',
                border: `1px solid ${isActive ? 'var(--color-primary-blue)' : 'var(--border-slate-gray)'}`,
                color: isActive ? 'var(--color-primary-blue)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{opt.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
