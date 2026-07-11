"use client";

import React from 'react';
import { StatusBadge } from './StatusBadge';

interface MissionCardProps {
  id: string;
  title: string;
  status: 'success' | 'warning' | 'critical' | 'info';
  statusLabel?: string;
  eta?: string;
  assignedUnit?: string;
  priority?: 'P1' | 'P2' | 'P3';
}

export const MissionCard: React.FC<MissionCardProps> = ({
  id,
  title,
  status,
  statusLabel,
  eta,
  assignedUnit,
  priority,
}) => {
  const defaultLabel =
    status === 'critical'
      ? 'CRITICAL'
      : status === 'success'
      ? 'COMPLETE'
      : status === 'warning'
      ? 'DELAYED'
      : 'IN PROGRESS';

  return (
    <div
      style={{
        padding: '14px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-slate-gray)',
        backgroundColor: 'var(--bg-card)',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
        animation: 'slide-in-right 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary-blue)';
        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow-blue)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-slate-gray)';
        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {priority && (
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color:
                  priority === 'P1'
                    ? 'var(--color-critical-red)'
                    : priority === 'P2'
                    ? 'var(--color-warning-amber)'
                    : 'var(--text-secondary)',
                backgroundColor:
                  priority === 'P1'
                    ? 'var(--color-critical-red-dim)'
                    : priority === 'P2'
                    ? 'var(--color-warning-amber-dim)'
                    : 'var(--bg-panel)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.5px',
              }}
            >
              {priority}
            </span>
          )}
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {id}
          </span>
        </div>
        <StatusBadge status={status}>{statusLabel || defaultLabel}</StatusBadge>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: '0.85rem',
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: eta || assignedUnit ? '12px' : 0,
        }}
      >
        {title}
      </div>

      {/* Meta Row */}
      {(eta || assignedUnit) && (
        <div
          style={{
            display: 'flex',
            gap: '16px',
            fontSize: '0.7rem',
            color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border-slate-gray)',
            paddingTop: '10px',
          }}
        >
          {assignedUnit && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ opacity: 0.5 }}>⬤</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                {assignedUnit}
              </span>
            </div>
          )}
          {eta && (
            <div>
              ETA{' '}
              <span
                style={{
                  color: 'var(--color-info-cyan)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                }}
              >
                {eta}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
