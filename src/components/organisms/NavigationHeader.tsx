import { FC } from 'react';
import styles from './NavigationHeader.module.css';

interface NavigationHeaderProps {
  title?: string;
}

export const NavigationHeader: FC<NavigationHeaderProps> = ({
  title = 'Period Tracker'
}) => {
  return (
    <header className={styles.headerWrapper} role="banner">
      <div className={styles.headerInner}>
        <h1 className={styles.headerTitle}>{title}</h1>
      </div>
    </header>
  );
};
