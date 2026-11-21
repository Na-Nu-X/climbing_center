import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'arrow-right'
  | 'phone'
  | 'mail'
  | 'pin'
  | 'clock'
  | 'calendar'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'menu'
  | 'close'
  | 'plus'
  | 'minus'
  | 'check'
  | 'shield'
  | 'users'
  | 'shoe'
  | 'rope'
  | 'coffee'
  | 'mountain'
  | 'chevron-down'
  | 'parking'
  | 'tram'
  | 'star'
  | 'info';

/** Lightweight inline SVG icon set (stroke icons, 24×24, inherits `currentColor`). */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      @switch (name()) {
        @case ('arrow-right') {
          <path d="M5 12h14M13 6l6 6-6 6" />
        }
        @case ('phone') {
          <path
            d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"
          />
        }
        @case ('mail') {
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        }
        @case ('pin') {
          <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
          <circle cx="12" cy="10" r="2.5" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        }
        @case ('calendar') {
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        }
        @case ('instagram') {
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
        }
        @case ('facebook') {
          <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v4H8v7h4v-7h3l.5-4H12V7.8c0-.5.4-.8.8-.8H15z" />
        }
        @case ('youtube') {
          <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
          <path d="m10 9 5 3-5 3z" fill="currentColor" />
        }
        @case ('menu') {
          <path d="M3 7h18M3 12h18M3 17h18" />
        }
        @case ('close') {
          <path d="M6 6l12 12M18 6 6 18" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('minus') {
          <path d="M5 12h14" />
        }
        @case ('check') {
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        }
        @case ('shield') {
          <path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6z" />
          <path d="m9 12 2 2 4-4" />
        }
        @case ('users') {
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" />
          <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.9.7 3.1 2.4 3.5 5.2" />
        }
        @case ('shoe') {
          <path d="M3 16.5V9.5l4-2 2.5 3.5c2 .2 4 1 5.6 2.2L21 14.5c.6.4 1 1 1 1.8v.2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M3 18.5h19" />
        }
        @case ('rope') {
          <circle cx="12" cy="6" r="3" />
          <path d="M12 9v4M8 13h8l-1 8H9z" />
        }
        @case ('coffee') {
          <path d="M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z" />
          <path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3" />
        }
        @case ('mountain') {
          <path d="m2.5 20 7-12 4 6.5 2.5-3.5 5.5 9z" />
          <path d="m7.5 11.5 2 1.5 2-1" />
        }
        @case ('chevron-down') {
          <path d="m6 9 6 6 6-6" />
        }
        @case ('parking') {
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M9.5 17V7h3.5a3 3 0 0 1 0 6H9.5" />
        }
        @case ('tram') {
          <rect x="5" y="4" width="14" height="13" rx="3" />
          <path d="M5 11h14M9 21l-2-4M15 21l2-4M9 2h6" />
          <circle cx="9" cy="14" r="0.6" fill="currentColor" />
          <circle cx="15" cy="14" r="0.6" fill="currentColor" />
        }
        @case ('star') {
          <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
        }
        @case ('info') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 7.5v.5" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      line-height: 0;
    }
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input<number>(20);
}
