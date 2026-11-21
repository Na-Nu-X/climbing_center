import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { EventType, GroupEventPayload } from '../../core/models/api.models';
import { EVENT_TYPE_OPTIONS } from '../../core/models/labels';
import { ApiService } from '../../core/services/api.service';
import { applyServerErrors, controlErrorMessage, phoneValidator } from '../../core/utils/form-errors';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';

interface EventPackage {
  readonly type: EventType;
  readonly icon: IconName;
  readonly eyebrow: string;
  readonly title: string;
  readonly text: string;
  readonly points: readonly string[];
  readonly priceFrom: string;
  readonly image: string;
}

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

@Component({
  selector: 'app-events-page',
  imports: [RouterLink, ReactiveFormsModule, PageHeroComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './events.page.html',
  styleUrl: './events.page.scss',
})
export class EventsPage {
  private readonly api = inject(ApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly site = SITE_CONFIG;
  protected readonly eventTypes = EVENT_TYPE_OPTIONS;

  protected readonly packages: readonly EventPackage[] = [
    {
      type: 'teambuilding',
      icon: 'users',
      eyebrow: 'Pre firmy',
      title: 'Firemný teambuilding na stene',
      text: 'Lezenie v dvojiciach je o dôvere, komunikácii a povzbudzovaní. Presne to, čo chcete posilniť aj v tíme.',
      points: [
        'Program na 2 – 4 hodiny s inštruktormi',
        'Tímové výzvy a súťaž v boulderingu',
        'Catering a káva v našom bistre',
        'Faktúra na firmu, možnosť prenájmu celej haly',
      ],
      priceFrom: 'od 29 € / osoba',
      image: img('1529156069898-49953e39b3ac'),
    },
    {
      type: 'narodeniny',
      icon: 'star',
      eyebrow: 'Pre deti 5 – 14 rokov',
      title: 'Detská narodeninová oslava s inštruktorom',
      text: 'Dve hodiny lezenia, hier a smiechu pod dohľadom inštruktora. Vy si len prinesiete tortu.',
      points: [
        '90 minút lezenia s inštruktorom',
        'Lezecké hry a malá súťaž s diplomami',
        'Vyhradený stôl v bistre na oslavu',
        'Výstroj pre všetky deti v cene',
      ],
      priceFrom: 'od 199 € / do 10 detí',
      image: img('1503454537195-1dcabb73ffb9'),
    },
    {
      type: 'skola',
      icon: 'calendar',
      eyebrow: 'Pre školy a krúžky',
      title: 'Školský výlet / Telesná výchova',
      text: 'Netradičná hodina telesnej výchovy alebo výlet, na ktorý sa deti tešia. Dopoludňajšie termíny počas pracovných dní.',
      points: [
        'Program prispôsobený veku a počtu žiakov',
        'Bezpečnostná inštruktáž a lezenie na lane aj bouldri',
        'Pedagógovia majú vstup zdarma',
        'Zvýhodnené ceny pri pravidelných návštevách',
      ],
      priceFrom: 'od 9 € / žiak',
      image: img('1522163182402-834f871fd851'),
    },
  ];

  protected readonly steps = [
    { title: 'Pošlite dopyt', text: 'Vyplňte formulár – zaberie to necelú minútu.' },
    { title: 'Ozveme sa do 24 h', text: 'Navrhneme program, termín a cenovú ponuku na mieru.' },
    { title: 'Príďte si to užiť', text: 'Výstroj, inštruktorov aj občerstvenie zariadime my.' },
  ] as const;

  protected readonly form = this.fb.group({
    event_type: this.fb.control<EventType>('teambuilding', Validators.required),
    estimated_participants: this.fb.control<number>(10, [Validators.required, Validators.min(1), Validators.max(300)]),
    preferred_date: ['', Validators.maxLength(120)],
    group_or_company_name: ['', Validators.maxLength(160)],
    contact_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, phoneValidator]],
    message: ['', Validators.maxLength(3000)],
    gdpr_consent: [false, Validators.requiredTrue],
  });

  protected readonly eventType = toSignal(this.form.controls.event_type.valueChanges, {
    initialValue: this.form.controls.event_type.value,
  });
  protected readonly companyLabel = computed(() => {
    switch (this.eventType()) {
      case 'teambuilding':
        return 'Názov firmy';
      case 'skola':
        return 'Názov školy';
      default:
        return 'Skupina / organizácia';
    }
  });
  protected readonly companyRequired = computed(() => this.eventType() === 'teambuilding');

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly submitError = signal<string | null>(null);

  constructor() {
    this.form.controls.event_type.valueChanges.subscribe((type) => {
      const company = this.form.controls.group_or_company_name;
      company.setValidators(
        type === 'teambuilding' ? [Validators.required, Validators.maxLength(160)] : [Validators.maxLength(160)],
      );
      company.updateValueAndValidity();
    });
    this.form.controls.event_type.updateValueAndValidity({ emitEvent: true });
  }

  protected choose(type: EventType): void {
    this.form.controls.event_type.setValue(type);
    document.getElementById('dopyt')?.scrollIntoView({ behavior: 'smooth' });
  }

  protected error(name: keyof typeof this.form.controls): string | null {
    return controlErrorMessage(this.form.controls[name]);
  }

  protected adjustParticipants(delta: number): void {
    const c = this.form.controls.estimated_participants;
    c.setValue(Math.min(300, Math.max(1, (Number(c.value) || 0) + delta)));
    c.markAsTouched();
  }

  protected submit(): void {
    if (this.submitting()) return;
    this.submitError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitError.set('Skontrolujte prosím zvýraznené polia formulára.');
      return;
    }
    const v = this.form.getRawValue();
    const payload: GroupEventPayload = {
      ...v,
      estimated_participants: Number(v.estimated_participants),
      preferred_date: v.preferred_date.trim(),
      group_or_company_name: v.group_or_company_name.trim(),
      contact_name: v.contact_name.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      message: v.message.trim(),
    };
    this.submitting.set(true);
    this.api.createEventInquiry(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
        this.form.reset();
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.submitError.set(applyServerErrors(this.form, err));
      },
    });
  }

  protected newInquiry(): void {
    this.submitted.set(false);
  }
}
