import React from 'react';
import { DayStatus } from '../../types/cycle';
import styles from './Calendar.module.css';

interface DayCellProps {
  dayNumber?: number;
  status?: DayStatus;
  onClick?: () => void;
}

export const DayCell: React.FC<DayCellProps> = ({ dayNumber, status, onClick }) => {
  if (!dayNumber || !status) {
    return <div className={`${styles.dayCell} ${styles.dayCellEmpty}`} />;
  }

  const classNames = [styles.dayCell];
  if (status.isToday) classNames.push(styles.isToday);
  if (status.isActualPeriod) classNames.push(styles.isActualPeriod);
  if (status.isPredictedPeriod) classNames.push(styles.isPredictedPeriod);
  if (status.isFertileWindow) classNames.push(styles.isFertileWindow);
  if (status.isOvulationDay) classNames.push(styles.isOvulationDay);

  return (
    <div className={classNames.join(' ')} onClick={onClick}>
      <span>{dayNumber}</span>
      {status.isOvulationDay && <div className={styles.ovulationDot} />}
    </div>
  );
};
