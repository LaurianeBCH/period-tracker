import { FC, ReactNode } from 'react';
import { UserSettings, CycleLog } from '../../types/cycle';
import { getDayStatus, formatDateISO } from '../../utils/cycleEngine';
import { DayCell } from './DayCell';
import styles from './Calendar.module.css';

interface MonthGridProps {
  year: number;
  month: number; // 0-indexed: 0 = January, 11 = December
  settings: UserSettings;
  logs: CycleLog[];
  onSelectDate: (dateStr: string) => void;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const MonthGrid: FC<MonthGridProps> = ({
  year,
  month,
  settings,
  logs,
  onSelectDate
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

  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const currentDate = new Date(year, month, d);
    const dateStr = formatDateISO(currentDate);
    const status = getDayStatus(dateStr, settings, logs);

    cells.push(
      <DayCell
        key={dateStr}
        dayNumber={d}
        status={status}
        onClick={() => onSelectDate(dateStr)}
      />
    );
  }

  return (
    <div className={styles.monthCard}>
      <h2 className={styles.monthTitle}>{monthName}</h2>
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
};
