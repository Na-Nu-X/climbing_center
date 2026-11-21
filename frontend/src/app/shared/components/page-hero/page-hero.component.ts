import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Dark granite header band used by inner pages. Extra content is projected below the lead. */
@Component({
  selector: 'app-page-hero',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumbs" aria-label="Omrvinková navigácia">
          <a routerLink="/">Domov</a>
          <span aria-hidden="true">/</span>
          @if (parent(); as p) {
            <a [routerLink]="p.path">{{ p.label }}</a>
            <span aria-hidden="true">/</span>
          }
          <span aria-current="page">{{ crumb() }}</span>
        </nav>
        <p class="eyebrow">{{ eyebrow() }}</p>
        <h1>{{ title() }}</h1>
        @if (lead()) {
          <p class="lead">{{ lead() }}</p>
        }
        <ng-content />
      </div>
    </section>
  `,
})
export class PageHeroComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly lead = input<string>('');
  readonly crumb = input.required<string>();
  readonly parent = input<{ label: string; path: string } | null>(null);
}
