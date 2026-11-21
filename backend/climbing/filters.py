import django_filters

from .models import ClimbingCourse, PricingPass


class ClimbingCourseFilter(django_filters.FilterSet):
    featured = django_filters.BooleanFilter(field_name="is_featured")
    includes_equipment = django_filters.BooleanFilter()
    max_price = django_filters.NumberFilter(field_name="price_eur", lookup_expr="lte")

    class Meta:
        model = ClimbingCourse
        fields = ["category", "skill_level", "featured", "includes_equipment", "max_price"]


class PricingPassFilter(django_filters.FilterSet):
    popular = django_filters.BooleanFilter(field_name="is_popular")

    class Meta:
        model = PricingPass
        fields = ["category", "popular"]
