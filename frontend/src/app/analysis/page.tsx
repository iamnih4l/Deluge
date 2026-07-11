"use client";

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Activity, Droplets, Map as MapIcon, Navigation, AlertTriangle, TrendingUp, Thermometer, Wind } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ComposedChart } from 'recharts';

export default function AnalysisPage() {
  useKeyboardShortcuts();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/analysis/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  // Format timeline data for Recharts
  const chartData = stats?.timeline?.map((event: any) => ({
    time: event.timestamp_minutes,
    type: event.event_type,
    // Add a Y value just to plot it on a scatter/line
    impact: event.event_type === 'flood_initiated' ? 100 : event.event_type === 'road_closed' ? 75 : 50,
    details: event.payload
  })) || [];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: 'var(--bg-base)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-poppins)',
      overflow: 'hidden'
    }}>
      <header style={{
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--border-slate-gray)',
        backgroundColor: 'var(--bg-panel)'
      }}>
        <Header />
      </header>

      <main style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Title Section */}
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Historical Incident Analysis</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Comprehensive post-action report and data visualization for the 2018 Kerala Flood event.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <StatCard title="Total Rainfall" value={stats ? `${stats.rainfall_mm.toLocaleString()} mm` : "..."} icon={<Droplets />} color="var(--color-primary-blue)" />
          <StatCard title="Roads Compromised" value={stats ? `${stats.roads_compromised_km.toLocaleString()} km` : "..."} icon={<Navigation />} color="var(--color-warning-amber)" />
          <StatCard title="Affected Population" value={stats ? `${(stats.affected_population / 1000000).toFixed(1)} M` : "..."} icon={<Activity />} color="var(--color-critical-red)" />
          <StatCard title="Bridges Destroyed" value={stats ? `${stats.infrastructure_destroyed}` : "..."} icon={<AlertTriangle />} color="var(--color-critical-red)" />
        </div>

        {/* Main Dashboard Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', flex: 1, minHeight: '400px' }}>
          
          {/* Timeline & Progression */}
          <div style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-slate-gray)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} /> Flood Progression Timeline
            </h2>
            <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#888" 
                      label={{ value: 'Time (T+ Minutes)', position: 'insideBottom', offset: -10, fill: '#888' }} 
                    />
                    <YAxis 
                      stroke="#888" 
                      label={{ value: 'Severity Index', angle: -90, position: 'insideLeft', fill: '#888' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-deep-slate)', borderColor: 'var(--border-slate-gray)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      labelFormatter={(label) => `T+${label} Minutes`}
                      formatter={(value: any, name: any, props: any) => {
                        const evt = props.payload;
                        return [evt.details.id || evt.details.title || evt.details.name_contains || evt.type, "Event"];
                      }}
                    />
                    <Line type="monotone" dataKey="impact" stroke="var(--color-primary-blue)" strokeWidth={2} dot={false} />
                    <Scatter dataKey="impact" fill="var(--color-warning-amber)" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Loading Timeline Data...</span>
                </div>
              )}
            </div>
          </div>

          {/* Environmental Data */}
          <div style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-slate-gray)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Thermometer size={16} /> Environmental Factors
            </h2>
            <EnvStat label="Periyar River Peak Level" value={stats ? `${stats.environmental.river_peak_m} m` : "..."} trend={stats && stats.environmental.river_peak_m > 12 ? "+2.3m above danger" : "Stable"} />
            <EnvStat label="Idukki Dam Release" value={stats ? `${stats.environmental.dam_release_cumecs.toLocaleString()} cumecs` : "..."} trend={stats && stats.environmental.dam_release_cumecs > 5000 ? "Max capacity" : "Nominal"} />
            <EnvStat label="Average Wind Speed" value={stats ? `${stats.environmental.wind_speed_kmh} km/h` : "..."} trend={<Wind size={14} />} />
            <EnvStat label="Soil Saturation" value={stats ? `${stats.environmental.soil_saturation_pct}%` : "..."} trend={stats && stats.environmental.soil_saturation_pct > 90 ? "Critical" : "Elevated"} />
          </div>
        </div>

        {/* Secondary Dashboard Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', minHeight: '300px' }}>
          {/* Affected Districts List */}
          <div style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-slate-gray)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Affected Districts</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <DistrictRow name="Ernakulam" severity="Severe" />
              <DistrictRow name="Idukki" severity="Severe" />
              <DistrictRow name="Pathanamthitta" severity="Severe" />
              <DistrictRow name="Alappuzha" severity="High" />
              <DistrictRow name="Thrissur" severity="High" />
            </ul>
          </div>

          {/* Static GIS Map Reference */}
          <div style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-slate-gray)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapIcon size={16} /> Flood Extent Map
            </h2>
            <div style={{ flex: 1, backgroundColor: '#0B0D11', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'url("https://a.tile.openstreetmap.org/10/725/479.png")',
                backgroundSize: 'cover',
                opacity: 0.3
              }} />
              <span style={{ color: 'var(--color-primary-blue)', fontSize: '0.85rem', zIndex: 1, fontWeight: 500, backgroundColor: 'rgba(11, 13, 17, 0.7)', padding: '8px 16px', borderRadius: '20px' }}>
                Static GIS Extent Render
              </span>
            </div>
          </div>
        </div>

      </main>
      <CommandPalette />
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-panel)',
      border: '1px solid var(--border-slate-gray)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
        <div style={{ color }}>{icon}</div>
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

function EnvStat({ label, value, trend }: { label: string, value: string, trend: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-slate-gray)' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-critical-red)', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--color-critical-red-dim)', padding: '4px 8px', borderRadius: '4px' }}>
        {trend}
      </div>
    </div>
  );
}

function DistrictRow({ name, severity }: { name: string, severity: 'Severe' | 'High' | 'Moderate' }) {
  const color = severity === 'Severe' ? 'var(--color-critical-red)' : severity === 'High' ? 'var(--color-warning-amber)' : 'var(--color-info-cyan)';
  return (
    <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{name}</span>
      <span style={{ fontSize: '0.7rem', color, backgroundColor: `${color}20`, padding: '2px 8px', borderRadius: '12px', border: `1px solid ${color}40` }}>
        {severity}
      </span>
    </li>
  );
}
