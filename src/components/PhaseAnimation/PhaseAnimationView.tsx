import { FC } from 'react';
import { CyclePhase } from '../../types/cycle';
import { Phase1Animation } from './Phase1Animation';
import { Phase2Animation } from './Phase2Animation';
import { Phase3Animation } from './Phase3Animation';
import { Phase4Animation } from './Phase4Animation';

interface PhaseAnimationViewProps {
  phase: CyclePhase;
}

export const PhaseAnimationView: FC<PhaseAnimationViewProps> = ({ phase }) => {
  switch (phase) {
    case 'Phase1-Follicular':
      return <Phase1Animation />;
    case 'Phase2-Ovulation':
      return <Phase2Animation />;
    case 'Phase3-Luteal':
      return <Phase3Animation />;
    case 'Phase4-Menstrual':
    case 'Phase4-Menstrual-Unconfirmed':
      return <Phase4Animation />;
    default:
      return null;
  }
};
