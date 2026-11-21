import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

/** Loading skeletons, error-with-retry and empty states for API-backed sections. */
@Component({
  selector: 'app-state-message',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (state()) {
      @case ('loading') {
        <div class="skeletons" [style.--cols]="columns()" aria-busy="true" aria-label="Načítavame obsah">
          @for (i of placeholders(); track i) {
            <div class="skeleton" [style.height.px]="height()"></div>
          }
        </div>
      }
      @case ('error') {
        <div class="message message--error" role="alert">
          <app-icon name="info" [size]="22" />
          <div>
            <strong>Obsah sa nepodarilo načítať.</strong>
            <p>Server je možno dočasne nedostupný. Skúste to prosím znova o chvíľu.</p>
          </div>
          <button type="button" class="btn btn--outline btn--sm" (click)="retry.emit()">Skúsiť znova</button>
        </div>
      }
      @case ('empty') {
        <div class="message">
          <app-icon name="mountain" [size]="22" />
          <div>
            <strong>{{ emptyTitle() }}</strong>
            <p>{{ emptyText() }}</p>
          </div>
          <ng-content />
        </div>
      }
    }
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .skeletons {
      display: grid;
      gap: $space-5;

      @include mq(md) {
        grid-template-columns: repeat(min(var(--cols), 2), minmax(0, 1fr));
      }
      @include mq(lg) {
        grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
      }
    }

    .message {
      @include card;
      display: grid;
      gap: $space-4;
      align-items: center;
      padding: $space-5 $space-6;

      @include mq(md) {
        grid-template-columns: auto 1fr auto;
      }

      app-icon {
        color: var(--color-accent);
      }

      strong {
        font-family: var(--font-display);
        font-size: 1.1rem;
      }

      p {
        color: var(--color-text-muted);
        font-size: 0.92rem;
      }

      &--error app-icon {
        color: var(--color-danger);
      }
    }
  `,
})
export class StateMessageComponent {
  readonly state = input.required<'loading' | 'error' | 'empty' | 'ready'>();
  readonly columns = input(3);
  readonly count = input(3);
  readonly height = input(380);
  readonly emptyTitle = input('Nič sme nenašli.');
  readonly emptyText = input('Skúste zmeniť filter alebo nás kontaktujte.');
  readonly retry = output<void>();

  protected placeholders(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}
