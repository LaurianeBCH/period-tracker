export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type PhaseNumber = 1 | 2 | 3 | 4;

export interface RecipeItem {
  title: string;
  url: string;
}

export const RECIPES_BY_SEASON_AND_PHASE: Record<Season, Record<PhaseNumber, RecipeItem[]>> = {
  "spring": {
    1: [
      {
        title: "Salade d'épinards, fraises et poulet",
        url: "https://www.google.com/search?q=recette+Salade+épinards+fraises+poulet"
      },
      {
        title: "Omelette aux asperges",
        url: "https://www.google.com/search?q=recette+Omelette+asperges"
      },
      {
        title: "Dahl de lentilles aux blettes",
        url: "https://www.google.com/search?q=recette+Dahl+lentilles+blettes"
      },
      {
        title: "Pavé de truite, tombée d'épinards",
        url: "https://www.google.com/search?q=recette+Pavé+truite+tombée+épinards"
      },
      {
        title: "Salade de quinoa aux fèves",
        url: "https://www.google.com/search?q=recette+Salade+quinoa+fèves"
      },
      {
        title: "Wok de bœuf aux pois gourmands",
        url: "https://www.google.com/search?q=recette+Wok+bœuf+pois+gourmands"
      },
      {
        title: "Tofu sauté aux brocolis",
        url: "https://www.google.com/search?q=recette+Tofu+sauté+brocolis"
      },
      {
        title: "Mousse chocolat noir et avocat",
        url: "https://www.google.com/search?q=recette+Mousse+chocolat+noir+avocat"
      },
      {
        title: "Chia pudding lait d'amande",
        url: "https://www.google.com/search?q=recette+Chia+pudding+lait+amande"
      },
      {
        title: "Tartelette crue aux fraises",
        url: "https://www.google.com/search?q=recette+Tartelette+crue+fraises"
      }
    ],
    2: [
      {
        title: "Asperges vinaigrette aux graines de courge",
        url: "https://www.google.com/search?q=recette+Asperges+vinaigrette+graines+courge"
      },
      {
        title: "Carpaccio de bœuf, roquette et pignons",
        url: "https://www.google.com/search?q=recette+Carpaccio+bœuf+roquette+pignons"
      },
      {
        title: "Salade de radis roses et concombre",
        url: "https://www.google.com/search?q=recette+Salade+radis+roses+concombre"
      },
      {
        title: "Ceviche de daurade aux agrumes",
        url: "https://www.google.com/search?q=recette+Ceviche+daurade+agrumes"
      },
      {
        title: "Salade de lentilles corail et pamplemousse",
        url: "https://www.google.com/search?q=recette+Salade+lentilles+corail+pamplemousse"
      },
      {
        title: "Rouleaux de printemps aux crevettes",
        url: "https://www.google.com/search?q=recette+Rouleaux+printemps+crevettes"
      },
      {
        title: "Soupe froide de petits pois à la menthe",
        url: "https://www.google.com/search?q=recette+Soupe+froide+petits+pois+menthe"
      },
      {
        title: "Huîtres au citron",
        url: "https://www.google.com/search?q=recette+Huitres+citron"
      },
      {
        title: "Salade de fenouil croquant à l'orange",
        url: "https://www.google.com/search?q=recette+Salade+fenouil+croquant+orange"
      },
      {
        title: "Tartare de saumon, avocat et sésame",
        url: "https://www.google.com/search?q=recette+Tartare+saumon+avocat+sésame"
      }
    ],
    3: [
      {
        title: "Risotto aux asperges vertes",
        url: "https://www.google.com/search?q=recette+Risotto+asperges+vertes"
      },
      {
        title: "Poulet rôti et pommes de terre nouvelles",
        url: "https://www.google.com/search?q=recette+Poulet+rôti+pommes+de+terre+nouvelles"
      },
      {
        title: "Mijoté de veau printanier aux carottes",
        url: "https://www.google.com/search?q=recette+Mijoté+veau+printanier+carottes"
      },
      {
        title: "Soupe de cresson",
        url: "https://www.google.com/search?q=recette+Soupe+cresson"
      },
      {
        title: "Curry de pois chiches au lait de coco",
        url: "https://www.google.com/search?q=recette+Curry+pois+chiches+lait+coco"
      },
      {
        title: "Papillote de cabillaud, julienne de légumes",
        url: "https://www.google.com/search?q=recette+Papillote+cabillaud+julienne+légumes"
      },
      {
        title: "Velouté de carottes au cumin",
        url: "https://www.google.com/search?q=recette+Velouté+carottes+cumin"
      },
      {
        title: "Quinoa chaud aux champignons",
        url: "https://www.google.com/search?q=recette+Quinoa+chaud+champignons"
      },
      {
        title: "Boulettes d'agneau, purée de pois cassés",
        url: "https://www.google.com/search?q=recette+Boulettes+agneau+purée+pois+cassés"
      },
      {
        title: "Omelette aux pommes de terre",
        url: "https://www.google.com/search?q=recette+Omelette+pommes+de+terre"
      }
    ],
    4: [
      {
        title: "Bouillon de poulet aux petits légumes",
        url: "https://www.google.com/search?q=recette+Bouillon+poulet+petits+légumes"
      },
      {
        title: "Hachis parmentier au bœuf maigre",
        url: "https://www.google.com/search?q=recette+Hachis+parmentier+bœuf+maigre"
      },
      {
        title: "Gratin de blettes au tofu fumé",
        url: "https://www.google.com/search?q=recette+Gratin+blettes+tofu+fumé"
      },
      {
        title: "Potée printanière au chou vert",
        url: "https://www.google.com/search?q=recette+Potée+printanière+chou+vert"
      },
      {
        title: "Purée de lentilles et saucisse végétale",
        url: "https://www.google.com/search?q=recette+Purée+lentilles+saucisse+végétale"
      },
      {
        title: "Filet mignon de porc aux carottes fondantes",
        url: "https://www.google.com/search?q=recette+Filet+mignon+porc+carottes"
      },
      {
        title: "Soupe de nouilles soba au miso",
        url: "https://www.google.com/search?q=recette+Soupe+nouilles+soba+miso"
      },
      {
        title: "Ragoût de haricots blancs à la tomate",
        url: "https://www.google.com/search?q=recette+Ragoût+haricots+blancs+tomate"
      },
      {
        title: "Steak de bœuf, écrasé de pommes de terre",
        url: "https://www.google.com/search?q=recette+Steak+bœuf+écrasé+pommes+de+terre"
      },
      {
        title: "Dhal de pois cassés aux épices",
        url: "https://www.google.com/search?q=recette+Dhal+pois+cassés+épices"
      }
    ]
  },
  "summer": {
    1: [
      {
        title: "Salade de roquette, melon et jambon de Parme",
        url: "https://www.google.com/search?q=recette+Salade+roquette+melon+jambon+Parme"
      },
      {
        title: "Brochettes de poulet et courgettes",
        url: "https://www.google.com/search?q=recette+Brochettes+poulet+courgettes"
      },
      {
        title: "Tarte aux blettes et chèvre",
        url: "https://www.google.com/search?q=recette+Tarte+blettes+chèvre"
      },
      {
        title: "Steak de thon, haricots verts persillés",
        url: "https://www.google.com/search?q=recette+Steak+thon+haricots+verts"
      },
      {
        title: "Salade de lentilles, tomates et féta",
        url: "https://www.google.com/search?q=recette+Salade+lentilles+tomates+féta"
      },
      {
        title: "Tofu grillé, salade de pousses d'épinards",
        url: "https://www.google.com/search?q=recette+Tofu+grillé+pousses+épinards"
      },
      {
        title: "Carpaccio de bœuf au basilic",
        url: "https://www.google.com/search?q=recette+Carpaccio+bœuf+basilic"
      },
      {
        title: "Sorbet framboise maison",
        url: "https://www.google.com/search?q=recette+Sorbet+framboise+maison"
      },
      {
        title: "Salade de fruits d'été à la menthe",
        url: "https://www.google.com/search?q=recette+Salade+fruits+été+menthe"
      },
      {
        title: "Clafoutis aux cerises allégé",
        url: "https://www.google.com/search?q=recette+Clafoutis+cerises+allégé"
      }
    ],
    2: [
      {
        title: "Gaspacho andalou",
        url: "https://www.google.com/search?q=recette+Gaspacho+andalou"
      },
      {
        title: "Ratatouille niçoise",
        url: "https://www.google.com/search?q=recette+Ratatouille+niçoise"
      },
      {
        title: "Salade de pastèque, féta et menthe",
        url: "https://www.google.com/search?q=recette+Salade+pastèque+féta+menthe"
      },
      {
        title: "Ceviche de bar aux pêches",
        url: "https://www.google.com/search?q=recette+Ceviche+bar+pêches"
      },
      {
        title: "Salade de tomates anciennes et graines de courge",
        url: "https://www.google.com/search?q=recette+Salade+tomates+anciennes+graines+courge"
      },
      {
        title: "Tartare de tomates et concombre",
        url: "https://www.google.com/search?q=recette+Tartare+tomates+concombre"
      },
      {
        title: "Carpaccio de courgettes au citron",
        url: "https://www.google.com/search?q=recette+Carpaccio+courgettes+citron"
      },
      {
        title: "Moules à la provençale",
        url: "https://www.google.com/search?q=recette+Moules+provençale"
      },
      {
        title: "Salade de quinoa, poivrons rouges et crevettes",
        url: "https://www.google.com/search?q=recette+Salade+quinoa+poivrons+crevettes"
      },
      {
        title: "Crevettes sautées à l'ail et persil",
        url: "https://www.google.com/search?q=recette+Crevettes+sautées+ail+persil"
      }
    ],
    3: [
      {
        title: "Aubergines farcies au bœuf",
        url: "https://www.google.com/search?q=recette+Aubergines+farcies+bœuf"
      },
      {
        title: "Tian de légumes du soleil",
        url: "https://www.google.com/search?q=recette+Tian+légumes+soleil"
      },
      {
        title: "Poulet basquaise",
        url: "https://www.google.com/search?q=recette+Poulet+basquaise"
      },
      {
        title: "Curry de courgettes au lait de coco",
        url: "https://www.google.com/search?q=recette+Curry+courgettes+lait+coco"
      },
      {
        title: "Pâtes semi-complètes sauce tomate et olives",
        url: "https://www.google.com/search?q=recette+Pâtes+sauce+tomate+olives"
      },
      {
        title: "Papillote de saumon aux tomates cerises",
        url: "https://www.google.com/search?q=recette+Papillote+saumon+tomates+cerises"
      },
      {
        title: "Mijoté de haricots plats à la tomate",
        url: "https://www.google.com/search?q=recette+Mijoté+haricots+plats+tomate"
      },
      {
        title: "Omelette aux courgettes",
        url: "https://www.google.com/search?q=recette+Omelette+courgettes"
      },
      {
        title: "Risotto à la tomate et basilic",
        url: "https://www.google.com/search?q=recette+Risotto+tomate+basilic"
      },
      {
        title: "Boulettes d'agneau à la menthe, semoule",
        url: "https://www.google.com/search?q=recette+Boulettes+agneau+menthe+semoule"
      }
    ],
    4: [
      {
        title: "Moussaka allégée",
        url: "https://www.google.com/search?q=recette+Moussaka+allégée"
      },
      {
        title: "Lasagnes végétariennes aux aubergines",
        url: "https://www.google.com/search?q=recette+Lasagnes+végétariennes+aubergines"
      },
      {
        title: "Chili con carne (bœuf)",
        url: "https://www.google.com/search?q=recette+Chili+con+carne"
      },
      {
        title: "Poivrons farcis au riz et viande hachée",
        url: "https://www.google.com/search?q=recette+Poivrons+farcis+riz+viande"
      },
      {
        title: "Purée d'aubergine chaude et pain pita",
        url: "https://www.google.com/search?q=recette+Purée+aubergine+chaude+pita"
      },
      {
        title: "Mijoté de porc aux poivrons",
        url: "https://www.google.com/search?q=recette+Mijoté+porc+poivrons"
      },
      {
        title: "Soupe de tomates chaudes au basilic",
        url: "https://www.google.com/search?q=recette+Soupe+tomates+chaudes+basilic"
      },
      {
        title: "Dal de lentilles rouges estival",
        url: "https://www.google.com/search?q=recette+Dal+lentilles+rouges+estival"
      },
      {
        title: "Bouillon de légumes d'été aux vermicelles",
        url: "https://www.google.com/search?q=recette+Bouillon+légumes+été+vermicelles"
      },
      {
        title: "Filet de poulet, purée de courgettes",
        url: "https://www.google.com/search?q=recette+Filet+poulet+purée+courgettes"
      }
    ]
  },
  "autumn": {
    1: [
      {
        title: "Salade d'épinards, figues et noix",
        url: "https://www.google.com/search?q=recette+Salade+épinards+figues+noix"
      },
      {
        title: "Poêlée de champignons et bœuf",
        url: "https://www.google.com/search?q=recette+Poêlée+champignons+bœuf"
      },
      {
        title: "Quiche aux poireaux et lardons",
        url: "https://www.google.com/search?q=recette+Quiche+poireaux+lardons"
      },
      {
        title: "Pavé de saumon, purée de brocolis",
        url: "https://www.google.com/search?q=recette+Pavé+saumon+purée+brocolis"
      },
      {
        title: "Salade de lentilles vertes aux noix",
        url: "https://www.google.com/search?q=recette+Salade+lentilles+vertes+noix"
      },
      {
        title: "Tofu brouillé aux champignons de Paris",
        url: "https://www.google.com/search?q=recette+Tofu+brouillé+champignons"
      },
      {
        title: "Wok de poulet aux pak-choï",
        url: "https://www.google.com/search?q=recette+Wok+poulet+pak-choi"
      },
      {
        title: "Pomme au four à la cannelle",
        url: "https://www.google.com/search?q=recette+Pomme+au+four+cannelle"
      },
      {
        title: "Compote poire-vanille",
        url: "https://www.google.com/search?q=recette+Compote+poire+vanille"
      },
      {
        title: "Cake moelleux à la courge",
        url: "https://www.google.com/search?q=recette+Cake+moelleux+courge"
      }
    ],
    2: [
      {
        title: "Carpaccio de cèpes",
        url: "https://www.google.com/search?q=recette+Carpaccio+cèpes"
      },
      {
        title: "Salade de chou rouge aux pommes",
        url: "https://www.google.com/search?q=recette+Salade+chou+rouge+pommes"
      },
      {
        title: "Velouté froid de betterave",
        url: "https://www.google.com/search?q=recette+Velouté+froid+betterave"
      },
      {
        title: "Huîtres au citron",
        url: "https://www.google.com/search?q=recette+Huitres+citron"
      },
      {
        title: "Tartare de saumon à l'aneth",
        url: "https://www.google.com/search?q=recette+Tartare+saumon+aneth"
      },
      {
        title: "Salade de carottes râpées aux graines de courge",
        url: "https://www.google.com/search?q=recette+Salade+carottes+graines+courge"
      },
      {
        title: "Fenouil croquant à l'huile de noix",
        url: "https://www.google.com/search?q=recette+Fenouil+croquant+huile+noix"
      },
      {
        title: "Salade d'endives, noix et roquefort",
        url: "https://www.google.com/search?q=recette+Salade+endives+noix+roquefort"
      },
      {
        title: "Poulet vapeur, brocolis croquants",
        url: "https://www.google.com/search?q=recette+Poulet+vapeur+brocolis"
      },
      {
        title: "Ceviche de Saint-Jacques",
        url: "https://www.google.com/search?q=recette+Ceviche+Saint-Jacques"
      }
    ],
    3: [
      {
        title: "Soupe de courge butternut",
        url: "https://www.google.com/search?q=recette+Soupe+courge+butternut"
      },
      {
        title: "Risotto aux champignons des bois",
        url: "https://www.google.com/search?q=recette+Risotto+champignons+des+bois"
      },
      {
        title: "Poulet rôti, légumes racines au four",
        url: "https://www.google.com/search?q=recette+Poulet+rôti+légumes+racines"
      },
      {
        title: "Gratin de chou-fleur",
        url: "https://www.google.com/search?q=recette+Gratin+chou-fleur"
      },
      {
        title: "Mijoté de veau aux carottes",
        url: "https://www.google.com/search?q=recette+Mijoté+veau+carottes"
      },
      {
        title: "Curry de potimarron et pois chiches",
        url: "https://www.google.com/search?q=recette+Curry+potimarron+pois+chiches"
      },
      {
        title: "Saucisse aux lentilles",
        url: "https://www.google.com/search?q=recette+Saucisse+lentilles"
      },
      {
        title: "Purée de céleri-rave, noisettes",
        url: "https://www.google.com/search?q=recette+Purée+céleri-rave+noisettes"
      },
      {
        title: "Tarte aux champignons",
        url: "https://www.google.com/search?q=recette+Tarte+champignons"
      },
      {
        title: "Papillote de lieu noir, fondue de poireaux",
        url: "https://www.google.com/search?q=recette+Papillote+lieu+noir+poireaux"
      }
    ],
    4: [
      {
        title: "Bœuf bourguignon",
        url: "https://www.google.com/search?q=recette+Bœuf+bourguignon"
      },
      {
        title: "Hachis parmentier végétarien aux lentilles",
        url: "https://www.google.com/search?q=recette+Hachis+parmentier+végétarien+lentilles"
      },
      {
        title: "Velouté de châtaignes",
        url: "https://www.google.com/search?q=recette+Velouté+châtaignes"
      },
      {
        title: "Ragoût de porc aux patates douces",
        url: "https://www.google.com/search?q=recette+Ragoût+porc+patates+douces"
      },
      {
        title: "Soupe à l'oignon gratinée",
        url: "https://www.google.com/search?q=recette+Soupe+oignon+gratinée"
      },
      {
        title: "Mijoté de haricots rouges à la courge",
        url: "https://www.google.com/search?q=recette+Mijoté+haricots+rouges+courge"
      },
      {
        title: "Bouillon aux ravioles du Dauphiné",
        url: "https://www.google.com/search?q=recette+Bouillon+ravioles+Dauphiné"
      },
      {
        title: "Goulash de bœuf au paprika",
        url: "https://www.google.com/search?q=recette+Goulash+bœuf+paprika"
      },
      {
        title: "Dahl de lentilles corail au lait de coco",
        url: "https://www.google.com/search?q=recette+Dahl+lentilles+corail+lait+coco"
      },
      {
        title: "Parmentier de potiron au bœuf haché",
        url: "https://www.google.com/search?q=recette+Parmentier+potiron+bœuf"
      }
    ]
  },
  "winter": {
    1: [
      {
        title: "Salade de mâche, betterave et œuf mollet",
        url: "https://www.google.com/search?q=recette+Salade+mâche+betterave+œuf"
      },
      {
        title: "Pavé de truite, tombée de blettes",
        url: "https://www.google.com/search?q=recette+Pavé+truite+blettes"
      },
      {
        title: "Wok de bœuf au chou kale",
        url: "https://www.google.com/search?q=recette+Wok+bœuf+chou+kale"
      },
      {
        title: "Salade de lentilles, hareng pomme à l'huile",
        url: "https://www.google.com/search?q=recette+Salade+lentilles+hareng+pomme"
      },
      {
        title: "Omelette aux truffes ou champignons",
        url: "https://www.google.com/search?q=recette+Omelette+truffes+champignons"
      },
      {
        title: "Tofu fumé sauté aux choux de Bruxelles",
        url: "https://www.google.com/search?q=recette+Tofu+sauté+choux+de+Bruxelles"
      },
      {
        title: "Foie de veau, persillade et épinards",
        url: "https://www.google.com/search?q=recette+Foie+veau+persillade+épinards"
      },
      {
        title: "Riz au lait d'amande",
        url: "https://www.google.com/search?q=recette+Riz+au+lait+amande"
      },
      {
        title: "Poire pochée aux épices",
        url: "https://www.google.com/search?q=recette+Poire+pochée+épices"
      },
      {
        title: "Mousse chocolat vegan au jus de pois chiche",
        url: "https://www.google.com/search?q=recette+Mousse+chocolat+vegan+aquafaba"
      }
    ],
    2: [
      {
        title: "Carpaccio de Saint-Jacques aux agrumes",
        url: "https://www.google.com/search?q=recette+Carpaccio+Saint-Jacques+agrumes"
      },
      {
        title: "Salade d'agrumes et avocat, crevettes",
        url: "https://www.google.com/search?q=recette+Salade+agrumes+avocat+crevettes"
      },
      {
        title: "Salade de chou blanc au sésame",
        url: "https://www.google.com/search?q=recette+Salade+chou+blanc+sésame"
      },
      {
        title: "Tartare de dorade au kiwi",
        url: "https://www.google.com/search?q=recette+Tartare+dorade+kiwi"
      },
      {
        title: "Salade de radis noir râpé",
        url: "https://www.google.com/search?q=recette+Salade+radis+noir"
      },
      {
        title: "Poireaux vinaigrette aux noisettes",
        url: "https://www.google.com/search?q=recette+Poireaux+vinaigrette+noisettes"
      },
      {
        title: "Carpaccio de betterave crue",
        url: "https://www.google.com/search?q=recette+Carpaccio+betterave+crue"
      },
      {
        title: "Salade de mâche aux noix et graines de courge",
        url: "https://www.google.com/search?q=recette+Salade+mâche+noix+graines+courge"
      },
      {
        title: "Blanc de dinde froid, mayonnaise à l'avocat",
        url: "https://www.google.com/search?q=recette+Blanc+dinde+mayonnaise+avocat"
      },
      {
        title: "Moules marinières",
        url: "https://www.google.com/search?q=recette+Moules+marinières"
      }
    ],
    3: [
      {
        title: "Gratin dauphinois",
        url: "https://www.google.com/search?q=recette+Gratin+dauphinois"
      },
      {
        title: "Pot-au-feu aux légumes d'hiver",
        url: "https://www.google.com/search?q=recette+Pot-au-feu+légumes+hiver"
      },
      {
        title: "Velouté de poireaux et pommes de terre",
        url: "https://www.google.com/search?q=recette+Velouté+poireaux+pommes+de+terre"
      },
      {
        title: "Blanquette de veau",
        url: "https://www.google.com/search?q=recette+Blanquette+veau"
      },
      {
        title: "Curry de légumes d'hiver",
        url: "https://www.google.com/search?q=recette+Curry+légumes+hiver"
      },
      {
        title: "Tartiflette aux poireaux",
        url: "https://www.google.com/search?q=recette+Tartiflette+poireaux"
      },
      {
        title: "Risotto au radicchio et noix",
        url: "https://www.google.com/search?q=recette+Risotto+radicchio+noix"
      },
      {
        title: "Saucisse de Morteau, écrasé de pommes de terre",
        url: "https://www.google.com/search?q=recette+Saucisse+Morteau+écrasé+pommes+de+terre"
      },
      {
        title: "Quiche au potimarron et chèvre",
        url: "https://www.google.com/search?q=recette+Quiche+potimarron+chèvre"
      },
      {
        title: "Papillote de poisson blanc, julienne de carottes",
        url: "https://www.google.com/search?q=recette+Papillote+poisson+blanc+julienne+carottes"
      }
    ],
    4: [
      {
        title: "Bouillon de poule aux vermicelles",
        url: "https://www.google.com/search?q=recette+Bouillon+poule+vermicelles"
      },
      {
        title: "Mijoté de pois cassés aux carottes",
        url: "https://www.google.com/search?q=recette+Mijoté+pois+cassés+carottes"
      },
      {
        title: "Hachis parmentier de bœuf aux pommes de terre",
        url: "https://www.google.com/search?q=recette+Hachis+parmentier+bœuf+pommes+de+terre"
      },
      {
        title: "Ragoût de seitan aux pommes de terre",
        url: "https://www.google.com/search?q=recette+Ragoût+seitan+pommes+de+terre"
      },
      {
        title: "Soupe de lentilles corail au cumin",
        url: "https://www.google.com/search?q=recette+Soupe+lentilles+corail+cumin"
      },
      {
        title: "Couscous végétarien aux légumes d'hiver",
        url: "https://www.google.com/search?q=recette+Couscous+végétarien+légumes+hiver"
      },
      {
        title: "Potée auvergnate",
        url: "https://www.google.com/search?q=recette+Potée+auvergnate"
      },
      {
        title: "Curry de pois chiches épinards",
        url: "https://www.google.com/search?q=recette+Curry+pois+chiches+épinards"
      },
      {
        title: "Soupe de cresson chaude",
        url: "https://www.google.com/search?q=recette+Soupe+cresson+chaude"
      },
      {
        title: "Mijoté de dinde aux marrons",
        url: "https://www.google.com/search?q=recette+Mijoté+dinde+marrons"
      }
    ]
  }
};

export function getSeasonForDate(date: Date = new Date()): Season {
  const monthDay = (date.getMonth() + 1) * 100 + date.getDate();
  if (monthDay >= 320 && monthDay <= 620) {
    return 'spring';
  }
  if (monthDay >= 621 && monthDay <= 921) {
    return 'summer';
  }
  if (monthDay >= 922 && monthDay <= 1220) {
    return 'autumn';
  }
  return 'winter';
}

export function getRecipesForPhase(phaseId: number, date: Date = new Date()): RecipeItem[] {
  const season = getSeasonForDate(date);
  const normalizedPhase: PhaseNumber =
    phaseId === 2 ? 2 : phaseId === 3 ? 3 : phaseId === 4 ? 4 : 1;
  return RECIPES_BY_SEASON_AND_PHASE[season][normalizedPhase];
}
