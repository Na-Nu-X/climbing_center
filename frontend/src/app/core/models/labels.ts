import { CourseCategory, EventType, ExperienceLevel, PricingCategory, SkillLevel } from './api.models';

/** Slovak UI labels for API enum values (short forms for badges & filters). */

export const COURSE_CATEGORY_FILTERS: readonly { value: CourseCategory | null; label: string }[] = [
  { value: null, label: 'Všetky' },
  { value: 'zaciatocnici', label: 'Pre začiatočníkov' },
  { value: 'lano_istenie', label: 'Lezenie s lanom' },
  { value: 'deti_mladez', label: 'Detské krúžky' },
  { value: 'treningy', label: 'Tréningy' },
];

export const COURSE_CATEGORY_SHORT: Record<CourseCategory, string> = {
  zaciatocnici: 'Začiatočníci',
  lano_istenie: 'Lano & istenie',
  deti_mladez: 'Deti & mládež',
  treningy: 'Tréningy',
};

export const SKILL_LEVEL_PILL: Record<SkillLevel, string> = {
  uplny_zaciatocnik: 'Vhodné pre úplných začiatočníkov',
  mierne_pokrocily: 'Pre mierne pokročilých',
  vsetky_urovne: 'Pre všetky úrovne',
};

export const SKILL_LEVEL_OPTIONS: readonly { value: SkillLevel | null; label: string }[] = [
  { value: null, label: 'Všetky úrovne' },
  { value: 'uplny_zaciatocnik', label: 'Úplný začiatočník' },
  { value: 'mierne_pokrocily', label: 'Mierne pokročilý' },
  { value: 'vsetky_urovne', label: 'Kurzy pre všetky úrovne' },
];

export const PRICING_CATEGORIES: readonly { value: PricingCategory; label: string; intro: string }[] = [
  {
    value: 'jednorazove',
    label: 'Jednorazové vstupy',
    intro: 'Celodenný vstup do všetkých lezeckých zón. Bez rezervácie, stačí prísť.',
  },
  {
    value: 'permanentky',
    label: 'Permanentky a členstvá',
    intro: 'Pre tých, ktorých lezenie chytilo. Čím častejšie lezieš, tým menej platíš.',
  },
  {
    value: 'pozicovna',
    label: 'Požičovňa lezeckého vybavenia',
    intro: 'Nemáš výstroj? Všetko ti požičiame na recepcii – čisté, skontrolované a v každej veľkosti.',
  },
];

export const EXPERIENCE_OPTIONS: readonly { value: ExperienceLevel; label: string }[] = [
  { value: 'ziadne', label: 'Žiadne skúsenosti' },
  { value: 'zaklady', label: 'Párkrát som už liezol/liezla' },
  { value: 'pokrocily', label: 'Pravidelne leziem' },
];

export const EVENT_TYPE_OPTIONS: readonly { value: EventType; label: string }[] = [
  { value: 'teambuilding', label: 'Firemný teambuilding na stene' },
  { value: 'narodeniny', label: 'Detská narodeninová oslava s inštruktorom' },
  { value: 'skola', label: 'Školský výlet / Telesná výchova' },
  { value: 'sukromny_trening', label: 'Individuálny tréning s inštruktorom' },
];
