"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { useSimulationStore } from '@/simulation';
import { Play, Pause, Square, RotateCcw, FastForward } from 'lucide-react';

export const ReplayControls: React.FC = () => {
  const {
    time: simulationTime,
    isRunning: isSimulationRunning,
    speed,
    severity,
    setRunning,
    setSpeed,
    seekTo,
    reset,
  } = useSimulationStore();

  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handlePlay = () => setRunning(true);
  const handlePause = () => setRunning(false);
  const handleStop = () => {
    setRunning(false);
    seekTo(0);
  };
  const handleRestart = () => {
    reset();
    setRunning(true);
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
    const speeds = [0.5, 1, 2, 4];
    const idx = speeds.indexOf(speed);
    setSpeed(speeds[(idx + 1) % speeds.length]);
  };

  // Time display
  const totalSimMinutes = 60;
  const currentSimMinutes = ((Number(simulationTime) || 0) / 100) * totalSimMinutes;
  const displayMins = Math.floor(currentSimMinutes);
  const displaySecs = Math.floor((currentSimMinutes - displayMins) * 60);
  const timeString = `T+${displayMins.toString().padStart(2, '0')}:${displaySecs.toString().padStart(2, '0')}`;

  const progressColor =
    severity === 'critical'
      ? 'var(--color-critical-red)'
      : severity === 'elevated'
      ? 'var(--color-warning-amber)'
      : 'var(--color-primary-blue)';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      gap: '24px',
      height: '100%'
    }}>
      {/* Replay Controls Group */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={handlePlay}
          disabled={isSimulationRunning}
          style={{
            background: isSimulationRunning ? 'var(--bg-deep-slate)' : 'var(--color-primary-blue)',
            color: isSimulationRunning ? 'var(--text-secondary)' : '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isSimulationRunning ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
          title="Play"
        >
          <Play size={18} fill={isSimulationRunning ? 'none' : 'currentColor'} />
        </button>
        <button
          onClick={handlePause}
          disabled={!isSimulationRunning}
          style={{
            background: !isSimulationRunning ? 'var(--bg-deep-slate)' : 'var(--color-warning-amber)',
            color: !isSimulationRunning ? 'var(--text-secondary)' : '#000',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: !isSimulationRunning ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
          title="Pause"
        >
          <Pause size={18} fill={!isSimulationRunning ? 'none' : 'currentColor'} />
        </button>
        <button
          onClick={handleStop}
          style={{
            background: 'var(--bg-deep-slate)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-slate-gray)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Stop"
        >
          <Square size={16} fill="currentColor" />
        </button>
        <button
          onClick={handleRestart}
          style={{
            background: 'var(--bg-deep-slate)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-slate-gray)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Restart Replay"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Scrubber Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--color-primary-blue)',
          fontWeight: 600,
          minWidth: '65px'
        }}>
          {timeString}
        </div>
        
        <div
          ref={trackRef}
          onMouseDown={handleMouseDown}
          style={{
            flex: 1,
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'ew-resize',
            position: 'relative'
          }}
        >
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'var(--bg-deep-slate)',
            borderRadius: '3px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${simulationTime}%`,
              backgroundColor: progressColor,
              transition: isDragging.current ? 'none' : 'width 0.1s linear'
            }} />
          </div>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: `${simulationTime}%`,
            width: '14px',
            height: '14px',
            backgroundColor: '#fff',
            border: `2px solid ${progressColor}`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 8px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            transition: isDragging.current ? 'none' : 'left 0.1s linear'
          }} />
        </div>
      </div>

      {/* Speed Control */}
      <button
        onClick={cycleSpeed}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-deep-slate)',
          border: '1px solid var(--border-slate-gray)',
          color: 'var(--text-primary)',
          padding: '4px 12px',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          fontWeight: 600
        }}
        title="Playback Speed"
      >
        <FastForward size={14} />
        {speed}x
      </button>
    </div>
  );
};
