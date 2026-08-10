import { FC } from 'react';
import styles from './Calendar.module.css';

interface CalendarHeaderProps {
  onOpenSettings: () => void;
  onBack?: () => void;
  title?: string;
}

export const CalendarHeader: FC<CalendarHeaderProps> = ({
  onOpenSettings,
  onBack,
  title = 'Period Tracker'
}) => {
  const isCentered = Boolean(onBack);

  return (
    <header className={`${styles.headerContainer} ${isCentered ? styles.headerCenteredLayout : ''}`}>
      {onBack && (
        <button
          type="button"
          className={`${styles.iconButton} ${styles.backButton}`}
          onClick={onBack}
          aria-label="Retour"
          title="Retour"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
      )}

      <h1 className={`${styles.headerTitle} ${isCentered ? styles.headerTitleCentered : ''}`}>
        {title}
      </h1>

      <button
        type="button"
        className={`${styles.iconButton} ${styles.settingsButton}`}
        onClick={onOpenSettings}
        aria-label="Réglages"
        title="Réglages"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6-3.6z" />
        </svg>
      </button>
    </header>
  );
};
