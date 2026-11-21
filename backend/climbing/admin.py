from django.contrib import admin, messages
from django.utils.html import format_html

from .models import (
    ClimbingCourse,
    ClimbingZone,
    CoachMember,
    ContactMessage,
    CourseRegistration,
    GroupEventInquiry,
    PricingPass,
)


def image_preview(url: str, height: int = 48):
    if not url:
        return "—"
    return format_html(
        '<img src="{}" style="height:{}px;width:auto;border-radius:4px;object-fit:cover" alt="">',
        url,
        height,
    )


@admin.register(ClimbingZone)
class ClimbingZoneAdmin(admin.ModelAdmin):
    list_display = (
        "thumbnail",
        "name",
        "max_height_meters",
        "wall_area_sqm",
        "routes_count_label",
        "difficulty_scale",
        "display_order",
        "updated_at",
    )
    list_display_links = ("thumbnail", "name")
    list_editable = ("routes_count_label", "display_order")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("preview", "updated_at")
    fieldsets = (
        (None, {"fields": ("name", "slug", "description", "display_order")}),
        ("Parametre steny", {"fields": ("max_height_meters", "wall_area_sqm", "difficulty_scale")}),
        (
            "Prestavby ciest",
            {"fields": ("routes_count_label", "updated_at"), "description": "Po každej prestavbe aktualizujte popis."},
        ),
        ("Obrázok", {"fields": ("image_url", "preview")}),
    )

    @admin.display(description="Náhľad")
    def thumbnail(self, obj):
        return image_preview(obj.image_url)

    @admin.display(description="Náhľad obrázka")
    def preview(self, obj):
        return image_preview(obj.image_url, 180)


@admin.register(PricingPass)
class PricingPassAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "price_eur", "subtitle_note", "is_popular", "display_order")
    list_editable = ("price_eur", "is_popular", "display_order")
    list_filter = ("category", "is_popular")
    search_fields = ("title", "subtitle_note")


@admin.register(ClimbingCourse)
class ClimbingCourseAdmin(admin.ModelAdmin):
    list_display = (
        "thumbnail",
        "title",
        "category",
        "skill_level",
        "duration_label",
        "price_eur",
        "is_featured",
        "is_active",
        "registrations_count",
    )
    list_display_links = ("thumbnail", "title")
    list_editable = ("is_featured", "is_active")
    list_filter = ("category", "skill_level", "is_featured", "is_active", "includes_equipment")
    search_fields = ("title", "short_description", "detailed_description")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("preview",)
    fieldsets = (
        (None, {"fields": ("title", "slug", "category", "skill_level", "is_active", "is_featured", "display_order")}),
        ("Termíny a cena", {"fields": ("duration_label", "schedule_info", "price_eur", "includes_equipment")}),
        (
            "Obsah kurzu",
            {"fields": ("short_description", "target_audience", "detailed_description", "what_you_will_learn")},
        ),
        ("Obrázok", {"fields": ("image_url", "preview")}),
    )

    @admin.display(description="Náhľad")
    def thumbnail(self, obj):
        return image_preview(obj.image_url)

    @admin.display(description="Náhľad obrázka")
    def preview(self, obj):
        return image_preview(obj.image_url, 180)

    @admin.display(description="Prihlášky")
    def registrations_count(self, obj):
        return obj.registrations.count()


@admin.register(CoachMember)
class CoachMemberAdmin(admin.ModelAdmin):
    list_display = ("thumbnail", "full_name", "role_title", "certifications", "display_order", "is_active")
    list_display_links = ("thumbnail", "full_name")
    list_editable = ("display_order", "is_active")
    search_fields = ("full_name", "role_title", "certifications")

    @admin.display(description="Foto")
    def thumbnail(self, obj):
        return image_preview(obj.photo_url)


@admin.register(CourseRegistration)
class CourseRegistrationAdmin(admin.ModelAdmin):
    list_display = (
        "participant_name",
        "participant_age",
        "course",
        "experience_level",
        "contact_name",
        "email",
        "phone",
        "status",
        "created_at",
    )
    list_editable = ("status",)
    list_filter = ("status", "course", "experience_level", "created_at")
    search_fields = ("participant_name", "contact_name", "email", "phone")
    date_hierarchy = "created_at"
    readonly_fields = ("created_at",)
    list_select_related = ("course",)
    actions = ("mark_confirmed", "mark_enrolled", "mark_cancelled")

    def _set_status(self, request, queryset, status, label):
        updated = queryset.update(status=status)
        self.message_user(request, f"{updated} prihlášok označených ako „{label}“.", messages.SUCCESS)

    @admin.action(description="Označiť ako potvrdené")
    def mark_confirmed(self, request, queryset):
        self._set_status(request, queryset, CourseRegistration.Status.CONFIRMED, "Potvrdená")

    @admin.action(description="Označiť ako zaradené do skupiny")
    def mark_enrolled(self, request, queryset):
        self._set_status(request, queryset, CourseRegistration.Status.ENROLLED, "Zaradená")

    @admin.action(description="Označiť ako zrušené")
    def mark_cancelled(self, request, queryset):
        self._set_status(request, queryset, CourseRegistration.Status.CANCELLED, "Zrušená")


@admin.register(GroupEventInquiry)
class GroupEventInquiryAdmin(admin.ModelAdmin):
    list_display = (
        "event_type",
        "group_or_company_name",
        "estimated_participants",
        "preferred_date",
        "contact_name",
        "email",
        "phone",
        "is_processed",
        "created_at",
    )
    list_editable = ("is_processed",)
    list_filter = ("event_type", "is_processed", "created_at")
    search_fields = ("contact_name", "group_or_company_name", "email", "phone", "message")
    date_hierarchy = "created_at"
    readonly_fields = ("created_at",)
    actions = ("mark_processed",)

    @admin.action(description="Označiť ako vybavené")
    def mark_processed(self, request, queryset):
        updated = queryset.update(is_processed=True)
        self.message_user(request, f"{updated} dopytov označených ako vybavené.", messages.SUCCESS)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "subject", "email", "phone", "is_processed", "created_at")
    list_editable = ("is_processed",)
    list_filter = ("is_processed", "created_at")
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("created_at",)
