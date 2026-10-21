import { useState, useEffect, useRef, FC } from 'react';
import { UserSettings, CycleLog } from '../../types/cycle';
import { formatDateISO, getDayStatus } from '../../utils/cycleEngine';
import { DayCell } from './DayCell';
import { Button } from '../atoms';
import styles from './Calendar.module.css';

interface YearCalendarViewProps {
  settings: UserSettings;
  periodDates?: string[];
  logs?: CycleLog[];
  onSelectDate: (dateStr: string) => void;
  onBack: () => void;
}

interface MonthItem {
  year: number;
  month: number;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const YearCalendarView: FC<YearCalendarViewProps> = ({
  settings,
  periodDates = [],
  logs,
  onSelectDate,
  onBack
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentMonthRef = useRef<HTMLDivElement>(null);

  const [currentYearMonth] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // 12 months around current month (e.g. -2 past to +10 future months)
  const [months] = useState<MonthItem[]>(() => {
    const { year, month } = currentYearMonth;
    const list: MonthItem[] = [];
    for (let i = -2; i <= 10; i++) {
      const d = new Date(year, month + i, 1);
      list.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return list;
  });

  // Scroll to current month on initial mount
  useEffect(() => {
    if (currentMonthRef.current && containerRef.current) {
      currentMonthRef.current.scrollIntoView({
        behavior: 'instant' as ScrollBehavior,
        block: 'start'
      });
    }
  }, []);

  const effectiveDates = periodDates.length > 0 ? periodDates : (logs || []);

  return (
    <div className={styles.yearViewContainer}>
      {/* Scrollable list of months */}
      <div className={styles.yearMonthList} ref={containerRef}>
        {months.map((m) => {
          const isCurrent =
            m.year === currentYearMonth.year && m.month === currentYearMonth.month;

          const date = new Date(m.year, m.month, 1);
          const rawMonthName = date.toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
          });
          const monthTitle =
            rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);

          let firstDayIndex = date.getDay() - 1;
          if (firstDayIndex === -1) firstDayIndex = 6;
          const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();

          const cells = [];
          for (let i = 0; i < firstDayIndex; i++) {
            cells.push(<DayCell key={`empty-${m.year}-${m.month}-${i}`} />);
          }

          for (let d = 1; d <= daysInMonth; d++) {
            const currentDate = new Date(m.year, m.month, d);
            const dateStr = formatDateISO(currentDate);
            const status = getDayStatus(dateStr, settings, effectiveDates);

            cells.push(
              <DayCell
                key={dateStr}
                dayNumber={d}
                status={status}
                onClick={() => onSelectDate(dateStr)}
              />
            );
          }

          // Trailing empty cells
          const remainder = cells.length % 7;
          if (remainder !== 0) {
            const trailingCount = 7 - remainder;
            for (let i = 0; i < trailingCount; i++) {
              cells.push(<DayCell key={`trailing-${m.year}-${m.month}-${i}`} />);
            }
          }

          return (
            <div
              key={`${m.year}-${m.month}`}
              ref={isCurrent ? currentMonthRef : undefined}
              className={styles.yearMonthSection}
              data-year-month={`${m.year}-${m.month}`}
            >
              <h2 className={styles.yearMonthTitle}>{monthTitle}</h2>
              <div className={styles.weekdaysRow}>
                {WEEKDAYS.map((wd) => (
                  <div key={wd} className={styles.weekdayCell}>
                    {wd}
                  </div>
                ))}
              </div>
              <div className={styles.daysGrid}>{cells}</div>
            </div>
          );
        })}
      </div>

      {/* Fixed bottom footer with V3 Primary Return Button */}
      <div className={styles.yearFooter}>
        <Button
          variant="primary"
          fullWidth
          onClick={onBack}
        >
          Retour
        </Button>
      </div>
    </div>
  );
};
