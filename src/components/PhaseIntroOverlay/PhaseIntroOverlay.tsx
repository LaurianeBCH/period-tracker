import { useEffect, useRef, useState } from 'react';
import { CyclePhase } from '../../types/cycle';
import styles from './PhaseIntroOverlay.module.css';

export type CanonicalIntroPhase =
  | 'Phase1-Follicular'
  | 'Phase2-Ovulation'
  | 'Phase3-Luteal'
  | 'Phase4-Menstrual';

export interface PhaseIntroMeta {
  animFile: string;
  durationMs: number;
  theme: 'phase 1' | 'phase 2' | 'phase 3' | 'phase 4';
}

export const PHASE_INTRO_CONFIG: Record<CanonicalIntroPhase, PhaseIntroMeta> = {
  'Phase1-Follicular': {
    animFile: 'phase1-anim.png',
    durationMs: 1568,
    theme: 'phase 1'
  },
  'Phase2-Ovulation': {
    animFile: 'phase2-anim.png',
    durationMs: 1786,
    theme: 'phase 2'
  },
  'Phase3-Luteal': {
    animFile: 'phase3-anim.png',
    durationMs: 1552,
    theme: 'phase 3'
  },
  'Phase4-Menstrual': {
    animFile: 'phase4-anim.png',
    durationMs: 1995,
    theme: 'phase 4'
  }
};

export const PHASE_FADE_MS = 500;

export function normalizeIntroPhase(phase: CyclePhase): CanonicalIntroPhase {
  if (phase === 'Phase4-Menstrual' || phase === 'Phase4-Menstrual-Unconfirmed') {
    return 'Phase4-Menstrual';
  }
  if (phase === 'Phase2-Ovulation') {
    return 'Phase2-Ovulation';
  }
  if (phase === 'Phase3-Luteal') {
    return 'Phase3-Luteal';
  }
  return 'Phase1-Follicular';
}

export function shouldTriggerPhaseIntro(
  lastPlayedPhase: CyclePhase | null,
  nextPhase: CyclePhase
): boolean {
  if (lastPlayedPhase === null) {
    return true;
  }
  return normalizeIntroPhase(lastPlayedPhase) !== normalizeIntroPhase(nextPhase);
}

export interface PhaseIntroOverlayProps {
  phase: CyclePhase;
  durationMs?: number;
  onComplete?: () => void;
}

export function PhaseIntroOverlay({
  phase,
  durationMs,
  onComplete
}: PhaseIntroOverlayProps) {
  const lastPlayedPhaseRef = useRef<CanonicalIntroPhase | null>(null);
  const [activePhase, setActivePhase] = useState<CanonicalIntroPhase>(() =>
    normalizeIntroPhase(phase)
  );
  const [runId, setRunId] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    const normalized = normalizeIntroPhase(phase);
    if (!shouldTriggerPhaseIntro(lastPlayedPhaseRef.current, normalized)) {
      return;
    }

    const previousPlayed = lastPlayedPhaseRef.current;
    lastPlayedPhaseRef.current = normalized;
    let hasReachedFade = false;

    setActivePhase(normalized);
    setIsVisible(true);
    setIsFadingOut(false);
    setRunId((prev) => prev + 1);

    const playDuration = durationMs ?? PHASE_INTRO_CONFIG[normalized].durationMs;

    const fadeTimer = window.setTimeout(() => {
      hasReachedFade = true;
      setIsFadingOut(true);
    }, playDuration);

    const unmountTimer = window.setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, playDuration + PHASE_FADE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(unmountTimer);
      if (!hasReachedFade) {
        lastPlayedPhaseRef.current = previousPlayed;
      }
    };
  }, [phase, durationMs, onComplete]);

  if (!isVisible) {
    return null;
  }

  const config = PHASE_INTRO_CONFIG[activePhase];
  const baseUrl = import.meta.env.BASE_URL || '/period-tracker/';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  return (
    <div
      className={`${styles.overlay} ${isFadingOut ? styles.fadeOut : ''}`}
      data-theme={config.theme}
      role="status"
      aria-label={`Animation d'introduction ${config.theme}`}
    >
      <img
        key={runId}
        src={`${normalizedBase}intro/${config.animFile}?run=${runId}`}
        alt={`Illustration animée ${config.theme}`}
        className={styles.animationImage}
      />
    </div>
  );
}
