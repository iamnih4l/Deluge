"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { useMapStore } from '@/store';
import { Play, Pause, RotateCcw } from 'lucide-react';

export const TimelineScrubber: React.FC = () => {
  const { simulationTime, setSimulationTime, isSimulationRunning, setSimulationRunning } =
    useMapStore();
  const playheadRef = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Playback Loop
  useEffect(() => {
    if (isSimulationRunning) {
      playheadRef.current = window.setInterval(() => {
        useMapStore.setState((state) => {
          if (state.simulationTime >= 100) {
            return { isSimulationRunning: false, simulationTime: 100 };
          }
          return { simulationTime: state.simulationTime + 0.5 };
        });
      }, 100);
    } else if (playheadRef.current) {
      clearInterval(playheadRef.current);
    }

    return () => {
      if (playheadRef.current) clearInterval(playheadRef.current);
    };
  }, [isSimulationRunning]);

  const handlePlayPause = () => {
    if (simulationTime >= 100) {
      setSimulationTime(0);
    }
    setSimulationRunning(!isSimulationRunning);
  };

  const scrubTo = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSimulationTime(percentage);
    },
    [setSimulationTime],
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    setSimulationRunning(false);
    scrubTo(e.clientX);

    const handleMouseMove = (ev: MouseEvent) => {
      if (isDragging.current) scrubTo(ev.clientX);
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Time display
  const totalSimMinutes = 60;
  const currentSimMinutes = ((Number(simulationTime) || 0) / 100) * totalSimMinutes;
  const displayMins = Math.floor(currentSimMinutes);
  const displaySecs = Math.floor((currentSimMinutes - displayMins) * 60);
  const timeString = `T+${displayMins.toString().padStart(2, '0')}:${displaySecs
    .toString()
    .padStart(2, '0')}`;

  // Severity markers for the track
  const severity =
    (simulationTime || 0) > 80 ? 'critical' : (simulationTime || 0) > 50 ? 'warning' : 'normal';
  const progressColor =
    severity === 'critical'
      ? 'var(--color-critical-red)'
      : severity === 'warning'
      ? 'var(--color-warning-amber)'
      : 'var(--color-primary-blue)';

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: isSimulationRunning ? 'var(--color-primary-blue)' : 'var(--text-primary)',
          padding: '8px 16px',
          backgroundColor: isSimulationRunning
            ? 'var(--color-primary-blue-dim)'
            : 'var(--bg-panel)',
          border: `1px solid ${
            isSimulationRunning ? 'var(--color-primary-blue)' : 'var(--border-slate-gray)'
          }`,
          borderRadius: 'var(--radius-md)',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.5px',
          cursor: 'pointer',
          minWidth: '170px',
          transition: 'all var(--transition-base)',
        }}
      >
        {isSimulationRunning ? (
          <><Pause size={14} /> PAUSE</>
        ) : simulationTime >= 100 ? (
          <><RotateCcw size={14} /> RESTART</>
        ) : (
          <><Play size={14} /> SIMULATE</>
        )}
      </button>

      {/* Time tick marks */}
      <div style={{ display: 'flex', gap: '12px', fontSize: '0.6rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
        <span>+0m</span>
        <span>+15m</span>
        <span>+30m</span>
        <span>+45m</span>
        <span>+60m</span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        style={{
          flex: 1,
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          cursor: 'ew-resize',
          position: 'relative',
        }}
      >
        {/* Background track */}
        <div
          style={{
            width: '100%',
            height: '3px',
            backgroundColor: 'var(--bg-deep-slate)',
            position: 'relative',
            borderRadius: '2px',
          }}
        >
          {/* Progress fill */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${simulationTime || 0}%`,
              background: `linear-gradient(90deg, var(--color-primary-blue), ${progressColor})`,
              borderRadius: '2px',
              transition: isSimulationRunning ? 'width 100ms linear' : 'none',
              boxShadow: `0 0 8px ${progressColor}40`,
            }}
          />

          {/* Playhead */}
          <div
            style={{
              position: 'absolute',
              left: `${simulationTime || 0}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '14px',
              height: '14px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              border: `2px solid ${progressColor}`,
              boxShadow: `0 0 12px ${progressColor}80`,
              transition: isSimulationRunning ? 'left 100ms linear' : 'none',
            }}
          />
        </div>
      </div>

      {/* Time Display */}
      <div
        style={{
          fontSize: '0.85rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          color: severity === 'critical' ? 'var(--color-critical-red)' : severity === 'warning' ? 'var(--color-warning-amber)' : 'var(--text-primary)',
          minWidth: '70px',
          textAlign: 'right',
          letterSpacing: '0.5px',
        }}
      >
        {timeString}
      </div>

      {/* Severity label */}
      <div
        style={{
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: severity === 'critical' ? 'var(--color-critical-red)' : severity === 'warning' ? 'var(--color-warning-amber)' : 'var(--text-tertiary)',
          minWidth: '60px',
        }}
      >
        {severity === 'critical' ? 'CRITICAL' : severity === 'warning' ? 'ELEVATED' : 'NOMINAL'}
      </div>
    </div>
  );
};
