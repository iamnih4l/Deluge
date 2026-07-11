"use client";

import React, { useState, useEffect } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AlertTriangle } from 'lucide-react';

/* ──────────────────────────────────────────
   Live Clock Hook
   ────────────────────────────────────────── */
function useClock() {
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ──────────────────────────────────────────
   Stat Box (for the header)
   ────────────────────────────────────────── */
function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <span
        style={{
          fontSize: '0.6rem',
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: '2px',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          color: color || 'var(--text-primary)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

export const Header: React.FC = () => {
  const clock = useClock();
  const timeStr = clock ? clock.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }) : '--:--:--';
  const dateStr = clock ? clock.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }) : 'Loading...';

  return (
    <>
      {/* Left: Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#fff',
              boxShadow: 'var(--shadow-glow-blue)',
            }}
          >
            D
          </div>
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              letterSpacing: '2.5px',
              color: 'var(--text-primary)',
            }}
          >
            DELUGE
          </span>
        </div>

        <div
          style={{
            height: '24px',
            width: '1px',
            backgroundColor: 'var(--border-slate-gray)',
          }}
        />

        <StatusBadge status="success">OPERATIONAL</StatusBadge>
      </div>

      {/* Center: Alert Strip */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            borderRadius: '99px',
            backgroundColor: 'var(--color-warning-amber-dim)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            fontSize: '0.7rem',
            fontWeight: 500,
            color: 'var(--color-warning-amber)',
          }}
        >
          <AlertTriangle size={14} style={{ animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
          FLOOD WARNING — Sector 7 water levels rising
        </div>
      </div>

      {/* Right: Stats + Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <StatBox label="Active Units" value="12" />
        <StatBox label="Open Missions" value="6" color="var(--color-warning-amber)" />
        <StatBox label="At Risk" value="3" color="var(--color-critical-red)" />

        <div
          style={{
            height: '24px',
            width: '1px',
            backgroundColor: 'var(--border-slate-gray)',
          }}
        />

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '0.95rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '1px',
            }}
          >
            {timeStr}
          </div>
          <div
            style={{
              fontSize: '0.6rem',
              color: 'var(--text-tertiary)',
              letterSpacing: '0.5px',
            }}
          >
            {dateStr} · UTC−5
          </div>
        </div>
      </div>
    </>
  );
};
