import { FC } from 'react';
import { DayStatus } from '../../types/cycle';
import styles from './Calendar.module.css';

interface DayCellProps {
  dayNumber?: number;
  status?: DayStatus;
  onClick?: () => void;
}

export const DayCell: FC<DayCellProps> = ({ dayNumber, status, onClick }) => {
  if (!dayNumber || !status) {
    return <div className={`${styles.dayCell} ${styles.emptyCell}`} />;
  }

  const phaseClass = (() => {
    switch (status.phase) {
      case 'Phase1-Follicular':
        return styles.phaseFollicular;
      case 'Phase2-Ovulation':
        return styles.phaseOvulation;
      case 'Phase3-Luteal':
        return styles.phaseLuteal;
      case 'Phase4-Menstrual':
        return styles.phaseMenstrual;
      case 'Phase4-Menstrual-Unconfirmed':
        return styles.phaseMenstrualUnconfirmed;
      default:
        return styles.phaseDefault;
    }
  })();

  const isDarkPhase = status.phase === 'Phase4-Menstrual';

  return (
    <div className={`${styles.dayCell} ${phaseClass}`} onClick={onClick}>
      <span>{dayNumber}</span>
      {status.isToday && (
        <div
          className={`${styles.indicatorDot} ${
            isDarkPhase ? styles.indicatorDotOnDark : ''
          }`}
        />
      )}
    </div>
  );
};
