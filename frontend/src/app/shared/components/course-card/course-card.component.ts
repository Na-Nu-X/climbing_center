import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ClimbingCourse } from '../../../core/models/api.models';
import { COURSE_CATEGORY_SHORT, SKILL_LEVEL_PILL } from '../../../core/models/labels';
import { EurPipe } from '../../../core/utils/eur.pipe';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-course-card',
  imports: [RouterLink, EurPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let c = course();
    <article class="course-card">
      <a class="course-card__media" [routerLink]="['/kurzy', c.slug]" tabindex="-1" aria-hidden="true">
        @if (c.image_url) {
          <img [src]="c.image_url" [alt]="" loading="lazy" decoding="async" width="800" height="560" />
        }
        <span class="badge badge--dark course-card__category">{{ categoryLabel() }}</span>
      </a>

      <div class="course-card__body">
        <span class="course-card__level" [class.is-beginner]="isBeginner()">
          <app-icon [name]="isBeginner() ? 'check' : 'mountain'" [size]="14" />
          {{ skillPill() }}
        </span>

        <h3 class="course-card__title">
          <a [routerLink]="['/kurzy', c.slug]">{{ c.title }}</a>
        </h3>

        <p class="course-card__desc">{{ c.short_description }}</p>

        <dl class="course-card__meta">
          <div>
            <dt><app-icon name="clock" [size]="16" /><span class="visually-hidden">Trvanie</span></dt>
            <dd class="num">{{ c.duration_label }}</dd>
          </div>
          <div>
            <dt><app-icon name="calendar" [size]="16" /><span class="visually-hidden">Termíny</span></dt>
            <dd>{{ c.schedule_info }}</dd>
          </div>
        </dl>

        <div class="course-card__footer">
          <div class="course-card__price">
            <span class="course-card__price-label">Cena kurzu</span>
            <span class="price">{{ c.price_eur | eur: true }}</span>
          </div>
          @if (c.includes_equipment) {
            <span class="badge badge--success">Výstroj v cene</span>
          } @else {
            <span class="badge badge--outline">Vlastná výstroj</span>
          }
        </div>

        <a class="course-card__link text-link" [routerLink]="['/kurzy', c.slug]">
          Detail kurzu <span class="visually-hidden">: {{ c.title }}</span><span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  `,
  styleUrl: './course-card.component.scss',
})
export class CourseCardComponent {
  readonly course = input.required<ClimbingCourse>();

  protected readonly categoryLabel = computed(() => COURSE_CATEGORY_SHORT[this.course().category]);
  protected readonly skillPill = computed(() => SKILL_LEVEL_PILL[this.course().skill_level]);
  protected readonly isBeginner = computed(() => this.course().skill_level === 'uplny_zaciatocnik');
}
