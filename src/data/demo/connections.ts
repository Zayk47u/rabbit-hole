import type { DiscoveryConnection } from '@/src/domain/types';

/** Tempting branches — teasers first, academic labels never. */
export const DEMO_CONNECTIONS: DiscoveryConnection[] = [
  // d01 Acoustic Kitty
  {
    id: 'c01',
    fromDiscoveryId: 'd01',
    toDiscoveryId: 'd10',
    branchType: 'same_pattern',
    teaser: 'When spy agencies treat minds and bodies like hardware to rewire',
  },
  {
    id: 'c02',
    fromDiscoveryId: 'd01',
    toDiscoveryId: 'd07',
    branchType: 'zoom_out',
    teaser: 'Cold War plans so extravagant they sound like satire — until you see the budgets',
  },
  {
    id: 'c03',
    fromDiscoveryId: 'd01',
    toDiscoveryId: 'd15',
    branchType: 'unexpected_parallel',
    teaser: 'A different kind of “impossible machine” — one that actually worked, then vanished',
  },

  // d02 Casino carpets
  {
    id: 'c04',
    fromDiscoveryId: 'd02',
    toDiscoveryId: 'd09',
    branchType: 'modern_version',
    teaser: 'How casino design and social feeds manipulate the same behavioral loop',
  },
  {
    id: 'c05',
    fromDiscoveryId: 'd02',
    toDiscoveryId: 'd13',
    branchType: 'where_this_leads',
    teaser: 'Why “bad” defaults stick around long after better options exist',
  },
  {
    id: 'c06',
    fromDiscoveryId: 'd02',
    toDiscoveryId: 'd18',
    branchType: 'darker_version',
    teaser: 'When environment design stops being playful and becomes total capture',
  },

  // d03 Cicada
  {
    id: 'c07',
    fromDiscoveryId: 'd03',
    toDiscoveryId: 'd17',
    branchType: 'side_quest',
    teaser: 'Another internet mythos that turned emptiness into a shared nightmare',
  },
  {
    id: 'c08',
    fromDiscoveryId: 'd03',
    toDiscoveryId: 'd08',
    branchType: 'unexpected_parallel',
    teaser: 'Recruitment aesthetics: cryptic symbols, uniforms, and belonging as the prize',
  },
  {
    id: 'c09',
    fromDiscoveryId: 'd03',
    toDiscoveryId: 'd16',
    branchType: 'where_this_leads',
    teaser: 'What happens when mystery itself can be synthetically manufactured',
  },
  {
    id: 'c10',
    fromDiscoveryId: 'd03',
    toDiscoveryId: 'd10',
    branchType: 'go_deeper',
    teaser: 'The older American tradition of secret programs that refuse clean endings',
  },

  // d04 Unit 731
  {
    id: 'c11',
    fromDiscoveryId: 'd04',
    toDiscoveryId: 'd10',
    branchType: 'same_pattern',
    teaser: 'Research so radioactive the paperwork had to disappear',
  },
  {
    id: 'c12',
    fromDiscoveryId: 'd04',
    toDiscoveryId: 'd12',
    branchType: 'opposite_example',
    teaser: 'A catastrophe the world was forced to see — and then couldn’t stop looking at',
  },
  {
    id: 'c13',
    fromDiscoveryId: 'd04',
    toDiscoveryId: 'd18',
    branchType: 'zoom_out',
    teaser: 'How institutions rewrite morality when “useful” becomes the highest value',
  },

  // d05 Stockholm
  {
    id: 'c14',
    fromDiscoveryId: 'd05',
    toDiscoveryId: 'd18',
    branchType: 'go_deeper',
    teaser: 'Trauma bonding at civilizational scale — utopia as the captivity story',
  },
  {
    id: 'c15',
    fromDiscoveryId: 'd05',
    toDiscoveryId: 'd09',
    branchType: 'modern_version',
    teaser: 'Why people defend platforms that exhaust them',
  },
  {
    id: 'c16',
    fromDiscoveryId: 'd05',
    toDiscoveryId: 'd20',
    branchType: 'side_quest',
    teaser: 'A scientific buzzword that tried to explain empathy — and overreached',
  },

  // d06 Vaporwave
  {
    id: 'c17',
    fromDiscoveryId: 'd06',
    toDiscoveryId: 'd17',
    branchType: 'same_pattern',
    teaser: 'Another aesthetic that turned late-capitalist emptiness into folklore',
  },
  {
    id: 'c18',
    fromDiscoveryId: 'd06',
    toDiscoveryId: 'd11',
    branchType: 'unexpected_parallel',
    teaser: 'When a look stops being fashion and starts being a political signal',
  },
  {
    id: 'c19',
    fromDiscoveryId: 'd06',
    toDiscoveryId: 'd19',
    branchType: 'where_this_leads',
    teaser: 'Dead malls, buried rivers, cities that mourn themselves in architecture',
  },

  // d07 MX silos
  {
    id: 'c20',
    fromDiscoveryId: 'd07',
    toDiscoveryId: 'd01',
    branchType: 'side_quest',
    teaser: 'A smaller, stranger Cold War gadget that also treated life like hardware',
  },
  {
    id: 'c21',
    fromDiscoveryId: 'd07',
    toDiscoveryId: 'd15',
    branchType: 'opposite_example',
    teaser: 'Engineering brilliance that survived by accident underwater — not by budget',
  },
  {
    id: 'c22',
    fromDiscoveryId: 'd07',
    toDiscoveryId: 'd12',
    branchType: 'darker_version',
    teaser: 'When the unthinkable actually happens to a technological system',
  },

  // d08 Heaven's Gate
  {
    id: 'c23',
    fromDiscoveryId: 'd08',
    toDiscoveryId: 'd18',
    branchType: 'same_pattern',
    teaser: 'Another group that sold transcendence with terrifying internal logic',
  },
  {
    id: 'c24',
    fromDiscoveryId: 'd08',
    toDiscoveryId: 'd11',
    branchType: 'unexpected_parallel',
    teaser: 'Clothes as cosmology — identity stitched before the ending arrives',
  },
  {
    id: 'c25',
    fromDiscoveryId: 'd08',
    toDiscoveryId: 'd03',
    branchType: 'side_quest',
    teaser: 'Recruitment through mystery: puzzles, symbols, and the hunger to be chosen',
  },

  // d09 For You Page
  {
    id: 'c26',
    fromDiscoveryId: 'd09',
    toDiscoveryId: 'd02',
    branchType: 'backstory',
    teaser: 'The analog ancestors of infinite scroll lived under casino lights',
  },
  {
    id: 'c27',
    fromDiscoveryId: 'd09',
    toDiscoveryId: 'd16',
    branchType: 'where_this_leads',
    teaser: 'When the feed can invent the face that keeps you watching',
  },
  {
    id: 'c28',
    fromDiscoveryId: 'd09',
    toDiscoveryId: 'd13',
    branchType: 'zoom_out',
    teaser: 'Why engagement systems rarely get replaced — even when everyone hates them',
  },
  {
    id: 'c29',
    fromDiscoveryId: 'd09',
    toDiscoveryId: 'd05',
    branchType: 'darker_version',
    teaser: 'Attachment under asymmetric power, without a bank vault in sight',
  },

  // d10 MKUltra
  {
    id: 'c30',
    fromDiscoveryId: 'd10',
    toDiscoveryId: 'd01',
    branchType: 'side_quest',
    teaser: 'The animal-cyborg cousin of human-subject hubris',
  },
  {
    id: 'c31',
    fromDiscoveryId: 'd10',
    toDiscoveryId: 'd04',
    branchType: 'same_pattern',
    teaser: 'When “research value” becomes the excuse that outlives ethics',
  },
  {
    id: 'c32',
    fromDiscoveryId: 'd10',
    toDiscoveryId: 'd03',
    branchType: 'modern_version',
    teaser: 'Public mystery as recruitment — the internet’s unofficial sequel energy',
  },

  // d11 Zoot suits
  {
    id: 'c33',
    fromDiscoveryId: 'd11',
    toDiscoveryId: 'd06',
    branchType: 'modern_version',
    teaser: 'Another style tribe that used aesthetics to argue with the mainstream',
  },
  {
    id: 'c34',
    fromDiscoveryId: 'd11',
    toDiscoveryId: 'd08',
    branchType: 'unexpected_parallel',
    teaser: 'Uniforms that make outsiders nervous — for very different reasons',
  },
  {
    id: 'c35',
    fromDiscoveryId: 'd11',
    toDiscoveryId: 'd19',
    branchType: 'where_this_leads',
    teaser: 'How cities remember (and forget) the people they once attacked',
  },

  // d12 Chernobyl
  {
    id: 'c36',
    fromDiscoveryId: 'd12',
    toDiscoveryId: 'd17',
    branchType: 'unexpected_parallel',
    teaser: 'Abandoned spaces as genre — from real exclusion zones to invented yellow halls',
  },
  {
    id: 'c37',
    fromDiscoveryId: 'd12',
    toDiscoveryId: 'd07',
    branchType: 'backstory',
    teaser: 'The imagination of nuclear permanence before failure made it visceral',
  },
  {
    id: 'c38',
    fromDiscoveryId: 'd12',
    toDiscoveryId: 'd19',
    branchType: 'zoom_out',
    teaser: 'Places that keep scoring new meaning after humans leave',
  },

  // d13 QWERTY
  {
    id: 'c39',
    fromDiscoveryId: 'd13',
    toDiscoveryId: 'd02',
    branchType: 'same_pattern',
    teaser: 'Another “bad” interface that wins because exit is harder than habit',
  },
  {
    id: 'c40',
    fromDiscoveryId: 'd13',
    toDiscoveryId: 'd09',
    branchType: 'modern_version',
    teaser: 'Recommendation defaults as the new QWERTY — sticky by design',
  },
  {
    id: 'c41',
    fromDiscoveryId: 'd13',
    toDiscoveryId: 'd15',
    branchType: 'opposite_example',
    teaser: 'A technology so good it got lost — the reverse of lock-in',
  },

  // d14 Dancing plague
  {
    id: 'c42',
    fromDiscoveryId: 'd14',
    toDiscoveryId: 'd05',
    branchType: 'same_pattern',
    teaser: 'When collective stress invents behaviors that look irrational from outside',
  },
  {
    id: 'c43',
    fromDiscoveryId: 'd14',
    toDiscoveryId: 'd20',
    branchType: 'go_deeper',
    teaser: 'Science stories that try to explain social contagion — and get remixed',
  },
  {
    id: 'c44',
    fromDiscoveryId: 'd14',
    toDiscoveryId: 'd18',
    branchType: 'darker_version',
    teaser: 'Contagion of belief with a leader steering the dance',
  },

  // d15 Antikythera
  {
    id: 'c45',
    fromDiscoveryId: 'd15',
    toDiscoveryId: 'd07',
    branchType: 'unexpected_parallel',
    teaser: 'Machines built for cosmic prediction vs machines built for cosmic threat',
  },
  {
    id: 'c46',
    fromDiscoveryId: 'd15',
    toDiscoveryId: 'd01',
    branchType: 'side_quest',
    teaser: 'A reminder that “clever engineering” and “good idea” are not synonyms',
  },
  {
    id: 'c47',
    fromDiscoveryId: 'd15',
    toDiscoveryId: 'd13',
    branchType: 'zoom_out',
    teaser: 'What survives isn’t always what’s best — sometimes it’s what’s found',
  },

  // d16 Deepfakes
  {
    id: 'c48',
    fromDiscoveryId: 'd16',
    toDiscoveryId: 'd09',
    branchType: 'backstory',
    teaser: 'Feeds trained us to trust faces at speed — then faces became forgeable',
  },
  {
    id: 'c49',
    fromDiscoveryId: 'd16',
    toDiscoveryId: 'd10',
    branchType: 'unexpected_parallel',
    teaser: 'Older programs that also tried to manufacture reality inside minds',
  },
  {
    id: 'c50',
    fromDiscoveryId: 'd16',
    toDiscoveryId: 'd03',
    branchType: 'side_quest',
    teaser: 'In a world of fakes, authentic mystery becomes even more addictive',
  },

  // d17 Backrooms
  {
    id: 'c51',
    fromDiscoveryId: 'd17',
    toDiscoveryId: 'd06',
    branchType: 'same_pattern',
    teaser: 'Internet aesthetics that turn capitalist emptiness into sacred text',
  },
  {
    id: 'c52',
    fromDiscoveryId: 'd17',
    toDiscoveryId: 'd12',
    branchType: 'unexpected_parallel',
    teaser: 'Real abandoned zones vs invented ones — which haunt harder?',
  },
  {
    id: 'c53',
    fromDiscoveryId: 'd17',
    toDiscoveryId: 'd19',
    branchType: 'where_this_leads',
    teaser: 'Liminal anxiety mapped onto actual cities and erased neighborhoods',
  },

  // d18 Jonestown
  {
    id: 'c54',
    fromDiscoveryId: 'd18',
    toDiscoveryId: 'd08',
    branchType: 'same_pattern',
    teaser: 'Another path where belonging, costume, and cosmology fuse fatally',
  },
  {
    id: 'c55',
    fromDiscoveryId: 'd18',
    toDiscoveryId: 'd05',
    branchType: 'go_deeper',
    teaser: 'The psychology of defending the cage while you’re still inside it',
  },
  {
    id: 'c56',
    fromDiscoveryId: 'd18',
    toDiscoveryId: 'd02',
    branchType: 'unexpected_parallel',
    teaser: 'Capture architecture without a compound — just incentives and design',
  },
  {
    id: 'c57',
    fromDiscoveryId: 'd18',
    toDiscoveryId: 'd09',
    branchType: 'modern_version',
    teaser: 'High-control dynamics that fit in your pocket',
  },

  // d19 Palimpsest cities
  {
    id: 'c58',
    fromDiscoveryId: 'd19',
    toDiscoveryId: 'd11',
    branchType: 'backstory',
    teaser: 'Fashion riots as one layer cities try to pave over',
  },
  {
    id: 'c59',
    fromDiscoveryId: 'd19',
    toDiscoveryId: 'd12',
    branchType: 'darker_version',
    teaser: 'When abandonment isn’t gradual — it’s radioactive and sudden',
  },
  {
    id: 'c60',
    fromDiscoveryId: 'd19',
    toDiscoveryId: 'd06',
    branchType: 'side_quest',
    teaser: 'Nostalgia genres that mourn commercial architecture before it’s gone',
  },

  // d20 Mirror neurons
  {
    id: 'c61',
    fromDiscoveryId: 'd20',
    toDiscoveryId: 'd09',
    branchType: 'modern_version',
    teaser: 'How scientific metaphors get packaged into feed-friendly certainty',
  },
  {
    id: 'c62',
    fromDiscoveryId: 'd20',
    toDiscoveryId: 'd14',
    branchType: 'unexpected_parallel',
    teaser: 'Older mysteries of contagious behavior that still resist neat mechanisms',
  },
  {
    id: 'c63',
    fromDiscoveryId: 'd20',
    toDiscoveryId: 'd05',
    branchType: 'where_this_leads',
    teaser: 'When pop-psych labels start explaining (and judging) survival',
  },
];
