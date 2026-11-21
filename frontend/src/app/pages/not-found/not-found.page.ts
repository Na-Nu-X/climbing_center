import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-hero not-found">
      <div class="container">
        <p class="eyebrow">Chyba 404</p>
        <h1>Táto cesta nikam nevedie.</h1>
        <p class="lead">Stránku sme nenašli – možno sme ju práve prestavali ako boulder. Skús to odznova zo zeme.</p>
        <div class="actions">
          <a class="btn btn--primary" routerLink="/">Späť na úvod <span class="arrow">→</span></a>
          <a class="btn btn--ghost-light" routerLink="/kurzy">Kurzy a krúžky</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .not-found {
      min-height: 60vh;
      display: flex;
      align-items: center;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
  `,
})
export class NotFoundPage {}
