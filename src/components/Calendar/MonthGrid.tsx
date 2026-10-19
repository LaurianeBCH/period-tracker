import { FC, ReactNode, RefObject } from 'react';
import { UserSettings, CycleLog } from '../../types/cycle';
import { getDayStatus, formatDateISO } from '../../utils/cycleEngine';
import { DayCell } from './DayCell';
import styles from './Calendar.module.css';

interface MonthGridProps {
  year: number;
  month: number; // 0-indexed: 0 = January, 11 = December
  settings: UserSettings;
  periodDates?: string[];
  logs?: CycleLog[];
  onSelectDate: (dateStr: string) => void;
  footerButton?: ReactNode;
  className?: string;
  innerRef?: RefObject<HTMLDivElement | null>;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const MonthGrid: FC<MonthGridProps> = ({
  year,
  month,
  settings,
  periodDates = [],
  logs,
  onSelectDate,
  footerButton,
  className,
  innerRef
}) => {
  const date = new Date(year, month, 1);
  const rawMonthName = date.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  });
  // Capitalize first letter of month (e.g., "Août 2026")
  const monthName = rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);

  // First day of month offset (0 = Mon, 6 = Sun)
  let firstDayIndex = date.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6; // Sunday

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: ReactNode[] = [];

  // Empty leading cells
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(<DayCell key={`empty-${i}`} />);
  }

  const effectiveDates = periodDates.length > 0 ? periodDates : (logs || []);

  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const currentDate = new Date(year, month, d);
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

  // Trailing empty cells to complete the last row
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const trailingCount = 7 - remainder;
    for (let i = 0; i < trailingCount; i++) {
      cells.push(<DayCell key={`trailing-${i}`} />);
    }
  }

  return (
    <div
      ref={innerRef}
      className={className || styles.monthCard}
      data-year-month={`${year}-${month}`}
    >
      <h2 className={styles.monthTitle}>{monthName}</h2>
      <div className={styles.weekdaysStrip}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} className={styles.weekdayHeaderCell}>
            {wd}
          </div>
        ))}
      </div>
      <div className={styles.daysGrid}>{cells}</div>
      {footerButton && <div className={styles.cardFooter}>{footerButton}</div>}
    </div>
  );
};
