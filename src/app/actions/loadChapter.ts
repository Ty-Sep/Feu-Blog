'use server'

// =============================================================================
// loadChapter — Server Action for on-demand chapter rendering.
//
// Called by BookPage when the user switches to a chapter that has not been
// cached yet.  Processes a single chapter's Markdown through the same
// remark/rehype pipeline used for SSR, returning only the rendered HTML.
//
// This keeps the initial page payload small (only chapter 1 is SSR-rendered)
// while later chapters load on demand without a full page refresh.
// =============================================================================

import { renderChapter } from '@/lib/content/render-chapter'
import { getCachedHtml } from '@/lib/content/html-cache'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LoadChapterResult {
  html: string
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Runtime render — runs the full remark/rehype/Shiki pipeline.
 * Used as fallback when the build-time cache is unavailable.
 */
export async function loadChapter(rawContent: string): Promise<LoadChapterResult> {
  console.time('[Perf] loadChapter (Server Action)')
  const html = await renderChapter(rawContent)
  console.timeEnd('[Perf] loadChapter (Server Action)')
  return { html }
}

/**
 * Cache read — returns pre-rendered HTML from .cache/content/.
 * Returns null when the cache hasn't been built yet (e.g. dev without
 * running build:content), signalling the caller to fall back to loadChapter.
 */
export async function loadCachedChapter(
  htmlPath: string,
): Promise<LoadChapterResult | null> {
  const html = await getCachedHtml(htmlPath)
  if (html === null) return null
  return { html }
}
