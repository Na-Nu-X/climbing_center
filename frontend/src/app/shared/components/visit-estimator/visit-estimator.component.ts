import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { PricingStore } from '../../../core/services/pricing.store';
import { EurPipe } from '../../../core/utils/eur.pipe';
import { IconComponent, IconName } from '../icon/icon.component';
import { bringChecklist, ClimbActivity, estimateVisit, VisitInput } from './visit-estimate';

type CounterKey = 'adults' | 'students' | 'kids';

interface CounterDef {
  readonly key: CounterKey;
  readonly label: string;
  readonly hint: string;
}

interface ActivityOption {
  readonly value: ClimbActivity;
  readonly label: string;
  readonly hint: string;
  readonly icon: IconName;
}

const MAX_PER_GROUP = 20;

@Component({
  selector: 'app-visit-estimator',
  imports: [RouterLink, EurPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visit-estimator.component.html',
  styleUrl: './visit-estimator.component.scss',
})
export class VisitAndPassEstimatorComponent {
  /** Hide the "full pricing" link when the estimator is embedded on the pricing page itself. */
  readonly showPricingLink = input(true);
  /** Unique prefix for element ids when the widget appears more than once. */
  readonly idPrefix = input('est');

  private readonly store = inject(PricingStore);
  protected readonly introCourseSlug = SITE_CONFIG.introCourseSlug;
  protected readonly maxPerGroup = MAX_PER_GROUP;

  protected readonly counters: readonly CounterDef[] = [
    { key: 'adults', label: 'Dospelí', hint: 'od 26 rokov' },
    { key: 'students', label: 'Študenti / Juniori', hint: '15 – 26 rokov' },
    { key: 'kids', label: 'Deti do 14 rokov', hint: 'v sprievode dospelého' },
  ];

  protected readonly activities: readonly ActivityOption[] = [
    {
      value: 'boulder',
      label: 'Bouldering (bez lana) – požičať lezečky',
      hint: 'Najjednoduchší štart, nízke steny nad matracmi',
      icon: 'shoe',
    },
    {
      value: 'rope',
      label: 'Stena s lanom – požičať kompletný set',
      hint: 'Lezečky, úväz a istítko na 16,5 m stenu',
      icon: 'rope',
    },
    {
      value: 'own',
      label: 'Mám vlastnú lezeckú výstroj',
      hint: 'Platíš iba vstup',
      icon: 'check',
    },
  ];

  // ---- reactive state
  protected readonly adults = signal(1);
  protected readonly students = signal(0);
  protected readonly kids = signal(0);
  protected readonly activity = signal<ClimbActivity>('boulder');
  protected readonly withInstructor = signal(false);

  protected readonly visit = computed<VisitInput>(() => ({
    adults: this.adults(),
    students: this.students(),
    kids: this.kids(),
    activity: this.activity(),
    withInstructor: this.withInstructor(),
  }));

  protected readonly prices = this.store.estimatorPrices;
  protected readonly estimate = computed(() => estimateVisit(this.visit(), this.prices()));
  protected readonly checklist = computed(() => bringChecklist(this.visit()));
  protected readonly ropeSafetyNote = computed(
    () => this.activity() !== 'boulder' && !this.withInstructor(),
  );

  constructor() {
    this.store.load();
  }

  protected count(key: CounterKey): number {
    return this[key]();
  }

  protected change(key: CounterKey, delta: number): void {
    this[key].update((value) => Math.min(MAX_PER_GROUP, Math.max(0, value + delta)));
  }

  protected canDecrement(key: CounterKey): boolean {
    // Keep at least one climber in the group.
    return this.count(key) > 0 && this.estimate().climbers > 1;
  }

  protected selectActivity(value: ClimbActivity): void {
    this.activity.set(value);
  }

  protected setInstructor(value: boolean): void {
    this.withInstructor.set(value);
  }
}
