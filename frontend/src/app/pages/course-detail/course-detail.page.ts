import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { CourseRegistrationPayload, ExperienceLevel } from '../../core/models/api.models';
import { COURSE_CATEGORY_SHORT, EXPERIENCE_OPTIONS, SKILL_LEVEL_PILL } from '../../core/models/labels';
import { ApiService } from '../../core/services/api.service';
import { EurPipe } from '../../core/utils/eur.pipe';
import { applyServerErrors, controlErrorMessage, phoneValidator } from '../../core/utils/form-errors';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-course-detail-page',
  imports: [RouterLink, ReactiveFormsModule, EurPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './course-detail.page.html',
  styleUrl: './course-detail.page.scss',
})
export class CourseDetailPage {
  private readonly api = inject(ApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly titleService = inject(Title);
  private readonly fragment = toSignal(inject(ActivatedRoute).fragment);
  private scrolledToForm = false;

  /** Bound from the `:slug` route parameter. */
  readonly slug = input.required<string>();

  protected readonly site = SITE_CONFIG;
  protected readonly experienceOptions = EXPERIENCE_OPTIONS;

  protected readonly course = rxResource({
    params: () => this.slug(),
    stream: ({ params }) => this.api.getCourse(params),
  });

  protected readonly data = computed(() => (this.course.hasValue() ? this.course.value() : undefined));
  protected readonly notFound = computed(() => {
    const err = this.course.error();
    return err instanceof HttpErrorResponse && err.status === 404;
  });
  protected readonly isKids = computed(() => this.data()?.category === 'deti_mladez');
  protected readonly categoryLabel = computed(() => {
    const c = this.data();
    return c ? COURSE_CATEGORY_SHORT[c.category] : '';
  });
  protected readonly skillPill = computed(() => {
    const c = this.data();
    return c ? SKILL_LEVEL_PILL[c.skill_level] : '';
  });

  /** "What's included" list derived from course data. */
  protected readonly included = computed(() => {
    const c = this.data();
    if (!c) return [];
    const list = ['Vedenie certifikovaným inštruktorom SHS JAMES', 'Vstup do lezeckého centra počas lekcií'];
    if (c.includes_equipment) {
      list.push('Zapožičanie kompletnej výstroje – lezečky, úväz, istítko, magnézium');
    }
    list.push('Malá skupina pre individuálny prístup', 'Úrazové poistenie počas lekcií');
    if (c.category === 'deti_mladez') list.push('Diplom a priateľské preteky na konci polroka');
    return list;
  });

  // ---------------------------------------------------------------- Registration form
  protected readonly form = this.fb.group({
    participant_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    participant_age: this.fb.control<number | null>(null, [Validators.min(3), Validators.max(99)]),
    experience_level: this.fb.control<ExperienceLevel>('ziadne'),
    preferred_schedule_note: ['', Validators.maxLength(200)],
    is_self: [true],
    contact_name: ['', Validators.maxLength(120)],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, phoneValidator]],
    notes: ['', Validators.maxLength(2000)],
    gdpr_consent: [false, Validators.requiredTrue],
  });

  private readonly isSelf = toSignal(this.form.controls.is_self.valueChanges, { initialValue: true });
  protected readonly showContactName = computed(() => this.isKids() || !this.isSelf());

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly submittedName = signal('');

  constructor() {
    effect(() => {
      const c = this.data();
      if (c) this.titleService.setTitle(`${c.title} | ${SITE_CONFIG.name}`);
    });

    // `#prihlaska` links arrive before the course is loaded – scroll once it renders.
    effect(() => {
      if (this.data() && this.fragment() === 'prihlaska' && !this.scrolledToForm) {
        this.scrolledToForm = true;
        setTimeout(() => document.getElementById('prihlaska')?.scrollIntoView({ behavior: 'smooth' }), 60);
      }
    });

    // Kids' clubs: age is mandatory and a parent is the contact person.
    effect(() => {
      const kids = this.isKids();
      const age = this.form.controls.participant_age;
      age.setValidators(
        kids
          ? [Validators.required, Validators.min(5), Validators.max(15)]
          : [Validators.min(3), Validators.max(99)],
      );
      age.updateValueAndValidity({ emitEvent: false });
      if (kids) this.form.controls.is_self.setValue(false);
    });

    effect(() => {
      const contact = this.form.controls.contact_name;
      contact.setValidators(
        this.showContactName()
          ? [Validators.required, Validators.minLength(2), Validators.maxLength(120)]
          : [Validators.maxLength(120)],
      );
      contact.updateValueAndValidity({ emitEvent: false });
    });
  }

  protected error(name: keyof typeof this.form.controls): string | null {
    return controlErrorMessage(this.form.controls[name]);
  }

  protected submit(): void {
    const course = this.data();
    if (!course || this.submitting()) return;
    this.submitError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitError.set('Skontrolujte prosím zvýraznené polia formulára.');
      return;
    }

    const v = this.form.getRawValue();
    const payload: CourseRegistrationPayload = {
      course: course.slug,
      participant_name: v.participant_name.trim(),
      participant_age: v.participant_age === null || (v.participant_age as unknown) === '' ? null : Number(v.participant_age),
      experience_level: v.experience_level,
      preferred_schedule_note: v.preferred_schedule_note.trim(),
      contact_name: (this.showContactName() ? v.contact_name : v.participant_name).trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      notes: v.notes.trim(),
      gdpr_consent: v.gdpr_consent,
    };

    this.submitting.set(true);
    this.api.createRegistration(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submittedName.set(payload.participant_name);
        this.submitted.set(true);
        this.form.reset({ experience_level: 'ziadne', is_self: !this.isKids(), gdpr_consent: false });
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.submitError.set(applyServerErrors(this.form, err));
      },
    });
  }

  protected registerAnother(): void {
    this.submitted.set(false);
  }
}
