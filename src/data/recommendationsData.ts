import { CyclePhase } from '../types/cycle';

export interface NutritionItem {
  title: string;
  subtitle: string;
  iconType?: string;
}

export interface MindsetItem {
  title: string;
  subtitle: string;
  iconType?: string;
}

export interface PhaseRecommendation {
  id: number;
  phaseKey: CyclePhase;
  title: string;
  menuSubtitle: string;
  menuBgColor: string;
  menuTextColor: string;
  imageSrc: string;
  description: string;
  nutritionIntro: string;
  nutritionItems: NutritionItem[];
  mindsetIntro: string;
  mindsetItems: MindsetItem[];
}

export const RECOMMENDATIONS_DATA: PhaseRecommendation[] = [
  {
    id: 1,
    phaseKey: 'Phase1-Follicular',
    title: 'Prise d’élan',
    menuSubtitle: 'Notre énergie explose et notre confiance en soie aussi !',
    menuBgColor: 'var(--background-level-2, #9ce2c0)',
    menuTextColor: 'var(--text-dark-primary, #002e2c)',
    imageSrc: '/illustrations/phase1-follicular.png',
    description:
      'Nous prenons notre élan pour la nouvelle vague. Notre énergie explose et notre confiance en soie aussi ! C’est le moment où on arrive à faire mille choses en même temps mais la lenteur des autres peut nous rendre impatiente.',
    nutritionIntro: 'Notre corps s’active, nous avons besoin d’énergie.',
    nutritionItems: [
      {
        title: 'Protéines',
        subtitle: 'Viande, tofu, fromage, pois chiche',
        iconType: 'protein'
      },
      {
        title: 'Fer, lipide et magnésium',
        subtitle: 'Chocolat noir, noix, céréales complètes, avocat',
        iconType: 'minerals'
      },
      {
        title: 'Légumes verts à feuilles',
        subtitle: 'Chou vert, chou kale (frisé), épinards, blettes',
        iconType: 'greens'
      }
    ],
    mindsetIntro:
      'Profitons de cette remontée d’énergie pour réaliser les tâches qui nous tiennent à coeur.',
    mindsetItems: [
      {
        title: 'Passer à l’action',
        subtitle: 'Réaliser des objectifs clairs pour ne pas s’épuiser'
      },
      {
        title: 'Relever de nouveaux défis',
        subtitle: 'C’est le moment idéale pour sortir de sa zone de confort'
      }
    ]
  },
  {
    id: 2,
    phaseKey: 'Phase2-Ovulation',
    title: 'Debout sur la planche',
    menuSubtitle: 'Notre corps est dans son pic d’ovulation.',
    menuBgColor: '#f0e486',
    menuTextColor: '#583500',
    imageSrc: '/illustrations/phase2-ovulation.png',
    description:
      'Nous surfons sur la vague ! Notre corps est dans son pic d’ovulation. Nous sommes rayonnantes. Notre visage est harmonieux. Nous ressentons plus d’empathie envers les autres.',
    nutritionIntro: 'Notre appétit diminue, nous privilégions la légèreté et les micronutriments.',
    nutritionItems: [
      {
        title: 'Zinc et antioxydants',
        subtitle: 'Huîtres, graines de courge, fruits rouges',
        iconType: 'protein'
      },
      {
        title: 'Hydratation & fibres',
        subtitle: 'Concombre, baies fraîches, salades légères',
        iconType: 'greens'
      },
      {
        title: 'Moins de sucres rapides',
        subtitle: 'Privilégier les sucres lents pour stabiliser l’énergie',
        iconType: 'minerals'
      }
    ],
    mindsetIntro:
      'C’est le moment idéal pour se mettre en avant, aller réseauter, charmer et convaincre.',
    mindsetItems: [
      {
        title: 'Créer du lien',
        subtitle: 'Organiser des sorties, échanger et partager avec enthousiasme'
      },
      {
        title: 'Exprimer sa créativité',
        subtitle: 'Lancer de nouveaux projets et prendre la parole'
      }
    ]
  },
  {
    id: 3,
    phaseKey: 'Phase3-Luteal',
    title: 'Dans le tube de la vague',
    menuSubtitle: 'Notre énergie diminue doucement. Notre esprit est plus clairvoyant.',
    menuBgColor: '#c0e0f2',
    menuTextColor: '#081f45',
    imageSrc: '/illustrations/phase3-luteal.png',
    description:
      'Le jour s’est assombri. Nous traversons une période inconfortable avec parfois des douleurs prémenstruelles. Notre énergie diminue doucement. Notre esprit est plus clairvoyant. Nous voyons les moindres failles et les imperfections qui nous entourent.',
    nutritionIntro: 'Pour apaiser notre système nerveux et calmer les tensions physiques.',
    nutritionItems: [
      {
        title: 'Vitamines B et magnésium',
        subtitle: 'Lentilles, graines, noix, banane',
        iconType: 'minerals'
      },
      {
        title: 'Oméga-3 et 6',
        subtitle: 'Poissons gras (saumon, sardines), huile de colza',
        iconType: 'protein'
      },
      {
        title: 'Légumes soufrés',
        subtitle: 'Brocolis, choux de Bruxelles, poireaux',
        iconType: 'greens'
      }
    ],
    mindsetIntro:
      'Faisons le tri dans nos affaires comme dans nos idées pour canaliser notre lucidité.',
    mindsetItems: [
      {
        title: 'Poser ses limites',
        subtitle: 'Exprimer ses besoins avec bienveillance et éviter la surcharge'
      },
      {
        title: 'Écriture et introspection',
        subtitle: 'Noter ses idées sans juger pour libérer son esprit'
      }
    ]
  },
  {
    id: 4,
    phaseKey: 'Phase4-Menstrual',
    title: 'Repos avant la prochaine vague',
    menuSubtitle: 'Nos émotions sont stables et propices à l’apaisement.',
    menuBgColor: '#eeb8b0',
    menuTextColor: '#321310',
    imageSrc: '/illustrations/phase4-menstrual.png',
    description:
      'Nos hormones sont au plus bas. Nos émotions sont stables et propices à l’apaisement. Notre corps demande beaucoup d’énergie avant de repartir sur un nouveau cycle.',
    nutritionIntro:
      'Privilégions une alimentation simple, chaude et digeste pour économiser notre énergie.',
    nutritionItems: [
      {
        title: 'Repas chauds et digestes',
        subtitle: 'Soupes réconfortantes, purées, bouillons',
        iconType: 'greens'
      },
      {
        title: 'Fer et minéraux',
        subtitle: 'Légumineuses, fruits secs, riz complet',
        iconType: 'minerals'
      },
      {
        title: 'Infusions apaisantes',
        subtitle: 'Camomille, framboisier, tisanes chaudes',
        iconType: 'protein'
      }
    ],
    mindsetIntro:
      'Ralentissons notre rythme de vie pour écouter notre corps et concevoir nos projets.',
    mindsetItems: [
      {
        title: 'S’accorder du repos',
        subtitle: 'Ralentir sans culpabilité et s’aménager des moments calmes'
      },
      {
        title: 'Faire le bilan',
        subtitle: 'Clôturer le cycle écoulé avec bienveillance'
      }
    ]
  }
];
