"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSimulationStore } from '@/simulation';
import { Play, Pause, RotateCcw, FastForward, AlertTriangle } from 'lucide-react';

export const TimelineScrubber: React.FC = () => {
  const searchParams = useSearchParams();
  const isReplayMode = searchParams?.get('mode') === 'replay';
  
  const {
    time: simulationTime,
    isRunning: isSimulationRunning,
    speed,
    severity,
    tick,
    setRunning,
    setSpeed,
    seekTo,
    reset,
  } = useSimulationStore();

  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const tickInterval = useRef<number | null>(null);

  // Simulation loop — calls tick() at 100ms intervals
  useEffect(() => {
    if (isSimulationRunning) {
      tickInterval.current = window.setInterval(() => {
        tick();
      }, 100);
    } else if (tickInterval.current) {
      clearInterval(tickInterval.current);
    }

    return () => {
      if (tickInterval.current) clearInterval(tickInterval.current);
    };
  }, [isSimulationRunning, tick]);

  const handlePlayPause = () => {
    if (simulationTime >= 100) {
      reset();
      setTimeout(() => setRunning(true), 50);
      return;
    }
    setRunning(!isSimulationRunning);
  };

  const scrubTo = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      seekTo(percentage);
    },
    [seekTo],
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    setRunning(false);
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

  const cycleSpeed = () => {
    const speeds = [1, 2, 4, 8];
    const idx = speeds.indexOf(speed);
    setSpeed(speeds[(idx + 1) % speeds.length]);
  };

  // Time display
  const totalSimMinutes = 60;
  const currentSimMinutes = ((Number(simulationTime) || 0) / 100) * totalSimMinutes;
  const displayMins = Math.floor(currentSimMinutes);
  const displaySecs = Math.floor((currentSimMinutes - displayMins) * 60);
  const timeString = `T+${displayMins.toString().padStart(2, '0')}:${displaySecs
    .toString()
    .padStart(2, '0')}`;

  const progressColor =
    severity === 'critical'
      ? 'var(--color-critical-red)'
      : severity === 'elevated'
      ? 'var(--color-warning-amber)'
      : 'var(--color-primary-blue)';

  return (
    <>
      {isReplayMode && !isSimulationRunning && simulationTime < 100 && (
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(220, 38, 38, 0.9)',
          color: 'white',
          padding: '8px 24px',
          borderRadius: 'var(--radius-lg)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          animation: 'pulse 2s infinite',
          zIndex: 1000
        }}>
          <AlertTriangle size={18} />
          HISTORICAL REPLAY READY - CLICK PLAY TO START
        </div>
      )}
      {isReplayMode && isSimulationRunning && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(5, 150, 105, 0.9)',
          color: 'white',
          padding: '4px 16px',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 1000
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34D399', animation: 'pulse 1s infinite' }} />
          REPLAY IN PROGRESS
        </div>
      )}
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}
    >
      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        aria-label={isSimulationRunning ? 'Pause feed' : 'Start replay'}
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
          minWidth: '150px',
          transition: 'all var(--transition-base)',
        }}
      >
        {isSimulationRunning ? (
          <><Pause size={14} /> PAUSE FEED</>
        ) : simulationTime >= 100 ? (
          <><RotateCcw size={14} /> RESET EVENT LOG</>
        ) : (
          <><Play size={14} /> START REPLAY</>
        )}
      </button>

      {/* Speed Control */}
      <button
        onClick={cycleSpeed}
        aria-label={`Replay speed: ${speed}x`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 12px',
          backgroundColor: speed > 1 ? 'var(--color-info-cyan-dim)' : 'var(--bg-panel)',
          border: `1px solid ${speed > 1 ? 'var(--color-info-cyan)' : 'var(--border-slate-gray)'}`,
          color: speed > 1 ? 'var(--color-info-cyan)' : 'var(--text-secondary)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.7rem',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        <FastForward size={12} /> {speed}×
      </button>

      {/* Time tick marks */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          fontSize: '0.55rem',
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)',
        }}
      >
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
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(simulationTime)}
        aria-label="Event timeline"
        tabIndex={0}
        style={{
          flex: 1,
          height: '28px',
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
          color:
            severity === 'critical'
              ? 'var(--color-critical-red)'
              : severity === 'elevated'
              ? 'var(--color-warning-amber)'
              : 'var(--text-primary)',
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
          color:
            severity === 'critical'
              ? 'var(--color-critical-red)'
              : severity === 'elevated'
              ? 'var(--color-warning-amber)'
              : 'var(--text-tertiary)',
          minWidth: '60px',
          animation: severity === 'critical' ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
        }}
      >
        {severity === 'critical' ? 'CRITICAL' : severity === 'elevated' ? 'ELEVATED' : 'NOMINAL'}
      </div>
    </div>
    </>
  );
};
