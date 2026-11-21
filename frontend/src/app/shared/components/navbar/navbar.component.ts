import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';

interface NavLink {
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  host: {
    '(window:scroll)': 'onScroll()',
    '(document:keydown.escape)': 'closeMenu()',
  },
})
export class NavbarComponent {
  protected readonly site = SITE_CONFIG;
  protected readonly links: readonly NavLink[] = [
    { label: 'Stena & Zóny', path: '/stena-a-zony' },
    { label: 'Cenník', path: '/cennik' },
    { label: 'Kurzy a krúžky', path: '/kurzy' },
    { label: 'Akcie & Firmy', path: '/akcie-a-teambuilding' },
    { label: 'Prvá návšteva', path: '/prva-navsteva-a-kontakt' },
  ];

  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);

  private readonly document = inject(DOCUMENT);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.closeMenu());

    // Lock page scroll while the mobile drawer is open.
    effect(() => {
      this.document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected onScroll(): void {
    const isScrolled = (this.document.defaultView?.scrollY ?? 0) > 8;
    if (isScrolled !== this.scrolled()) this.scrolled.set(isScrolled);
  }
}
