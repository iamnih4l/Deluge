"use client";

import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-slate-gray)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SettingsIcon size={18} /> Settings
        </h2>
      </div>

      <div style={{ padding: '24px 16px', flex: 1, color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '0.85rem', marginBottom: '24px' }}>System preferences and simulation configuration.</p>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Data Feed Refresh Rate</label>
          <select style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-dark-graphite)', border: '1px solid var(--border-slate-gray)', color: 'var(--text-primary)', borderRadius: '4px' }}>
            <option>Real-time (WebSocket)</option>
            <option>10 seconds</option>
            <option>30 seconds</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Simulation Speed</label>
          <select style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-dark-graphite)', border: '1px solid var(--border-slate-gray)', color: 'var(--text-primary)', borderRadius: '4px' }}>
            <option>1x (Real-time)</option>
            <option>5x (Fast)</option>
            <option>10x (Accelerated)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
