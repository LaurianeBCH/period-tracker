import { useState, useEffect } from 'react';
import { UserSettings } from './types/cycle';
import {
  getSettings,
  saveSettings,
  getPeriodDates,
  savePeriodDates,
  togglePeriodDate
} from './services/storage';
import {
  getDayStatus,
  getTodayISO,
  extractPeriodBlocks,
  computeCycleMetrics
} from './utils/cycleEngine';
import { getPhaseInsight } from './data/phaseInsights';
import { OnboardingWizard } from './components/OnboardingWizard/OnboardingWizard';
import { CalendarHeader } from './components/Calendar/CalendarHeader';
import { HomeMonthlyCalendar } from './components/Calendar/HomeMonthlyCalendar';
import { YearCalendarView } from './components/Calendar/YearCalendarView';
import { PhaseInsightsCard } from './components/Calendar/PhaseInsightsCard';
import { PhaseAnimationView } from './components/PhaseAnimation';
import styles from './components/Calendar/Calendar.module.css';

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(() => getSettings());
  const [periodDates, setPeriodDates] = useState<string[]>(() => getPeriodDates());
  const [currentView, setCurrentView] = useState<'home' | 'full_calendar'>('home');

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const todayISO = getTodayISO();
  const todayStatus = getDayStatus(todayISO, settings, periodDates);
  const todayInsight = getPhaseInsight(todayStatus.phase);

  // Apply phase linear-gradient on body
  useEffect(() => {
    if (!settings.isOnboarded) return;

    if (currentView === 'full_calendar') {
      document.body.style.background = '#ffffff';
      return;
    }

    const phaseKey = todayInsight.phaseKey;
    const gradient =
      phaseKey === 'Phase1-Follicular'
        ? 'linear-gradient(180deg, rgba(252, 255, 234, 1) 0%, rgba(238, 241, 226, 1) 100%)'
        : phaseKey === 'Phase2-Ovulation'
        ? 'linear-gradient(180deg, rgba(255, 231, 192, 0) 0%, rgba(255, 231, 192, 1) 100%)'
        : phaseKey === 'Phase3-Luteal'
        ? 'linear-gradient(180deg, rgba(223, 208, 241, 0) 0%, rgba(223, 208, 241, 1) 100%)'
        : 'linear-gradient(180deg, rgba(232, 196, 196, 0) 0%, rgba(250, 157, 173, 1) 100%)';

    document.documentElement.style.setProperty('--current-phase-gradient', gradient);
    document.body.style.background = gradient;
    document.body.style.backgroundAttachment = 'fixed';
  }, [settings.isOnboarded, currentView, todayInsight.phaseKey]);

  const handleOnboardingComplete = (
    newSettings: UserSettings,
    initialDates: string[] = []
  ) => {
    if (initialDates && initialDates.length > 0) {
      savePeriodDates(initialDates);
      setPeriodDates([...initialDates]);
    }
    setSettings(newSettings);
  };

  /**
   * Direct calendar click:
   * - If date already in periodDates: toggles it off.
   * - If date is free: autofills current periodLength days (if new period) or adds single day.
   */
  const handleSelectDate = (dateStr: string) => {
    const blocks = extractPeriodBlocks(periodDates);
    const metrics = computeCycleMetrics(blocks, settings);
    const updated = togglePeriodDate(dateStr, metrics.periodLength);
    setPeriodDates([...updated]);
  };

  if (!settings.isOnboarded) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  const isYearView = currentView === 'full_calendar';

  return (
    <div
      className={`${styles.appLayout} ${
        isYearView ? styles.yearViewWrapper : ''
      }`}
    >
      <CalendarHeader title="Period Tracker" />

      {currentView === 'home' ? (
        <div className={styles.homeContainer}>
          {/* Monthly Calendar card with horizontal slide, legend & annual button */}
          <HomeMonthlyCalendar
            settings={settings}
            periodDates={periodDates}
            onSelectDate={handleSelectDate}
            onViewFullCalendar={() => setCurrentView('full_calendar')}
          />

          {/* "Votre phase du moment" Card */}
          <PhaseInsightsCard insight={todayInsight} />

          {/* Animation illustrée de la phase en cours */}
          <PhaseAnimationView phase={todayInsight.phaseKey} />
        </div>
      ) : (
        <YearCalendarView
          settings={settings}
          periodDates={periodDates}
          onSelectDate={handleSelectDate}
          onBack={() => setCurrentView('home')}
        />
      )}
    </div>
  );
}
