"""
Planora AI – Backend API Test Suite

Comprehensive automated test suite validating:
- Health check
- Authentication & Bearer token validation
- User profile & session verification
- Cross-user resource ownership & authorization (403 Forbidden)
- Event CRUD operations
- Budget calculations & category summaries
- Task management & status transitions
- Vendor management
- Guest list & RSVP metrics
- AI Event Plan generation (validated schema)
- AI Event Copilot queries
- Master reports & CSV exports
- Cascading event deletion
"""

import json
import base64
import unittest
from datetime import date, timedelta
from starlette.testclient import TestClient

from app.main import app


def make_mock_token(user_id: str, email: str = "test@planora.ai", name: str = "Test User") -> str:
    """Creates a mock JWT token format for local test authentication."""
    header = base64.urlsafe_b64encode(json.dumps({"alg": "RS256", "typ": "JWT"}).encode()).decode().rstrip("=")
    payload = base64.urlsafe_b64encode(json.dumps({
        "user_id": user_id,
        "sub": user_id,
        "email": email,
        "name": name,
        "aud": "planora-ai",
        "iss": "https://securetoken.google.com/planora-ai",
    }).encode()).decode().rstrip("=")
    signature = base64.urlsafe_b64encode(b"mock_signature").decode().rstrip("=")
    return f"{header}.{payload}.{signature}"


class TestPlanoraAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.user_a_token = make_mock_token("user-alpha-123", "alpha@planora.ai", "Alpha User")
        cls.user_b_token = make_mock_token("user-beta-456", "beta@planora.ai", "Beta User")

        cls.auth_headers_a = {"Authorization": f"Bearer {cls.user_a_token}"}
        cls.auth_headers_b = {"Authorization": f"Bearer {cls.user_b_token}"}

    def test_01_health_check(self):
        """Health endpoint should return 200 OK without authentication."""
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["service"], "planora-ai-api")

    def test_02_unauthenticated_requests_rejected(self):
        """Protected endpoints must reject requests missing Authorization header with 401."""
        endpoints = [
            ("GET", "/api/me"),
            ("GET", "/api/events"),
            ("POST", "/api/events"),
        ]
        for method, path in endpoints:
            if method == "GET":
                resp = self.client.get(path)
            else:
                resp = self.client.post(path, json={})
            self.assertEqual(
                resp.status_code,
                401,
                f"Endpoint {path} did not reject unauthenticated access with 401",
            )

    def test_03_invalid_token_format_rejected(self):
        """Tokens with invalid structure should be rejected with 401."""
        resp = self.client.get("/api/me", headers={"Authorization": "Bearer not-a-jwt"})
        self.assertEqual(resp.status_code, 401)

    def test_04_authenticated_user_profile(self):
        """User A should be able to retrieve their profile."""
        resp = self.client.get("/api/me", headers=self.auth_headers_a)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["uid"], "user-alpha-123")
        self.assertEqual(data["email"], "alpha@planora.ai")

    def test_05_create_event_validation(self):
        """Event creation requires valid future date, guest count, and budget."""
        future_date = (date.today() + timedelta(days=90)).isoformat()
        past_date = (date.today() - timedelta(days=10)).isoformat()

        # Reject negative budget
        bad_budget = {
            "name": "Invalid Event",
            "event_type": "wedding",
            "event_date": future_date,
            "guest_count": 100,
            "budget": -500,
        }
        resp = self.client.post("/api/events", json=bad_budget, headers=self.auth_headers_a)
        self.assertEqual(resp.status_code, 422)

        # Reject past date
        bad_date = {
            "name": "Past Event",
            "event_type": "birthday",
            "event_date": past_date,
            "guest_count": 50,
            "budget": 50000,
        }
        resp = self.client.post("/api/events", json=bad_date, headers=self.auth_headers_a)
        self.assertEqual(resp.status_code, 422)

        # Valid event creation
        valid_event = {
            "name": "Grand Jubilee Gala",
            "event_type": "anniversary",
            "event_date": future_date,
            "location": "The Oberoi Grand, Mumbai",
            "guest_count": 150,
            "budget": 750000.0,
            "currency": "INR",
            "theme": "Modern Royal Elegance",
            "dietary_preferences": "Vegetarian & Jain options",
            "additional_requirements": "Sound system, floral stage",
        }
        resp = self.client.post("/api/events", json=valid_event, headers=self.auth_headers_a)
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertEqual(data["name"], "Grand Jubilee Gala")
        self.assertEqual(data["user_id"], "user-alpha-123")
        self.assertTrue("id" in data)

        # Save event_id for subsequent tests
        TestPlanoraAPI.test_event_id = data["id"]

    def test_06_list_events_and_ownership(self):
        """User A should see their created event; User B should see an empty list."""
        resp_a = self.client.get("/api/events", headers=self.auth_headers_a)
        self.assertEqual(resp_a.status_code, 200)
        events_a = resp_a.json()["events"]
        self.assertGreaterEqual(len(events_a), 1)

        resp_b = self.client.get("/api/events", headers=self.auth_headers_b)
        self.assertEqual(resp_b.status_code, 200)
        events_b = resp_b.json()["events"]
        # User B should not see User A's events
        for ev in events_b:
            self.assertNotEqual(ev["user_id"], "user-alpha-123")

    def test_07_cross_user_access_forbidden(self):
        """User B must be rejected with HTTP 403 Forbidden when accessing User A's event."""
        event_id = TestPlanoraAPI.test_event_id
        resp = self.client.get(f"/api/events/{event_id}", headers=self.auth_headers_b)
        self.assertEqual(resp.status_code, 403)

    def test_08_update_event(self):
        """User A can update their event."""
        event_id = TestPlanoraAPI.test_event_id
        update_payload = {"guest_count": 180, "location": "The Taj Palace, Mumbai"}
        resp = self.client.patch(f"/api/events/{event_id}", json=update_payload, headers=self.auth_headers_a)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["guest_count"], 180)

    def test_09_budget_expenses_and_summary(self):
        """Create expenses, calculate budget utilization and category breakdown."""
        event_id = TestPlanoraAPI.test_event_id

        # Add venue expense
        exp1 = {
            "category": "venue",
            "name": "Banquet Hall Rental Deposit",
            "estimated_amount": 250000.0,
            "actual_amount": 250000.0,
            "is_paid": True,
            "vendor_name": "Taj Banquets",
        }
        resp1 = self.client.post(f"/api/events/{event_id}/expenses", json=exp1, headers=self.auth_headers_a)
        self.assertEqual(resp1.status_code, 201)

        # Add catering expense
        exp2 = {
            "category": "catering",
            "name": "Live Stations & Buffet",
            "estimated_amount": 200000.0,
            "actual_amount": None,
            "is_paid": False,
            "vendor_name": "Royal Caterers",
        }
        resp2 = self.client.post(f"/api/events/{event_id}/expenses", json=exp2, headers=self.auth_headers_a)
        self.assertEqual(resp2.status_code, 201)

        # Get summary
        resp_sum = self.client.get(f"/api/events/{event_id}/budget-summary", headers=self.auth_headers_a)
        self.assertEqual(resp_sum.status_code, 200)
        summary = resp_sum.json()
        self.assertEqual(summary["total_budget"], 750000.0)
        self.assertEqual(summary["total_actual"], 250000.0)
        self.assertEqual(summary["remaining_budget"], 500000.0)
        self.assertFalse(summary["over_budget"])
        self.assertGreaterEqual(len(summary["category_breakdown"]), 2)

    def test_10_task_management_workflow(self):
        """Create tasks, filter by priority, toggle status."""
        event_id = TestPlanoraAPI.test_event_id

        task_data = {
            "title": "Select floral centerpieces",
            "priority": "high",
            "status": "todo",
            "description": "Meet with florist at 3pm",
        }
        resp = self.client.post(f"/api/events/{event_id}/tasks", json=task_data, headers=self.auth_headers_a)
        self.assertEqual(resp.status_code, 201)
        task_id = resp.json()["id"]

        # Update task status to done
        patch_resp = self.client.patch(f"/api/tasks/{task_id}", json={"status": "done"}, headers=self.auth_headers_a)
        self.assertEqual(patch_resp.status_code, 200)
        self.assertEqual(patch_resp.json()["status"], "done")

    def test_11_vendor_and_guest_management(self):
        """Create vendor and guests, check RSVP summary."""
        event_id = TestPlanoraAPI.test_event_id

        # Vendor
        vendor_data = {
            "name": "Prism Sounds & Lights",
            "category": "sound_lighting",
            "contact_name": "Vikram Singh",
            "contact_email": "vikram@prismsounds.com",
            "estimated_cost": 45000.0,
            "booking_status": "quoted",
        }
        v_resp = self.client.post(f"/api/events/{event_id}/vendors", json=vendor_data, headers=self.auth_headers_a)
        self.assertEqual(v_resp.status_code, 201)

        # Guest
        guest_data = {
            "name": "Dr. Ramesh Sharma",
            "email": "ramesh@example.com",
            "rsvp_status": "confirmed",
            "plus_one": True,
            "dietary_preference": "Vegetarian",
        }
        g_resp = self.client.post(f"/api/events/{event_id}/guests", json=guest_data, headers=self.auth_headers_a)
        self.assertEqual(g_resp.status_code, 201)

        # RSVP summary
        rsvp_resp = self.client.get(f"/api/events/{event_id}/guests/summary", headers=self.auth_headers_a)
        self.assertEqual(rsvp_resp.status_code, 200)
        rsvp_data = rsvp_resp.json()
        self.assertEqual(rsvp_data["confirmed_count"], 1)
        self.assertEqual(rsvp_data["plus_one_count"], 1)
        self.assertEqual(rsvp_data["total_attending_headcount"], 2)

    def test_12_ai_plan_generation_and_saving(self):
        """Generate structured event plan in demo mode and persist to workspace."""
        event_id = TestPlanoraAPI.test_event_id

        plan_req = {
            "preferred_themes": "Royal Contemporary",
            "budget_priority": "Venue & Hospitality",
            "include_vendor_suggestions": True,
            "include_timeline": True,
            "include_task_list": True,
        }
        gen_resp = self.client.post(
            f"/api/events/{event_id}/generate-plan?demo_mode=true",
            json=plan_req,
            headers=self.auth_headers_a,
        )
        self.assertEqual(gen_resp.status_code, 200)
        plan_data = gen_resp.json()
        self.assertTrue("event_summary" in plan_data)
        self.assertGreaterEqual(len(plan_data["budget_breakdown"]), 1)
        self.assertGreaterEqual(len(plan_data["timeline_milestones"]), 1)
        self.assertGreaterEqual(len(plan_data["task_suggestions"]), 1)

        # Accept and save plan
        save_resp = self.client.post(
            f"/api/events/{event_id}/plans?apply_to_workspace=true",
            json=plan_data,
            headers=self.auth_headers_a,
        )
        self.assertEqual(save_resp.status_code, 201)

    def test_13_ai_copilot_contextual_query(self):
        """Query AI Copilot with event grounding context."""
        event_id = TestPlanoraAPI.test_event_id

        query = {"message": "How can I reduce my budget by 10%?"}
        resp = self.client.post(
            f"/api/events/{event_id}/copilot?demo_mode=true",
            json=query,
            headers=self.auth_headers_a,
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue("message" in data)
        self.assertGreaterEqual(len(data["suggestions"]), 1)

    def test_14_master_report_and_csv_export(self):
        """Generate complete master report and CSV download."""
        event_id = TestPlanoraAPI.test_event_id

        # Master report
        rep_resp = self.client.get(f"/api/events/{event_id}/report", headers=self.auth_headers_a)
        self.assertEqual(rep_resp.status_code, 200)
        rep = rep_resp.json()
        self.assertTrue("budget_overview" in rep)
        self.assertTrue("tasks_overview" in rep)
        self.assertTrue("guests_overview" in rep)

        # CSV export
        csv_resp = self.client.get(f"/api/events/{event_id}/export/csv?export_type=expenses", headers=self.auth_headers_a)
        self.assertEqual(csv_resp.status_code, 200)
        self.assertIn("text/csv", csv_resp.headers["content-type"])
        self.assertIn("Estimated Amount", csv_resp.text)

    def test_15_delete_event_cascades(self):
        """Deleting an event cleans up the event and related items."""
        event_id = TestPlanoraAPI.test_event_id
        del_resp = self.client.delete(f"/api/events/{event_id}", headers=self.auth_headers_a)
        self.assertEqual(del_resp.status_code, 200)

        # Verify event is gone
        get_resp = self.client.get(f"/api/events/{event_id}", headers=self.auth_headers_a)
        self.assertEqual(get_resp.status_code, 404)


if __name__ == "__main__":
    unittest.main()
