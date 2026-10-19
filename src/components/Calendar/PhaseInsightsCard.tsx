import { FC, useState, useRef, useEffect } from 'react';
import { PhaseInsight, PHASE_INSIGHTS } from '../../data/phaseInsights';
import { DayStatus } from '../../types/cycle';
import { Badge, Button, WaterDropIcon } from '../atoms';
import {
  CURVE_SEGMENTS,
  calculateTodayCurvePosition,
  getSegmentKeyFromPhase,
  Point
} from '../../utils/curveMath';
import styles from './Calendar.module.css';

interface PhaseInsightsCardProps {
  insight: PhaseInsight;
  todayStatus?: DayStatus;
  selectedStatus?: DayStatus;
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

export const PhaseInsightsCard: FC<PhaseInsightsCardProps> = ({
  insight,
  todayStatus,
  selectedStatus
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Status to display: selected day if active, otherwise today's status
  const activeStatus = selectedStatus || todayStatus;
  const currentPhase = activeStatus?.phase || insight.phaseKey;
  const currentPhaseDay = activeStatus?.phaseDay ?? 1;
  const currentPhaseTotalDays = activeStatus?.phaseTotalDays ?? 6;
  const cycleDay = activeStatus?.cycleDay ?? 1;
  const totalCycleDays = activeStatus?.totalCycleDays ?? 28;

  // Segment references to measure exact SVG path length
  const seg1Ref = useRef<SVGPathElement | null>(null);
  const seg2Ref = useRef<SVGPathElement | null>(null);
  const seg3Ref = useRef<SVGPathElement | null>(null);
  const seg4Ref = useRef<SVGPathElement | null>(null);

  // Analytical coordinate fallback
  const initial = calculateTodayCurvePosition(
    currentPhase,
    currentPhaseDay,
    currentPhaseTotalDays
  );

  const [markerPos, setMarkerPos] = useState<Point>(initial.point);

  // Synchronize precise SVG coordinates along the path on mount & status updates
  useEffect(() => {
    const segmentKey = getSegmentKeyFromPhase(currentPhase);
    let targetPath: SVGPathElement | null = null;

    if (segmentKey === 'phase1') targetPath = seg1Ref.current;
    else if (segmentKey === 'phase2') targetPath = seg2Ref.current;
    else if (segmentKey === 'phase3') targetPath = seg3Ref.current;
    else if (segmentKey === 'phase4') targetPath = seg4Ref.current;

    if (targetPath) {
      try {
        const totalLength = targetPath.getTotalLength();
        const progress = Math.max(
          0,
          Math.min(1, (currentPhaseDay - 0.5) / Math.max(1, currentPhaseTotalDays))
        );
        const svgPoint = targetPath.getPointAtLength(progress * totalLength);
        if (svgPoint && !isNaN(svgPoint.x) && !isNaN(svgPoint.y)) {
          setMarkerPos({ x: svgPoint.x, y: svgPoint.y });
          return;
        }
      } catch {
        // Fallback to analytical calculation if SVG getPointAtLength fails
      }
    }

    // Default analytical position
    const calculated = calculateTodayCurvePosition(
      currentPhase,
      currentPhaseDay,
      currentPhaseTotalDays
    );
    setMarkerPos(calculated.point);
  }, [currentPhase, currentPhaseDay, currentPhaseTotalDays]);

  const activeSegmentKey = getSegmentKeyFromPhase(currentPhase);
  const activeSegment = CURVE_SEGMENTS[activeSegmentKey];

  return (
    <div className={styles.phaseInsightsCard}>
      <div className={styles.phaseHeaderGroup}>
        <h2 className={styles.phaseInsightsTitle}>Les phases de mon cycle</h2>
        <p className={styles.phaseCycleDaySubtitle}>
          Jour J • <strong>Jour {cycleDay}</strong> sur {totalCycleDays} ({activeSegment.label})
        </p>
      </div>

      {/* SVG Wave Curve Graph (Figma exact geometry: 4 segments, 3 separators, dynamic day marker) */}
      <div className={styles.curveContainer}>
        <svg
          viewBox="0 0 370 200"
          className={styles.curveSvg}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Graphique d'avancement jour par jour dans le cycle menstruel"
        >
          <defs>
            {/* Figma drop shadow filter for avatar/marker (#FBFF24 blur) */}
            <filter
              id="avatarGlowFilter"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feFlood floodColor="#FBFF24" floodOpacity="0.8" result="color" />
              <feComposite in2="blur" in="color" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 3 Vertical separator lines between the 4 segments */}
          {/* Separator 1: Between Phase 1 and Phase 2 (x=62.87) */}
          <line
            x1="62.87"
            y1="5"
            x2="62.87"
            y2="185"
            stroke="var(--border)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Separator 2: Between Phase 2 and Phase 3 (x=130.00) */}
          <line
            x1="130.00"
            y1="5"
            x2="130.00"
            y2="185"
            stroke="var(--border)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Separator 3: Between Phase 3 and Phase 4 (x=297.24) */}
          <line
            x1="297.24"
            y1="5"
            x2="297.24"
            y2="185"
            stroke="var(--border)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Baseline guide line through whole cycle */}
          <line
            x1="0"
            y1="173.14"
            x2="369"
            y2="173.14"
            stroke="var(--text-dark-primary)"
            strokeWidth="1"
            opacity="0.15"
          />

          {/* Segment 1: Prise d'élan (Folliculaire) */}
          <path
            ref={seg1Ref}
            id="curve-seg-1"
            d={CURVE_SEGMENTS.phase1.pathD}
            fill="none"
            stroke="var(--text-dark-primary)"
            strokeWidth={activeSegmentKey === 'phase1' ? '3.5' : '2.5'}
            strokeLinecap="round"
            className={activeSegmentKey === 'phase1' ? styles.activeCurveSegment : ''}
          />

          {/* Segment 2: Debout sur la planche (Ovulation) */}
          <path
            ref={seg2Ref}
            id="curve-seg-2"
            d={CURVE_SEGMENTS.phase2.pathD}
            fill="none"
            stroke="var(--text-dark-primary)"
            strokeWidth={activeSegmentKey === 'phase2' ? '3.5' : '2.5'}
            strokeLinecap="round"
            className={activeSegmentKey === 'phase2' ? styles.activeCurveSegment : ''}
          />

          {/* Segment 3: Dans le tube de la vague (Lutéale) */}
          <path
            ref={seg3Ref}
            id="curve-seg-3"
            d={CURVE_SEGMENTS.phase3.pathD}
            fill="none"
            stroke="var(--text-dark-primary)"
            strokeWidth={activeSegmentKey === 'phase3' ? '3.5' : '2.5'}
            strokeLinecap="round"
            className={activeSegmentKey === 'phase3' ? styles.activeCurveSegment : ''}
          />

          {/* Segment 4: Repos avant la prochaine vague (Règles) */}
          <path
            ref={seg4Ref}
            id="curve-seg-4"
            d={CURVE_SEGMENTS.phase4.pathD}
            fill="none"
            stroke="var(--text-dark-primary)"
            strokeWidth={activeSegmentKey === 'phase4' ? '3.5' : '2.5'}
            strokeLinecap="round"
            className={activeSegmentKey === 'phase4' ? styles.activeCurveSegment : ''}
          />

          {/* Dynamic Day Marker: Jour J (Yellow glowing circle) */}
          <g
            className={styles.jourJMarkerGroup}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip((prev) => !prev)}
            role="button"
            tabIndex={0}
            aria-label={`Jour J: Jour ${cycleDay} du cycle, ${activeSegment.label}`}
          >
            {/* Outer pulsing glow aura */}
            <circle
              cx={markerPos.x}
              cy={markerPos.y}
              r="16"
              fill="var(--accent)"
              opacity="0.5"
              className={styles.curvePulseCircle}
            />

            {/* Main yellow avatar circle with dark border */}
            <circle
              cx={markerPos.x}
              cy={markerPos.y}
              r="10"
              fill="var(--accent)"
              stroke="var(--text-dark-primary)"
              strokeWidth="2.5"
              className={styles.jourJCircle}
            />

            {/* Floating indicator tooltip on hover/click */}
            {showTooltip && (
              <g className={styles.markerTooltipG}>
                <rect
                  x={Math.max(10, Math.min(270, markerPos.x - 45))}
                  y={Math.max(5, markerPos.y - 36)}
                  width="90"
                  height="26"
                  rx="6"
                  fill="var(--text-dark-primary)"
                  opacity="0.9"
                />
                <text
                  x={Math.max(55, Math.min(315, markerPos.x))}
                  y={Math.max(22, markerPos.y - 19)}
                  textAnchor="middle"
                  fill="var(--text-white)"
                  fontSize="11"
                  fontFamily="var(--font-family)"
                  fontWeight="bold"
                >
                  Jour J (J{cycleDay})
                </text>
              </g>
            )}
          </g>
        </svg>

        {/* Phase badges aligned proportionally beneath their corresponding curve segment */}
        <div className={styles.curveSegmentsBadgesRow}>
          {/* Column 1: Phase 1 (0 to 62.87px -> 17.0%) */}
          <div className={styles.curveSegmentBadgeCol} style={{ width: '17%' }}>
            <Badge variant="phase1">1</Badge>
          </div>

          {/* Column 2: Phase 2 (62.87px to 130px -> 18.2%) */}
          <div className={styles.curveSegmentBadgeCol} style={{ width: '18.2%' }}>
            <Badge variant="phase2">2</Badge>
          </div>

          {/* Column 3: Phase 3 (130px to 297.24px -> 45.3%) */}
          <div className={styles.curveSegmentBadgeCol} style={{ width: '45.3%' }}>
            <Badge variant="phase3">3</Badge>
          </div>

          {/* Column 4: Phase 4 (297.24px to 369px -> 19.5%) */}
          <div className={styles.curveSegmentBadgeCol} style={{ width: '19.5%' }}>
            <div className={styles.waterDropBadgeContainer}>
              <WaterDropIcon size={16} color="var(--text-dark-primary)" />
            </div>
          </div>
        </div>
      </div>

      {/* Legend items */}
      <div className={styles.legendList}>
        <div
          className={`${styles.legendRow} ${
            activeSegmentKey === 'phase1' ? styles.activeLegendRow : ''
          }`}
        >
          <Badge variant="phase1">1</Badge>
          <span>Prise d’élan (folliculaire)</span>
        </div>
        <div
          className={`${styles.legendRow} ${
            activeSegmentKey === 'phase2' ? styles.activeLegendRow : ''
          }`}
        >
          <Badge variant="phase2">2</Badge>
          <span>Debout sur la planche (ovulation)</span>
        </div>
        <div
          className={`${styles.legendRow} ${
            activeSegmentKey === 'phase3' ? styles.activeLegendRow : ''
          }`}
        >
          <Badge variant="phase3">3</Badge>
          <span>Dans le tube de la vague (lutéale)</span>
        </div>
        <div
          className={`${styles.legendRow} ${
            activeSegmentKey === 'phase4' ? styles.activeLegendRow : ''
          }`}
        >
          <div className={styles.waterDropBadgeContainer}>
            <WaterDropIcon size={16} color="var(--text-dark-primary)" />
          </div>
          <span>Repos avant la prochaine vague (règle)</span>
        </div>
      </div>

      {/* Button Secondary: "En savoir plus sur les phases" */}
      <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
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
              <p className={styles.modalPhaseDesc}>
                {PHASE_INSIGHTS['Phase1-Follicular'].emotions}
              </p>
            </div>

            <div className={styles.modalPhaseItem}>
              <div className={styles.modalPhaseTitle}>
                <Badge variant="phase2">2</Badge>
                <span>Debout sur la planche (Ovulation)</span>
              </div>
              <p className={styles.modalPhaseDesc}>
                {PHASE_INSIGHTS['Phase2-Ovulation'].emotions}
              </p>
            </div>

            <div className={styles.modalPhaseItem}>
              <div className={styles.modalPhaseTitle}>
                <Badge variant="phase3">3</Badge>
                <span>Dans le tube de la vague (Lutéale)</span>
              </div>
              <p className={styles.modalPhaseDesc}>
                {PHASE_INSIGHTS['Phase3-Luteal'].emotions}
              </p>
            </div>

            <div className={styles.modalPhaseItem}>
              <div className={styles.modalPhaseTitle}>
                <div className={styles.waterDropBadgeContainer}>
                  <WaterDropIcon size={16} color="var(--text-dark-primary)" />
                </div>
                <span>Repos avant la prochaine vague (Menstruelle)</span>
              </div>
              <p className={styles.modalPhaseDesc}>
                {PHASE_INSIGHTS['Phase4-Menstrual'].emotions}
              </p>
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
