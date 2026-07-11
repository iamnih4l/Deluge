"use client";

import React from 'react';
import styles from './CommandCenterLayout.module.css';
import { Header } from './Header';
import { MissionPlanner } from '@/features/mission/MissionPlanner';
import { OperationalPanel } from '@/features/intel/OperationalPanel';
import { Interactive3DMap } from '../Interactive3DMap';
import { TimelineScrubber } from '../ui/TimelineScrubber';
import { CommandPalette } from '../ui/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface CommandCenterLayoutProps {
  showTimeline?: boolean;
  timelineContent?: React.ReactNode;
}

export const CommandCenterLayout: React.FC<CommandCenterLayoutProps> = ({
  showTimeline = false,
  timelineContent
}) => {
  useKeyboardShortcuts();

  return (
    <div className={styles.layout} style={{ gridTemplateRows: showTimeline ? '52px 1fr 64px' : '52px 1fr 0px' }}>
      <header className={styles.header}><Header /></header>
      <aside className={styles.leftPanel}><MissionPlanner /></aside>
      <main className={styles.mapArea}><Interactive3DMap /></main>
      <aside className={styles.rightPanel}><OperationalPanel /></aside>
      {showTimeline && <footer className={styles.timeline}>{timelineContent}</footer>}
      <CommandPalette />
    </div>
  );
};
