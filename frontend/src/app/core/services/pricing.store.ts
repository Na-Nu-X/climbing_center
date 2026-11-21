import { Injectable, computed, inject, signal } from '@angular/core';

import { SITE_CONFIG } from '../config/site.config';
import { ClimbingCourse, PricingPass } from '../models/api.models';
import { ApiService } from './api.service';

export type EstimatorPrices = typeof SITE_CONFIG.estimatorFallbackPrices;

/**
 * Shared, lazily-loaded pricing state. Used by the pricing page and by every
 * instance of the visit estimator so the API is hit only once per session.
 */
@Injectable({ providedIn: 'root' })
export class PricingStore {
  private readonly api = inject(ApiService);

  readonly items = signal<PricingPass[]>([]);
  readonly introCourse = signal<ClimbingCourse | null>(null);
  readonly loading = signal(false);
  readonly error = signal(false);
  private requested = false;

  /** Prices for the estimator: live values where linked in the admin, else config fallbacks. */
  readonly estimatorPrices = computed<EstimatorPrices>(() => {
    const prices: { -readonly [K in keyof EstimatorPrices]: number } = { ...SITE_CONFIG.estimatorFallbackPrices };
    for (const item of this.items()) {
      if (item.estimator_key) prices[item.estimator_key] = Number(item.price_eur);
    }
    const intro = this.introCourse();
    if (intro) prices.intro_course = Number(intro.price_eur);
    return prices;
  });

  load(): void {
    if (this.requested) return;
    this.requested = true;
    this.loading.set(true);

    this.api.getPricing().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
        this.requested = false; // allow retry on next visit
      },
    });

    this.api.getCourses({ category: 'zaciatocnici' }).subscribe({
      next: (courses) =>
        this.introCourse.set(courses.find((c) => c.slug === SITE_CONFIG.introCourseSlug) ?? null),
      error: () => this.introCourse.set(null),
    });
  }
}
