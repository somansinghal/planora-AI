# Technical SEO Implementation Guide – Planora AI

**Document Version**: 2.0.0  
**Domain**: `https://planora-ai-india.vercel.app/`  
**Applicability**: Public static pages, social preview generation, structured metadata, and crawler directives.

---

## 1. Overview & SEO Philosophy

Planora AI is built as a high-performance, single-workspace SaaS platform. To achieve optimal search engine discoverability without risking index pollution or user data exposure, the codebase implements strict boundaries between **Public Discoverable Pages** and **Protected User Workspaces**.

### Core Tenets:
1. **Absolute Canonical URLs**: Every indexable page defines its own absolute HTTPS canonical URL on `https://planora-ai-india.vercel.app/`.
2. **Zero Keyword Stuffing**: Keyword tags and body headings naturally integrate phrases such as *AI event planner*, *wedding planning tools*, *event budget planner*, and *event management platform* without artificial repetition.
3. **Factual Integrity**: Zero fabricated customer reviews, fake user counts, or unverified star ratings.
4. **Air-Gapped Private Workspaces**: All authenticated application interfaces declare `<meta name="robots" content="noindex, nofollow">` and are disallowed in `robots.txt`.

---

## 2. Public Canonical Map

| Page | Relative Path | Canonical URL | Purpose |
|---|---|---|---|
| Homepage | `/index.html` | `https://planora-ai-india.vercel.app/` | Primary marketing & conversion landing |
| About Us | `/about.html` | `https://planora-ai-india.vercel.app/about.html` | Founder story, architecture, principles |
| Pricing | `/pricing.html` | `https://planora-ai-india.vercel.app/pricing.html` | Plan tiers, feature comparisons, FAQ |
| Privacy Policy | `/privacy.html` | `https://planora-ai-india.vercel.app/privacy.html` | Data protection, Firebase authentication privacy |
| Terms of Service | `/terms.html` | `https://planora-ai-india.vercel.app/terms.html` | SaaS terms of service, AI usage guidelines |

---

## 3. Metadata Standards

Every public page must include the following standard `<head>` block:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[Specific Title] – Planora AI</title>
<meta name="description" content="[Unique 120-160 character description]">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://planora-ai-india.vercel.app/[page].html">

<!-- Favicon Suite -->
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="alternate icon" href="favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="assets/images/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/images/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/images/apple-touch-icon.png">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://planora-ai-india.vercel.app/[page].html">
<meta property="og:title" content="[Specific Title]">
<meta property="og:description" content="[Description]">
<meta property="og:image" content="https://planora-ai-india.vercel.app/assets/images/planora-ai-social-preview.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="Planora AI">
<meta property="og:locale" content="en_US">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@SomanSinghal">
<meta name="twitter:creator" content="@SomanSinghal">
<meta name="twitter:url" content="https://planora-ai-india.vercel.app/[page].html">
<meta name="twitter:title" content="[Specific Title]">
<meta name="twitter:description" content="[Description]">
<meta name="twitter:image" content="https://planora-ai-india.vercel.app/assets/images/planora-ai-social-preview.png">
```

---

## 4. Structured Data (JSON-LD) Specification

The homepage includes a connected Schema.org graph representing the `WebSite` and the `SoftwareApplication`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://planora-ai-india.vercel.app/#website",
      "url": "https://planora-ai-india.vercel.app/",
      "name": "Planora AI",
      "description": "Plan events smarter with Planora AI. Create personalized event plans, manage budgets, organize tasks, build timelines, and keep every detail in one workspace.",
      "inLanguage": "en-US",
      "author": {
        "@type": "Person",
        "name": "Soman Singhal",
        "url": "https://somansinghal.vercel.app/",
        "sameAs": [
          "https://github.com/somansinghal",
          "https://www.linkedin.com/in/soman-singhal/",
          "https://x.com/SomanSinghal",
          "https://www.instagram.com/_somansinghal/"
        ]
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://planora-ai-india.vercel.app/#application",
      "name": "Planora AI",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "url": "https://planora-ai-india.vercel.app/",
      "description": "AI-powered event planning and management SaaS for weddings, celebrations, and corporate events.",
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "INR"
      },
      "creator": {
        "@type": "Person",
        "name": "Soman Singhal",
        "url": "https://somansinghal.vercel.app/"
      }
    }
  ]
}
```

---

## 5. Adding New Public Pages

When creating new public indexable pages in the future:
1. Create the HTML file in the project root (e.g., `features.html`).
2. Add the canonical tag pointing to `https://planora-ai-india.vercel.app/features.html`.
3. Add the complete meta, Open Graph, Twitter card, and favicon tags.
4. Add the URL to `sitemap.xml`:
   ```xml
   <url>
     <loc>https://planora-ai-india.vercel.app/features.html</loc>
     <lastmod>2026-10-25</lastmod>
     <changefreq>monthly</changefreq>
     <priority>0.8</priority>
   </url>
   ```
5. Add the `Allow: /features.html` directive in `robots.txt`.
6. Add the test case into `tests/test_seo_and_demo.py` under `PUBLIC_PAGES`.
7. Re-run `python3 tests/test_seo_and_demo.py` to ensure zero regressions.
