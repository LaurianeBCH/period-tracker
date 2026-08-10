import { useState, FC, FormEvent } from 'react';
import { getTodayISO } from '../../utils/cycleEngine';
import styles from './LogPeriodModal.module.css';

interface LogPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (startDateStr: string, endDateStr?: string) => void;
}

export const LogPeriodModal: FC<LogPeriodModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [startDate, setStartDate] = useState<string>(getTodayISO());
  const [endDate, setEndDate] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!startDate) return;
    onSave(startDate, endDate || undefined);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Déclarer mes règles</h2>

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Début de mes règles</label>
            <div className={styles.inputFrame}>
              <input
                type="date"
                className={styles.dateInput}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Fin de mes règles</label>
            <div className={styles.inputFrame}>
              <input
                type="date"
                className={styles.dateInput}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button type="submit" className={styles.btnSave}>
              Enregistrer
            </button>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
