import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CoachMember } from '../../../core/models/api.models';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-coach-card',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let m = member();
    <article class="coach">
      <div class="coach__photo">
        @if (m.photo_url) {
          <img [src]="m.photo_url" [alt]="'Foto: ' + m.full_name" loading="lazy" decoding="async" width="600" height="720" />
        }
      </div>
      <div class="coach__body">
        <p class="coach__role">{{ m.role_title }}</p>
        <h3 class="coach__name">{{ m.full_name }}</h3>
        @if (m.certifications) {
          <p class="coach__cert"><app-icon name="shield" [size]="16" />{{ m.certifications }}</p>
        }
        @if (showBio() && m.bio) {
          <p class="coach__bio">{{ m.bio }}</p>
        }
      </div>
    </article>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    :host {
      display: block;
      height: 100%;
    }

    .coach {
      @include card;
      @include zoom-trigger;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      &__photo {
        @include zoom-media(5, 6);
        img {
          filter: grayscale(0.25);
        }
      }

      &__body {
        display: grid;
        gap: $space-2;
        padding: $space-5;
      }

      &__role {
        @include eyebrow;
        font-size: 0.68rem;
        color: var(--color-accent);
        line-height: 1.5;
      }

      &__name {
        font-size: 1.2rem;
      }

      &__cert {
        display: flex;
        gap: $space-2;
        font-size: 0.82rem;
        color: var(--color-success);
        font-weight: 500;

        app-icon {
          margin-top: 2px;
        }
      }

      &__bio {
        font-size: 0.9rem;
        color: var(--color-text-muted);
      }
    }
  `,
})
export class CoachCardComponent {
  readonly member = input.required<CoachMember>();
  readonly showBio = input(true);
}
