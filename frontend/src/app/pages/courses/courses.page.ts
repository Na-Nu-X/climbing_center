import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { CourseCategory, CourseFilters, SkillLevel } from '../../core/models/api.models';
import { COURSE_CATEGORY_FILTERS, SKILL_LEVEL_OPTIONS } from '../../core/models/labels';
import { ApiService } from '../../core/services/api.service';
import { listValue, listViewState } from '../../core/utils/resource-state';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';
import { StateMessageComponent } from '../../shared/components/state-message/state-message.component';

const VALID_CATEGORIES = new Set<string>(['zaciatocnici', 'lano_istenie', 'deti_mladez', 'treningy']);

@Component({
  selector: 'app-courses-page',
  imports: [RouterLink, PageHeroComponent, CourseCardComponent, StateMessageComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './courses.page.html',
  styleUrl: './courses.page.scss',
})
export class CoursesPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  /** Bound from the `?kategoria=` query parameter (shareable filter URLs). */
  readonly kategoria = input<string | undefined>();

  protected readonly categoryFilters = COURSE_CATEGORY_FILTERS;
  protected readonly skillOptions = SKILL_LEVEL_OPTIONS;
  protected readonly orderingOptions = [
    { value: '', label: 'Odporúčané' },
    { value: 'price_eur', label: 'Cena od najnižšej' },
    { value: '-price_eur', label: 'Cena od najvyššej' },
    { value: 'title', label: 'Abecedne' },
  ] as const;

  protected readonly category = computed<CourseCategory | null>(() => {
    const value = this.kategoria();
    return value && VALID_CATEGORIES.has(value) ? (value as CourseCategory) : null;
  });
  protected readonly skillLevel = signal<SkillLevel | null>(null);
  protected readonly ordering = signal('');
  protected readonly searchInput = signal('');
  private readonly search = toSignal(
    toObservable(this.searchInput).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );

  private readonly filters = computed<CourseFilters>(() => ({
    category: this.category(),
    skill_level: this.skillLevel(),
    search: this.search(),
    ordering: this.ordering(),
  }));

  protected readonly courses = rxResource({
    params: () => this.filters(),
    stream: ({ params }) => this.api.getCourses(params),
  });

  protected readonly listValue = listValue;
  protected readonly listViewState = listViewState;
  protected readonly hasExtraFilters = computed(
    () => !!this.skillLevel() || !!this.searchInput().trim() || !!this.ordering(),
  );

  protected selectCategory(value: CourseCategory | null): void {
    void this.router.navigate([], {
      queryParams: { kategoria: value },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected onSkillChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.skillLevel.set(value ? (value as SkillLevel) : null);
  }

  protected onOrderingChange(event: Event): void {
    this.ordering.set((event.target as HTMLSelectElement).value);
  }

  protected onSearch(event: Event): void {
    this.searchInput.set((event.target as HTMLInputElement).value);
  }

  protected resetFilters(): void {
    this.skillLevel.set(null);
    this.ordering.set('');
    this.searchInput.set('');
    this.selectCategory(null);
  }
}
