import React, { useState, useEffect, useRef } from 'react';
import { UserSettings, CycleLog } from '../../types/cycle';
import { MonthGrid } from './MonthGrid';
import styles from './Calendar.module.css';

interface InfiniteMonthListProps {
  settings: UserSettings;
  logs: CycleLog[];
  onSelectDate: (dateStr: string) => void;
}

interface MonthItem {
  year: number;
  month: number; // 0-11
}

export const InfiniteMonthList: React.FC<InfiniteMonthListProps> = ({
  settings,
  logs,
  onSelectDate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize starting month list from current month to current + 6 months
  const [months, setMonths] = useState<MonthItem[]>(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const initialMonths: MonthItem[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(currentYear, currentMonth + i, 1);
      initialMonths.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return initialMonths;
  });

  const loadMoreMonths = () => {
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

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - (scrollTop + clientHeight) < 400) {
      loadMoreMonths();
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.monthListContainer} ref={containerRef}>
      {months.map((m) => (
        <MonthGrid
          key={`${m.year}-${m.month}`}
          year={m.year}
          month={m.month}
          settings={settings}
          logs={logs}
          onSelectDate={onSelectDate}
        />
      ))}
    </div>
  );
};
