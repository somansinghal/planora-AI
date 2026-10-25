/**
 * Planora AI – Centralized Social Links & Public Site Configuration
 * 
 * Defines the canonical URLs for founder attribution and site-wide metadata.
 * These profiles represent the creator/owner and are not official corporate accounts.
 */

export const SOCIAL_LINKS = {
  GITHUB: 'https://github.com/somansinghal',
  PORTFOLIO: 'https://somansinghal.vercel.app/',
  INSTAGRAM: 'https://www.instagram.com/_somansinghal/',
  LINKEDIN: 'https://www.linkedin.com/in/soman-singhal/',
  X: 'https://x.com/SomanSinghal'
};

export const SITE_CONFIG = {
  NAME: 'Planora AI',
  TAGLINE: 'From idea to flawlessly planned.',
  CANONICAL_ORIGIN: 'https://planora-ai-india.vercel.app',
  CREATOR_NAME: 'Soman Singhal',
  DESCRIPTION: 'Plan events smarter with Planora AI. Create personalized event plans, manage budgets, organize tasks, build timelines, and keep every detail in one workspace.',
  SOCIAL_PREVIEW_IMAGE: 'https://planora-ai-india.vercel.app/assets/images/planora-ai-social-preview.png',
  FAVICON_ICO: '/favicon.ico',
  FAVICON_SVG: '/favicon.svg',
  FAVICON_PNG: '/assets/images/favicon-32x32.png',
  APPLE_TOUCH_ICON: '/assets/images/apple-touch-icon.png',
  JUDGE_DEMO_PATH: 'dashboard.html?demo=true'
};

/**
 * Handle public link sharing using Web Share API with clipboard fallback
 * @param {Object} options
 * @param {string} [options.title]
 * @param {string} [options.text]
 * @param {string} [options.url]
 * @returns {Promise<{success: boolean, method: string}>}
 */
export async function sharePlanora(options = {}) {
  const shareData = {
    title: options.title || `${SITE_CONFIG.NAME} — ${SITE_CONFIG.TAGLINE}`,
    text: options.text || SITE_CONFIG.DESCRIPTION,
    url: options.url || window.location.href
  };

  // Ensure only public canonical URLs are shared (strip private tokens/queries)
  try {
    const urlObj = new URL(shareData.url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      shareData.url = SITE_CONFIG.CANONICAL_ORIGIN;
    }
  } catch {
    shareData.url = SITE_CONFIG.CANONICAL_ORIGIN;
  }

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'native' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'cancelled' };
      }
      // Fallback to clipboard if share failed
    }
  }

  // Clipboard fallback
  try {
    await navigator.clipboard.writeText(shareData.url);
    return { success: true, method: 'clipboard' };
  } catch (clipboardErr) {
    // Legacy textarea fallback
    const textarea = document.createElement('textarea');
    textarea.value = shareData.url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return { success: copied, method: copied ? 'clipboard' : 'failed' };
  }
}
