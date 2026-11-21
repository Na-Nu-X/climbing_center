import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { ApiService } from '../../core/services/api.service';
import { SkDecimalPipe } from '../../core/utils/eur.pipe';
import { listValue, listViewState } from '../../core/utils/resource-state';
import { CoachCardComponent } from '../../shared/components/coach-card/coach-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';
import { StateMessageComponent } from '../../shared/components/state-message/state-message.component';

@Component({
  selector: 'app-zones-page',
  imports: [RouterLink, PageHeroComponent, StateMessageComponent, CoachCardComponent, IconComponent, SkDecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      eyebrow="Stena & zóny"
      title="Lezecké zóny pre každú úroveň"
      crumb="Stena & Zóny"
      [lead]="
        'Bouldering, vysoké steny s lanom, tréningová zóna aj detský svet – na ' +
        site.facility.totalWallAreaSqm.toLocaleString('sk-SK') +
        ' m² pod jednou strechou.'
      "
    >
      <dl class="facts">
        <div>
          <dt>Lezecká plocha</dt>
          <dd class="num">{{ site.facility.totalWallAreaSqm.toLocaleString('sk-SK') }} m²</dd>
        </div>
        <div>
          <dt>Najvyššia stena</dt>
          <dd class="num">{{ site.facility.maxWallHeightM | skDecimal }} m</dd>
        </div>
        <div>
          <dt>Obtiažnosti</dt>
          <dd class="num">{{ site.facility.gradeRange }}</dd>
        </div>
        <div>
          <dt>Auto-belay</dt>
          <dd class="num">{{ site.facility.autoBelayCount }} navijakov</dd>
        </div>
      </dl>
    </app-page-hero>

    <section class="section" aria-label="Zóny">
      <div class="container">
        @if (listViewState(zones) === 'ready') {
          <div class="zone-list">
            @for (z of listValue(zones); track z.id; let i = $index) {
              <article class="zone-row" [id]="z.slug" [class.zone-row--flip]="i % 2 === 1">
                <div class="zone-row__media">
                  <img [src]="z.image_url" [alt]="z.name" loading="lazy" decoding="async" width="1200" height="900" />
                  <span class="zone-row__index num">0{{ i + 1 }}</span>
                </div>
                <div class="zone-row__body">
                  <h2 class="h2">{{ z.name }}</h2>
                  <p class="lead">{{ z.description }}</p>
                  <dl class="zone-row__specs">
                    @if (z.max_height_meters) {
                      <div>
                        <dt>Výška</dt>
                        <dd class="num">{{ z.max_height_meters | skDecimal }} m</dd>
                      </div>
                    }
                    @if (z.wall_area_sqm) {
                      <div>
                        <dt>Plocha</dt>
                        <dd class="num">{{ z.wall_area_sqm }} m²</dd>
                      </div>
                    }
                    @if (z.difficulty_scale) {
                      <div>
                        <dt>Obtiažnosť</dt>
                        <dd class="num">{{ z.difficulty_scale }}</dd>
                      </div>
                    }
                  </dl>
                  @if (z.routes_count_label) {
                    <p class="zone-row__routes"><app-icon name="mountain" [size]="18" />{{ z.routes_count_label }}</p>
                  }
                </div>
              </article>
            }
          </div>
        } @else {
          <app-state-message [state]="listViewState(zones)" [columns]="2" [count]="2" (retry)="zones.reload()" />
        }
      </div>
    </section>

    <section class="section section--dark section--tight" aria-labelledby="setting-title">
      <div class="container setting">
        <div>
          <p class="eyebrow">Route setting</p>
          <h2 id="setting-title" class="h2">Stena, ktorá sa mení každý týždeň</h2>
        </div>
        <div class="setting__text">
          <p class="lead">{{ site.facility.routeSettingNote }}</p>
          <p class="muted">{{ site.openingHoursNote }}</p>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="team-title">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Náš tím</p>
          <h2 id="team-title">Stavitelia ciest a certifikovaní inštruktori</h2>
          <p class="lead">Za každým boulderom aj každým kurzom stojí niekto, kto lezie roky a rád sa o to podelí.</p>
        </div>
        @if (listViewState(team) === 'ready') {
          <div class="grid grid--4">
            @for (m of listValue(team); track m.id) {
              <app-coach-card [member]="m" />
            }
          </div>
        } @else {
          <app-state-message [state]="listViewState(team)" [columns]="4" [count]="4" (retry)="team.reload()" />
        }
        <div class="cta-row">
          <a class="btn btn--primary" routerLink="/kurzy">Kurzy s našimi inštruktormi <span class="arrow">→</span></a>
          <a class="btn btn--outline" routerLink="/cennik">Cenník vstupného</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .facts {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: $space-4;
      margin: $space-5 0 0;
      max-width: 820px;

      @include mq(md) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      div {
        padding-top: $space-3;
        border-top: 2px solid var(--color-accent);
      }

      dt {
        font-size: 0.8rem;
        color: var(--color-on-dark-muted);
      }

      dd {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 600;
      }
    }

    .zone-list {
      display: grid;
      gap: $space-8;
    }

    .zone-row {
      display: grid;
      gap: $space-5;
      align-items: center;

      @include mq(lg) {
        grid-template-columns: 1.1fr 1fr;
        gap: $space-8;

        &--flip .zone-row__media {
          order: 2;
        }
      }

      &__media {
        @include zoom-media(4, 3);
        @include zoom-trigger;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
      }

      &__index {
        position: absolute;
        top: $space-4;
        left: $space-4;
        padding: $space-1 $space-3;
        border-radius: var(--radius-sm);
        background: var(--color-accent);
        color: var(--color-on-accent);
        font-weight: 600;
      }

      &__body {
        display: grid;
        gap: $space-5;
      }

      &__specs {
        display: flex;
        flex-wrap: wrap;
        gap: $space-3;
        margin: 0;

        div {
          @include card;
          padding: $space-3 $space-4;
          min-width: 120px;
        }

        dt {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted);
        }

        dd {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }
      }

      &__routes {
        display: flex;
        gap: $space-2;
        align-items: center;
        font-weight: 600;
        color: var(--color-success);
      }
    }

    .setting {
      display: grid;
      gap: $space-5;

      @include mq(lg) {
        grid-template-columns: 1fr 1fr;
        align-items: end;
      }

      &__text {
        display: grid;
        gap: $space-3;
      }
    }

    .cta-row {
      display: flex;
      flex-wrap: wrap;
      gap: $space-3;
      margin-top: $space-7;
    }
  `,
})
export class ZonesPage {
  private readonly api = inject(ApiService);
  protected readonly site = SITE_CONFIG;
  protected readonly zones = rxResource({ stream: () => this.api.getZones() });
  protected readonly team = rxResource({ stream: () => this.api.getTeam() });
  protected readonly listValue = listValue;
  protected readonly listViewState = listViewState;
}
