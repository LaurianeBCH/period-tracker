import React, { FC } from 'react';
import styles from './TabBar.module.css';

export type TabId = 'calendar' | 'recommendations' | 'cycle';

interface TabBarProps {
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
}

const CalendarIcon: FC<{ size?: number }> = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const SparklesIcon: FC<{ size?: number }> = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
  </svg>
);

const UserIcon: FC<{ size?: number }> = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const TabBar: FC<TabBarProps> = ({
  activeTab = 'calendar',
  onTabChange
}) => {
  const tabs = [
    {
      id: 'calendar' as TabId,
      label: 'Calendrier',
      icon: <CalendarIcon size={24} />
    },
    {
      id: 'recommendations' as TabId,
      label: 'Recommandations',
      icon: <SparklesIcon size={24} />
    },
    {
      id: 'cycle' as TabId,
      label: 'Mon cycle',
      icon: <UserIcon size={24} />
    }
  ];

  return (
    <nav className={styles.tabBarWrapper} aria-label="Navigation principale">
      <div className={styles.tabBarInner}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={styles.tabItem}
              onClick={() => onTabChange?.(tab.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`${styles.iconWrapper} ${
                  isActive ? styles.iconWrapperActive : styles.iconWrapperInactive
                }`}
              >
                {tab.icon}
              </div>
              <span
                className={`${styles.label} ${
                  isActive ? styles.labelActive : styles.labelInactive
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
