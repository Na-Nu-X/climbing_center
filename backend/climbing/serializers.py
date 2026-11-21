import re

from rest_framework import serializers

from .models import (
    ClimbingCourse,
    ClimbingZone,
    CoachMember,
    ContactMessage,
    CourseRegistration,
    GroupEventInquiry,
    PricingPass,
)

PHONE_RE = re.compile(r"^\+?[0-9 ()/-]{9,20}$")


def validate_phone_value(value: str) -> str:
    value = value.strip()
    if not PHONE_RE.match(value) or sum(ch.isdigit() for ch in value) < 9:
        raise serializers.ValidationError(
            "Zadajte platné telefónne číslo, napr. +421 900 123 456."
        )
    return value


def validate_name_value(value: str) -> str:
    value = value.strip()
    if len(value) < 2:
        raise serializers.ValidationError("Meno musí mať aspoň 2 znaky.")
    return value


class ClimbingZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClimbingZone
        fields = [
            "id",
            "name",
            "slug",
            "max_height_meters",
            "wall_area_sqm",
            "routes_count_label",
            "difficulty_scale",
            "description",
            "image_url",
            "display_order",
            "updated_at",
        ]


class PricingPassSerializer(serializers.ModelSerializer):
    category_label = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = PricingPass
        fields = [
            "id",
            "category",
            "category_label",
            "title",
            "subtitle_note",
            "price_eur",
            "is_popular",
            "estimator_key",
            "display_order",
        ]


class ClimbingCourseListSerializer(serializers.ModelSerializer):
    category_label = serializers.CharField(source="get_category_display", read_only=True)
    skill_level_label = serializers.CharField(source="get_skill_level_display", read_only=True)

    class Meta:
        model = ClimbingCourse
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "category_label",
            "skill_level",
            "skill_level_label",
            "duration_label",
            "schedule_info",
            "price_eur",
            "includes_equipment",
            "short_description",
            "image_url",
            "is_featured",
        ]


class ClimbingCourseDetailSerializer(ClimbingCourseListSerializer):
    class Meta(ClimbingCourseListSerializer.Meta):
        fields = ClimbingCourseListSerializer.Meta.fields + [
            "target_audience",
            "detailed_description",
            "what_you_will_learn",
        ]


class CoachMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoachMember
        fields = ["id", "full_name", "role_title", "certifications", "bio", "photo_url", "display_order"]


class CourseRegistrationSerializer(serializers.ModelSerializer):
    course = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=ClimbingCourse.objects.filter(is_active=True),
        error_messages={
            "does_not_exist": "Vybraný kurz neexistuje alebo prihlasovanie je uzavreté.",
            "required": "Vyberte kurz, na ktorý sa chcete prihlásiť.",
        },
    )
    gdpr_consent = serializers.BooleanField(write_only=True)

    class Meta:
        model = CourseRegistration
        fields = [
            "id",
            "course",
            "participant_name",
            "participant_age",
            "experience_level",
            "preferred_schedule_note",
            "contact_name",
            "email",
            "phone",
            "notes",
            "gdpr_consent",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]
        extra_kwargs = {
            "email": {"error_messages": {"invalid": "Zadajte platnú e-mailovú adresu."}},
            "participant_age": {
                "error_messages": {
                    "min_value": "Najnižší vek pre kurzy je 3 roky.",
                    "max_value": "Zadajte platný vek.",
                    "invalid": "Vek musí byť celé číslo.",
                }
            },
        }

    def validate_participant_name(self, value: str) -> str:
        return validate_name_value(value)

    def validate_contact_name(self, value: str) -> str:
        return validate_name_value(value)

    def validate_phone(self, value: str) -> str:
        return validate_phone_value(value)

    def validate_gdpr_consent(self, value: bool) -> bool:
        if not value:
            raise serializers.ValidationError(
                "Na odoslanie prihlášky je potrebný súhlas so spracovaním osobných údajov."
            )
        return value

    def validate(self, attrs):
        course: ClimbingCourse = attrs["course"]
        age = attrs.get("participant_age")
        if course.category == ClimbingCourse.Category.KIDS and age is None:
            raise serializers.ValidationError(
                {"participant_age": "Pri detských krúžkoch prosím uveďte vek dieťaťa."}
            )
        if course.category == ClimbingCourse.Category.KIDS and age is not None and not 5 <= age <= 15:
            raise serializers.ValidationError(
                {"participant_age": "Detský krúžok je určený pre deti vo veku 6 – 14 rokov."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("gdpr_consent", None)
        return super().create(validated_data)


class GroupEventInquirySerializer(serializers.ModelSerializer):
    gdpr_consent = serializers.BooleanField(write_only=True)

    class Meta:
        model = GroupEventInquiry
        fields = [
            "id",
            "event_type",
            "estimated_participants",
            "preferred_date",
            "group_or_company_name",
            "contact_name",
            "email",
            "phone",
            "message",
            "gdpr_consent",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "email": {"error_messages": {"invalid": "Zadajte platnú e-mailovú adresu."}},
            "estimated_participants": {
                "error_messages": {
                    "min_value": "Počet účastníkov musí byť aspoň 1.",
                    "max_value": "Pre skupiny nad 300 osôb nás prosím kontaktujte telefonicky.",
                }
            },
        }

    def validate_contact_name(self, value: str) -> str:
        return validate_name_value(value)

    def validate_phone(self, value: str) -> str:
        return validate_phone_value(value)

    def validate_gdpr_consent(self, value: bool) -> bool:
        if not value:
            raise serializers.ValidationError(
                "Na odoslanie dopytu je potrebný súhlas so spracovaním osobných údajov."
            )
        return value

    def validate(self, attrs):
        if attrs.get("event_type") == GroupEventInquiry.EventType.TEAMBUILDING and not attrs.get(
            "group_or_company_name", ""
        ).strip():
            raise serializers.ValidationError(
                {"group_or_company_name": "Pri firemnom teambuildingu uveďte názov firmy."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("gdpr_consent", None)
        return super().create(validated_data)


class ContactMessageSerializer(serializers.ModelSerializer):
    gdpr_consent = serializers.BooleanField(write_only=True)

    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "phone", "subject", "message", "gdpr_consent", "created_at"]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {"email": {"error_messages": {"invalid": "Zadajte platnú e-mailovú adresu."}}}

    def validate_name(self, value: str) -> str:
        return validate_name_value(value)

    def validate_phone(self, value: str) -> str:
        return validate_phone_value(value) if value.strip() else ""

    def validate_message(self, value: str) -> str:
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Správa je príliš krátka – napíšte nám aspoň 10 znakov.")
        return value.strip()

    def validate_gdpr_consent(self, value: bool) -> bool:
        if not value:
            raise serializers.ValidationError(
                "Na odoslanie správy je potrebný súhlas so spracovaním osobných údajov."
            )
        return value

    def create(self, validated_data):
        validated_data.pop("gdpr_consent", None)
        return super().create(validated_data)
