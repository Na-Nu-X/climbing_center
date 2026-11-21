from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


def unique_slug(instance: models.Model, value: str, max_length: int = 220) -> str:
    """Return a slug derived from `value` that is unique for the instance's model."""
    base = slugify(value)[:max_length] or "polozka"
    slug = base
    model = type(instance)
    counter = 2
    while model.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
        suffix = f"-{counter}"
        slug = f"{base[: max_length - len(suffix)]}{suffix}"
        counter += 1
    return slug


class ClimbingZone(models.Model):
    name = models.CharField("Názov zóny", max_length=160)
    slug = models.SlugField("Slug (URL)", max_length=180, unique=True, blank=True)
    max_height_meters = models.DecimalField(
        "Max. výška steny (m)", max_digits=4, decimal_places=1, null=True, blank=True
    )
    wall_area_sqm = models.PositiveIntegerField("Lezecká plocha (m²)", null=True, blank=True)
    routes_count_label = models.CharField(
        "Počet ciest / prestavby",
        max_length=160,
        blank=True,
        help_text="Napr. „130+ boulderov • každý týždeň nové cesty“. Aktualizujte po prestavbe.",
    )
    difficulty_scale = models.CharField(
        "Rozsah obtiažnosti", max_length=80, blank=True, help_text="Napr. „Začiatočníci až 8B“."
    )
    description = models.TextField("Popis")
    image_url = models.URLField("URL obrázka", max_length=500, blank=True)
    display_order = models.PositiveSmallIntegerField("Poradie zobrazenia", default=0)
    updated_at = models.DateTimeField("Naposledy upravené", auto_now=True)

    class Meta:
        verbose_name = "Lezecká zóna"
        verbose_name_plural = "Zóny lezeckého centra"
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(self, self.name, 180)
        super().save(*args, **kwargs)


class PricingPass(models.Model):
    class Category(models.TextChoices):
        SINGLE = "jednorazove", "Jednorazové vstupy"
        PASSES = "permanentky", "Permanentky a členstvá"
        RENTAL = "pozicovna", "Požičovňa lezeckého vybavenia"

    category = models.CharField("Kategória", max_length=20, choices=Category.choices)
    title = models.CharField("Názov položky", max_length=160)
    subtitle_note = models.CharField("Poznámka", max_length=200, blank=True)
    price_eur = models.DecimalField(
        "Cena (€)", max_digits=7, decimal_places=2, validators=[MinValueValidator(0)]
    )
    is_popular = models.BooleanField("Najobľúbenejšie", default=False)
    display_order = models.PositiveSmallIntegerField("Poradie zobrazenia", default=0)

    class Meta:
        verbose_name = "Položka cenníka"
        verbose_name_plural = "Cenník vstupného, permanentiek a požičovne"
        ordering = ["category", "display_order", "title"]
        constraints = [
            models.UniqueConstraint(fields=["category", "title"], name="unique_pricing_title_per_category")
        ]

    def __str__(self) -> str:
        return f"{self.title} – {self.price_eur} €"


class ClimbingCourse(models.Model):
    class Category(models.TextChoices):
        BEGINNERS = "zaciatocnici", "Pre úplných začiatočníkov"
        ROPE = "lano_istenie", "Lezenie s lanom a istenie"
        KIDS = "deti_mladez", "Detské lezecké krúžky"
        TRAINING = "treningy", "Skupinové a individuálne tréningy"

    class SkillLevel(models.TextChoices):
        BEGINNER = "uplny_zaciatocnik", "Úplný začiatočník – bez skúseností"
        INTERMEDIATE = "mierne_pokrocily", "Mierne pokročilý"
        ALL = "vsetky_urovne", "Všetky úrovne"

    category = models.CharField("Kategória", max_length=20, choices=Category.choices)
    title = models.CharField("Názov kurzu", max_length=200)
    slug = models.SlugField("Slug (URL)", max_length=220, unique=True, blank=True)
    skill_level = models.CharField("Úroveň", max_length=24, choices=SkillLevel.choices)
    duration_label = models.CharField("Trvanie", max_length=80, help_text="Napr. „4× 90 minút (4 týždne)“.")
    schedule_info = models.CharField("Termíny", max_length=200)
    price_eur = models.DecimalField(
        "Cena (€)", max_digits=7, decimal_places=2, validators=[MinValueValidator(0)]
    )
    includes_equipment = models.BooleanField("Výstroj v cene", default=True)
    target_audience = models.TextField(
        "Pre koho je kurz určený", blank=True, help_text="Krátky odsek o cieľovej skupine."
    )
    short_description = models.CharField("Krátky popis", max_length=300)
    detailed_description = models.TextField("Podrobný popis")
    what_you_will_learn = models.JSONField(
        "Čo sa naučíte", default=list, blank=True, help_text='Zoznam bodov, napr. ["Osmičkový uzol", "Istenie"].'
    )
    image_url = models.URLField("URL obrázka", max_length=500, blank=True)
    is_featured = models.BooleanField("Zobraziť na úvodnej stránke", default=False)
    is_active = models.BooleanField("Aktívny (prihlasovanie otvorené)", default=True)
    display_order = models.PositiveSmallIntegerField("Poradie zobrazenia", default=0)
    created_at = models.DateTimeField("Vytvorené", auto_now_add=True)

    class Meta:
        verbose_name = "Kurz / krúžok"
        verbose_name_plural = "Kurzy, tréningy a krúžky"
        ordering = ["display_order", "title"]

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(self, self.title, 220)
        super().save(*args, **kwargs)


class CoachMember(models.Model):
    full_name = models.CharField("Meno a priezvisko", max_length=120)
    role_title = models.CharField("Pozícia", max_length=160)
    certifications = models.CharField("Certifikácie", max_length=250, blank=True)
    bio = models.TextField("Krátky životopis", blank=True)
    photo_url = models.URLField("URL fotografie", max_length=500, blank=True)
    display_order = models.PositiveSmallIntegerField("Poradie zobrazenia", default=0)
    is_active = models.BooleanField("Zobraziť na webe", default=True)

    class Meta:
        verbose_name = "Člen tímu"
        verbose_name_plural = "Tím inštruktorov a staviteľov ciest"
        ordering = ["display_order", "full_name"]

    def __str__(self) -> str:
        return self.full_name


class CourseRegistration(models.Model):
    class Experience(models.TextChoices):
        NONE = "ziadne", "Žiadne skúsenosti"
        BASICS = "zaklady", "Párkrát som už liezol/a"
        ADVANCED = "pokrocily", "Pravidelne leziem"

    class Status(models.TextChoices):
        NEW = "nova", "Nová"
        CONFIRMED = "potvrdena", "Potvrdená"
        ENROLLED = "zaradena", "Zaradená do skupiny"
        CANCELLED = "zrusena", "Zrušená"

    course = models.ForeignKey(
        ClimbingCourse, verbose_name="Kurz", on_delete=models.PROTECT, related_name="registrations"
    )
    participant_name = models.CharField("Meno účastníka", max_length=120)
    participant_age = models.PositiveSmallIntegerField(
        "Vek účastníka",
        null=True,
        blank=True,
        validators=[MinValueValidator(3), MaxValueValidator(99)],
    )
    experience_level = models.CharField(
        "Skúsenosti", max_length=12, choices=Experience.choices, default=Experience.NONE
    )
    preferred_schedule_note = models.CharField("Preferovaný termín", max_length=200, blank=True)
    contact_name = models.CharField(
        "Kontaktná osoba", max_length=120, help_text="Pri deťoch meno rodiča / zákonného zástupcu."
    )
    email = models.EmailField("E-mail")
    phone = models.CharField("Telefón", max_length=32)
    notes = models.TextField("Poznámka", blank=True)
    status = models.CharField("Stav", max_length=12, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField("Prijaté", auto_now_add=True)

    class Meta:
        verbose_name = "Prihláška na kurz"
        verbose_name_plural = "Prihlášky na kurzy a krúžky"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.participant_name} → {self.course}"


class GroupEventInquiry(models.Model):
    class EventType(models.TextChoices):
        TEAMBUILDING = "teambuilding", "Firemný teambuilding na stene"
        BIRTHDAY = "narodeniny", "Detská narodeninová oslava s inštruktorom"
        SCHOOL = "skola", "Školský výlet / Telesná výchova"
        PRIVATE = "sukromny_trening", "Individuálny tréning s inštruktorom"

    event_type = models.CharField("Typ akcie", max_length=20, choices=EventType.choices)
    estimated_participants = models.PositiveIntegerField(
        "Predpokladaný počet účastníkov",
        default=10,
        validators=[MinValueValidator(1), MaxValueValidator(300)],
    )
    preferred_date = models.CharField("Preferovaný termín", max_length=120, blank=True)
    group_or_company_name = models.CharField("Firma / škola / skupina", max_length=160, blank=True)
    contact_name = models.CharField("Kontaktná osoba", max_length=120)
    email = models.EmailField("E-mail")
    phone = models.CharField("Telefón", max_length=32)
    message = models.TextField("Správa", blank=True)
    is_processed = models.BooleanField("Vybavené", default=False)
    created_at = models.DateTimeField("Prijaté", auto_now_add=True)

    class Meta:
        verbose_name = "Dopyt na skupinovú akciu"
        verbose_name_plural = "Dopyty na teambuildingy, oslavy a školy"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.get_event_type_display()} – {self.contact_name}"


class ContactMessage(models.Model):
    """General message from the contact form on the First Visit & Contact page."""

    name = models.CharField("Meno", max_length=120)
    email = models.EmailField("E-mail")
    phone = models.CharField("Telefón", max_length=32, blank=True)
    subject = models.CharField("Predmet", max_length=160, blank=True)
    message = models.TextField("Správa")
    is_processed = models.BooleanField("Vybavené", default=False)
    created_at = models.DateTimeField("Prijaté", auto_now_add=True)

    class Meta:
        verbose_name = "Správa z kontaktného formulára"
        verbose_name_plural = "Správy z kontaktného formulára"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} – {self.subject or 'bez predmetu'}"
