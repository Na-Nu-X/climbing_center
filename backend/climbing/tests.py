from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .models import ClimbingCourse, ClimbingZone, CoachMember, CourseRegistration, GroupEventInquiry, PricingPass


class SeedDataTests(TestCase):
    def test_seed_is_idempotent(self):
        call_command("seed_data", verbosity=0)
        call_command("seed_data", verbosity=0)
        self.assertEqual(ClimbingZone.objects.count(), 5)
        self.assertEqual(PricingPass.objects.count(), 12)
        self.assertEqual(ClimbingCourse.objects.count(), 6)
        self.assertEqual(CoachMember.objects.count(), 4)
        self.assertEqual(set(PricingPass.objects.values_list("category", flat=True)), {"jednorazove", "permanentky", "pozicovna"})


class ApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_data", verbosity=0)

    def setUp(self):
        self.client = APIClient()

    def test_read_endpoints(self):
        for url in ("/api/zones/", "/api/pricing/", "/api/pricing/grouped/", "/api/courses/", "/api/team/"):
            self.assertEqual(self.client.get(url).status_code, 200, url)

    def test_course_filters_and_detail(self):
        data = self.client.get("/api/courses/", {"category": "deti_mladez"}).json()
        self.assertTrue(data and all(c["category"] == "deti_mladez" for c in data))
        featured = self.client.get("/api/courses/", {"featured": "true"}).json()
        self.assertTrue(all(c["is_featured"] for c in featured))
        found = self.client.get("/api/courses/", {"search": "istenia"}).json()
        self.assertTrue(any("istenia" in c["title"] for c in found))
        detail = self.client.get("/api/courses/prve-kroky-na-stene/").json()
        self.assertIsInstance(detail["what_you_will_learn"], list)

    def test_registration_valid_and_invalid(self):
        payload = {
            "course": "prve-kroky-na-stene",
            "participant_name": "Peter Novák",
            "participant_age": 30,
            "experience_level": "ziadne",
            "contact_name": "Peter Novák",
            "email": "peter@example.com",
            "phone": "+421 900 123 456",
            "gdpr_consent": True,
        }
        self.assertEqual(self.client.post("/api/registrations/", payload, format="json").status_code, 201)
        self.assertEqual(CourseRegistration.objects.count(), 1)

        bad = {**payload, "phone": "123", "email": "nope", "gdpr_consent": False}
        response = self.client.post("/api/registrations/", bad, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual({"phone", "email", "gdpr_consent"}, set(response.json()) & {"phone", "email", "gdpr_consent"})

        kids = {**payload, "course": "detsky-lezecky-kruzok", "participant_age": None}
        self.assertIn("participant_age", self.client.post("/api/registrations/", kids, format="json").json())

    def test_registrations_are_not_listable(self):
        self.assertEqual(self.client.get("/api/registrations/").status_code, 405)

    def test_event_inquiry(self):
        payload = {
            "event_type": "teambuilding",
            "estimated_participants": 25,
            "group_or_company_name": "Firma s.r.o.",
            "contact_name": "Jana Malá",
            "email": "jana@example.com",
            "phone": "0900 123 456",
            "gdpr_consent": True,
        }
        self.assertEqual(self.client.post("/api/events/", payload, format="json").status_code, 201)
        self.assertEqual(GroupEventInquiry.objects.count(), 1)
        missing_company = {**payload, "group_or_company_name": ""}
        self.assertIn(
            "group_or_company_name", self.client.post("/api/events/", missing_company, format="json").json()
        )
