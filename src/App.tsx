import { useState, useEffect } from 'react';
import { UserSettings, CycleLog } from './types/cycle';
import {
  getSettings,
  saveSettings,
  getLogs,
  logPeriodStart,
  logPeriodEnd,
  removeLogForDate
} from './services/storage';
import { getDayStatus, getTodayISO } from './utils/cycleEngine';
import { getPhaseInsight } from './data/phaseInsights';
import { OnboardingWizard } from './components/OnboardingWizard/OnboardingWizard';
import { CalendarHeader } from './components/Calendar/CalendarHeader';
import { InfiniteMonthList } from './components/Calendar/InfiniteMonthList';
import { PhaseInsightsCard } from './components/Calendar/PhaseInsightsCard';
import { BottomSheet } from './components/BottomSheet/BottomSheet';
import { SettingsModal } from './components/SettingsModal/SettingsModal';
import { LogPeriodModal } from './components/LogPeriodModal/LogPeriodModal';
import styles from './components/Calendar/Calendar.module.css';

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(() => getSettings());
  const [logs, setLogs] = useState<CycleLog[]>(() => getLogs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLogPeriodModalOpen, setIsLogPeriodModalOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'home' | 'full_calendar'>('home');

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const todayISO = getTodayISO();
  const todayStatus = getDayStatus(todayISO, settings, logs);
  const todayInsight = getPhaseInsight(todayStatus.phase);

  // Centralized effect updating --current-phase-bg across body, app wrapper, header, calendar page, & bottom bar
  useEffect(() => {
    if (!settings.isOnboarded) return;
    const phaseNum =
      todayInsight.phaseKey === 'Phase1-Follicular'
        ? '1'
        : todayInsight.phaseKey === 'Phase2-Ovulation'
        ? '2'
        : todayInsight.phaseKey === 'Phase3-Luteal'
        ? '3'
        : '4';
    const bgVar = `var(--background-phase-${phaseNum})`;
    document.documentElement.style.setProperty('--current-phase-bg', bgVar);
    document.body.style.backgroundColor = bgVar;
  }, [settings.isOnboarded, todayInsight]);

  const handleOnboardingComplete = (
    newSettings: UserSettings,
    initialPeriodStartDate?: string
  ) => {
    let updatedLogs = logs;
    if (initialPeriodStartDate) {
      updatedLogs = logPeriodStart(initialPeriodStartDate);
      setLogs(updatedLogs);
    }
    setSettings(newSettings);
  };

  const handleLogPeriodStart = (dateStr: string) => {
    const updated = logPeriodStart(dateStr);
    setLogs([...updated]);
  };

  const handleLogPeriodEnd = (dateStr: string) => {
    const updated = logPeriodEnd(dateStr);
    setLogs([...updated]);
  };

  const handleRemoveLog = (dateStr: string) => {
    const updated = removeLogForDate(dateStr);
    setLogs([...updated]);
  };

  const handleSavePeriodFromModal = (startDateStr: string, endDateStr?: string) => {
    let updated = logPeriodStart(startDateStr);
    if (endDateStr) {
      updated = logPeriodEnd(endDateStr);
    }
    setLogs([...updated]);
  };

  if (!settings.isOnboarded) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  const selectedDayStatus = selectedDate
    ? getDayStatus(selectedDate, settings, logs)
    : null;

  return (
    <div className={styles.calendarWrapper}>
      <CalendarHeader
        title={currentView === 'home' ? 'Period Tracker' : 'Calendrier'}
        onBack={
          currentView === 'full_calendar'
            ? () => setCurrentView('home')
            : undefined
        }
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {currentView === 'home' ? (
        <div className={styles.monthListContainer}>
          {/* Hero Banner with illustration & phase title */}
          <div className={styles.heroBanner}>
            <div className={styles.heroImageFrame}>
              <img
                src={todayInsight.imageSrc}
                alt={todayInsight.title}
                className={styles.heroImage}
              />
            </div>
            <h2 className={styles.heroPhaseTitle}>{todayInsight.title}</h2>
          </div>

          {/* 2-month Calendar preview */}
          <InfiniteMonthList
            key={currentView}
            settings={settings}
            logs={logs}
            maxMonths={2}
            onViewFullCalendar={() => setCurrentView('full_calendar')}
            onSelectDate={(dateStr) => setSelectedDate(dateStr)}
          />

          {/* Phase Insights Section (Emotions, Nutrition, Recommendations) */}
          <PhaseInsightsCard insight={todayInsight} />
        </div>
      ) : (
        <InfiniteMonthList
          key={currentView}
          settings={settings}
          logs={logs}
          onSelectDate={(dateStr) => setSelectedDate(dateStr)}
        />
      )}

      {/* Floating Bottom Action Bar */}
      <div className={styles.bottomActionBar}>
        <button
          type="button"
          className={styles.btnDeclarePeriod}
          onClick={() => setIsLogPeriodModalOpen(true)}
        >
          Déclarer mes règles
        </button>
      </div>

      <BottomSheet
        selectedDateStr={selectedDate}
        dayStatus={selectedDayStatus}
        onLogPeriodStart={handleLogPeriodStart}
        onLogPeriodEnd={handleLogPeriodEnd}
        onRemoveLog={handleRemoveLog}
        onClose={() => setSelectedDate(null)}
      />

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={(newSettings) => setSettings(newSettings)}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      <LogPeriodModal
        isOpen={isLogPeriodModalOpen}
        onClose={() => setIsLogPeriodModalOpen(false)}
        onSave={handleSavePeriodFromModal}
      />
    </div>
  );
}
