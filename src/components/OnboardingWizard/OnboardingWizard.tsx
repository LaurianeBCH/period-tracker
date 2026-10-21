import { useState, FC, ChangeEvent } from 'react';
import { UserSettings } from '../../types/cycle';
import { getTodayISO, addDays } from '../../utils/cycleEngine';
import { Button } from '../atoms';
import styles from './OnboardingWizard.module.css';

interface OnboardingWizardProps {
  onComplete: (settings: UserSettings, initialDates?: string[]) => void;
}

export const OnboardingWizard: FC<OnboardingWizardProps> = ({ onComplete }) => {
  const today = getTodayISO();
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(addDays(today, 3));

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    if (newStart > endDate) {
      setEndDate(addDays(newStart, 3));
    }
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    if (newEnd >= startDate) {
      setEndDate(newEnd);
    }
  };

  const handleFinish = () => {
    const dates: string[] = [];
    let curr = startDate;
    while (curr <= endDate) {
      dates.push(curr);
      curr = addDays(curr, 1);
    }

    const finalSettings: UserSettings = {
      defaultCycleLength: 28,
      defaultPeriodLength: dates.length > 0 ? dates.length : 4,
      lutealPhaseLength: 14,
      isOnboarded: true
    };

    onComplete(finalSettings, dates);
  };

  const handleSkip = () => {
    const finalSettings: UserSettings = {
      defaultCycleLength: 28,
      defaultPeriodLength: 4,
      lutealPhaseLength: 14,
      isOnboarded: true
    };
    onComplete(finalSettings, []);
  };

  return (
    <div className={styles.wizardOverlay}>
      <div className={styles.wizardCard}>
        <h2 className={styles.wizardTitle}>Vos dernières règles</h2>
        <p className={styles.wizardSubtitle}>
          Renseignez la période de vos dernières règles pour initialiser vos prédictions de cycle.
        </p>

        <div className={styles.dateGroup}>
          <label className={styles.dateLabel}>
            Premier jour
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className={styles.dateInput}
            />
          </label>

          <label className={styles.dateLabel}>
            Dernier jour
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={handleEndDateChange}
              className={styles.dateInput}
            />
          </label>
        </div>

        <div className={styles.actions}>
          <Button
            variant="primary"
            fullWidth
            onClick={handleFinish}
          >
            Valider et continuer
          </Button>

          <button
            type="button"
            className={styles.skipButton}
            onClick={handleSkip}
          >
            Passer cette étape
          </button>
        </div>
      </div>
    </div>
  );
};
