"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSimulationStore } from '@/simulation';
import {
  Search,
  Map,
  ClipboardList,
  AlertOctagon,
  Activity,
  ShieldCheck,
  Crosshair,
  Settings,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Layers,
  Eye,
  EyeOff,
  Command,
  Droplets,
  Ban,
  ShieldPlus,
} from 'lucide-react';
import { useMapStore } from '@/store';

/* ──────────────────────────────────────────
   Command Palette
   Ctrl+K fuzzy-search command overlay.
   ────────────────────────────────────────── */

interface PaletteCommand {
  id: string;
  label: string;
  category: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { isRunning, setRunning, reset, setSpeed, speed } = useSimulationStore();
  const { toggleLayer, layers } = useMapStore();

  const commands: PaletteCommand[] = useMemo(
    () => [
      // Navigation
      { id: 'nav-map', label: 'Go to Map', category: 'Navigation', icon: Map, shortcut: '1', action: () => router.push('/') },
      { id: 'nav-missions', label: 'Go to Missions', category: 'Navigation', icon: ClipboardList, shortcut: '2', action: () => router.push('/missions') },
      { id: 'nav-alerts', label: 'Go to Alerts', category: 'Navigation', icon: AlertOctagon, shortcut: '3', action: () => router.push('/alerts') },
      { id: 'nav-infra', label: 'Go to Infrastructure', category: 'Navigation', icon: Activity, shortcut: '4', action: () => router.push('/infra') },
      { id: 'nav-zones', label: 'Go to Safe Zones', category: 'Navigation', icon: ShieldCheck, shortcut: '5', action: () => router.push('/zones') },
      { id: 'nav-units', label: 'Go to Units', category: 'Navigation', icon: Crosshair, shortcut: '6', action: () => router.push('/units') },
      { id: 'nav-settings', label: 'Go to Settings', category: 'Navigation', icon: Settings, action: () => router.push('/settings') },

      // Feed
      { id: 'sim-play', label: isRunning ? 'Pause Feed' : 'Start Replay', category: 'Event Feed', icon: isRunning ? Pause : Play, shortcut: 'Space', action: () => setRunning(!isRunning) },
      { id: 'sim-reset', label: 'Reset Event Log', category: 'Event Feed', icon: RotateCcw, action: () => reset() },
      { id: 'sim-speed-1', label: 'Speed: 1×', category: 'Event Feed', icon: FastForward, action: () => setSpeed(1) },
      { id: 'sim-speed-2', label: 'Speed: 2×', category: 'Event Feed', icon: FastForward, action: () => setSpeed(2) },
      { id: 'sim-speed-4', label: 'Speed: 4×', category: 'Event Feed', icon: FastForward, action: () => setSpeed(4) },
      { id: 'sim-speed-8', label: 'Speed: 8×', category: 'Event Feed', icon: FastForward, action: () => setSpeed(8) },

      // Actions
      {
        id: 'act-inject-flood',
        label: 'Inject Flood',
        category: 'Actions',
        icon: Droplets,
        action: () => {
          useSimulationStore.setState((s) => ({
            floodCells: s.floodCells.map((c) => ({ ...c, growthRate: c.growthRate * 1.5, maxRadius: c.maxRadius * 1.2 })),
          }));
        },
      },
      {
        id: 'act-block-road',
        label: 'Block Next Road',
        category: 'Actions',
        icon: Ban,
        action: () => {
          useSimulationStore.setState((s) => {
            const roads = [...s.roads];
            const openRoad = roads.find((r) => r.status === 'open');
            if (openRoad) {
              const idx = roads.indexOf(openRoad);
              roads[idx] = { ...openRoad, status: 'blocked', capacity: 0 };
              return { roads };
            }
            return {};
          });
        },
      },
      {
        id: 'act-open-shelter',
        label: 'Open New Shelter',
        category: 'Actions',
        icon: ShieldPlus,
        action: () => {
          useSimulationStore.setState((s) => ({
            shelters: [
              ...s.shelters,
              {
                id: `shelter-cmd-${Date.now()}`,
                name: `Emergency Shelter ${s.shelters.length + 1}`,
                position: [-74.006 + (Math.random() - 0.5) * 0.006, 40.713 + (Math.random() - 0.5) * 0.003] as [number, number],
                capacity: 250,
                currentOccupancy: 0,
                status: 'operational' as const,
                intakeRate: 5,
                accessible: true,
              },
            ],
          }));
        },
      },

      // Layers
      { id: 'layer-buildings', label: `${layers.buildings ? 'Hide' : 'Show'} Buildings`, category: 'Layers', icon: layers.buildings ? EyeOff : Eye, shortcut: 'B', action: () => toggleLayer('buildings') },
      { id: 'layer-flood', label: `${layers.flood ? 'Hide' : 'Show'} Flood`, category: 'Layers', icon: layers.flood ? EyeOff : Eye, shortcut: 'F', action: () => toggleLayer('flood') },
      { id: 'layer-vehicles', label: `${layers.vehicles ? 'Hide' : 'Show'} Vehicles`, category: 'Layers', icon: layers.vehicles ? EyeOff : Eye, shortcut: 'V', action: () => toggleLayer('vehicles') },
      { id: 'layer-routes', label: `${layers.routes ? 'Hide' : 'Show'} Routes`, category: 'Layers', icon: layers.routes ? EyeOff : Eye, shortcut: 'R', action: () => toggleLayer('routes') },
    ],
    [isRunning, setRunning, reset, setSpeed, speed, router, layers, toggleLayer],
  );

  const filtered = query.trim()
    ? commands.filter((cmd) => fuzzyMatch(query, cmd.label) || fuzzyMatch(query, cmd.category))
    : commands;

  // Group by category
  const grouped = filtered.reduce<Record<string, PaletteCommand[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    },
    [open],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSelect = (cmd: PaletteCommand) => {
    cmd.action();
    setOpen(false);
    setQuery('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) handleSelect(filtered[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          animation: 'fade-in 0.15s ease',
        }}
      />

      {/* Palette */}
      <div
        role="dialog"
        aria-label="Command palette"
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '520px',
          maxHeight: '420px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--glass-bg-heavy)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slide-up 0.2s ease',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-slate-gray)',
          }}
        >
          <Search size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
            }}
          />
          <div
            style={{
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-slate-gray)',
              fontSize: '0.6rem',
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ESC
          </div>
        </div>

        {/* Results */}
        <div style={{ overflow: 'auto', flex: 1, padding: '6px' }}>
          {Object.entries(grouped).map(([category, cmds]) => (
            <div key={category}>
              <div
                style={{
                  padding: '8px 10px 4px',
                  fontSize: '0.6rem',
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 600,
                }}
              >
                {category}
              </div>
              {cmds.map((cmd) => {
                const flatIdx = filtered.indexOf(cmd);
                const isSelected = flatIdx === selectedIndex;
                const Icon = cmd.icon;

                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    onMouseEnter={() => setSelectedIndex(flatIdx)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 10px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                      border: isSelected ? '1px solid var(--border-slate-gray)' : '1px solid transparent',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)',
                    }}
                  >
                    <Icon size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{cmd.label}</span>
                    {cmd.shortcut && (
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-panel)',
                          border: '1px solid var(--border-slate-gray)',
                          fontSize: '0.6rem',
                          color: 'var(--text-tertiary)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {cmd.shortcut}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '0.8rem',
              }}
            >
              No commands found for &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--border-slate-gray)',
            display: 'flex',
            gap: '16px',
            fontSize: '0.6rem',
            color: 'var(--text-tertiary)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Command size={10} /> + K to toggle
          </span>
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
        </div>
      </div>
    </>
  );
};
