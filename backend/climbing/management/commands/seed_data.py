"""
Idempotent demo content for the climbing center.

Run `python manage.py seed_data` any number of times: records are matched on a
natural key (slug / title / name) and updated in place, never duplicated.
"""

from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from climbing.models import ClimbingCourse, ClimbingZone, CoachMember, PricingPass


def unsplash(photo_id: str, width: int = 1600, extra: str = "") -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w={width}&q=80{extra}"


# Verified Unsplash photos (replace with the gym's own photography for production).
IMG_BOULDER_INDOOR = "1564769662533-4f00a87b4056"
IMG_ROPE_CLIMBER = "1601224748193-d24f166b5c77"
IMG_OVERHANG = "1522163182402-834f871fd851"
IMG_ROPE_DETAIL = "1516592673884-4a382d1124c2"
IMG_TRAINING = "1541534741688-6078c6bfb5c5"
IMG_KID = "1503454537195-1dcabb73ffb9"
IMG_BISTRO = "1554118811-1e0d58224f24"

ZONES = [
    {
        "slug": "boulderingova-hala",
        "name": "Boulderingová hala (4,5 m)",
        "max_height_meters": Decimal("4.5"),
        "wall_area_sqm": 620,
        "routes_count_label": "130+ boulderov • každý týždeň nové cesty",
        "difficulty_scale": "Začiatočníci až 8B",
        "description": (
            "Srdce nášho centra. Lezieš bez lana nad hrubými dopadovými matracmi, takže stačia "
            "lezečky a chuť skúsiť to. Farebné okruhy od úplne ľahkých „schodov“ až po silové "
            "previsy – každý týždeň prestavujeme jeden sektor, aby ťa stena nikdy neomrzela."
        ),
        "image_url": unsplash(IMG_BOULDER_INDOOR),
        "display_order": 1,
    },
    {
        "slug": "stena-s-lanom-auto-belay",
        "name": "Stena s lanom & Auto-Belay navijaky (16,5 m)",
        "max_height_meters": Decimal("16.5"),
        "wall_area_sqm": 580,
        "routes_count_label": "70+ ciest na lane • 6 samoistiacich navijakov",
        "difficulty_scale": "4a – 8b+",
        "description": (
            "Vysoké steny pre lezenie na top-rope aj ako prvolezec. Šesť automatických navijakov "
            "(auto-belay) ťa bezpečne istí aj vtedy, keď prídeš sám a ešte nevieš istiť – ideálne "
            "na prvé metre nad zemou."
        ),
        "image_url": unsplash(IMG_ROPE_CLIMBER),
        "display_order": 2,
    },
    {
        "slug": "treningova-zona",
        "name": "Tréningová zóna (Kilter Board & Campus)",
        "max_height_meters": Decimal("3.5"),
        "wall_area_sqm": 120,
        "routes_count_label": "Kilter Board 40° • campus board • hangboardy",
        "difficulty_scale": "6A – 8C",
        "description": (
            "Interaktívny Kilter Board s tisíckami problémov v aplikácii, campus board, hangboardy, "
            "kruhy a strečingová zóna. Miesto, kde sa z rekreačných lezcov stávajú silní lezci."
        ),
        "image_url": unsplash(IMG_TRAINING),
        "display_order": 3,
    },
    {
        "slug": "detsky-lezecky-svet",
        "name": "Detský lezecký svet",
        "max_height_meters": Decimal("3.0"),
        "wall_area_sqm": 80,
        "routes_count_label": "Hravé steny, šmykľavka a farebné chyty",
        "difficulty_scale": "Pre deti od 3 rokov",
        "description": (
            "Nízke steny s mäkkými dopadmi, hravými chytmi v tvare zvieratiek a úlohami na "
            "rovnováhu. Deti sa tu hrajú, rodičia môžu odpočívať na dohľad z lavičky."
        ),
        "image_url": unsplash(IMG_KID),
        "display_order": 4,
    },
    {
        "slug": "lezecke-bistro-chill-out",
        "name": "Lezecké bistro & Chill-out zóna",
        "max_height_meters": None,
        "wall_area_sqm": None,
        "routes_count_label": "Výberová káva • smoothie • domáce koláče",
        "difficulty_scale": "",
        "description": (
            "Výhľad na boulderingovú halu, výberová káva, proteínové smoothie a poctivé "
            "bagety. Miesto na oddych medzi pokusmi aj na pracovné stretnutie po tréningu."
        ),
        "image_url": unsplash(IMG_BISTRO),
        "display_order": 5,
    },
]

PRICING = [
    # Single entries
    ("jednorazove", "Jednorazový vstup – Dospelý", "Neobmedzený čas vstupu počas celého dňa", "13.00", False, 1),
    ("jednorazove", "Jednorazový vstup – Študent / Junior (do 26 r.)", "Pri vstupe preukážte platný študentský preukaz", "11.00", True, 2),
    ("jednorazove", "Detský vstup (do 14 rokov)", "Deti do 14 rokov lezú v sprievode dospelej osoby", "8.00", False, 3),
    ("jednorazove", "Rodinný vstup (2 dospelí + 2 deti)", "Každé ďalšie dieťa len 5 €", "34.00", False, 4),
    ("jednorazove", "Ranný vstup (Po – Pi do 14:00)", "Pre dospelých aj študentov – menej ľudí, viac stien", "10.00", False, 5),
    # Passes & memberships
    ("permanentky", "Permanentka 10 vstupov", "Platnosť 6 mesiacov od zakúpenia • prenosná", "115.00", True, 1),
    ("permanentky", "Mesačná neobmedzená permanentka", "Lez koľkokrát chceš počas 30 dní", "59.00", False, 2),
    ("permanentky", "Ročné členstvo", "Neobmedzený vstup + 10 % zľava na kurzy a v bistre", "549.00", False, 3),
    # Gear rental
    ("pozicovna", "Požičanie lezečiek", "Dezinfikované po každom použití • veľkosti 28 – 48", "4.00", True, 1),
    ("pozicovna", "Požičanie úväzu", "Nastaviteľné úväzy pre deti aj dospelých", "3.00", False, 2),
    ("pozicovna", "Vrecko s magnéziom", "Tekuté aj práškové magnézium na lepší úchop", "2.00", False, 3),
    ("pozicovna", "Kompletný set na lano (lezečky + úväz + istítko)", "Všetko, čo potrebuješ na lezenie s lanom", "8.00", False, 4),
]

COURSES = [
    {
        "slug": "prve-kroky-na-stene",
        "title": "Prvé kroky na stene – Úvodný kurz s inštruktorom",
        "category": "zaciatocnici",
        "skill_level": "uplny_zaciatocnik",
        "duration_label": "1× 90 minút",
        "schedule_info": "Utorok a štvrtok o 18:00 alebo sobota o 10:00",
        "price_eur": "29.00",
        "includes_equipment": True,
        "is_featured": True,
        "display_order": 1,
        "image_url": unsplash(IMG_BOULDER_INDOOR, extra="&crop=focalpoint&fp-x=0.6"),
        "target_audience": (
            "Pre každého, kto ešte nikdy nestál na lezeckej stene – alebo to bolo dávno. "
            "Nepotrebuješ kondíciu ani vlastnú výstroj, len pohodlné oblečenie a chuť vyskúšať niečo nové."
        ),
        "short_description": (
            "90 minút s inštruktorom, po ktorých budeš vedieť bezpečne liezť na bouldri aj na "
            "samoistiacich navijakoch. Vstup a požičanie výstroja sú v cene."
        ),
        "detailed_description": (
            "Začneme rozcvičkou a prehliadkou centra, vysvetlíme si, ako fungujú farebné okruhy "
            "a obtiažnosti. Naučíš sa správne padať na matrace, používať lezečky a nohy namiesto "
            "rúk. Na záver si vyskúšaš auto-belay navijaky na 16-metrovej stene. Po kurze môžeš "
            "rovno pokračovať v lezení – vstup na celý deň je v cene."
        ),
        "what_you_will_learn": [
            "Bezpečné padanie a pravidlá pohybu v boulderingovej hale",
            "Základy lezeckej techniky – práca nôh, rovnováha, prenášanie váhy",
            "Ako čítať farebné okruhy a stupnicu obtiažnosti",
            "Používanie samoistiacich navijakov (auto-belay)",
            "Rozcvička a strečing, ktoré chránia prsty a ramená",
        ],
    },
    {
        "slug": "bouldering-zaciatocnici-4-tyzdne",
        "title": "Bouldering pre začiatočníkov – 4-týždňový kurz",
        "category": "zaciatocnici",
        "skill_level": "uplny_zaciatocnik",
        "duration_label": "4× 90 minút (4 týždne)",
        "schedule_info": "Pondelok o 18:30 alebo nedeľa o 16:00",
        "price_eur": "99.00",
        "includes_equipment": True,
        "is_featured": True,
        "display_order": 2,
        "image_url": unsplash(IMG_OVERHANG),
        "target_audience": (
            "Pre úplných začiatočníkov a tých, ktorí párkrát liezli a chcú si vybudovať "
            "pevné základy techniky v malej skupine (max. 8 ľudí)."
        ),
        "short_description": (
            "Štyri týždne, štyri témy, jedna partia. Z nesmelých prvých pokusov sa dostaneš "
            "k sebavedomému lezeniu oranžového okruhu."
        ),
        "detailed_description": (
            "Každý týždeň sa venujeme jednej téme: nohy a rovnováha, telo pri stene, "
            "dynamické pohyby a čítanie boulderov. Medzi lekciami máš vstup za zvýhodnenú cenu, "
            "aby si mohol trénovať aj sám. Na konci kurzu dostaneš osobný tréningový plán."
        ),
        "what_you_will_learn": [
            "Presné stúpanie a technika „tichých nôh“",
            "Natočenie bokov a práca s ťažiskom",
            "Prvé dynamické pohyby a bezpečné skoky",
            "Plánovanie postupu – čítanie boulderu zo zeme",
            "Tréningový plán na ďalšie mesiace",
        ],
    },
    {
        "slug": "kurz-istenia-a-lezenia-na-lane",
        "title": "Kurz istenia a lezenia na lane (Top-Rope & Prvolezec)",
        "category": "lano_istenie",
        "skill_level": "mierne_pokrocily",
        "duration_label": "3× 120 minút",
        "schedule_info": "Streda o 18:00 (3 týždne po sebe) alebo víkendový intenzív",
        "price_eur": "119.00",
        "includes_equipment": True,
        "is_featured": True,
        "display_order": 3,
        "image_url": unsplash(IMG_ROPE_CLIMBER),
        "target_audience": (
            "Pre lezcov, ktorí si už vyskúšali bouldering alebo auto-belay a chcú liezť s partnerom "
            "na lane. Na konci kurzu získaš preukaz samostatného ističa nášho centra."
        ),
        "short_description": (
            "Naučíš sa naviazať, istiť a bezpečne spúšťať partnera. Po skúške môžeš samostatne "
            "liezť s lanom na celej 16,5-metrovej stene."
        ),
        "detailed_description": (
            "Prvá lekcia patrí uzlom, úväzu a istiacemu zariadeniu. V druhej trénujeme istenie "
            "top-rope a komunikáciu v dvojici. Tretia lekcia je úvodom do lezenia ako prvolezec – "
            "cvakanie expresiek, pády a dynamické istenie. Kurz končí praktickou skúškou."
        ),
        "what_you_will_learn": [
            "Osmičkový uzol a kontrola partnera (partner check)",
            "Istenie pomocou istítka GriGri a ATC",
            "Bezpečné spúšťanie a komunikácia na stene",
            "Cvakanie expresiek a lezenie ako prvolezec",
            "Kontrolované pády a dynamické istenie",
        ],
    },
    {
        "slug": "detsky-lezecky-kruzok",
        "title": "Detský lezecký krúžok (6 – 14 rokov)",
        "category": "deti_mladez",
        "skill_level": "vsetky_urovne",
        "duration_label": "Polročný kurz 1× týždenne (60 minút)",
        "schedule_info": "Pondelok, streda alebo piatok o 16:00",
        "price_eur": "179.00",
        "includes_equipment": True,
        "is_featured": True,
        "display_order": 4,
        "image_url": unsplash(IMG_KID),
        "target_audience": (
            "Pre deti od 6 do 14 rokov, začiatočníkov aj tie, ktoré už lezú. Skupiny delíme podľa "
            "veku a úrovne, v jednej skupine je najviac 8 detí na jedného inštruktora."
        ),
        "short_description": (
            "Hravý polročný krúžok, kde deti získajú silu, koordináciu a sebadôveru – a nové "
            "kamarátstva. Výstroj zapožičiame."
        ),
        "detailed_description": (
            "Krúžok spája lezenie s hrami, ktoré rozvíjajú obratnosť a odvahu. Deti sa postupne "
            "učia lezenie na lane s istením inštruktora, základy bezpečnosti a spolupráce. "
            "Na konci polroka organizujeme priateľské preteky s diplomami pre všetkých."
        ),
        "what_you_will_learn": [
            "Bezpečné správanie na stene a pri matracoch",
            "Koordinácia, rovnováha a sila primerane veku",
            "Lezenie na lane s istením inštruktora",
            "Spolupráca a povzbudzovanie v tíme",
            "Priateľské preteky na konci polroka",
        ],
    },
    {
        "slug": "juniorsky-trening-mladez",
        "title": "Juniorský tréningový tím (12 – 18 rokov)",
        "category": "deti_mladez",
        "skill_level": "mierne_pokrocily",
        "duration_label": "Polročný kurz 2× týždenne (90 minút)",
        "schedule_info": "Utorok a štvrtok o 16:30",
        "price_eur": "299.00",
        "includes_equipment": False,
        "is_featured": False,
        "display_order": 5,
        "image_url": unsplash(IMG_ROPE_DETAIL),
        "target_audience": (
            "Pre mladých lezcov, ktorí už lezú aspoň 5c a chcú trénovať systematicky, "
            "prípadne sa pripravovať na Slovenský pohár mládeže."
        ),
        "short_description": (
            "Systematický tréning techniky, sily a hlavy pre ambicióznu mládež pod vedením "
            "licencovaného trénera."
        ),
        "detailed_description": (
            "Ročný plán s periodizáciou, testovaním sily prstov a pravidelnou videoanalýzou. "
            "Súčasťou sú tréningy na Kilter Boarde, mentálna príprava a účasť na pretekoch."
        ),
        "what_you_will_learn": [
            "Pokročilá technika – heel hook, toe hook, drop knee",
            "Bezpečný tréning sily prstov na hangboarde",
            "Taktika a mentálna príprava na preteky",
            "Videoanalýza vlastného lezenia",
        ],
    },
    {
        "slug": "vecerny-trening-techniky-a-sily",
        "title": "Večerný skupinový tréning techniky a sily",
        "category": "treningy",
        "skill_level": "vsetky_urovne",
        "duration_label": "8× 90 minút (8 týždňov)",
        "schedule_info": "Utorok a štvrtok o 19:30",
        "price_eur": "149.00",
        "includes_equipment": False,
        "is_featured": True,
        "display_order": 6,
        "image_url": unsplash(IMG_TRAINING),
        "target_audience": (
            "Pre dospelých lezcov, ktorí lezú pravidelne a cítia, že sa zasekli na rovnakej "
            "obtiažnosti. Skupiny delíme podľa úrovne."
        ),
        "short_description": (
            "Osem týždňov štruktúrovaného tréningu techniky, sily a mobility s trénerom. "
            "Prelom svoje plató."
        ),
        "detailed_description": (
            "Každý tréning má jasný cieľ: technické drily, silové bloky na Kilter Boarde, "
            "kompenzačné cvičenia a mobilitu. Na začiatku a na konci cyklu ťa otestujeme, "
            "aby si videl reálny progres."
        ),
        "what_you_will_learn": [
            "Efektívna technika v previsoch",
            "Tréning sily prstov a ťahu bez zranení",
            "Kompenzačné cvičenia pre ramená a lakte",
            "Ako si zostaviť vlastný tréningový týždeň",
        ],
    },
]

TEAM = [
    {
        "full_name": "Mgr. Jakub Horváth",
        "role_title": "Hlavný staviteľ ciest (Chief Route Setter) & Tréner",
        "certifications": "Inštruktor lezenia na umelých stenách SHS JAMES • Route Setter Level 2",
        "bio": (
            "Lezie 18 rokov, staval cesty na Slovenskom pohári a stojí za každou novou farbou "
            "v boulderingovej hale. Jeho obľúbený pohyb? Dynamický skok do dobrého chytu."
        ),
        "photo_url": unsplash("1500648767791-00dcc994a43e", 800),
        "display_order": 1,
    },
    {
        "full_name": "Bc. Lucia Kováčová",
        "role_title": "Vedúca inštruktorka kurzov pre začiatočníkov",
        "certifications": "Inštruktorka lezenia SHS JAMES • Prvá pomoc v športe",
        "bio": (
            "Naučila liezť stovky začiatočníkov – od študentov po dôchodcov. Verí, že najlepší "
            "lezec je ten, ktorý sa na stene najviac baví."
        ),
        "photo_url": unsplash("1494790108377-be9c29b29330", 800),
        "display_order": 2,
    },
    {
        "full_name": "Tomáš Baláž",
        "role_title": "Tréner mládeže & Staviteľ ciest",
        "certifications": "Tréner lezenia II. kvalifikačného stupňa • Inštruktor SHS JAMES",
        "bio": (
            "Bývalý reprezentant v boulderingu. Vedie juniorský tím a večerné tréningy, kde "
            "spája vedu o tréningu s chuťou do lezenia."
        ),
        "photo_url": unsplash("1507003211169-0a1dd7228f2d", 800),
        "display_order": 3,
    },
    {
        "full_name": "Mgr. Zuzana Nováková",
        "role_title": "Koordinátorka detských krúžkov a teambuildingov",
        "certifications": "Inštruktorka lezenia SHS JAMES • Pedagogička telesnej výchovy",
        "bio": (
            "Pedagogička s lezeckým srdcom. Pripravuje detské krúžky, narodeninové oslavy "
            "a firemné akcie tak, aby si ich užil naozaj každý."
        ),
        "photo_url": unsplash("1438761681033-6461ffad8d80", 800),
        "display_order": 4,
    },
]


class Command(BaseCommand):
    help = "Naplní databázu ukážkovými dátami lezeckého centra (idempotentne)."

    @transaction.atomic
    def handle(self, *args, **options):
        counts = {"created": 0, "updated": 0}

        def track(created: bool):
            counts["created" if created else "updated"] += 1

        for zone in ZONES:
            data = dict(zone)
            slug = data.pop("slug")
            _, created = ClimbingZone.objects.update_or_create(slug=slug, defaults=data)
            track(created)

        for category, title, note, price, popular, order in PRICING:
            _, created = PricingPass.objects.update_or_create(
                category=category,
                title=title,
                defaults={
                    "subtitle_note": note,
                    "price_eur": Decimal(price),
                    "is_popular": popular,
                    "display_order": order,
                },
            )
            track(created)

        for course in COURSES:
            data = dict(course)
            slug = data.pop("slug")
            data["price_eur"] = Decimal(data["price_eur"])
            _, created = ClimbingCourse.objects.update_or_create(slug=slug, defaults=data)
            track(created)

        for member in TEAM:
            data = dict(member)
            name = data.pop("full_name")
            _, created = CoachMember.objects.update_or_create(full_name=name, defaults=data)
            track(created)

        self.stdout.write(
            self.style.SUCCESS(
                f"Hotovo: {len(ZONES)} zón, {len(PRICING)} položiek cenníka, {len(COURSES)} kurzov, "
                f"{len(TEAM)} členov tímu (vytvorené: {counts['created']}, aktualizované: {counts['updated']})."
            )
        )
