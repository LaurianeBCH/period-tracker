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
import { getDayStatus } from './utils/cycleEngine';
import { OnboardingWizard } from './components/OnboardingWizard/OnboardingWizard';
import { CalendarHeader } from './components/Calendar/CalendarHeader';
import { InfiniteMonthList } from './components/Calendar/InfiniteMonthList';
import { BottomSheet } from './components/BottomSheet/BottomSheet';
import { SettingsModal } from './components/SettingsModal/SettingsModal';
import styles from './components/Calendar/Calendar.module.css';

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(() => getSettings());
  const [logs, setLogs] = useState<CycleLog[]>(() => getLogs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

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

  if (!settings.isOnboarded) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  const selectedDayStatus = selectedDate
    ? getDayStatus(selectedDate, settings, logs)
    : null;

  return (
    <div className={styles.calendarWrapper}>
      <CalendarHeader onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <InfiniteMonthList
        settings={settings}
        logs={logs}
        onSelectDate={(dateStr) => setSelectedDate(dateStr)}
      />

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
    </div>
  );
}
