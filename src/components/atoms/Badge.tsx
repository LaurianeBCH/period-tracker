import React, { FC, ReactNode } from 'react';
import styles from './Badge.module.css';

export type BadgeVariant = 'badge' | 'phase1' | 'phase2' | 'phase3' | 'period';

export interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children?: ReactNode;
  iconColor?: string;
}

export const WaterDropIcon: FC<{ className?: string; color?: string; size?: number }> = ({
  className = '',
  color = 'currentColor',
  size = 14
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ color }}
  >
    <path
      d="M12 3.1L6.34 8.76C3.22 11.88 3.22 16.95 6.34 20.07C9.46 23.19 14.54 23.19 17.66 20.07C20.78 16.95 20.78 11.88 17.66 8.76L12 3.1Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
    />
  </svg>
);

export const Badge: FC<BadgeProps> = ({
  variant = 'badge',
  className = '',
  children,
  iconColor
}) => {
  if (variant === 'badge') {
    return <div className={`${styles.badge} ${className}`.trim()}>{children}</div>;
  }

  if (variant === 'period') {
    return (
      <div className={`${styles.period} ${className}`.trim()}>
        <WaterDropIcon color={iconColor} className={styles.periodIcon} />
      </div>
    );
  }

  const phaseNum = variant === 'phase1' ? '1' : variant === 'phase2' ? '2' : '3';
  const phaseClass = styles[variant];

  return (
    <div className={`${styles.phaseCircle} ${phaseClass} ${className}`.trim()}>
      {children || phaseNum}
    </div>
  );
};
