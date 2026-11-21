# PREVIS – Climbing Center Website (white-label)

Full-stack website for an indoor climbing & bouldering center: zones, transparent pricing with a visit
estimator, a course catalog with online registration, and group event / teambuilding inquiries.
The UI is in Slovak; code and docs are in English.

| Part | Stack | Directory |
| --- | --- | --- |
| API & admin | Python 3, Django, Django REST Framework, django-filter, django-cors-headers | `backend/` |
| Website | Angular (standalone components, Signals, strict TypeScript), pure SCSS | `frontend/` |

---

## Quick start

### 1. Backend (Django API on http://localhost:8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # optional – defaults work for local development
python manage.py migrate
python manage.py seed_data         # demo content (safe to run repeatedly)
python manage.py createsuperuser   # account for the admin panel
python manage.py runserver         # http://localhost:8000
```

### 2. Frontend (Angular on http://localhost:4200)

```bash
cd frontend
npm install
npm start                          # = ng serve → http://localhost:4200
```

The frontend calls the API at `http://localhost:8000/api` (`frontend/src/environments/environment.ts`).
If port 8000 is taken on your machine, run `python manage.py runserver 8001` and update `apiUrl`.

### 3. Admin panel

Open **http://localhost:8000/admin/** and log in with the superuser you created. Gym staff can manage:

- **Zóny lezeckého centra** – heights, wall area, route counts (update after each route-setting session)
- **Cenník** – entry, pass and rental prices, edited inline. The *Použitie v kalkulačke návštevy* field
  links an item to the website's visit estimator.
- **Kurzy, tréningy a krúžky** – schedule, price, syllabus (`what_you_will_learn` is a JSON list), featured flag
- **Tím inštruktorov** – instructors and route setters
- **Prihlášky na kurzy** – incoming registrations, with bulk actions *potvrdená / zaradená / zrušená*
- **Dopyty na teambuildingy, oslavy a školy**, **Správy z kontaktného formulára** – mark as processed

---

## REST API (`/api/`)

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET | `/api/zones/` | Climbing & facility zones |
| GET | `/api/pricing/` | Filter: `?category=jednorazove\|permanentky\|pozicovna`, `?popular=true` |
| GET | `/api/pricing/grouped/` | Pricing grouped by category |
| GET | `/api/courses/` | Filters: `category`, `skill_level`, `featured=true`, `search`, `ordering` (`price_eur`, `-price_eur`, `title`) |
| GET | `/api/courses/<slug>/` | Full course detail incl. learning outcomes |
| GET | `/api/team/` | Instructors & route setters |
| POST | `/api/registrations/` | Course registration (course slug, GDPR consent required) |
| POST | `/api/events/` | Teambuilding / birthday / school inquiry |
| POST | `/api/contact/` | General contact message |

POST endpoints are write-only (personal data is never listed back) and rate-limited
(`API_FORMS_THROTTLE`, default `20/hour`). Validation errors come back in Slovak.

---

## Rebranding for a new client

1. **Business data & branding** – edit `frontend/src/app/core/config/site.config.ts`: name, wordmark,
   tagline, phone, emails, address, parking/transit, IČO/DIČ, wall area & height, route-setting note,
   opening hours, social links, trust metrics, hero image and estimator fallback prices.
2. **Colors & fonts** – edit the palette in `frontend/src/styles/_variables.scss` (exposed as CSS custom
   properties in `_theme.scss`) and the Google Fonts link in `frontend/src/index.html`.
3. **Content** – zones, prices, courses and team are edited in the Django admin, or by changing
   `backend/climbing/management/commands/seed_data.py`.
4. **Photos** – demo images come from Unsplash; replace the URLs (in admin or the seed command) with the
   gym's own photography before launch.

### Frontend structure

```
frontend/src/
├── styles/            _variables, _mixins, _typography, _theme (CSS custom properties)
└── app/
    ├── core/          config/site.config.ts, models, services (API, pricing store), utils
    ├── shared/        navbar, footer, course-card, visit-estimator, zone/coach cards, page-hero…
    └── pages/         home, zones, pricing, courses, course-detail, events, first-visit, not-found
```

| Route | Page |
| --- | --- |
| `/` | Home |
| `/stena-a-zony` | Zones & team |
| `/cennik` | Pricing + visit estimator |
| `/kurzy`, `/kurzy/:slug` | Course catalog, course detail + online registration |
| `/akcie-a-teambuilding` | Group events + inquiry form |
| `/prva-navsteva-a-kontakt` | First visit guide, FAQ & safety rules, contact |

---

## Checks

```bash
cd backend && python manage.py check && python manage.py test climbing
cd frontend && npx ng build
```

## Production notes

- Set `DJANGO_DEBUG=False`, a strong `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, and
  `DATABASE_URL=postgres://…` in `backend/.env`; install `requirements-prod.txt` (psycopg, gunicorn).
- Run `python manage.py collectstatic` and serve Django with gunicorn behind a reverse proxy.
- `ng build` outputs to `frontend/dist/frontend/browser`. The production build calls the API at `/api`
  (same domain), so proxy `/api/` and `/admin/` to Django and serve everything else from the
  Angular build with an `index.html` fallback for client-side routes.
- Set `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS` if the frontend lives on a different domain.
