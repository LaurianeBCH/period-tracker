import { FC } from 'react';
import sharedStyles from './PhaseAnimation.module.css';
import styles from './Phase4Animation.module.css';
import { getAnimationAssetUrl } from './utils';

export const Phase4Animation: FC = () => {
  return (
    <div className={sharedStyles.animationCard} aria-label="Illustration animée : Repos avant la prochaine vague">
      <div className={sharedStyles.sceneWrapper}>
        {/* Vague 3 (Arrière-plan) */}
        <div className={`${sharedStyles.layer} ${styles.wave3}`}>
          <img
            src={getAnimationAssetUrl('phase4-vague 3.svg')}
            alt=""
            draggable={false}
          />
        </div>

        {/* Vague 2 (Plan intermédiaire) */}
        <div className={`${sharedStyles.layer} ${styles.wave2}`}>
          <img
            src={getAnimationAssetUrl('phase4-vague 2.svg')}
            alt=""
            draggable={false}
          />
        </div>

        {/* Personnage 4 (Surfeuse au repos) */}
        <div className={`${sharedStyles.character} ${styles.character}`}>
          <img
            src={getAnimationAssetUrl('personnage4.png')}
            alt="Surfeuse au repos"
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Vague 1 (Premier plan) */}
        <div className={`${sharedStyles.layer} ${styles.wave1}`}>
          <img
            src={getAnimationAssetUrl('phase4-vague 1.svg')}
            alt=""
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};
