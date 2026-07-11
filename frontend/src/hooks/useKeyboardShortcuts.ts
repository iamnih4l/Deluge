"use client";

import { useEffect } from 'react';
import { useSimulationStore } from '@/simulation';
import { useMapStore } from '@/store';

/* ──────────────────────────────────────────
   Global Keyboard Shortcuts
   Power-user hotkeys for rapid operation.
   ────────────────────────────────────────── */

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const sim = useSimulationStore.getState();
      const map = useMapStore.getState();

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (sim.time >= 100) {
            sim.reset();
            setTimeout(() => useSimulationStore.getState().setRunning(true), 50);
          } else {
            sim.setRunning(!sim.isRunning);
          }
          break;

        case 'b':
        case 'B':
          map.toggleLayer('buildings');
          break;

        case 'f':
        case 'F':
          map.toggleLayer('flood');
          break;

        case 'v':
        case 'V':
          map.toggleLayer('vehicles');
          break;

        case 'r':
        case 'R':
          map.toggleLayer('routes');
          break;

        case '1':
          sim.setSpeed(1);
          break;
        case '2':
          sim.setSpeed(2);
          break;
        case '4':
          sim.setSpeed(4);
          break;
        case '8':
          sim.setSpeed(8);
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
