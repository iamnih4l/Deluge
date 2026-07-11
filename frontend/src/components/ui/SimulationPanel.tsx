"use client";

import React, { useState } from 'react';
import { useSimulationStore } from '@/simulation';
import {
  Droplets,
  Ban,
  ShieldPlus,
  CloudRain,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Gauge,
  Zap,
} from 'lucide-react';

/* ──────────────────────────────────────────
   Simulation Control Panel
   Floating glassmorphism panel on the map for
   operator-level simulation interactions.
   ────────────────────────────────────────── */

interface ControlButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
  active?: boolean;
  disabled?: boolean;
}

function ControlButton({
  icon: Icon,
  label,
  onClick,
  color = 'var(--text-secondary)',
  active = false,
  disabled = false,
}: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: active ? `${color}18` : 'transparent',
        border: `1px solid ${active ? color : 'var(--border-slate-gray)'}`,
        color: active ? color : 'var(--text-secondary)',
        fontSize: '0.7rem',
        fontWeight: 500,
        letterSpacing: '0.3px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all var(--transition-fast)',
        width: '100%',
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function RainfallSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div style={{ padding: '0 4px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}
      >
        <span
          style={{
            fontSize: '0.6rem',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}
        >
          Rainfall Intensity
        </span>
        <span
          style={{
            fontSize: '0.65rem',
            fontFamily: 'var(--font-mono)',
            color:
              value > 75
                ? 'var(--color-critical-red)'
                : value > 40
                ? 'var(--color-warning-amber)'
                : 'var(--color-primary-blue)',
            fontWeight: 600,
          }}
        >
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Rainfall intensity"
        style={{
          width: '100%',
          height: '4px',
          appearance: 'none',
          background: `linear-gradient(90deg, var(--color-primary-blue) ${value}%, var(--bg-deep-slate) ${value}%)`,
          borderRadius: '2px',
          cursor: 'pointer',
          outline: 'none',
        }}
      />
    </div>
  );
}

export const SimulationPanel: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [rainfall, setRainfall] = useState(50);

  const { time, isRunning, speed, reset, setSpeed } = useSimulationStore();

  const handleInjectFlood = () => {
    // Modify flood growth rate based on rainfall
    useSimulationStore.setState((state) => ({
      floodCells: state.floodCells.map((cell) => ({
        ...cell,
        growthRate: cell.growthRate * 1.5,
        maxRadius: cell.maxRadius * 1.2,
      })),
    }));
  };

  const handleBlockRoad = () => {
    // Block the first open road
    useSimulationStore.setState((state) => {
      const roads = [...state.roads];
      const openRoad = roads.find((r) => r.status === 'open');
      if (openRoad) {
        const idx = roads.indexOf(openRoad);
        roads[idx] = { ...openRoad, status: 'blocked', capacity: 0 };
        return {
          roads,
          alerts: [
            {
              id: `alert-manual-block-${Date.now()}`,
              severity: 'warning' as const,
              title: 'Road Manually Blocked',
              body: `${openRoad.name} has been blocked by the operator.`,
              timestamp: state.time,
              acknowledged: false,
            },
            ...state.alerts,
          ],
        };
      }
      return {};
    });
  };

  const handleOpenShelter = () => {
    useSimulationStore.setState((state) => ({
      shelters: [
        ...state.shelters,
        {
          id: `shelter-new-${Date.now()}`,
          name: `Emergency Shelter ${state.shelters.length + 1}`,
          position: [-74.006 + (Math.random() - 0.5) * 0.006, 40.713 + (Math.random() - 0.5) * 0.003],
          capacity: 250,
          currentOccupancy: 0,
          status: 'operational' as const,
          intakeRate: 5,
          accessible: true,
        },
      ],
      alerts: [
        {
          id: `alert-shelter-${Date.now()}`,
          severity: 'info' as const,
          title: 'Shelter Activated',
          body: `Emergency Shelter ${state.shelters.length + 1} is now operational and accepting evacuees.`,
          timestamp: state.time,
          acknowledged: false,
        },
        ...state.alerts,
      ],
    }));
  };

  const handleRainfallChange = (val: number) => {
    setRainfall(val);
    // Adjust flood growth rates based on rainfall
    const multiplier = val / 50; // 1.0 at 50%, 2.0 at 100%, 0 at 0%
    useSimulationStore.setState((state) => ({
      floodCells: state.floodCells.map((cell) => ({
        ...cell,
        growthRate: 0.012 * multiplier + 0.003,
      })),
    }));
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 14,
        right: 14,
        zIndex: 10,
        width: collapsed ? 'auto' : '220px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          color: 'var(--text-primary)',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.8px',
          borderBottom: collapsed ? 'none' : '1px solid var(--glass-border)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Gauge size={14} style={{ color: 'var(--color-info-cyan)' }} />
          SIM CONTROL
        </span>
        {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>

      {!collapsed && (
        <div
          style={{
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            animation: 'fade-in 0.2s ease',
          }}
        >
          {/* Status */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.6rem',
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
              padding: '4px',
              backgroundColor: 'var(--bg-deep-slate)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span>T+{Math.floor((time / 100) * 60)}m</span>
            <span>{isRunning ? `RUNNING ${speed}×` : 'PAUSED'}</span>
          </div>

          {/* Rainfall Slider */}
          <RainfallSlider value={rainfall} onChange={handleRainfallChange} />

          {/* Action Buttons */}
          <ControlButton
            icon={Droplets}
            label="Inject Flood"
            onClick={handleInjectFlood}
            color="var(--color-primary-blue)"
          />
          <ControlButton
            icon={Ban}
            label="Block Road"
            onClick={handleBlockRoad}
            color="var(--color-critical-red)"
          />
          <ControlButton
            icon={ShieldPlus}
            label="Open Shelter"
            onClick={handleOpenShelter}
            color="var(--color-safe-green)"
          />
          <ControlButton
            icon={CloudRain}
            label={`Rain: ${rainfall > 75 ? 'Heavy' : rainfall > 40 ? 'Moderate' : 'Light'}`}
            onClick={() => handleRainfallChange(Math.min(rainfall + 25, 100))}
            color="var(--color-info-cyan)"
            active={rainfall > 60}
          />

          {/* Divider */}
          <div
            style={{
              height: '1px',
              backgroundColor: 'var(--glass-border)',
              margin: '2px 0',
            }}
          />

          {/* Speed buttons */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
            }}
          >
            {[1, 2, 4, 8].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                style={{
                  flex: 1,
                  padding: '5px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: speed === s ? 'var(--color-info-cyan-dim)' : 'transparent',
                  border: `1px solid ${speed === s ? 'var(--color-info-cyan)' : 'var(--border-slate-gray)'}`,
                  color: speed === s ? 'var(--color-info-cyan)' : 'var(--text-tertiary)',
                  fontSize: '0.6rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {s}×
              </button>
            ))}
          </div>

          {/* Reset */}
          <ControlButton
            icon={RotateCcw}
            label="Reset Simulation"
            onClick={reset}
            color="var(--color-warning-amber)"
          />
        </div>
      )}
    </div>
  );
};
