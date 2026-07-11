"use client";

import React from 'react';
import styles from './CommandCenterLayout.module.css';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Interactive3DMap } from '../Interactive3DMap';
import { TimelineScrubber } from '../ui/TimelineScrubber';
import { CommandPalette } from '../ui/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface CommandCenterLayoutProps {
  children: React.ReactNode;
}

export const CommandCenterLayout: React.FC<CommandCenterLayoutProps> = ({
  children
}) => {
  useKeyboardShortcuts();

  return (
    <div className={styles.layout}>
      <header className={styles.header}><Header /></header>
      <aside className={styles.sidebar}><Sidebar /></aside>
      <main className={styles.mapArea}><Interactive3DMap /></main>
      <aside className={styles.rightPanel}>{children}</aside>
      <footer className={styles.timeline}><TimelineScrubber /></footer>
      <CommandPalette />
    </div>
  );
};
