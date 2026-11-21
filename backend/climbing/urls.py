from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("zones", views.ClimbingZoneViewSet, basename="zone")
router.register("pricing", views.PricingPassViewSet, basename="pricing")
router.register("courses", views.ClimbingCourseViewSet, basename="course")
router.register("team", views.CoachMemberViewSet, basename="team")
router.register("registrations", views.CourseRegistrationViewSet, basename="registration")
router.register("events", views.GroupEventInquiryViewSet, basename="event")
router.register("contact", views.ContactMessageViewSet, basename="contact")

urlpatterns = router.urls
