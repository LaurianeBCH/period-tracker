import { useState, FC } from 'react';
import { UserSettings } from '../../types/cycle';
import theme from '../../styles/theme.module.css';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
  onClose: () => void;
}

export const SettingsModal: FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [cycleLength, setCycleLength] = useState<number>(settings.averageCycleLength);
  const [periodLength, setPeriodLength] = useState<number>(settings.averagePeriodLength);

  const handleSave = () => {
    onSave({
      ...settings,
      averageCycleLength: cycleLength,
      averagePeriodLength: periodLength
    });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Réglages du Cycle</h2>

        <div className={styles.field}>
          <label className={styles.label}>Durée du cycle (jours)</label>
          <div className={styles.valueDisplay}>{cycleLength} jours</div>
          <input
            type="range"
            min="20"
            max="45"
            value={cycleLength}
            onChange={(e) => setCycleLength(Number(e.target.value))}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Durée des règles (jours)</label>
          <div className={styles.valueDisplay}>{periodLength} jours</div>
          <input
            type="range"
            min="2"
            max="10"
            value={periodLength}
            onChange={(e) => setPeriodLength(Number(e.target.value))}
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className={theme.btnPrimary} onClick={handleSave}>
            Enregistrer les modifications
          </button>
          <button type="button" className={theme.btnSecondary} onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};
