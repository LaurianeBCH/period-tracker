import { useState, useEffect, useRef, FC, ReactNode } from 'react';
import { UserSettings, CycleLog } from '../../types/cycle';
import { MonthGrid } from './MonthGrid';
import styles from './Calendar.module.css';

interface InfiniteMonthListProps {
  settings: UserSettings;
  logs: CycleLog[];
  onSelectDate: (dateStr: string) => void;
  maxMonths?: number;
  onViewFullCalendar?: () => void;
}

interface MonthItem {
  year: number;
  month: number; // 0-11
}

export const InfiniteMonthList: FC<InfiniteMonthListProps> = ({
  settings,
  logs,
  onSelectDate,
  maxMonths,
  onViewFullCalendar
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentMonthRef = useRef<HTMLDivElement>(null);

  const [currentYearMonth] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Initialize month list
  const [months, setMonths] = useState<MonthItem[]>(() => {
    const { year, month } = currentYearMonth;
    const initialMonths: MonthItem[] = [];

    if (maxMonths) {
      // Home preview: 2 months starting from current month
      for (let i = 0; i < maxMonths; i++) {
        const d = new Date(year, month + i, 1);
        initialMonths.push({ year: d.getFullYear(), month: d.getMonth() });
      }
    } else {
      // Full calendar view: 6 past months + current month + 6 future months
      for (let i = -6; i <= 6; i++) {
        const d = new Date(year, month + i, 1);
        initialMonths.push({ year: d.getFullYear(), month: d.getMonth() });
      }
    }
    return initialMonths;
  });

  // Load more future months
  const loadMoreFutureMonths = () => {
    setMonths((prev) => {
      const lastMonth = prev[prev.length - 1];
      const nextMonths: MonthItem[] = [];
      for (let i = 1; i <= 6; i++) {
        const d = new Date(lastMonth.year, lastMonth.month + i, 1);
        nextMonths.push({ year: d.getFullYear(), month: d.getMonth() });
      }
      return [...prev, ...nextMonths];
    });
  };

  // Load more past months
  const loadMorePastMonths = () => {
    if (maxMonths || !containerRef.current) return;
    const container = containerRef.current;
    const previousScrollHeight = container.scrollHeight;

    setMonths((prev) => {
      const firstMonth = prev[0];
      const pastMonths: MonthItem[] = [];
      for (let i = 6; i >= 1; i--) {
        const d = new Date(firstMonth.year, firstMonth.month - i, 1);
        pastMonths.push({ year: d.getFullYear(), month: d.getMonth() });
      }
      return [...pastMonths, ...prev];
    });

    requestAnimationFrame(() => {
      if (container) {
        container.scrollTop = container.scrollHeight - previousScrollHeight;
      }
    });
  };

  const handleScroll = () => {
    if (maxMonths || !containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    if (scrollHeight - (scrollTop + clientHeight) < 400) {
      loadMoreFutureMonths();
    } else if (scrollTop < 200) {
      loadMorePastMonths();
    }
  };

  useEffect(() => {
    if (maxMonths) return;
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [maxMonths]);

  // Focus current month on full calendar load
  useEffect(() => {
    if (!maxMonths && currentMonthRef.current && containerRef.current) {
      currentMonthRef.current.scrollIntoView({
        block: 'start',
        behavior: 'instant' as ScrollBehavior
      });
    }
  }, [maxMonths]);

  // RENDER: Home view preview (Unified single card block for 2 months)
  if (maxMonths && maxMonths === 2) {
    const fullCalendarButton: ReactNode = onViewFullCalendar ? (
      <button
        type="button"
        className={styles.btnFullCalendar}
        onClick={onViewFullCalendar}
      >
        Voir le calendrier complet
      </button>
    ) : null;

    return (
      <div className={styles.unifiedHomeCard}>
        {months.map((m, index) => (
          <div key={`${m.year}-${m.month}`} className={styles.unifiedMonthSection}>
            <MonthGrid
              year={m.year}
              month={m.month}
              settings={settings}
              logs={logs}
              onSelectDate={onSelectDate}
              className={styles.monthCardInner}
              footerButton={index === months.length - 1 ? fullCalendarButton : undefined}
            />
          </div>
        ))}
      </div>
    );
  }

  // RENDER: Full Calendar view (Separate cards, infinite scroll past & future, auto-focused)
  return (
    <div className={styles.monthListContainer} ref={containerRef}>
      {months.map((m) => {
        const isCurrent =
          m.year === currentYearMonth.year && m.month === currentYearMonth.month;
        return (
          <MonthGrid
            key={`${m.year}-${m.month}`}
            innerRef={isCurrent ? currentMonthRef : undefined}
            year={m.year}
            month={m.month}
            settings={settings}
            logs={logs}
            onSelectDate={onSelectDate}
          />
        );
      })}
    </div>
  );
};
