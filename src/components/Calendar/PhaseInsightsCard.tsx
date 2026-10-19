import { FC, useState } from 'react';
import { PhaseInsight, PHASE_INSIGHTS } from '../../data/phaseInsights';
import { Badge, Button, WaterDropIcon } from '../atoms';
import styles from './Calendar.module.css';

interface PhaseInsightsCardProps {
  insight: PhaseInsight;
}

const SparklesSmallIcon: FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
  </svg>
);

export const PhaseInsightsCard: FC<PhaseInsightsCardProps> = ({ insight }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compute indicator dot (x, y) along the curve based on phaseKey
  const getIndicatorPosition = () => {
    switch (insight.phaseKey) {
      case 'Phase1-Follicular':
        return { x: 34, y: 104 };
      case 'Phase2-Ovulation':
        return { x: 60, y: 22 };
      case 'Phase3-Luteal':
        return { x: 180, y: 55 };
      case 'Phase4-Menstrual':
      default:
        return { x: 295, y: 115 };
    }
  };

  const marker = getIndicatorPosition();

  return (
    <div className={styles.phaseInsightsCard}>
      <h2 className={styles.phaseInsightsTitle}>Les phases de mon cycle</h2>

      {/* SVG Wave Curve Graph */}
      <div className={styles.curveContainer}>
        <svg
          viewBox="0 0 340 150"
          className={styles.curveSvg}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Graphique des phases du cycle menstruel"
        >
          {/* Vertical phase division lines */}
          <line x1="68" y1="10" x2="68" y2="125" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <line x1="130" y1="10" x2="130" y2="125" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <line x1="262" y1="10" x2="262" y2="125" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

          {/* Baseline connecting through Phase 4 */}
          <line x1="10" y1="115" x2="330" y2="115" stroke="var(--text-dark-primary)" strokeWidth="1.5" opacity="0.3" />

          {/* Wave curve */}
          <path
            d="M 12 115 C 24 112, 45 40, 60 22 C 72 6, 85 106, 102 112 C 128 118, 145 52, 180 52 C 220 52, 240 115, 262 115 L 330 115"
            fill="none"
            stroke="var(--text-dark-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active indicator dot with glow */}
          <circle
            cx={marker.x}
            cy={marker.y}
            r="12"
            fill="var(--accent)"
            opacity="0.4"
            className={styles.curvePulseCircle}
          />
          <circle
            cx={marker.x}
            cy={marker.y}
            r="7"
            fill="var(--accent)"
            stroke="var(--text-dark-primary)"
            strokeWidth="2.5"
          />
        </svg>

        {/* Phase numbers below division lines */}
        <div className={styles.curveLabelsRow}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Badge variant="phase1">1</Badge>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Badge variant="phase2">2</Badge>
          </div>
          <div style={{ flex: 1.5, display: 'flex', justifyContent: 'center' }}>
            <Badge variant="phase3">3</Badge>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <WaterDropIcon size={16} color="var(--text-dark-primary)" />
          </div>
        </div>
      </div>

      {/* Legend items */}
      <div className={styles.legendList}>
        <div className={styles.legendRow}>
          <Badge variant="phase1">1</Badge>
          <span>Prise d’élan (folliculaire)</span>
        </div>
        <div className={styles.legendRow}>
          <Badge variant="phase2">2</Badge>
          <span>Debout sur la planche (ovulation)</span>
        </div>
        <div className={styles.legendRow}>
          <Badge variant="phase3">3</Badge>
          <span>Dans le tube de la vague (lutéale)</span>
        </div>
        <div className={styles.legendRow}>
          <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WaterDropIcon size={16} color="var(--text-dark-primary)" />
          </div>
          <span>Repos avant la prochaine vague (règle)</span>
        </div>
      </div>

      {/* Button Secondary: "En savoir plus sur les phases" */}
      <Button
        variant="secondary"
        onClick={() => setIsModalOpen(true)}
      >
        <SparklesSmallIcon size={20} />
        <span>En savoir plus sur les phases</span>
      </Button>

      {/* Detail Modal */}
      {isModalOpen && (
        <div
          className={styles.learnMoreModalOverlay}
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.learnMoreModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.phaseInsightsTitle}>Comprendre les 4 phases</h3>
            
            <div className={styles.modalPhaseItem}>
              <div className={styles.modalPhaseTitle}>
                <Badge variant="phase1">1</Badge>
                <span>Prise d’élan (Folliculaire)</span>
              </div>
              <p className={styles.modalPhaseDesc}>{PHASE_INSIGHTS['Phase1-Follicular'].emotions}</p>
            </div>

            <div className={styles.modalPhaseItem}>
              <div className={styles.modalPhaseTitle}>
                <Badge variant="phase2">2</Badge>
                <span>Debout sur la planche (Ovulation)</span>
              </div>
              <p className={styles.modalPhaseDesc}>{PHASE_INSIGHTS['Phase2-Ovulation'].emotions}</p>
            </div>

            <div className={styles.modalPhaseItem}>
              <div className={styles.modalPhaseTitle}>
                <Badge variant="phase3">3</Badge>
                <span>Dans le tube de la vague (Lutéale)</span>
              </div>
              <p className={styles.modalPhaseDesc}>{PHASE_INSIGHTS['Phase3-Luteal'].emotions}</p>
            </div>

            <div className={styles.modalPhaseItem}>
              <div className={styles.modalPhaseTitle}>
                <WaterDropIcon size={16} color="var(--text-dark-primary)" />
                <span>Repos avant la vague (Règles)</span>
              </div>
              <p className={styles.modalPhaseDesc}>{PHASE_INSIGHTS['Phase4-Menstrual'].emotions}</p>
            </div>

            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
