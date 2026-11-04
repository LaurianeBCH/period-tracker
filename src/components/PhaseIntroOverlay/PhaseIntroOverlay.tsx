import { useEffect, useRef, useState } from 'react';
import { CyclePhase } from '../../types/cycle';
import styles from './PhaseIntroOverlay.module.css';

export const PHASE4_INTRO_DURATION_MS = 3000;
export const PHASE4_FADE_MS = 500;

export function isPhase4(phase: CyclePhase): boolean {
  return phase === 'Phase4-Menstrual' || phase === 'Phase4-Menstrual-Unconfirmed';
}

export function shouldPlayPhaseIntro(
  isOnboarded: boolean,
  isEditingSettings: boolean,
  phase: CyclePhase
): boolean {
  return Boolean(isOnboarded && !isEditingSettings && isPhase4(phase));
}

export interface PhaseIntroOverlayProps {
  phase: CyclePhase;
  durationMs?: number;
  onComplete?: () => void;
}

export function PhaseIntroOverlay({
  phase,
  durationMs = PHASE4_INTRO_DURATION_MS,
  onComplete
}: PhaseIntroOverlayProps) {
  const initialPhaseRef = useRef<CyclePhase>(phase);
  const [isVisible, setIsVisible] = useState<boolean>(() => isPhase4(initialPhaseRef.current));
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    if (!isPhase4(initialPhaseRef.current)) {
      setIsVisible(false);
      return;
    }

    const baseUrl = import.meta.env.BASE_URL || '/period-tracker/';
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const audio = new Audio(`${normalizedBase}intro/phase4-audio.m4a`);
    audio.preload = 'auto';

    const cleanupUnlockListeners = () => {
      window.removeEventListener('pointerdown', unlockAndPlay);
      window.removeEventListener('keydown', unlockAndPlay);
    };

    const unlockAndPlay = () => {
      if (!audio.paused) {
        cleanupUnlockListeners();
        return;
      }
      audio.play().catch(() => {});
    };

    window.addEventListener('pointerdown', unlockAndPlay, { passive: true });
    window.addEventListener('keydown', unlockAndPlay, { passive: true });
    audio.play().catch(() => {});

    const fadeTimer = window.setTimeout(() => {
      setIsFadingOut(true);
    }, durationMs);

    const unmountTimer = window.setTimeout(() => {
      cleanupUnlockListeners();
      audio.pause();
      audio.src = '';
      setIsVisible(false);
      onComplete?.();
    }, durationMs + PHASE4_FADE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(unmountTimer);
      cleanupUnlockListeners();
      audio.pause();
      audio.src = '';
    };
  }, [durationMs, onComplete]);

  if (!isVisible || !isPhase4(initialPhaseRef.current)) {
    return null;
  }

  const baseUrl = import.meta.env.BASE_URL || '/period-tracker/';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  return (
    <div
      className={`${styles.overlay} ${isFadingOut ? styles.fadeOut : ''}`}
      data-theme="phase 4"
      role="status"
      aria-label="Animation d'introduction Phase 4"
    >
      <img
        src={`${normalizedBase}intro/phase4-anim.png`}
        alt="Illustration animée de la phase menstruelle"
        className={styles.animationImage}
      />
    </div>
  );
}
