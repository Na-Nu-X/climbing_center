import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { PRICING_CATEGORIES } from '../../core/models/labels';
import { PricingStore } from '../../core/services/pricing.store';
import { EurPipe } from '../../core/utils/eur.pipe';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';
import { StateMessageComponent } from '../../shared/components/state-message/state-message.component';
import { VisitAndPassEstimatorComponent } from '../../shared/components/visit-estimator/visit-estimator.component';

@Component({
  selector: 'app-pricing-page',
  imports: [
    RouterLink,
    EurPipe,
    IconComponent,
    PageHeroComponent,
    StateMessageComponent,
    VisitAndPassEstimatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pricing.page.html',
  styleUrl: './pricing.page.scss',
})
export class PricingPage {
  private readonly store = inject(PricingStore);
  protected readonly site = SITE_CONFIG;

  protected readonly state = computed(() => {
    if (this.store.items().length) return 'ready' as const;
    if (this.store.error()) return 'error' as const;
    return 'loading' as const;
  });

  protected readonly groups = computed(() =>
    PRICING_CATEGORIES.map((category) => ({
      ...category,
      items: this.store.items().filter((item) => item.category === category.value),
    })).filter((group) => group.items.length > 0),
  );

  constructor() {
    this.store.load();
  }

  protected retry(): void {
    this.store.error.set(false);
    this.store.load();
  }
}
