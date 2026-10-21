import { FC, ReactNode } from 'react';
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
      opacity="0.3"
      d="M12 4.67C7.95 8.37 6 11.46 6 13.81C6 17.44 8.65 20.01 12 20.01C15.35 20.01 18 17.44 18 13.81C18 11.46 16.05 8.36 12 4.67ZM12.28 18.99C10.15 19.12 7.66 17.9 7.09 14.87C7.01 14.42 7.37 14 7.83 14C8.2 14 8.5 14.26 8.57 14.62C8.98 16.85 10.85 17.6 12.21 17.49C12.64 17.47 13 17.81 13 18.24C13 18.64 12.68 18.97 12.28 18.99Z"
      fill="currentColor"
    />
    <path
      d="M12 2C6.67 6.55 4 10.48 4 13.8C4 18.78 7.8 22 12 22C16.2 22 20 18.78 20 13.8C20 10.48 17.33 6.55 12 2ZM12 20C8.65 20 6 17.43 6 13.8C6 11.46 7.95 8.36 12 4.66C16.05 8.36 18 11.45 18 13.8C18 17.43 15.35 20 12 20ZM7.83 14C8.2 14 8.5 14.26 8.57 14.62C8.98 16.84 10.85 17.6 12.21 17.49C12.64 17.47 13 17.81 13 18.24C13 18.64 12.68 18.97 12.28 18.99C10.15 19.12 7.66 17.9 7.09 14.87C7.01 14.42 7.37 14 7.83 14Z"
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
