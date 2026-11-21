import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ClimbingZone } from '../../../core/models/api.models';
import { SkDecimalPipe } from '../../../core/utils/eur.pipe';

@Component({
  selector: 'app-zone-card',
  imports: [SkDecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let z = zone();
    <article class="zone" [class.zone--wide]="wide()" [id]="z.slug">
      <div class="zone__media">
        @if (z.image_url) {
          <img [src]="z.image_url" [alt]="z.name" loading="lazy" decoding="async" width="1200" height="900" />
        }
        <div class="zone__stats">
          @if (z.max_height_meters) {
            <span class="zone__stat"
              ><span class="num">{{ z.max_height_meters | skDecimal }} m</span><small>výška</small></span
            >
          }
          @if (z.wall_area_sqm) {
            <span class="zone__stat"
              ><span class="num">{{ z.wall_area_sqm }} m²</span><small>plocha</small></span
            >
          }
        </div>
      </div>
      <div class="zone__body">
        <h3 class="zone__title">{{ z.name }}</h3>
        @if (z.difficulty_scale) {
          <p class="zone__grade"><span class="badge badge--outline num">{{ z.difficulty_scale }}</span></p>
        }
        @if (showDescription()) {
          <p class="zone__desc">{{ z.description }}</p>
        }
        @if (z.routes_count_label) {
          <p class="zone__routes">{{ z.routes_count_label }}</p>
        }
      </div>
    </article>
  `,
  styleUrl: './zone-card.component.scss',
})
export class ZoneCardComponent {
  readonly zone = input.required<ClimbingZone>();
  readonly showDescription = input(true);
  readonly wide = input(false);
}
