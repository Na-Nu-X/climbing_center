import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected readonly site = SITE_CONFIG;
  protected readonly year = new Date().getFullYear();
  protected readonly quickLinks = [
    { label: 'Stena & lezecké zóny', path: '/stena-a-zony' },
    { label: 'Cenník a permanentky', path: '/cennik' },
    { label: 'Kurzy a krúžky', path: '/kurzy' },
    { label: 'Teambuildingy a oslavy', path: '/akcie-a-teambuilding' },
    { label: 'Prvá návšteva & kontakt', path: '/prva-navsteva-a-kontakt' },
  ] as const;
}
