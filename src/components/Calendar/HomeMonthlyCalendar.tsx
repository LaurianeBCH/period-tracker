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
  const currentIndexRef = useRef(12);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollTimerRef = useRef<number | null>(null);

  // Scroll to current month on initial mount & handle window resize
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    const alignMonth = (smooth = false) => {
      const isDesktop = window.innerWidth >= 1024;
      const targetSlide = el.children[currentIndexRef.current] as HTMLElement;
      if (!targetSlide) return;

      if (isDesktop) {
        targetSlide.scrollIntoView({
          behavior: smooth ? 'smooth' : ('instant' as ScrollBehavior),
          block: 'start'
        });
      } else {
        targetSlide.scrollIntoView({
          behavior: smooth ? 'smooth' : ('instant' as ScrollBehavior),
          inline: 'center',
          block: 'nearest'
        });
      }
    };

    // Instant alignment on mount without animation glitches
    alignMonth(false);

    const handleResize = () => {
      alignMonth(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen to scrollend event to safely release programmatic scroll lock
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    const handleScrollEnd = () => {
      if (window.innerWidth >= 1024) return;
      isProgrammaticScrollRef.current = false;
      if (programmaticScrollTimerRef.current) {
        window.clearTimeout(programmaticScrollTimerRef.current);
        programmaticScrollTimerRef.current = null;
      }
      const width = el.clientWidth;
      if (width > 0) {
        const finalIndex = Math.round(el.scrollLeft / width);
        if (finalIndex >= 0 && finalIndex < months.length && finalIndex !== currentIndexRef.current) {
          currentIndexRef.current = finalIndex;
          setCurrentIndex(finalIndex);
        }
      }
    };

    el.addEventListener('scrollend', handleScrollEnd);
    return () => {
      el.removeEventListener('scrollend', handleScrollEnd);
      if (programmaticScrollTimerRef.current) {
        window.clearTimeout(programmaticScrollTimerRef.current);
      }
    };
  }, [months.length]);

  // Update active month title as user swipes manually
  const handleScroll = () => {
    if (window.innerWidth >= 1024) return;
    if (isProgrammaticScrollRef.current) return;
    const el = sliderRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const width = el.clientWidth;
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex >= 0 && newIndex < months.length && newIndex !== currentIndexRef.current) {
        currentIndexRef.current = newIndex;
        setCurrentIndex(newIndex);
      }
    }
  };

  const scrollToMonth = (index: number, smooth = true) => {
    const el = sliderRef.current;
    if (!el) return;
    if (index < 0 || index >= months.length) return;

    const targetSlide = el.children[index] as HTMLElement;
    if (!targetSlide) return;

    currentIndexRef.current = index;
    setCurrentIndex(index);

    if (smooth) {
      isProgrammaticScrollRef.current = true;
      if (programmaticScrollTimerRef.current) {
        window.clearTimeout(programmaticScrollTimerRef.current);
      }

      targetSlide.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });

      // Safety timeout in case scrollend is not supported or delayed
      programmaticScrollTimerRef.current = window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 500);
    } else {
      targetSlide.scrollIntoView({
        behavior: 'instant' as ScrollBehavior,
        inline: 'center',
        block: 'nearest'
      });
    }
  };

  const goToPrevMonth = () => {
    if (currentIndexRef.current > 0) {
      scrollToMonth(currentIndexRef.current - 1, true);
    }
  };

  const goToNextMonth = () => {
    if (currentIndexRef.current < months.length - 1) {
      scrollToMonth(currentIndexRef.current + 1, true);
    }
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const idx = months.findIndex(
      (m) => m.year === curYear && m.month === curMonth
    );
    const targetIndex = idx !== -1 ? idx : 12;
    scrollToMonth(targetIndex, true);
  };

  const currentMonthItem = months[currentIndex] || months[12];
  const dateObj = new Date(currentMonthItem.year, currentMonthItem.month, 1);
  const rawMonthName = dateObj.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  });
  const monthTitle = rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);

  const now = new Date();
  const isCurrentMonth =
    currentMonthItem.year === now.getFullYear() &&
    currentMonthItem.month === now.getMonth();

  const effectiveDates = periodDates.length > 0 ? periodDates : (logs || []);

  return (
    <div className={styles.calendarCard}>
      {/* Month Navigation Header */}
      <div className={styles.monthHeader}>
        <button
          type="button"
          className={styles.navButton}
          onClick={goToPrevMonth}
          aria-label="Mois précédent"
          title="Mois précédent"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <h2 className={styles.monthHeading}>
          <button
            type="button"
            className={styles.monthTitle}
            onClick={goToCurrentMonth}
            title={
              isCurrentMonth
                ? 'Mois et année en cours'
                : 'Revenir au mois et année en cours'
            }
            aria-label={`Mois affiché : ${monthTitle}. Cliquer pour revenir au mois et année en cours.`}
          >
            {monthTitle}
          </button>
        </h2>

        <button
          type="button"
          className={styles.navButton}
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
        className={styles.monthSlider}
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

          const rawMonth = new Date(m.year, m.month, 1).toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
          });
          const slideMonthTitle =
            rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);

          return (
            <div
              key={`${m.year}-${m.month}`}
              className={styles.monthSlide}
              data-year-month={`${m.year}-${m.month}`}
            >
              <h2 className={styles.desktopMonthTitle}>{slideMonthTitle}</h2>
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

      {/* Action button to view full continuous calendar */}
      <div className={styles.calendarFooter}>
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
