import { EstimatorPrices } from '../../../core/services/pricing.store';

export type ClimbActivity = 'boulder' | 'rope' | 'own';

export interface VisitInput {
  readonly adults: number;
  readonly students: number;
  readonly kids: number;
  readonly activity: ClimbActivity;
  readonly withInstructor: boolean;
}

export interface EstimateLine {
  readonly label: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly total: number;
}

export interface VisitEstimate {
  readonly climbers: number;
  readonly lines: readonly EstimateLine[];
  readonly total: number;
  /** Savings per adult over 10 visits when buying the 10-entry pass (0 = no saving). */
  readonly passSavingPerAdult: number;
  readonly passPricePerVisit: number;
  readonly familyTicketsApplied: number;
}

function line(label: string, quantity: number, unitPrice: number): EstimateLine | null {
  return quantity > 0 ? { label, quantity, unitPrice, total: round(quantity * unitPrice) } : null;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Pure price calculation for a single visit – kept framework-free for easy testing. */
export function estimateVisit(input: VisitInput, prices: EstimatorPrices): VisitEstimate {
  const adults = Math.max(0, input.adults);
  const students = Math.max(0, input.students);
  const kids = Math.max(0, input.kids);
  const climbers = adults + students + kids;
  const lines: (EstimateLine | null)[] = [];
  let familyTickets = 0;

  if (input.withInstructor) {
    // The intro course includes day entry and all rental gear.
    lines.push(line('Úvodný kurz s inštruktorom (vstup + výstroj v cene)', climbers, prices.intro_course));
  } else {
    const possibleFamilies = Math.min(Math.floor(adults / 2), Math.floor(kids / 2));
    const familyIsCheaper = prices.family_entry < 2 * prices.adult_entry + 2 * prices.child_entry;
    familyTickets = familyIsCheaper ? possibleFamilies : 0;

    lines.push(line('Rodinný vstup (2 dospelí + 2 deti)', familyTickets, prices.family_entry));
    lines.push(line('Vstup – dospelý', adults - 2 * familyTickets, prices.adult_entry));
    lines.push(line('Vstup – študent / junior', students, prices.student_entry));
    lines.push(line('Vstup – dieťa do 14 rokov', kids - 2 * familyTickets, prices.child_entry));

    if (input.activity === 'boulder') {
      lines.push(line('Požičanie lezečiek', climbers, prices.shoes_rental));
    } else if (input.activity === 'rope') {
      lines.push(line('Kompletný set na lano', climbers, prices.rope_set_rental));
    }
  }

  const presentLines = lines.filter((l): l is EstimateLine => l !== null);
  const total = round(presentLines.reduce((sum, l) => sum + l.total, 0));
  const passSavingPerAdult = round(Math.max(0, 10 * prices.adult_entry - prices.pass_10));

  return {
    climbers,
    lines: presentLines,
    total,
    passSavingPerAdult: adults > 0 ? passSavingPerAdult : 0,
    passPricePerVisit: round(prices.pass_10 / 10),
    familyTicketsApplied: familyTickets,
  };
}

/** "What to bring" checklist tailored to the selected visit. */
export function bringChecklist(input: VisitInput): string[] {
  const list = ['Pohodlné športové oblečenie, ktoré nebráni v pohybe', 'Fľašu s vodou a uterák'];
  if (input.activity === 'own') {
    list.push('Vlastné lezečky a vrecko s magnéziom');
    list.push('Pri lezení s lanom: úväz, istítko a karabínu s poistkou');
  } else {
    list.push('Ponožky – lezečky požičiavame na boso aj s tenkými ponožkami');
  }
  if (input.students > 0) list.push('Platný študentský preukaz (ISIC) pre zľavnený vstup');
  if (input.kids > 0) list.push('Pri deťoch prítomnosť rodiča, ktorý podpíše prehlásenie');
  list.push('Zopnuté vlasy, bez prsteňov a hodiniek na rukách');
  return list;
}
