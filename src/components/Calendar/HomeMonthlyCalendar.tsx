import { useState, useRef, useEffect, FC } from 'react';
import { UserSettings, CycleLog } from '../../types/cycle';
import { formatDateISO, getDayStatus } from '../../utils/cycleEngine';
import { DayCell } from './DayCell';
import { Button } from '../atoms';
import styles from './Calendar.module.css';

interface HomeMonthlyCalendarProps {
  settings: UserSettings;
  periodDates?: string[];
  logs?: CycleLog[];
  onSelectDate: (dateStr: string) => void;
  onViewFullCalendar: () => void;
}

interface MonthItem {
  year: number;
  month: number;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const HomeMonthlyCalendar: FC<HomeMonthlyCalendarProps> = ({
  settings,
  periodDates = [],
  logs,
  onSelectDate,
  onViewFullCalendar
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  // Generate 25 months (-12 to +12 months around now)
  const [months] = useState<MonthItem[]>(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const list: MonthItem[] = [];
    for (let i = -12; i <= 12; i++) {
      const d = new Date(curYear, curMonth + i, 1);
      list.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return list;
  });

  // Default to current month index (12)
  const [currentIndex, setCurrentIndex] = useState(12);

  // Scroll to current month on initial mount
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const targetSlide = el.children[currentIndex] as HTMLElement;
    if (targetSlide) {
      el.scrollLeft = targetSlide.offsetLeft;
    }
  }, []);

  // Update active month title as user swipes
  const handleScroll = () => {
    const el = sliderRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const width = el.clientWidth;
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex >= 0 && newIndex < months.length && newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  const scrollToMonth = (index: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const targetSlide = el.children[index] as HTMLElement;
    if (targetSlide) {
      targetSlide.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
      setCurrentIndex(index);
    }
  };

  const goToPrevMonth = () => {
    if (currentIndex > 0) {
      scrollToMonth(currentIndex - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentIndex < months.length - 1) {
      scrollToMonth(currentIndex + 1);
    }
  };

  const currentMonthItem = months[currentIndex] || months[12];
  const dateObj = new Date(currentMonthItem.year, currentMonthItem.month, 1);
  const rawMonthName = dateObj.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  });
  const monthTitle = rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);

  const effectiveDates = periodDates.length > 0 ? periodDates : (logs || []);

  return (
    <div className={styles.homeCalendarCard}>
      {/* Month Navigation Header */}
      <div className={styles.monthHeaderRow}>
        <button
          type="button"
          className={styles.monthNavButton}
          onClick={goToPrevMonth}
          aria-label="Mois précédent"
          title="Mois précédent"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <h2 className={styles.monthTitle}>{monthTitle}</h2>

        <button
          type="button"
          className={styles.monthNavButton}
          onClick={goToNextMonth}
          aria-label="Mois suivant"
          title="Mois suivant"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Horizontal slide container for months */}
      <div
        ref={sliderRef}
        className={styles.monthSliderContainer}
        onScroll={handleScroll}
      >
        {months.map((m) => {
          const firstDay = new Date(m.year, m.month, 1);
          let firstDayIndex = firstDay.getDay() - 1;
          if (firstDayIndex === -1) firstDayIndex = 6;

          const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
          const cells = [];

          // Empty leading cells
          for (let i = 0; i < firstDayIndex; i++) {
            cells.push(<DayCell key={`empty-${m.year}-${m.month}-${i}`} />);
          }

          // Days
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

          // Empty trailing cells to complete the 7-day row
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
              className={styles.monthSlide}
              data-year-month={`${m.year}-${m.month}`}
            >
              <div className={styles.weekdaysStrip}>
                {WEEKDAYS.map((wd) => (
                  <div key={wd} className={styles.weekdayHeaderCell}>
                    {wd}
                  </div>
                ))}
              </div>
              <div className={styles.daysGrid}>{cells}</div>
            </div>
          );
        })}
      </div>

      {/* Action button to view full continuous calendar */}
      <div className={styles.cardFooter}>
        <Button
          variant="primary"
          fullWidth
          onClick={onViewFullCalendar}
        >
          Voir le calendrier sur l’année
        </Button>
      </div>
    </div>
  );
};
