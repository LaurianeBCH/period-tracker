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
  onNavigateToRecommendations?: () => void;
}

export const PhaseInsightsCard: FC<PhaseInsightsCardProps> = ({
  insight,
  todayStatus,
  selectedStatus,
  onNavigateToRecommendations
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Status to display: selected day if active, otherwise today's status
  const activeStatus = selectedStatus || todayStatus;
  const currentPhase = activeStatus?.phase || insight.phaseKey;
  const currentPhaseDay = activeStatus?.phaseDay ?? 1;
  const currentPhaseTotalDays = activeStatus?.phaseTotalDays ?? 6;
  const cycleDay = activeStatus?.cycleDay ?? 1;

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
    <div className={styles.insightsCard}>
      {/* V3 Figma Header: "Ma phase du moment" + phase title */}
      <div className={styles.insightsHeader}>
        <h2 className={styles.insightsMainTitle}>Phase du moment</h2>
        <p className={styles.insightsPhaseSubtitle}>{insight.title}</p>
      </div>

      {/* SVG Wave Curve Graph (Figma exact geometry: 4 segments, 3 solid separators, dynamic day marker, bottom badge row) */}
      <div className={styles.curveContainer}>
        <svg
          viewBox="0 0 370 202"
          className={styles.curveSvg}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Graphique d'avancement jour par jour dans le cycle menstruel"
        >
          <defs>
            {/* Figma drop shadow glow filter for avatar/marker (#FBFF24 blur) */}
            <filter
              id="avatarGlowFilter"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FBFF24" floodOpacity="0.85" />
            </filter>
          </defs>

          {/* 3 Vertical separator lines between the 4 segments (solid in Figma, extending down to badge row) */}
          <line
            x1="62.87"
            y1="2"
            x2="62.87"
            y2="202"
            stroke="var(--border)"
            strokeWidth="1"
          />

          <line
            x1="130.00"
            y1="2"
            x2="130.00"
            y2="202"
            stroke="var(--border)"
            strokeWidth="1"
          />

          <line
            x1="297.24"
            y1="2"
            x2="297.24"
            y2="202"
            stroke="var(--border)"
            strokeWidth="1"
          />

          {/* Segment 1: Prise d'élan (Folliculaire) */}
          <path
            ref={seg1Ref}
            id="curve-seg-1"
            d={CURVE_SEGMENTS.phase1.pathD}
            fill="none"
            stroke="var(--text-dark-primary)"
            strokeWidth="2"
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
            strokeWidth="2"
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
            strokeWidth="2"
            strokeLinecap="round"
            className={activeSegmentKey === 'phase3' ? styles.activeCurveSegment : ''}
          />

          {/* Segment 4: Repos avant la prochaine vague (Règles - flat baseline line) */}
          <path
            ref={seg4Ref}
            id="curve-seg-4"
            d={CURVE_SEGMENTS.phase4.pathD}
            fill="none"
            stroke="var(--text-dark-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            className={activeSegmentKey === 'phase4' ? styles.activeCurveSegment : ''}
          />

          {/* Bottom phase badges row (integrated inside SVG for exact alignment with separators) */}
          {/* Phase 1 badge: circular pill with "1" */}
          <g id="badge-phase1">
            <circle cx="31.44" cy="190" r="9" fill="var(--background-level-1)" />
            <text
              x="31.44"
              y="190"
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--text-dark-primary)"
              fontSize="14"
              fontFamily="var(--font-family)"
              fontWeight="400"
            >
              1
            </text>
          </g>

          {/* Phase 2 badge: circular pill with "2" */}
          <g id="badge-phase2">
            <circle cx="96.44" cy="190" r="9" fill="var(--text-white)" />
            <text
              x="96.44"
              y="190"
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--text-dark-primary)"
              fontSize="14"
              fontFamily="var(--font-family)"
              fontWeight="400"
            >
              2
            </text>
          </g>

          {/* Phase 3 badge: "3" */}
          <g id="badge-phase3">
            <circle cx="213.62" cy="190" r="9" fill="var(--background-level-2)" />
            <text
              x="213.62"
              y="190"
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--text-dark-primary)"
              fontSize="14"
              fontFamily="var(--font-family)"
              fontWeight="400"
            >
              3
            </text>
          </g>

          {/* Phase 4 badge: water drop icon */}
          <g id="badge-phase4" transform="translate(324.62, 181)">
            <WaterDropIcon size={18} color="var(--text-dark-primary)" />
          </g>

          {/* Dynamic Day Marker: Jour J (Yellow glowing circle) */}
          <g
            className={styles.dayMarkerGroup}
            filter="url(#avatarGlowFilter)"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip((prev) => !prev)}
            role="button"
            tabIndex={0}
            aria-label={`Jour J: Jour ${cycleDay} du cycle, ${activeSegment.label}`}
          >
            {/* Main yellow avatar circle with dark border matching Figma */}
            <circle
              cx={markerPos.x}
              cy={markerPos.y}
              r="10"
              fill="var(--accent)"
              className={styles.dayMarkerCircle}
            />
            <circle
              cx={markerPos.x}
              cy={markerPos.y}
              r="9"
              fill="none"
              stroke="var(--text-dark-primary)"
              strokeWidth="2"
              className={styles.dayMarkerBorder}
            />

            {/* Floating indicator tooltip on hover/click */}
            {showTooltip && (
              <g className={styles.markerTooltip}>
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
      </div>

      {/* Legend items */}
      {/*<div className={styles.legendList}>
        <div className={styles.legendRow}>
          <Badge variant="phase1">1</Badge>
          <span>Prise d’élan (folliculaire)</span>
        </div>
        <div className={styles.legendRow}>
          <Badge variant="phase2">2</Badge>
          <span>Debout sur la planche (ovulation)</span>
        </div>
        <div className={styles.legendRow}>
          <span className={styles.phase3Number}>3</span>
          <span>Dans le tube de la vague (lutéale)</span>
        </div>
        <div className={styles.legendRow}>
          <div className={styles.waterDropBadge}>
            <WaterDropIcon size={16} color="var(--text-dark-primary)" />
          </div>
          <span>Repos avant la prochaine vague (règle)</span>
        </div>
      </div>

      {/* Button Secondary Figma: "En savoir plus" with right chevron -> navigates to recommendations */}
      <button
        type="button"
        className={styles.moreButton}
        onClick={onNavigateToRecommendations}
      >
        <span className={styles.moreButtonText}>En savoir plus</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.moreButtonChevron}
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
};
