"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSimulationStore } from '@/simulation';
import { AlertTriangle, Radio, CloudRain, Database, Bell, User } from 'lucide-react';
import styles from './Header.module.css';

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
   Animated Number — counts up/down smoothly
   ────────────────────────────────────────── */
function AnimatedNumber({ value, color }: { value: number; color?: string }) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value === prevValue.current) return;

    const start = prevValue.current;
    const end = value;
    const duration = 300;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    prevValue.current = value;
  }, [value]);

  return (
    <span
      style={{
        fontSize: '0.9rem',
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        color: color || 'var(--text-primary)',
        transition: 'color 0.3s ease',
      }}
    >
      {display}
    </span>
  );
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
  value: number;
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
      <AnimatedNumber value={value} color={color} />
    </div>
  );
}

export const Header: React.FC = () => {
  const pathname = usePathname();
  const clock = useClock();
  const timeStr = clock
    ? clock.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    : '--:--:--';
  const dateStr = clock
    ? clock.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : 'Loading...';

  const stats = useSimulationStore((s) => s.stats);
  const severity = useSimulationStore((s) => s.severity);
  const alerts = useSimulationStore((s) => s.alerts);
  const isRunning = useSimulationStore((s) => s.isRunning);

  // Get the most recent unacknowledged alert for the alert strip
  const latestAlert = alerts.find((a) => !a.acknowledged);
  const alertColor =
    latestAlert?.severity === 'critical'
      ? 'var(--color-critical-red)'
      : latestAlert?.severity === 'warning'
      ? 'var(--color-warning-amber)'
      : 'var(--color-info-cyan)';
  const alertBg =
    latestAlert?.severity === 'critical'
      ? 'var(--color-critical-red-dim)'
      : latestAlert?.severity === 'warning'
      ? 'var(--color-warning-amber-dim)'
      : 'var(--color-info-cyan-dim)';

  return (
    <div className={styles.headerContainer}>
      {/* Left: Brand */}
      <div className={styles.brandSection}>
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

        <StatusBadge
          status={severity === 'critical' ? 'critical' : severity === 'elevated' ? 'warning' : 'success'}
        >
          {severity === 'critical' ? 'CRITICAL' : severity === 'elevated' ? 'ELEVATED' : 'OPERATIONAL'}
        </StatusBadge>

        {isRunning && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.6rem',
              color: 'var(--color-safe-green)',
              fontWeight: 500,
              animation: 'breathe 2s ease-in-out infinite',
            }}
          >
            <Radio size={12} /> LIVE
          </div>
        )}

        <div
          style={{
            height: '24px',
            width: '1px',
            backgroundColor: 'var(--border-slate-gray)',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Current Incident</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>Ernakulam Floods</span>
        </div>

        <div
          style={{
            height: '24px',
            width: '1px',
            backgroundColor: 'var(--border-slate-gray)',
            marginLeft: '10px'
          }}
        />

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginLeft: '10px' }}>
          <Link href="/" style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: pathname === '/' ? 'var(--color-primary-blue-dim)' : 'var(--bg-panel)',
            color: pathname === '/' ? 'var(--color-primary-blue)' : 'var(--text-secondary)',
            border: pathname === '/' ? '1px solid var(--color-primary-blue)' : '1px solid var(--border-slate-gray)',
            fontSize: '0.75rem',
            fontWeight: pathname === '/' ? 600 : 500,
            textDecoration: 'none'
          }}>Mission Control</Link>
          
          <Link href="/replay" style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: pathname === '/replay' ? 'var(--color-primary-blue-dim)' : 'var(--bg-panel)',
            color: pathname === '/replay' ? 'var(--color-primary-blue)' : 'var(--text-secondary)',
            border: pathname === '/replay' ? '1px solid var(--color-primary-blue)' : '1px solid var(--border-slate-gray)',
            fontSize: '0.75rem',
            fontWeight: pathname === '/replay' ? 600 : 500,
            textDecoration: 'none'
          }}>Historical Replay</Link>

          <Link href="/analysis" style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: pathname === '/analysis' ? 'var(--color-primary-blue-dim)' : 'var(--bg-panel)',
            color: pathname === '/analysis' ? 'var(--color-primary-blue)' : 'var(--text-secondary)',
            border: pathname === '/analysis' ? '1px solid var(--color-primary-blue)' : '1px solid var(--border-slate-gray)',
            fontSize: '0.75rem',
            fontWeight: pathname === '/analysis' ? 600 : 500,
            textDecoration: 'none'
          }}>Incident Analysis</Link>
        </div>
      </div>

      {/* Center: Alert Strip */}
      <div className={styles.alertSection}>
        {latestAlert && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              borderRadius: '99px',
              backgroundColor: alertBg,
              border: `1px solid ${alertColor}20`,
              fontSize: '0.7rem',
              fontWeight: 500,
              color: alertColor,
              maxWidth: '500px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              animation: 'slide-in-right 0.3s ease',
            }}
          >
            <AlertTriangle
              size={14}
              style={{ flexShrink: 0, animation: 'pulse-dot 1.5s ease-in-out infinite' }}
            />
            {latestAlert.title} — {latestAlert.body.slice(0, 80)}
            {latestAlert.body.length > 80 ? '…' : ''}
          </div>
        )}
      </div>

      {/* Right: Stats + Clock */}
      <div className={styles.statsSection}>
        <StatBox label="Active Units" value={stats.activeUnits} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <CloudRain size={16} />
          <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Heavy Rain</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-info-cyan)' }}>
          <Database size={16} />
          <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>OSM Linked</span>
        </div>

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '8px' }}>
          <Bell size={18} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--bg-deep-slate)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-slate-gray)', cursor: 'pointer' }}>
            <User size={14} color="var(--text-secondary)" />
          </div>
        </div>
      </div>
    </div>
  );
};
