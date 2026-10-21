import { FC } from 'react';
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
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM7.35 18.5C8.66 17.56 10.26 17 12 17C13.74 17 15.34 17.56 16.65 18.5C15.34 19.44 13.74 20 12 20C10.26 20 8.66 19.44 7.35 18.5ZM18.14 17.12C16.45 15.8 14.32 15 12 15C9.68 15 7.55 15.8 5.86 17.12C4.7 15.73 4 13.95 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 13.95 19.3 15.73 18.14 17.12Z"
      fill="currentColor"
    />
    <path
      d="M12 6C10.07 6 8.5 7.57 8.5 9.5C8.5 11.43 10.07 13 12 13C13.93 13 15.5 11.43 15.5 9.5C15.5 7.57 13.93 6 12 6ZM12 11C11.17 11 10.5 10.33 10.5 9.5C10.5 8.67 11.17 8 12 8C12.83 8 13.5 8.67 13.5 9.5C13.5 10.33 12.83 11 12 11Z"
      fill="currentColor"
    />
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
                className={`${styles.tabIconWrapper} ${
                  isActive ? styles.tabIconActive : styles.tabIconInactive
                }`}
              >
                {tab.icon}
              </div>
              <span
                className={`${styles.tabLabel} ${
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive
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
