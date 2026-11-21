import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { ContactPayload } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { applyServerErrors, controlErrorMessage, phoneValidator } from '../../core/utils/form-errors';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';

interface VisitStep {
  readonly icon: IconName;
  readonly title: string;
  readonly text: string;
  readonly time: string;
}

interface FaqItem {
  readonly q: string;
  readonly a: string;
  readonly safety?: boolean;
}

@Component({
  selector: 'app-first-visit-page',
  imports: [RouterLink, ReactiveFormsModule, PageHeroComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './first-visit.page.html',
  styleUrl: './first-visit.page.scss',
})
export class FirstVisitPage {
  private readonly api = inject(ApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly site = SITE_CONFIG;

  protected readonly steps: readonly VisitStep[] = [
    {
      icon: 'users',
      title: 'Registrácia na recepcii',
      text: 'Vyplníš krátke prehlásenie (za deti ho podpisuje rodič), zaplatíš vstup a dostaneš náramok.',
      time: '5 min',
    },
    {
      icon: 'shoe',
      title: 'Požičanie lezečiek',
      text: 'Lezečky by mali sedieť tesne, ale nebolieť. Pomôžeme ti vybrať správnu veľkosť, pri lane dostaneš aj úväz.',
      time: '3 min',
    },
    {
      icon: 'shield',
      title: 'Krátka bezpečnostná inštruktáž',
      text: 'Ukážeme ti, ako bezpečne padať na matrace, kde sa nestáť pod lezcom a ako fungujú auto-belay navijaky.',
      time: '5 min',
    },
    {
      icon: 'mountain',
      title: 'Lezenie!',
      text: 'Začni na najľahšom žltom okruhu, rob si prestávky a neboj sa spýtať. Každý tu raz začínal.',
      time: 'celý deň',
    },
  ];

  protected readonly faq: readonly FaqItem[] = [
    {
      q: 'Potrebujem nejaké skúsenosti alebo kondíciu?',
      a: 'Nie. Väčšina našich návštevníkov prišla prvýkrát bez akýchkoľvek skúseností. Ľahké cesty zvládne každý, kto vyjde po rebríku. Ak si chceš byť istý, prihlás sa na úvodný kurz s inštruktorom.',
    },
    {
      q: 'Musím si vopred rezervovať vstup?',
      a: 'Na voľné lezenie rezerváciu nepotrebuješ – stačí prísť počas otváracích hodín. Rezervácia je nutná len na kurzy a skupinové akcie nad 8 osôb.',
    },
    {
      q: 'Od koľkých rokov môžu deti liezť?',
      a: 'V detskom lezeckom svete lezú deti už od 3 rokov pod dohľadom rodiča. Detský krúžok je pre deti od 6 do 14 rokov. Osoby mladšie ako 18 rokov potrebujú podpísané prehlásenie zákonného zástupcu.',
    },
    {
      q: 'Čo si mám obliecť?',
      a: 'Pohodlné športové oblečenie, ktoré nebráni v pohybe – legíny alebo tepláky a tričko. Lezie sa v lezečkách, ktoré ti požičiame. Šperky a hodinky si radšej odlož.',
    },
    {
      q: 'Pravidlá v boulderingovej hale',
      a: 'Nikdy nestoj ani nesedávaj na matracoch pod lezcom. Na jednom boulderi lezie vždy len jeden človek. Z vrcholu sa vždy zlez alebo zoskoč kontrolovane, s pokrčenými kolenami. Deti musia byť stále pod dohľadom.',
      safety: true,
    },
    {
      q: 'Pravidlá pri lezení s lanom',
      a: 'Istiť môže len ten, kto má preukaz ističa nášho centra alebo absolvoval kurz istenia. Pred každým výstupom vždy urob partner check: uzol, úväz, istítko, karabína. Bez znalosti istenia používaj len auto-belay navijaky.',
      safety: true,
    },
    {
      q: 'Je lezenie bezpečné?',
      a: 'Pri dodržiavaní pravidiel áno. Naše matrace majú 40 cm, auto-belay navijaky prechádzajú dennou kontrolou a celé centrum spĺňa normu EN 12572. Na recepcii je vždy prítomný človek s kurzom prvej pomoci.',
      safety: true,
    },
    {
      q: 'Môžem platiť kartou? Máte darčekové poukážky?',
      a: 'Áno, prijímame karty, hotovosť aj stravné a športové karty (MultiSport, Benefit Plus). Darčekové poukážky na vstupy aj kurzy kúpiš na recepcii.',
    },
  ];

  protected readonly openFaq = signal<number | null>(0);

  protected toggleFaq(index: number): void {
    this.openFaq.update((current) => (current === index ? null : index));
  }

  // ---------------------------------------------------------------- Contact form
  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', phoneValidator],
    subject: ['', Validators.maxLength(160)],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(3000)]],
    gdpr_consent: [false, Validators.requiredTrue],
  });

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected error(name: keyof typeof this.form.controls): string | null {
    return controlErrorMessage(this.form.controls[name]);
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
    const payload: ContactPayload = {
      name: v.name.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      subject: v.subject.trim(),
      message: v.message.trim(),
      gdpr_consent: v.gdpr_consent,
    };
    this.submitting.set(true);
    this.api.sendContactMessage(payload).subscribe({
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
}
