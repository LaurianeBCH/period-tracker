import { FC } from 'react';
import { DayStatus } from '../../types/cycle';
import { Badge, WaterDropIcon } from '../atoms';
import styles from './Calendar.module.css';

interface DayCellProps {
  dayNumber?: number;
  status?: DayStatus;
  onClick?: () => void;
}

export const DayCell: FC<DayCellProps> = ({ dayNumber, status, onClick }) => {
  if (!dayNumber || !status) {
    return <div className={`${styles.dayCell} ${styles.emptyCell}`} aria-hidden="true" />;
  }

  const isConfirmedPeriod = status.phase === 'Phase4-Menstrual';
  const isEstimatedPeriod = status.phase === 'Phase4-Menstrual-Unconfirmed';

  const phaseClass = (() => {
    if (isConfirmedPeriod) return styles.phaseMenstrual;
    if (isEstimatedPeriod) return styles.phaseMenstrualUnconfirmed;
    if (status.phase === 'Phase1-Follicular') return styles.phaseFollicular;
    if (status.phase === 'Phase2-Ovulation') return styles.phaseOvulation;
    if (status.phase === 'Phase3-Luteal') return styles.phaseLuteal;
    return styles.phaseDefault;
  })();

  const renderIndicator = () => {
    if (isConfirmedPeriod) {
      return (
        <div className={styles.cellIconContainer}>
          <WaterDropIcon size={14} color="var(--text-white)" />
        </div>
      );
    }
    if (isEstimatedPeriod) {
      return (
        <div className={styles.cellIconContainer}>
          <WaterDropIcon size={14} color="var(--text-dark-primary)" />
        </div>
      );
    }
    if (status.phase === 'Phase1-Follicular') {
      return <Badge variant="phase1">1</Badge>;
    }
    if (status.phase === 'Phase2-Ovulation') {
      return <Badge variant="phase2">2</Badge>;
    }
    if (status.phase === 'Phase3-Luteal') {
      return <Badge variant="phase3">3</Badge>;
    }
    return null;
  };

  return (
    <div
      className={`${styles.dayCell} ${phaseClass}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className={styles.dayNumber}>{dayNumber}</span>
      {renderIndicator()}
      {status.isToday && <div className={styles.indicatorDot} title="Aujourd'hui" />}
    </div>
  );
};
