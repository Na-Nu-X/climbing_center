from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from .filters import ClimbingCourseFilter, PricingPassFilter
from .models import (
    ClimbingCourse,
    ClimbingZone,
    CoachMember,
    ContactMessage,
    CourseRegistration,
    GroupEventInquiry,
    PricingPass,
)
from .serializers import (
    ClimbingCourseDetailSerializer,
    ClimbingCourseListSerializer,
    ClimbingZoneSerializer,
    CoachMemberSerializer,
    ContactMessageSerializer,
    CourseRegistrationSerializer,
    GroupEventInquirySerializer,
    PricingPassSerializer,
)


class ClimbingZoneViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ClimbingZone.objects.all()
    serializer_class = ClimbingZoneSerializer
    lookup_field = "slug"
    pagination_class = None


class PricingPassViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PricingPass.objects.all()
    serializer_class = PricingPassSerializer
    filterset_class = PricingPassFilter
    ordering_fields = ["price_eur", "display_order"]
    pagination_class = None

    @action(detail=False, methods=["get"])
    def grouped(self, request):
        """Return pricing items grouped by category, in canonical category order."""
        items = self.filter_queryset(self.get_queryset())
        groups = []
        for value, label in PricingPass.Category.choices:
            category_items = [item for item in items if item.category == value]
            groups.append(
                {
                    "category": value,
                    "label": label,
                    "items": PricingPassSerializer(category_items, many=True).data,
                }
            )
        return Response(groups)


class ClimbingCourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ClimbingCourse.objects.filter(is_active=True)
    lookup_field = "slug"
    filterset_class = ClimbingCourseFilter
    search_fields = ["title", "short_description", "detailed_description"]
    ordering_fields = ["price_eur", "title", "display_order", "created_at"]
    ordering = ["display_order", "title"]
    pagination_class = None

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ClimbingCourseDetailSerializer
        return ClimbingCourseListSerializer


class CoachMemberViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CoachMember.objects.filter(is_active=True)
    serializer_class = CoachMemberSerializer
    pagination_class = None


class _PublicCreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Write-only endpoint for public forms (no listing of submitted personal data)."""

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "public_forms"


class CourseRegistrationViewSet(_PublicCreateViewSet):
    queryset = CourseRegistration.objects.all()
    serializer_class = CourseRegistrationSerializer


class GroupEventInquiryViewSet(_PublicCreateViewSet):
    queryset = GroupEventInquiry.objects.all()
    serializer_class = GroupEventInquirySerializer


class ContactMessageViewSet(_PublicCreateViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
