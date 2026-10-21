import { FC, useState, useEffect } from 'react';
import { CyclePhase } from '../../types/cycle';
import { RECOMMENDATIONS_DATA, PhaseRecommendation } from '../../data/recommendationsData';
import styles from './RecommendationsView.module.css';

interface RecommendationsViewProps {
  currentPhase?: CyclePhase;
  mobileView?: 'menu' | 'details';
  onMobileViewChange?: (view: 'menu' | 'details') => void;
  selectedPhaseId?: number;
  onSelectPhaseId?: (id: number) => void;
}

function getPhaseNumber(phase?: CyclePhase): number {
  if (phase === 'Phase2-Ovulation') return 2;
  if (phase === 'Phase3-Luteal') return 3;
  if (phase === 'Phase4-Menstrual' || phase === 'Phase4-Menstrual-Unconfirmed') return 4;
  return 1;
}

export const NutritionIcon: FC<{ size?: number; className?: string }> = ({
  size = 24,
  className
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M16 6V14H19V22H21V2C18.24 2 16 4.24 16 6ZM11 9H9V2H7V9H5V2H3V9C3 11.21 4.79 13 7 13V22H9V13C11.21 13 13 11.21 13 9V2H11V9Z"
      fill="currentColor"
    />
  </svg>
);

export const MindsetIcon: FC<{ size?: number; className?: string }> = ({
  size = 24,
  className
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M12 8C13.1046 8 14 7.10457 14 6C14 4.89543 13.1046 4 12 4C10.8954 4 10 4.89543 10 6C10 7.10457 10.8954 8 12 8Z"
      fill="currentColor"
    />
    <path
      d="M21 16V14C18.76 14 16.84 13.04 15.4 11.32L14.06 9.72C13.68 9.26 13.12 9 12.53 9H11.48C10.89 9 10.33 9.26 9.95 9.72L8.61 11.32C7.16 13.04 5.24 14 3 14V16C5.77 16 8.19 14.83 10 12.75V15L6.12 16.55C5.45 16.82 5 17.48 5 18.21C5 19.2 5.8 20 6.79 20H9V19.5C9 18.12 10.12 17 11.5 17H14.5C14.78 17 15 17.22 15 17.5C15 17.78 14.78 18 14.5 18H11.5C10.67 18 10 18.67 10 19.5V20H17.21C18.2 20 19 19.2 19 18.21C19 17.48 18.55 16.82 17.88 16.55L14 15V12.75C15.81 14.83 18.23 16 21 16Z"
      fill="currentColor"
    />
  </svg>
);

export const RecommendationsView: FC<RecommendationsViewProps> = ({
  currentPhase,
  mobileView: controlledMobileView,
  onMobileViewChange,
  selectedPhaseId: controlledSelectedId,
  onSelectPhaseId
}) => {
  const currentPhaseId = getPhaseNumber(currentPhase);
  const [internalSelectedPhaseId, setInternalSelectedPhaseId] = useState<number>(currentPhaseId);
  const [internalMobileView, setInternalMobileView] = useState<'menu' | 'details'>('menu');

  const selectedPhaseId = controlledSelectedId ?? internalSelectedPhaseId;
  const mobileView = controlledMobileView ?? internalMobileView;

  const selectedPhase: PhaseRecommendation =
    RECOMMENDATIONS_DATA.find((p) => p.id === selectedPhaseId) || RECOMMENDATIONS_DATA[0];

  // Basculer les couleurs dynamiquement selon le menu de phase sélectionné
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', `phase ${selectedPhaseId}`);
    document.body.style.backgroundColor = 'var(--background-level-1)';
  }, [selectedPhaseId]);

  const handleSelectPhase = (id: number) => {
    if (onSelectPhaseId) {
      onSelectPhaseId(id);
    } else {
      setInternalSelectedPhaseId(id);
    }

    if (onMobileViewChange) {
      onMobileViewChange('details');
    } else {
      setInternalMobileView('details');
    }
  };

  return (
    <div className={styles.pageLayout}>
      {/* ========================================================
          COLONNE MENU (4 PHASES)
          Visible sur mobile si mobileView === 'menu'
          Toujours visible sur desktop (>= 992px)
          ======================================================== */}
      <nav
        className={`${styles.menuColumn} ${
          mobileView === 'details' ? styles.hideOnMobile : ''
        }`}
        aria-label="Sélection des phases"
      >
        <h1 className={styles.menuHeading}>Recommandations</h1>

        <div className={styles.phaseMenuList}>
          {RECOMMENDATIONS_DATA.map((phase) => {
            const isActive = selectedPhase.id === phase.id;
            const isCurrent = phase.id === currentPhaseId;

            return (
              <button
                key={phase.id}
                type="button"
                data-theme={`phase ${phase.id}`}
                className={`${styles.menuCard} ${
                  isActive ? styles.menuCardActive : ''
                }`}
                onClick={() => handleSelectPhase(phase.id)}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`Phase ${phase.id} : ${phase.title}`}
              >
                <div className={styles.menuCardHeader}>
                  <div className={styles.phaseAvatar} aria-hidden="true">
                    {phase.id}
                  </div>
                  <h2 className={styles.phaseCardTitle}>{phase.title}</h2>
                  {isCurrent && (
                    <span className={styles.currentBadge}>En ce moment</span>
                  )}
                </div>

                <p className={styles.phaseCardSubtitle}>{phase.menuSubtitle}</p>

                <div className={styles.menuCardChevron} aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ========================================================
          COLONNE DÉTAILS
          Visible sur mobile si mobileView === 'details'
          Toujours visible sur desktop (>= 992px)
          ======================================================== */}
      <article
        className={`${styles.detailsColumn} ${
          mobileView === 'menu' ? styles.hideOnMobile : ''
        }`}
        aria-labelledby="details-phase-title"
      >
        {/* Illustration Principale de la Phase */}
        <div className={styles.illustrationWrapper}>
          <img
            src={selectedPhase.imageSrc}
            alt={`Illustration ${selectedPhase.title}`}
            className={styles.illustrationImage}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* En-tête & Description */}
        <div className={styles.detailsHeader}>
          <h1 id="details-phase-title" className={styles.detailsTitle}>
            {selectedPhase.title}
          </h1>
          <p className={styles.detailsDescription}>
            {selectedPhase.description}
          </p>
        </div>

        <hr className={styles.sectionDivider} />

        {/* Section Nutrition */}
        <section className={styles.contentSection} aria-labelledby="nutrition-title">
          <div className={styles.sectionHeaderRow}>
            <NutritionIcon size={24} />
            <h2 id="nutrition-title" className={styles.sectionTitle}>
              Nutrition
            </h2>
          </div>

          <p className={styles.sectionIntroText}>{selectedPhase.nutritionIntro}</p>

          <div className={styles.nutritionGrid}>
            {selectedPhase.nutritionItems.map((item, idx) => (
              <div key={idx} className={styles.nutritionCard}>
                <div className={styles.nutritionBanner}>
                  <img
                    src={selectedPhase.imageSrc}
                    alt=""
                    aria-hidden="true"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemSubtitle}>{item.subtitle}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className={styles.sectionDivider} />

        {/* Section État d'esprit */}
        <section className={styles.contentSection} aria-labelledby="mindset-title">
          <div className={styles.sectionHeaderRow}>
            <MindsetIcon size={24} />
            <h2 id="mindset-title" className={styles.sectionTitle}>
              Etat d’esprit
            </h2>
          </div>

          <p className={styles.sectionIntroText}>{selectedPhase.mindsetIntro}</p>

          <div className={styles.mindsetList}>
            {selectedPhase.mindsetItems.map((item, idx) => (
              <div key={idx} className={styles.mindsetItem}>
                <div className={styles.mindsetThumbnail}>
                  <img
                    src={selectedPhase.imageSrc}
                    alt=""
                    aria-hidden="true"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className={styles.mindsetTextBlock}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemSubtitle}>{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
};
