import { Routes } from '@angular/router';

import { SITE_CONFIG } from './core/config/site.config';

const title = (page: string) => `${page} | ${SITE_CONFIG.name}`;

export const routes: Routes = [
  {
    path: '',
    title: `${SITE_CONFIG.name} – bouldering, lezenie s lanom a kurzy`,
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'stena-a-zony',
    title: title('Stena & lezecké zóny'),
    loadComponent: () => import('./pages/zones/zones.page').then((m) => m.ZonesPage),
  },
  {
    path: 'cennik',
    title: title('Cenník vstupného, permanentiek a požičovne'),
    loadComponent: () => import('./pages/pricing/pricing.page').then((m) => m.PricingPage),
  },
  {
    path: 'kurzy',
    title: title('Kurzy, krúžky a tréningy'),
    loadComponent: () => import('./pages/courses/courses.page').then((m) => m.CoursesPage),
  },
  {
    path: 'kurzy/:slug',
    title: title('Detail kurzu a online prihláška'),
    loadComponent: () => import('./pages/course-detail/course-detail.page').then((m) => m.CourseDetailPage),
  },
  {
    path: 'akcie-a-teambuilding',
    title: title('Teambuildingy, oslavy a školy'),
    loadComponent: () => import('./pages/events/events.page').then((m) => m.EventsPage),
  },
  {
    path: 'prva-navsteva-a-kontakt',
    title: title('Prvá návšteva, pravidlá & kontakt'),
    loadComponent: () =>
      import('./pages/first-visit/first-visit.page').then((m) => m.FirstVisitPage),
  },
  {
    path: '**',
    title: title('Stránka nenájdená'),
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
