import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { ApiService } from '../../core/services/api.service';
import { listValue, listViewState } from '../../core/utils/resource-state';
import { CoachCardComponent } from '../../shared/components/coach-card/coach-card.component';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';
import { StateMessageComponent } from '../../shared/components/state-message/state-message.component';
import { VisitAndPassEstimatorComponent } from '../../shared/components/visit-estimator/visit-estimator.component';
import { ZoneCardComponent } from '../../shared/components/zone-card/zone-card.component';

interface Pillar {
  readonly icon: IconName;
  readonly title: string;
  readonly text: string;
}

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    IconComponent,
    ZoneCardComponent,
    CourseCardComponent,
    CoachCardComponent,
    StateMessageComponent,
    VisitAndPassEstimatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly api = inject(ApiService);
  protected readonly site = SITE_CONFIG;

  protected readonly zones = rxResource({ stream: () => this.api.getZones() });
  protected readonly courses = rxResource({ stream: () => this.api.getCourses({ featured: true }) });
  protected readonly team = rxResource({ stream: () => this.api.getTeam() });

  protected readonly listValue = listValue;
  protected readonly listViewState = listViewState;

  protected readonly highlights: readonly { value: string; label: string }[] = [
    {
      value: `${SITE_CONFIG.facility.totalWallAreaSqm.toLocaleString('sk-SK')} m²`,
      label: 'lezeckej plochy',
    },
    { value: 'Nové cesty', label: 'každý týždeň' },
    { value: `${SITE_CONFIG.facility.autoBelayCount}× auto-belay`, label: 'samoistiace navijaky pre začiatočníkov' },
  ];

  protected readonly pillars: readonly Pillar[] = [
    {
      icon: 'users',
      title: 'Vhodné aj pre úplných začiatočníkov',
      text: 'Nepotrebuješ skúsenosti ani kondíciu. Ľahké farebné okruhy a auto-belay navijaky ťa dostanú na stenu hneď v prvý deň.',
    },
    {
      icon: 'shield',
      title: 'Certifikovaní inštruktori',
      text: 'Náš tím má licencie SHS JAMES a prvú pomoc. Na stene aj na recepcii ti radi poradia s technikou či výberom cesty.',
    },
    {
      icon: 'shoe',
      title: 'Požičovňa kompletnej výstroje na recepcii',
      text: 'Lezečky vo všetkých veľkostiach, úväzy, istítka aj magnézium. Stačí prísť v športovom oblečení.',
    },
    {
      icon: 'mountain',
      title: 'Nové cesty každý týždeň',
      text: 'Naši stavitelia ciest prestavujú každý týždeň jeden sektor. Stena ťa neomrzí ani po roku pravidelného lezenia.',
    },
    {
      icon: 'coffee',
      title: 'Útulné bistro & chill-out zóna',
      text: 'Výberová káva, smoothie a koláče s výhľadom na boulderingovú halu. Ideálne miesto na oddych medzi pokusmi.',
    },
    {
      icon: 'parking',
      title: 'Bezplatné parkovanie',
      text: 'Parkovisko pre 80 áut priamo pred halou a zastávka MHD na pár krokov. Ľahko sa k nám dostaneš odkiaľkoľvek.',
    },
  ];
}
