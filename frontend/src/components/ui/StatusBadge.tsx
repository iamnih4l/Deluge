import React from 'react';
import styles from './StatusBadge.module.css';
import { cn } from '@/utils';

export type BadgeStatus = 'success' | 'warning' | 'critical' | 'info';

interface StatusBadgeProps {
  status: BadgeStatus;
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children, className }) => {
  return (
    <div className={cn(styles.badge, styles[status], className)}>
      <span className={styles.dot} />
      {children}
    </div>
  );
};
