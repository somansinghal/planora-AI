"""
Planora AI — Automated SEO, Social Media, and Judge Demo Verification Suite
Tests all static assets, HTML metadata, canonical configurations, structured data,
social profiles, and client-side demo sandbox isolation.
"""

import os
import re
import unittest
import xml.etree.ElementTree as ET

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CANONICAL_ORIGIN = "https://planora-ai-india.vercel.app"

PUBLIC_PAGES = [
    "index.html",
    "about.html",
    "pricing.html",
    "privacy.html",
    "terms.html"
]

PRIVATE_PAGES = [
    "dashboard.html",
    "create-event.html",
    "planner.html",
    "budget.html",
    "timeline.html",
    "tasks.html",
    "vendors.html",
    "guests.html",
    "copilot.html",
    "reports.html",
    "settings.html"
]

AUTH_PAGES = [
    "login.html",
    "signup.html",
    "404.html"
]

EXPECTED_SOCIAL_URLS = {
    "github": "https://github.com/somansinghal",
    "portfolio": "https://somansinghal.vercel.app/",
    "instagram": "https://www.instagram.com/_somansinghal/",
    "linkedin": "https://www.linkedin.com/in/soman-singhal/",
    "x": "https://x.com/SomanSinghal"
}


class TestSEOAndSocial(unittest.TestCase):
    """Verifies Technical SEO, Canonical tags, Open Graph, and Structured Data."""

    def test_01_brand_assets_exist(self):
        """Verify all brand and social assets exist in filesystem."""
        expected_files = [
            "favicon.ico",
            "favicon.svg",
            "assets/images/favicon-32x32.png",
            "assets/images/favicon-16x16.png",
            "assets/images/apple-touch-icon.png",
            "assets/images/planora-ai-social-preview.png",
            "robots.txt",
            "sitemap.xml",
            "js/config/social-links.js",
            "js/demo-mode.js"
        ]
        for rel_path in expected_files:
            full_path = os.path.join(ROOT_DIR, rel_path)
            self.assertTrue(os.path.exists(full_path), f"Missing required asset: {rel_path}")

    def test_02_social_preview_image_dimensions(self):
        """Verify social preview image is valid PNG and 1200x630."""
        from PIL import Image
        img_path = os.path.join(ROOT_DIR, "assets/images/planora-ai-social-preview.png")
        with Image.open(img_path) as img:
            self.assertEqual(img.size, (1200, 630), "Social preview must be 1200x630")
            self.assertEqual(img.format, "PNG", "Social preview must be PNG")

    def test_03_public_pages_seo_metadata(self):
        """Verify every public page has title, meta description, canonical, and robots directives."""
        for page in PUBLIC_PAGES:
            file_path = os.path.join(ROOT_DIR, page)
            self.assertTrue(os.path.exists(file_path), f"{page} does not exist")
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Title
            title_match = re.search(r"<title>(.*?)</title>", content)
            self.assertIsNotNone(title_match, f"{page} missing <title>")
            self.assertTrue(len(title_match.group(1).strip()) > 10, f"{page} title too short")

            # Meta description
            desc_match = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', content)
            self.assertIsNotNone(desc_match, f"{page} missing meta description")
            self.assertTrue(len(desc_match.group(1).strip()) > 30, f"{page} description too short")

            # Canonical URL
            canonical_match = re.search(r'<link\s+rel="canonical"\s+href="([^"]+)"', content)
            self.assertIsNotNone(canonical_match, f"{page} missing canonical link")
            canonical_url = canonical_match.group(1)
            self.assertTrue(canonical_url.startswith(CANONICAL_ORIGIN), f"{page} canonical must point to production origin")
            self.assertNotIn("localhost", canonical_url)
            self.assertNotIn("127.0.0.1", canonical_url)

            # Open Graph
            self.assertIn('property="og:title"', content, f"{page} missing og:title")
            self.assertIn('property="og:description"', content, f"{page} missing og:description")
            self.assertIn('property="og:image"', content, f"{page} missing og:image")
            self.assertIn('property="og:url"', content, f"{page} missing og:url")

            # Twitter Card
            self.assertIn('name="twitter:card"', content, f"{page} missing twitter:card")
            self.assertIn('name="twitter:title"', content, f"{page} missing twitter:title")
            self.assertIn('name="twitter:image"', content, f"{page} missing twitter:image")

            # Favicon links
            self.assertIn('href="favicon.svg"', content, f"{page} missing SVG favicon")
            self.assertIn('href="favicon.ico"', content, f"{page} missing ICO favicon")

    def test_04_homepage_specific_requirements(self):
        """Verify homepage title, description, and structured data match specification."""
        file_path = os.path.join(ROOT_DIR, "index.html")
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Exact title
        self.assertIn("<title>Planora AI — AI-Powered Event Planning & Management</title>", content)

        # Meta description
        expected_desc = "Plan events smarter with Planora AI. Create personalized event plans, manage budgets, organize tasks, build timelines, and keep every detail in one workspace."
        self.assertIn(expected_desc, content)

        # JSON-LD Structured Data
        self.assertIn('application/ld+json', content)
        self.assertIn('"@type": "SoftwareApplication"', content)
        self.assertIn('"@type": "WebSite"', content)
        self.assertIn('"name": "Planora AI"', content)
        self.assertIn('"url": "https://planora-ai-india.vercel.app/"', content)
        self.assertIn('"name": "Soman Singhal"', content)

        # No fake customer reviews or ratings
        self.assertNotIn("Priya Sharma", content)
        self.assertNotIn("Rahul Mehta", content)
        self.assertNotIn("Ananya Krishnan", content)

    def test_05_robots_txt_directives(self):
        """Verify robots.txt allows public pages and excludes private dashboards."""
        robots_path = os.path.join(ROOT_DIR, "robots.txt")
        with open(robots_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("User-agent: *", content)
        self.assertIn(f"Sitemap: {CANONICAL_ORIGIN}/sitemap.xml", content)
        self.assertIn("Allow: /$", content)
        self.assertIn("Allow: /about.html", content)
        self.assertIn("Allow: /pricing.html", content)
        self.assertIn("Disallow: /dashboard.html", content)
        self.assertIn("Disallow: /planner.html", content)
        self.assertIn("Disallow: /budget.html", content)
        self.assertIn("Disallow: /api/", content)
        self.assertNotIn("localhost", content)

    def test_06_sitemap_xml_integrity(self):
        """Verify sitemap.xml contains only canonical public pages and no private workspaces."""
        sitemap_path = os.path.join(ROOT_DIR, "sitemap.xml")
        tree = ET.parse(sitemap_path)
        root = tree.getroot()

        # Namespace
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        urls = [elem.text for elem in root.findall("sm:url/sm:loc", ns)]

        self.assertTrue(len(urls) >= 5, "Sitemap should contain all public pages")
        self.assertIn(f"{CANONICAL_ORIGIN}/", urls)
        self.assertIn(f"{CANONICAL_ORIGIN}/pricing.html", urls)
        self.assertIn(f"{CANONICAL_ORIGIN}/about.html", urls)
        self.assertIn(f"{CANONICAL_ORIGIN}/privacy.html", urls)
        self.assertIn(f"{CANONICAL_ORIGIN}/terms.html", urls)

        # Verify no private or auth pages are in the sitemap
        for url in urls:
            self.assertFalse(url.startswith("http://"), "Sitemap must use HTTPS")
            self.assertNotIn("localhost", url)
            self.assertNotIn("dashboard", url)
            self.assertNotIn("planner", url)
            self.assertNotIn("budget", url)
            self.assertNotIn("login", url)
            self.assertNotIn("signup", url)

    def test_07_private_pages_have_noindex(self):
        """Verify private application pages have noindex, nofollow directives."""
        for page in PRIVATE_PAGES:
            file_path = os.path.join(ROOT_DIR, page)
            self.assertTrue(os.path.exists(file_path), f"Private page {page} missing")
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            self.assertIn('<meta name="robots" content="noindex, nofollow">', content,
                          f"Private page {page} must contain noindex, nofollow")

    def test_08_social_links_configuration(self):
        """Verify centralized social links configuration contains exact owner profiles."""
        social_cfg_path = os.path.join(ROOT_DIR, "js/config/social-links.js")
        with open(social_cfg_path, "r", encoding="utf-8") as f:
            content = f.read()

        for key, expected_url in EXPECTED_SOCIAL_URLS.items():
            self.assertIn(expected_url, content, f"Missing expected social profile: {expected_url}")

        self.assertIn("CANONICAL_ORIGIN", content)
        self.assertIn("sharePlanora", content)

    def test_09_footer_social_links_accessibility(self):
        """Verify public footer renders all 5 social links with security attributes and accessible labels."""
        index_path = os.path.join(ROOT_DIR, "index.html")
        with open(index_path, "r", encoding="utf-8") as f:
            content = f.read()

        for key, url in EXPECTED_SOCIAL_URLS.items():
            self.assertIn(f'href="{url}"', content, f"Footer missing {url}")

        # Security attributes
        self.assertIn('rel="noopener noreferrer"', content)
        self.assertIn('target="_blank"', content)
        # Accessible aria-label
        self.assertIn('aria-label="Soman Singhal on GitHub"', content)
        self.assertIn('aria-label="Soman Singhal on LinkedIn"', content)


class TestJudgeDemoMode(unittest.TestCase):
    """Verifies Judge Demo Mode configuration, seeded showcase data, and UI entry points."""

    def test_01_demo_mode_module_integrity(self):
        """Verify demo-mode.js contains showcase event, sample data, and storage isolation."""
        demo_path = os.path.join(ROOT_DIR, "js/demo-mode.js")
        with open(demo_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("Planora Showcase Wedding", content)
        self.assertIn("1200000", content)  # Budget
        self.assertTrue("855000" in content or "785000" in content, "Spent must be calculated or seeded")
        self.assertIn("The Oberoi Udaivilas, Udaipur", content)
        self.assertIn("isJudgeDemoMode", content)
        self.assertIn("enableJudgeDemoMode", content)
        self.assertIn("exitJudgeDemoMode", content)
        self.assertIn("resetDemoData", content)
        self.assertIn("planora_judge_demo_active", content)
        self.assertIn("planora_judge_demo_data", content)

    def test_02_demo_entry_points_exist(self):
        """Verify Judge Demo buttons exist on homepage, login, signup, 404, and footers."""
        entry_checks = [
            ("index.html", "Try Live Demo"),
            ("index.html", "Explore Judge Demo"),
            ("login.html", "Explore Judge Demo"),
            ("signup.html", "Explore Judge Demo"),
            ("404.html", "Explore Judge Demo"),
            ("about.html", "Try Live Demo"),
            ("pricing.html", "Try Live Demo"),
        ]
        for filename, expected_text in entry_checks:
            file_path = os.path.join(ROOT_DIR, filename)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            self.assertIn(expected_text, content, f"Missing demo entry '{expected_text}' in {filename}")

    def test_03_auth_guard_allows_demo(self):
        """Verify auth-guard.js recognizes judge demo mode and bypasses auth redirect."""
        auth_guard_path = os.path.join(ROOT_DIR, "js/auth-guard.js")
        with open(auth_guard_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("isJudgeDemoMode()", content)
        self.assertIn("renderDemoBanner()", content)
        self.assertIn("DEMO_USER", content)

    def test_04_app_shell_displays_demo_ui(self):
        """Verify app-shell.js includes demo badge and topbar reset/exit controls."""
        app_shell_path = os.path.join(ROOT_DIR, "js/app-shell.js")
        with open(app_shell_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("DEMO", content)
        self.assertIn("DEMO SANDBOX", content)
        self.assertIn("Reset Data", content)
        self.assertIn("Exit", content)

    def test_05_api_client_intercepts_demo_requests(self):
        """Verify api.js serves isolated demo records without making unauthorized backend calls."""
        api_path = os.path.join(ROOT_DIR, "js/api.js")
        with open(api_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("isJudgeDemoMode()", content)
        self.assertIn("getDemoEvent()", content)
        self.assertIn("updateDemoExpense", content)
        self.assertIn("chatWithCopilot", content)
        self.assertIn("generateEventPlan", content)

    def test_06_expense_and_dashboard_synchronization(self):
        """Verify data mutators and reactive synchronization event listeners exist."""
        demo_path = os.path.join(ROOT_DIR, "js/demo-mode.js")
        with open(demo_path, "r", encoding="utf-8") as f:
            demo_code = f.read()

        self.assertIn("planora:data-updated", demo_code)
        self.assertIn("updateDemoExpense", demo_code)
        self.assertIn("deleteDemoExpense", demo_code)
        self.assertIn("getDemoBudgetSummary", demo_code)

        dashboard_path = os.path.join(ROOT_DIR, "dashboard.html")
        with open(dashboard_path, "r", encoding="utf-8") as f:
            dash_code = f.read()

        self.assertIn("planora:data-updated", dash_code)
        self.assertIn("storage", dash_code)

        budget_path = os.path.join(ROOT_DIR, "budget.html")
        with open(budget_path, "r", encoding="utf-8") as f:
            budget_code = f.read()

        self.assertIn("planora:data-updated", budget_code)
        self.assertIn("storage", budget_code)

    def test_07_environment_and_secret_protection(self):
        """Verify .env.example, backend/.env.example, and strict .gitignore rules."""
        self.assertTrue(os.path.exists(os.path.join(ROOT_DIR, ".env.example")))
        self.assertTrue(os.path.exists(os.path.join(ROOT_DIR, "backend/.env.example")))

        with open(os.path.join(ROOT_DIR, ".gitignore"), "r", encoding="utf-8") as f:
            gitignore = f.read()

        self.assertIn(".env", gitignore)
        self.assertIn("serviceAccountKey.json", gitignore)
        self.assertIn("credentials.json", gitignore)
        self.assertIn("!.env.example", gitignore)


if __name__ == "__main__":
    unittest.main()
