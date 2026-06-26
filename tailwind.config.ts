// =============================================================================
// Tailwind CSS v3 — bridges every design token from globals.css.
//
// Components reference CSS variables directly (e.g. var(--ink-primary)).
// The theme extension here makes those same tokens available as Tailwind
// classes (e.g. text-ink-primary, bg-bg-card) for convenience.
// =============================================================================

import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  // ── Content scanning ──────────────────────────────────────────────────────
  content: [
    './src/**/*.{ts,tsx,mdx}',
  ],

  // ── Theme extension ───────────────────────────────────────────────────────
  theme: {
    extend: {
      /* ── Paper colours ── */
      colors: {
        'bg-page':  'var(--bg-page)',
        'bg-card':  'var(--bg-card)',
        'bg-prose': 'var(--bg-prose)',

        /* ── Ink colours ── */
        'ink-primary':   'var(--ink-primary)',
        'ink-secondary': 'var(--ink-secondary)',
        'ink-muted':     'var(--ink-muted)',

        /* ── Accent colours (one per content type) ── */
        'accent-java':     'var(--accent-java)',
        'accent-408':      'var(--accent-408)',
        'accent-exam':     'var(--accent-exam)',
        'accent-articles': 'var(--accent-articles)',
        'accent-projects': 'var(--accent-projects)',

        /* ── Sticky note colours ── */
        'sticky-yellow': 'var(--sticky-yellow)',
        'sticky-blue':   'var(--sticky-blue)',
        'sticky-pink':   'var(--sticky-pink)',
      },

      /* ── Font stacks ── */
      fontFamily: {
        title: 'var(--font-title)',
        body:  'var(--font-body)',
        mono:  'var(--font-mono)',
      },

      /* ── Max widths ── */
      maxWidth: {
        'content':   'var(--content-max-width)',
        'homepage':  'var(--homepage-max-width)',
      },

      /* ── Shadows ── */
      boxShadow: {
        card: 'var(--shadow-card)',
        note: 'var(--shadow-note)',
      },

      /* ── Border radius — hand-drawn feel ── */
      borderRadius: {
        sketch: '0.25rem',
      },

      /* ── Animation durations ── */
      transitionDuration: {
        fade:  'var(--duration-fade)',
        slide: 'var(--duration-slide)',
      },

      /* ── Spacing (arbitrary value references already used by components) ── */
      // The --space-* tokens are consumed via arbitrary-value syntax
      // (e.g. px-[var(--space-4)]) — no theme mapping needed here.
    },
  },

  // ── Plugins ───────────────────────────────────────────────────────────────
  plugins: [animate],
}

export default config
