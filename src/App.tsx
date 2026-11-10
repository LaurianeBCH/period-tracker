import { useState, useEffect, useRef } from 'react';
import { UserSettings } from './types/cycle';
import {
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
  getPeriodDates,
  savePeriodDates,
  togglePeriodDate,
  clearAllStorage
} from './services/storage';
import { supabase } from './services/supabaseClient';
import {
  sendMagicLink,
  pullAndMergeCloudData,
  pushCloudData,
  signOutAccount,
  deleteUserAccount
} from './services/syncService';
import {
  getDayStatus,
  getTodayISO,
  extractPeriodBlocks,
  computeCycleMetrics
} from './utils/cycleEngine';
import { getPhaseInsight } from './data/phaseInsights';
import { NavigationHeader, TabBar, TabId } from './components/organisms';
import { HomeMonthlyCalendar } from './components/Calendar/HomeMonthlyCalendar';
import { YearCalendarView } from './components/Calendar/YearCalendarView';
import { PhaseInsightsCard } from './components/Calendar/PhaseInsightsCard';
import { MyCycleView } from './components/MyCycle/MyCycleView';
import { RecommendationsView } from './components/Recommendations/RecommendationsView';
import { Button } from './components/atoms';
import styles from './components/Calendar/Calendar.module.css';

interface SessionUser {
  id: string;
  email: string;
}

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(() => getSettings());
  const [periodDates, setPeriodDates] = useState<string[]>(() => getPeriodDates());
  const [currentView, setCurrentView] = useState<'home' | 'full_calendar'>('home');
  const [activeTab, setActiveTab] = useState<TabId>('calendar');
  const [recMobileView, setRecMobileView] = useState<'menu' | 'details'>('menu');
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const isHydratingFromCloudRef = useRef(false);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Listen to Supabase auth state and merge local + remote data upon login
  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    const syncForUser = async (id: string) => {
      isHydratingFromCloudRef.current = true;
      try {
        const merged = await pullAndMergeCloudData(id, getSettings(), getPeriodDates());
        if (isMounted && merged) {
          saveSettings(merged.settings);
          savePeriodDates(merged.periodDates);
          setSettings(merged.settings);
          setPeriodDates(merged.periodDates);
        }
      } finally {
        if (isMounted) {
          isHydratingFromCloudRef.current = false;
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user?.id && session.user.email) {
        setSessionUser({ id: session.user.id, email: session.user.email });
        void syncForUser(session.user.id);
      } else {
        setSessionUser(null);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session?.user?.id && session.user.email) {
        setSessionUser({ id: session.user.id, email: session.user.email });
        void syncForUser(session.user.id);
      } else {
        setSessionUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Push updates to Supabase whenever settings or periodDates change while logged in
  useEffect(() => {
    if (!sessionUser || isHydratingFromCloudRef.current) return;
    void pushCloudData(sessionUser.id, settings, periodDates);
  }, [sessionUser, settings, periodDates]);

  const todayISO = getTodayISO();
  const todayStatus = getDayStatus(todayISO, settings, periodDates);
  const todayInsight = getPhaseInsight(todayStatus.phase);

  // Synchronize V3 Multi-Mode Design Tokens with current phase (or 'neutre' when periodDates is empty)
  useEffect(() => {
    if (activeTab === 'calendar' || activeTab === 'cycle') {
      if (periodDates.length === 0) {
        document.documentElement.setAttribute('data-theme', 'neutre');
        document.body.style.backgroundColor = 'var(--background-level-1)';
        return;
      }

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
  }, [periodDates.length, todayInsight.phaseKey, activeTab]);

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

  const handleSignOut = async () => {
    await signOutAccount();
    setSessionUser(null);
  };

  const handleDeleteAccount = async () => {
    if (sessionUser) {
      await deleteUserAccount(sessionUser.id);
    }
    clearAllStorage();
    setSessionUser(null);
    setPeriodDates([]);
    setSettings({ ...DEFAULT_SETTINGS });
    return { error: null };
  };

  const isYearView = currentView === 'full_calendar';

  return (
    <div
      className={`${styles.appLayout} ${
        isYearView ? styles.yearViewWrapper : ''
      }`}
    >
      {/* V3 Navigation Header */}
      <NavigationHeader title="Period Tracker" />

      {currentView === 'home' ? (
        <>
          {activeTab === 'cycle' ? (
            <MyCycleView
              settings={settings}
              periodDates={periodDates}
              userEmail={sessionUser?.email ?? null}
              onSendMagicLink={sendMagicLink}
              onSignOut={handleSignOut}
              onDeleteAccount={handleDeleteAccount}
            />
          ) : activeTab === 'recommendations' ? (
            <RecommendationsView
              currentPhase={todayStatus.phase}
              mobileView={recMobileView}
              onMobileViewChange={setRecMobileView}
            />
          ) : (
            <main className={styles.homeContainer}>
              <div className={styles.pageTitleRow}>
                <h1 className={styles.pageTitle}>Calendrier</h1>
              </div>

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
