import React from 'react';
import { useSimulationStore } from '@/simulation';
import { SectionHeader } from './DashboardComponents';
import { X, Navigation, Info, Users, AlertTriangle } from 'lucide-react';

export const EntityInspector: React.FC = () => {
  const selectedEntity = useSimulationStore((s) => s.selectedEntity);
  const setSelectedEntity = useSimulationStore((s) => s.setSelectedEntity);
  const state = useSimulationStore();

  if (!selectedEntity) return null;

  let content = null;
  const { type, id } = selectedEntity;

  const closeBtn = (
    <button 
      onClick={() => setSelectedEntity(null)}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        padding: '4px'
      }}
    >
      <X size={16} />
    </button>
  );

  if (type === 'vehicle') {
    const vehicle = state.vehicles.find(v => v.id === id);
    if (vehicle) {
      content = (
        <div style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>{vehicle.callsign}</h3>
            {closeBtn}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '12px' }}>
            Type: <span style={{ color: 'var(--color-info-cyan)' }}>{vehicle.type.toUpperCase().replace('_', ' ')}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Status</span>
              <div style={{ color: 'var(--text-primary)' }}>{vehicle.status.replace('_', ' ')}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Speed</span>
              <div style={{ color: 'var(--text-primary)' }}>{vehicle.speed.toFixed(2)} units/t</div>
            </div>
            {vehicle.assignedMission && (
              <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Mission</span>
                <div style={{ color: 'var(--color-primary-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Navigation size={12} /> {vehicle.assignedMission}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  } else if (type === 'shelter' || type === 'infrastructure') {
    const shelter = state.shelters.find(s => s.id === id);
    const infra = state.infrastructure.find(i => i.id === id);
    const item = shelter || infra;
    if (item) {
      content = (
        <div style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>{item.name}</h3>
            {closeBtn}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Status</span>
              <div style={{ color: item.status === 'operational' ? 'var(--color-success-green)' : 'var(--color-critical-red)' }}>
                {item.status.toUpperCase()}
              </div>
            </div>
            {shelter && (
              <>
                <div>
                  <span style={{ color: 'var(--text-tertiary)' }}><Users size={12} style={{ display: 'inline', marginRight: '4px' }}/>Occupancy</span>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {shelter.currentOccupancy} / {shelter.capacity} ({(shelter.currentOccupancy / shelter.capacity * 100).toFixed(0)}%)
                  </div>
                </div>
                <div style={{ height: '4px', background: 'var(--surface-sunken)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${(shelter.currentOccupancy / shelter.capacity) * 100}%`,
                    background: shelter.currentOccupancy > shelter.capacity * 0.9 ? 'var(--color-critical-red)' : 'var(--color-success-green)'
                  }} />
                </div>
              </>
            )}
            {infra && (
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}><Info size={12} style={{ display: 'inline', marginRight: '4px' }}/>Details</span>
                <div style={{ color: 'var(--text-primary)' }}>{infra.detail}</div>
              </div>
            )}
          </div>
        </div>
      );
    }
  } else if (type === 'road') {
    const road = state.roads.find(r => r.id === id);
    if (road) {
      content = (
        <div style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>{road.name}</h3>
            {closeBtn}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Status</span>
              <div style={{ 
                color: road.status === 'flooded' ? 'var(--color-critical-red)' : 
                       road.status === 'at_risk' ? 'var(--color-warning-amber)' : 'var(--color-success-green)' 
              }}>
                {road.status.toUpperCase().replace('_', ' ')}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}><AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px' }}/>Capacity Constraint</span>
              <div style={{ color: 'var(--text-primary)' }}>{(road.capacity * 100).toFixed(0)}% flow</div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      backgroundColor: 'var(--surface-elevated)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-slate-gray)'
    }}>
      <SectionHeader title="Entity Inspector" />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {content || (
          <div style={{ padding: '12px', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{closeBtn}</div>
            Entity data unavailable.
          </div>
        )}
      </div>
    </div>
  );
};
