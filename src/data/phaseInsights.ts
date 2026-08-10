import { CyclePhase } from '../types/cycle';

export interface PhaseInsight {
  phaseKey: CyclePhase;
  title: string;
  subtitle: string;
  emotions: string;
  nutrition: string;
  recommendations: string;
  bgTokenClass: string;
  surfaceTokenClass: string;
  imageSrc: string;
}

export const PHASE_INSIGHTS: Record<string, PhaseInsight> = {
  'Phase1-Follicular': {
    phaseKey: 'Phase1-Follicular',
    title: 'Prise d’élan',
    subtitle: '« Rien ne nous arrête ! »',
    emotions:
      'Nous prenons notre élan pour la nouvelle vague. Notre énergie explose et notre confiance en soi aussi ! C’est le moment où on arrive à faire mille choses en même temps, mais la lenteur des autres peut nous rendre impatientes.',
    nutrition:
      'Notre corps s’active, nous avons besoin d’énergie. Privilégions les protéines, les aliments riches en fer (chocolat noir, noix) et en magnésium (céréales complètes). Les légumes verts à feuilles, les avocats et les pois chiches sont recommandés pour stimuler naturellement votre production d\'œstrogènes.',
    recommendations:
      'Profitons de cette remontée d’énergie pour passer à l\'action avec des objectifs clairs pour ne pas s’épuiser. C’est le moment idéal pour sortir de notre zone de confort et relever de nouveaux défis.',
    bgTokenClass: 'bgPhase1',
    surfaceTokenClass: 'surfacePhase1',
    imageSrc: '/illustrations/phase1-follicular.png'
  },
  'Phase2-Ovulation': {
    phaseKey: 'Phase2-Ovulation',
    title: 'Debout sur la planche',
    subtitle: '« Nous sommes radieuses. »',
    emotions:
      'Nous surfons sur la vague ! Notre corps est dans son pic d’ovulation. Nous sommes rayonnantes. Notre visage est harmonieux. Nous ressentons plus d\'empathie envers les autres.',
    nutrition:
      'Notre appétit diminue. Il est recommandé de consommer du zinc (huîtres) et moins de sucre pendant cette période.',
    recommendations:
      'Profitons de ce moment pour créer des liens forts avec notre entourage ou faire de nouvelles rencontres. C’est le moment idéal pour se mettre en avant, aller réseauter, charmer et convaincre.',
    bgTokenClass: 'bgPhase2',
    surfaceTokenClass: 'surfacePhase2',
    imageSrc: '/illustrations/phase2-ovulation.png'
  },
  'Phase3-Luteal': {
    phaseKey: 'Phase3-Luteal',
    title: 'Dans le tube de la vague',
    subtitle: '« Le jour s’est assombri. »',
    emotions:
      'Le jour s’est assombri. Nous traversons une période inconfortable avec parfois des douleurs prémenstruelles. Notre énergie diminue doucement. Notre esprit est plus clairvoyant. Nous voyons les moindres failles et les imperfections qui nous entourent.',
    nutrition:
      'Pour apaiser notre système nerveux, il est recommandé de manger des légumes verts à feuilles et soufrés comme les brocolis ou les choux. Intégrez des aliments riches en vitamines B (lentilles, graines, noix). Ajoutez des acides gras oméga-3 et 6 (poissons gras, huile de colza) pour prévenir les tensions physiques.',
    recommendations:
      'C’est le bon moment pour noter ses idées et exprimer ses émotions par l’écriture ou une activité artistique afin d\'éviter de prendre une décision sous le coup de l’émotion. Faisons le tri dans nos affaires comme dans nos idées !',
    bgTokenClass: 'bgPhase3',
    surfaceTokenClass: 'surfacePhase3',
    imageSrc: '/illustrations/phase3-luteal.png'
  },
  'Phase4-Menstrual': {
    phaseKey: 'Phase4-Menstrual',
    title: 'Repos avant la prochaine vague',
    subtitle: '« Observer l’océan. »',
    emotions:
      'Nos hormones sont au plus bas. Nos émotions sont stables et propices à l’apaisement. Notre corps demande beaucoup d’énergie avant de repartir sur un nouveau cycle.',
    nutrition:
      'Privilégions une alimentation simple et digeste pour économiser notre énergie (soupes, purées, salades, compotes) avec des fruits secs, du riz complet, des légumes verts et des légumineuses pour calmer nos tensions menstruelles.',
    recommendations:
      'Ralentissons notre rythme de vie. C’est le moment idéal pour se poser les bonnes questions sur nos projets en cours et concevoir un plan d’action.',
    bgTokenClass: 'bgPhase4',
    surfaceTokenClass: 'surfacePhase4',
    imageSrc: '/illustrations/phase4-menstrual.png'
  }
};

export function getPhaseInsight(phase: CyclePhase): PhaseInsight {
  if (phase === 'Phase4-Menstrual-Unconfirmed') {
    return PHASE_INSIGHTS['Phase4-Menstrual'];
  }
  return PHASE_INSIGHTS[phase] || PHASE_INSIGHTS['Phase1-Follicular'];
}
