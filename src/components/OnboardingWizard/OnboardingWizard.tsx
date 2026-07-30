import { useState, FC } from 'react';
import { UserSettings } from '../../types/cycle';
import { getTodayISO } from '../../utils/cycleEngine';
import theme from '../../styles/theme.module.css';
import styles from './OnboardingWizard.module.css';

interface OnboardingWizardProps {
  onComplete: (settings: UserSettings, initialPeriodStartDate?: string) => void;
}

export const OnboardingWizard: FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [periodLength, setPeriodLength] = useState<number>(5);
  const [lastPeriodDate, setLastPeriodDate] = useState<string>(getTodayISO());

  const handleNextStep1 = (customValue?: number) => {
    if (customValue !== undefined) {
      setCycleLength(customValue);
    }
    setStep(2);
  };

  const handleNextStep2 = (customValue?: number) => {
    if (customValue !== undefined) {
      setPeriodLength(customValue);
    }
    setStep(3);
  };

  const handleFinish = (useDefaultDate: boolean = false) => {
    const finalSettings: UserSettings = {
      averageCycleLength: cycleLength,
      averagePeriodLength: periodLength,
      lutealPhaseLength: 14,
      isOnboarded: true
    };

    const initialDate = useDefaultDate ? getTodayISO() : lastPeriodDate;
    onComplete(finalSettings, initialDate);
  };

  return (
    <div className={styles.wizardOverlay}>
      <div className={styles.wizardCard}>
        {/* Step Indicator */}
        <div className={styles.stepIndicator}>
          <div className={`${styles.dot} ${step === 1 ? styles.activeDot : ''}`} />
          <div className={`${styles.dot} ${step === 2 ? styles.activeDot : ''}`} />
          <div className={`${styles.dot} ${step === 3 ? styles.activeDot : ''}`} />
        </div>

        {/* Step 1: Cycle Length */}
        {step === 1 && (
          <>
            <h2 className={styles.title}>Durée moyenne de votre cycle</h2>
            <p className={styles.subtitle}>Compté du premier jour des règles au premier jour des règles suivantes.</p>
            
            <div className={styles.displayValue}>{cycleLength} jours</div>

            <div className={styles.sliderContainer}>
              <input
                type="range"
                min="20"
                max="45"
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={theme.btnPrimary}
                onClick={() => handleNextStep1()}
              >
                Continuer
              </button>
              
              <button
                type="button"
                className={styles.unknownBtn}
                onClick={() => handleNextStep1(28)}
              >
                Je ne sais pas (Valeur par défaut: 28 jours)
              </button>
            </div>
          </>
        )}

        {/* Step 2: Period Length */}
        {step === 2 && (
          <>
            <h2 className={styles.title}>Durée moyenne de vos règles</h2>
            <p className={styles.subtitle}>Le nombre de jours pendant lesquels durent vos saignements.</p>
            
            <div className={styles.displayValue}>{periodLength} jours</div>

            <div className={styles.sliderContainer}>
              <input
                type="range"
                min="2"
                max="10"
                value={periodLength}
                onChange={(e) => setPeriodLength(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={theme.btnPrimary}
                onClick={() => handleNextStep2()}
              >
                Continuer
              </button>
              
              <button
                type="button"
                className={styles.unknownBtn}
                onClick={() => handleNextStep2(5)}
              >
                Je ne sais pas (Valeur par défaut: 5 jours)
              </button>
            </div>
          </>
        )}

        {/* Step 3: Last Period Date */}
        {step === 3 && (
          <>
            <h2 className={styles.title}>Début des dernières règles</h2>
            <p className={styles.subtitle}>Indiquez le premier jour de vos dernières règles pour démarrer les prédictions.</p>
            
            <div style={{ margin: '16px 0' }}>
              <input
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={theme.btnPrimary}
                onClick={() => handleFinish(false)}
              >
                Valider & Accéder à l'application
              </button>
              
              <button
                type="button"
                className={styles.unknownBtn}
                onClick={() => handleFinish(true)}
              >
                Je ne sais pas / Démarrer aujourd'hui
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
