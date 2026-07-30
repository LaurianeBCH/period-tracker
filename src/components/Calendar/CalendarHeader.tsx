import React from 'react';
import styles from './Calendar.module.css';

interface CalendarHeaderProps {
  onOpenSettings: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ onOpenSettings }) => {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerTitle}>Mon Cycle</div>
        <button type="button" className={styles.headerBtn} onClick={onOpenSettings}>
          Réglages
        </button>
      </header>
      <div className={styles.weekdayHeader}>
        <div>Lun</div>
        <div>Mar</div>
        <div>Mer</div>
        <div>Jeu</div>
        <div>Ven</div>
        <div>Sam</div>
        <div>Dim</div>
      </div>
    </>
  );
};
