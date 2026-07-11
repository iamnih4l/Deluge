import React from 'react';
import { StatusBadge, BadgeStatus } from './StatusBadge';
import { Bot, AlertTriangle, CheckCircle, Activity, Zap, ShieldCheck, DivideSquare as Bridge, Hospital } from 'lucide-react';

/* ──────────────────────────────────────────
   Section Header
   ────────────────────────────────────────── */
export function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 16px 12px',
      }}
    >
      <span
        style={{
          fontSize: '0.65rem',
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
        }}
      >
        {title}
      </span>
      {count !== undefined && (
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            backgroundColor: 'var(--bg-panel)',
            padding: '2px 8px',
            borderRadius: '99px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────
   Intelligence Card
   ────────────────────────────────────────── */
export function IntelCard({
  type,
  title,
  body,
  timestamp,
  onApprove,
  onDismiss,
}: {
  type: 'recommendation' | 'alert' | 'update';
  title: string;
  body: string;
  timestamp: string;
  onApprove?: () => void;
  onDismiss?: () => void;
}) {
  const configs = {
    recommendation: {
      accent: 'var(--color-info-cyan)',
      bg: 'var(--color-info-cyan-dim)',
      Icon: Bot,
    },
    alert: {
      accent: 'var(--color-critical-red)',
      bg: 'var(--color-critical-red-dim)',
      Icon: AlertTriangle,
    },
    update: {
      accent: 'var(--color-safe-green)',
      bg: 'var(--color-safe-green-dim)',
      Icon: CheckCircle,
    },
  };
  const c = configs[type];
  const Icon = c.Icon;

  return (
    <div
      style={{
        padding: '14px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-slate-gray)',
        marginBottom: '8px',
        animation: 'slide-in-right 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: c.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: c.accent,
            }}
          >
            <Icon size={14} />
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: c.accent,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </span>
        </div>
        <span
          style={{
            fontSize: '0.6rem',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {timestamp}
        </span>
      </div>
      <p
        style={{
          fontSize: '0.8rem',
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
        }}
      >
        {body}
      </p>
      {type === 'recommendation' && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            onClick={onApprove}
            style={{
              flex: 1,
              padding: '7px',
              backgroundColor: 'var(--color-primary-blue)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              cursor: 'pointer',
            }}
          >
            APPROVE
          </button>
          <button
            onClick={onDismiss}
            style={{
              flex: 1,
              padding: '7px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-slate-gray)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              cursor: 'pointer',
            }}
          >
            DISMISS
          </button>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────
   Infrastructure Row
   ────────────────────────────────────────── */
export function InfraRow({
  iconType,
  name,
  status,
  detail,
}: {
  iconType: 'hospital' | 'power' | 'shelter' | 'bridge';
  name: string;
  status: BadgeStatus;
  detail: string;
}) {
  const Icon = 
    iconType === 'hospital' ? Hospital :
    iconType === 'power' ? Zap :
    iconType === 'shelter' ? ShieldCheck :
    Bridge;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-slate-gray)',
        transition: 'background var(--transition-fast)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <div style={{ color: 'var(--text-secondary)' }}>
        <Icon size={18} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-primary)' }}>
          {name}
        </div>
        <div
          style={{
            fontSize: '0.65rem',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {detail}
        </div>
      </div>
      <StatusBadge status={status}>
        {status === 'critical' ? 'OFFLINE' : status === 'warning' ? 'AT RISK' : 'ONLINE'}
      </StatusBadge>
    </div>
  );
}
