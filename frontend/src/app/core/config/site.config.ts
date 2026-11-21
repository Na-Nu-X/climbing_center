/**
 * White-label configuration.
 *
 * Every piece of branding and business information shown on the website lives
 * here. To rebrand the site for a new climbing gym, edit this file (and, for
 * colors, the CSS custom properties in `src/styles/_theme.scss`).
 */

export interface OpeningHoursRow {
  readonly days: string;
  readonly hours: string;
  readonly note?: string;
}

export interface SocialLink {
  readonly label: string;
  readonly url: string;
  readonly icon: 'instagram' | 'facebook' | 'youtube';
}

export interface TrustMetric {
  readonly value: string;
  readonly label: string;
}

export interface SiteConfig {
  readonly name: string;
  readonly legalName: string;
  /** Wordmark split into two parts – the second is rendered in the accent color. */
  readonly wordmark: { readonly primary: string; readonly secondary: string };
  readonly tagline: string;
  readonly heroImageUrl: string;
  readonly contact: {
    readonly phone: string;
    readonly phoneHref: string;
    readonly email: string;
    readonly eventsEmail: string;
  };
  readonly address: {
    readonly street: string;
    readonly city: string;
    readonly postalCode: string;
    readonly country: string;
    readonly mapUrl: string;
    readonly parking: string;
    readonly publicTransit: string;
  };
  readonly company: {
    readonly ico: string;
    readonly dic: string;
    readonly icDph?: string;
    readonly registry: string;
  };
  readonly facility: {
    readonly totalWallAreaSqm: number;
    readonly maxWallHeightM: number;
    readonly gradeRange: string;
    readonly autoBelayCount: number;
    readonly routeSettingNote: string;
  };
  readonly openingHours: readonly OpeningHoursRow[];
  readonly openingHoursNote: string;
  readonly social: readonly SocialLink[];
  readonly trustMetrics: readonly TrustMetric[];
  /** Slug of the introductory course linked from the visit estimator. */
  readonly introCourseSlug: string;
  /**
   * Fallback prices for the visit estimator (EUR), used until live prices load
   * from the API or when a pricing item is not linked in the admin.
   */
  readonly estimatorFallbackPrices: {
    readonly adult_entry: number;
    readonly student_entry: number;
    readonly child_entry: number;
    readonly family_entry: number;
    readonly pass_10: number;
    readonly shoes_rental: number;
    readonly rope_set_rental: number;
    readonly intro_course: number;
  };
}

export const SITE_CONFIG: SiteConfig = {
  name: 'PREVIS Lezecké centrum',
  legalName: 'PREVIS Climbing s.r.o.',
  wordmark: { primary: 'PREVIS', secondary: 'climbing' },
  tagline: 'Bouldering, lezenie s lanom a kurzy pre všetkých – od prvého chytu po prvý previs.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=2000&q=80',
  contact: {
    phone: '+421 948 120 450',
    phoneHref: 'tel:+421948120450',
    email: 'recepcia@previs-climbing.sk',
    eventsEmail: 'akcie@previs-climbing.sk',
  },
  address: {
    street: 'Mlynské nivy 120',
    city: 'Bratislava',
    postalCode: '821 09',
    country: 'Slovensko',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Mlynsk%C3%A9+nivy+Bratislava',
    parking: 'Bezplatné parkovanie pre 80 áut priamo pred halou, nabíjačky pre elektromobily a kryté stojany na bicykle.',
    publicTransit: 'Električka 4 a autobus 50 – zastávka „Mlynské nivy“, 3 minúty pešo. Z hlavnej stanice 15 minút.',
  },
  company: {
    ico: '53 912 448',
    dic: '2121 554 873',
    icDph: 'SK2121554873',
    registry: 'Zapísaná v OR Mestského súdu Bratislava III, odd. Sro, vl. č. 154 210/B',
  },
  facility: {
    totalWallAreaSqm: 1400,
    maxWallHeightM: 16.5,
    gradeRange: '4a – 8b+',
    autoBelayCount: 6,
    routeSettingNote: 'Nové bouldre každý utorok, cesty na lane prestavujeme každý druhý štvrtok.',
  },
  openingHours: [
    { days: 'Pondelok – Piatok', hours: '07:00 – 23:00', note: 'Ranný vstup do 14:00 za zvýhodnenú cenu' },
    { days: 'Sobota', hours: '09:00 – 22:00' },
    { days: 'Nedeľa a sviatky', hours: '09:00 – 21:00' },
  ],
  openingHoursNote: 'Posledný vstup 60 minút pred zatvorením. V utorok 07:00 – 12:00 je časť boulderingovej haly uzavretá kvôli prestavbe.',
  social: [
    { label: 'Instagram', url: 'https://www.instagram.com/', icon: 'instagram' },
    { label: 'Facebook', url: 'https://www.facebook.com/', icon: 'facebook' },
    { label: 'YouTube', url: 'https://www.youtube.com/', icon: 'youtube' },
  ],
  trustMetrics: [
    { value: '1 400 m²', label: 'lezeckej plochy' },
    { value: '16,5 m', label: 'najvyššia stena' },
    { value: '200+', label: 'ciest a boulderov' },
    { value: '4,9 ★', label: 'hodnotenie od 1 200+ lezcov' },
  ],
  introCourseSlug: 'prve-kroky-na-stene',
  estimatorFallbackPrices: {
    adult_entry: 13,
    student_entry: 11,
    child_entry: 8,
    family_entry: 34,
    pass_10: 115,
    shoes_rental: 4,
    rope_set_rental: 8,
    intro_course: 29,
  },
};
