# Social Links & Creator Attribution Specification – Planora AI

**Version**: 2.0.0  
**Effective Date**: October 25, 2026  
**Auditor**: Frontend Architect & Security Reviewer  

---

## 1. Verified Creator Profiles

In accordance with Section 1 and Section 11 of the project specification, the creator's verified personal/professional profiles are centralized and integrated across public interfaces.

> **Important Boundary Rule**: The owner's personal profiles are displayed strictly as creator/founder attribution (`Connect (Creator)`). They are never misrepresented as official corporate Planora AI brand accounts.

| Platform | Verified Profile Destination | Accessible Label | Icon Asset |
|---|---|---|---|
| **GitHub** | `https://github.com/somansinghal` | `Soman Singhal on GitHub` | Lucide GitHub SVG |
| **Portfolio** | `https://somansinghal.vercel.app/` | `Soman Singhal Personal Portfolio` | Lucide Globe SVG |
| **Instagram** | `https://www.instagram.com/_somansinghal/` | `Soman Singhal on Instagram` | Lucide Instagram SVG |
| **LinkedIn** | `https://www.linkedin.com/in/soman-singhal/` | `Soman Singhal on LinkedIn` | Lucide LinkedIn SVG |
| **X (Twitter)** | `https://x.com/SomanSinghal` | `Soman Singhal on X (formerly Twitter)` | Lucide X (Twitter) SVG |

---

## 2. Centralized Configuration Architecture

To ensure zero hardcoded duplication and absolute maintainability, all social profile endpoints and sharing helpers are centralized in `js/config/social-links.js`:

```javascript
export const SOCIAL_PROFILES = {
  github: {
    name: 'GitHub',
    handle: 'somansinghal',
    url: 'https://github.com/somansinghal',
    label: 'Soman Singhal on GitHub',
  },
  portfolio: {
    name: 'Portfolio',
    handle: 'somansinghal.vercel.app',
    url: 'https://somansinghal.vercel.app/',
    label: 'Soman Singhal Personal Portfolio',
  },
  instagram: {
    name: 'Instagram',
    handle: '_somansinghal',
    url: 'https://www.instagram.com/_somansinghal/',
    label: 'Soman Singhal on Instagram',
  },
  linkedin: {
    name: 'LinkedIn',
    handle: 'soman-singhal',
    url: 'https://www.linkedin.com/in/soman-singhal/',
    label: 'Soman Singhal on LinkedIn',
  },
  x: {
    name: 'X',
    handle: '@SomanSinghal',
    url: 'https://x.com/SomanSinghal',
    label: 'Soman Singhal on X (formerly Twitter)',
  }
};
```

---

## 3. Security & Accessibility Standards

Every social link rendered across public pages conforms to strict web security and accessibility mandates:

1. **Security Attributes**: All external links opening in new browser tabs enforce:
   `target="_blank" rel="noopener noreferrer"`
   This prevents reverse-tabnabbing vulnerabilities where malicious target pages could redirect the parent window via `window.opener`.
2. **Accessible Names**: Each anchor provides a distinct `aria-label` describing the person, platform, and action (e.g., `aria-label="Soman Singhal on GitHub"`).
3. **Professional Vector Icons**: Authentic SVG icons with `aria-hidden="true"` and `stroke-width="2"` are utilized. No emoji substitutes (such as 📷 or 🐦) are used.
4. **Target Size & Contrast**: Touch targets are styled as minimum 36×36px interactive chips with visible hover and focus rings adhering to WCAG 2.1 AA standards.
5. **Zero Dead Links**: All 5 links were verified to target valid, live HTTP 200 / valid destinations.

---

## 4. Web Share API & Copy-Link Fallback

A native share utility is provided on public pages allowing visitors to share Planora AI:

- **Primary Mechanism**: Browser-native `navigator.share()` API sharing the title `Planora AI — AI-Powered Event Planning & Management` and URL `https://planora-ai-india.vercel.app/`.
- **Fallback Mechanism**: When Web Share is unsupported (e.g. desktop browsers without share sheets), `navigator.clipboard.writeText()` copies the canonical URL and triggers a polite floating toast notification (*"Link copied to clipboard!"*).
- **Security Boundary**: The share button strictly shares public URLs and never exposes session tokens, event IDs, guest lists, or budgets.
