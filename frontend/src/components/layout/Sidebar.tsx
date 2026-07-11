"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Map,
  ClipboardList,
  AlertOctagon,
  Activity,
  ShieldCheck,
  Crosshair,
  Settings,
} from 'lucide-react';

function SidebarIcon({
  icon: Icon,
  label,
  href,
  active,
  alert,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      style={{
        width: '42px',
        height: '42px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? 'var(--color-primary-blue-dim)' : 'transparent',
        border: active ? '1px solid var(--color-primary-blue)' : '1px solid transparent',
        color: active ? 'var(--color-primary-blue)' : 'var(--text-secondary)',
        position: 'relative',
        transition: 'all var(--transition-fast)',
      }}
    >
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      {alert && (
        <span
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: 'var(--color-critical-red)',
            animation: 'pulse-dot 1.5s ease-in-out infinite',
          }}
        />
      )}
    </Link>
  );
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          alignItems: 'center',
          paddingTop: '4px',
        }}
      >
        <SidebarIcon icon={Map} label="Map" href="/" active={pathname === '/'} />
        <SidebarIcon
          icon={ClipboardList}
          label="Missions"
          href="/missions"
          active={pathname.startsWith('/missions')}
          alert
        />
        <SidebarIcon
          icon={AlertOctagon}
          label="Alerts"
          href="/alerts"
          active={pathname.startsWith('/alerts')}
          alert
        />
        <SidebarIcon
          icon={Activity}
          label="Infrastructure"
          href="/infra"
          active={pathname.startsWith('/infra')}
        />
        <SidebarIcon
          icon={ShieldCheck}
          label="Safe Zones"
          href="/zones"
          active={pathname.startsWith('/zones')}
        />
        <SidebarIcon
          icon={Crosshair}
          label="Units"
          href="/units"
          active={pathname.startsWith('/units')}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          alignItems: 'center',
          paddingBottom: '8px',
        }}
      >
        <SidebarIcon
          icon={Settings}
          label="Settings"
          href="/settings"
          active={pathname.startsWith('/settings')}
        />
      </div>
    </div>
  );
};
