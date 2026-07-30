import { FC } from 'react';
import { DayStatus } from '../../types/cycle';
import { parseDateISO } from '../../utils/cycleEngine';
import styles from './BottomSheet.module.css';

interface BottomSheetProps {
  selectedDateStr: string | null;
  dayStatus: DayStatus | null;
  onLogPeriodStart: (dateStr: string) => void;
  onLogPeriodEnd: (dateStr: string) => void;
  onRemoveLog: (dateStr: string) => void;
  onClose: () => void;
}

export const BottomSheet: FC<BottomSheetProps> = ({
  selectedDateStr,
  dayStatus,
  onLogPeriodStart,
  onLogPeriodEnd,
  onRemoveLog,
  onClose
}) => {
  if (!selectedDateStr || !dayStatus) return null;

  const dateObj = parseDateISO(selectedDateStr);
  const formattedDate = dateObj.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dragHandle} />
        
        <div className={styles.header}>
          <div className={styles.dateTitle}>{formattedDate}</div>

          {dayStatus.isActualPeriod && (
            <span className={`${styles.statusBadge} ${styles.statusActual}`}>Règles réelles</span>
          )}
          {!dayStatus.isActualPeriod && dayStatus.isPredictedPeriod && (
            <span className={`${styles.statusBadge} ${styles.statusPredicted}`}>Règles prévues</span>
          )}
          {dayStatus.isOvulationDay && (
            <span className={`${styles.statusBadge} ${styles.statusOvulation}`}>Jour d'ovulation</span>
          )}
          {!dayStatus.isOvulationDay && dayStatus.isFertileWindow && (
            <span className={`${styles.statusBadge} ${styles.statusFertile}`}>Période fertile</span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnAction}
            onClick={() => {
              onLogPeriodStart(selectedDateStr);
              onClose();
            }}
          >
            Marquer comme début des règles
          </button>

          <button
            type="button"
            className={styles.btnActionSecondary}
            onClick={() => {
              onLogPeriodEnd(selectedDateStr);
              onClose();
            }}
          >
            Marquer comme fin des règles
          </button>

          {dayStatus.log && (
            <button
              type="button"
              className={styles.btnDelete}
              onClick={() => {
                onRemoveLog(selectedDateStr);
                onClose();
              }}
            >
              Effacer la saisie pour cette date
            </button>
          )}

          <button
            type="button"
            className={styles.btnDelete}
            style={{ marginTop: '4px' }}
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
