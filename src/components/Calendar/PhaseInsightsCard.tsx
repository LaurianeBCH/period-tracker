import { FC } from 'react';
import { PhaseInsight } from '../../data/phaseInsights';
import styles from './Calendar.module.css';

interface PhaseInsightsCardProps {
  insight: PhaseInsight;
}

export const PhaseInsightsCard: FC<PhaseInsightsCardProps> = ({ insight }) => {
  return (
    <div className={styles.insightsFeedContainer}>
      {/* Card 1: Badge + Citation Quote + Illustration */}
      <div className={styles.insightCard}>
        <div className={`${styles.badgePill} ${styles[insight.surfaceTokenClass]}`}>
          <span>{insight.title}</span>
        </div>
        <h2 className={styles.quoteText}>{insight.subtitle}</h2>
        <div className={styles.cardImageFrame}>
          <img
            src={insight.imageSrc}
            alt={insight.title}
            className={styles.cardImage}
          />
        </div>
      </div>

      {/* Card 2: Nos émotions */}
      <div className={styles.insightCard}>
        <h3 className={styles.insightSectionTitle}>Nos émotions</h3>
        <p className={styles.insightSectionText}>{insight.emotions}</p>
      </div>

      {/* Card 3: Nutritions */}
      <div className={styles.insightCard}>
        <h3 className={styles.insightSectionTitle}>Nutritions</h3>
        <p className={styles.insightSectionText}>{insight.nutrition}</p>
      </div>

      {/* Card 4: Recommandations */}
      <div className={styles.insightCard}>
        <h3 className={styles.insightSectionTitle}>Recommandations</h3>
        <p className={styles.insightSectionText}>{insight.recommendations}</p>
      </div>
    </div>
  );
};
