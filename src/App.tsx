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
import { NavigationHeader, TabBar, TabId } from './components/organisms';
import { HomeMonthlyCalendar } from './components/Calendar/HomeMonthlyCalendar';
import { YearCalendarView } from './components/Calendar/YearCalendarView';
import { PhaseInsightsCard } from './components/Calendar/PhaseInsightsCard';
import { MyCycleView } from './components/MyCycle/MyCycleView';
import { RecommendationsView } from './components/Recommendations/RecommendationsView';
import { Button } from './components/atoms';
import styles from './components/Calendar/Calendar.module.css';

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(() => getSettings());
  const [periodDates, setPeriodDates] = useState<string[]>(() => getPeriodDates());
  const [currentView, setCurrentView] = useState<'home' | 'full_calendar'>('home');
  const [activeTab, setActiveTab] = useState<TabId>('calendar');
  const [recMobileView, setRecMobileView] = useState<'menu' | 'details'>('menu');
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const todayISO = getTodayISO();
  const todayStatus = getDayStatus(todayISO, settings, periodDates);
  const todayInsight = getPhaseInsight(todayStatus.phase);

  // Synchronize V3 Multi-Mode Design Tokens with current phase (or restore on tab switch)
  useEffect(() => {
    if (!settings.isOnboarded) return;

    if (activeTab === 'calendar' || activeTab === 'cycle') {
      const phaseKey = todayInsight.phaseKey;
      const themeMode =
        phaseKey === 'Phase1-Follicular'
          ? 'phase 1'
          : phaseKey === 'Phase2-Ovulation'
          ? 'phase 2'
          : phaseKey === 'Phase3-Luteal'
          ? 'phase 3'
          : 'phase 4';

      document.documentElement.setAttribute('data-theme', themeMode);
      document.body.style.backgroundColor = 'var(--background-level-1)';
    }
  }, [settings.isOnboarded, todayInsight.phaseKey, activeTab]);

  const handleOnboardingComplete = (
    newSettings: UserSettings,
    initialDates: string[] = []
  ) => {
    if (initialDates && initialDates.length > 0) {
      savePeriodDates(initialDates);
      setPeriodDates([...initialDates]);
    }
    setSettings(newSettings);
    setIsEditingSettings(false);
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

  if (!settings.isOnboarded || isEditingSettings) {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
      />
    );
  }

  const isYearView = currentView === 'full_calendar';

  return (
    <div
      className={`${styles.appLayout} ${
        isYearView ? styles.yearViewWrapper : ''
      }`}
    >
      {/* V3 Navigation Header */}
      <NavigationHeader
        title="Period Tracker"
        onSettingsClick={() => setIsEditingSettings(true)}
      />

      {currentView === 'home' ? (
        <>
          {activeTab === 'cycle' ? (
            <MyCycleView
              settings={settings}
              periodDates={periodDates}
            />
          ) : activeTab === 'recommendations' ? (
            <RecommendationsView
              currentPhase={todayStatus.phase}
              mobileView={recMobileView}
              onMobileViewChange={setRecMobileView}
            />
          ) : (
            <main className={styles.homeContainer}>
              {/* Monthly Calendar card */}
              <HomeMonthlyCalendar
                settings={settings}
                periodDates={periodDates}
                onSelectDate={handleSelectDate}
                onViewFullCalendar={() => setCurrentView('full_calendar')}
              />

              {/* V3 "Ma phase du moment" Card with wave curve graph */}
              <PhaseInsightsCard
                insight={todayInsight}
                todayStatus={todayStatus}
                onNavigateToRecommendations={() => {
                  setActiveTab('recommendations');
                  setCurrentView('home');
                }}
              />
            </main>
          )}

          {/* V3 Bottom Navigation / Mobile Return Button in yearFooter */}
          {activeTab === 'recommendations' && recMobileView === 'details' ? (
            <>
              <div className={styles.mobileOnlyFooter}>
                <div className={styles.yearFooter}>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setRecMobileView('menu')}
                  >
                    Retour
                  </Button>
                </div>
              </div>
              <div className={styles.desktopOnlyTabBar}>
                <TabBar
                  activeTab={activeTab}
                  onTabChange={(tab) => {
                    setActiveTab(tab);
                    setCurrentView('home');
                  }}
                />
              </div>
            </>
          ) : (
            <TabBar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setCurrentView('home');
              }}
            />
          )}
        </>
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
