// =============================================================================
// Frontmatter parser — uses gray-matter to extract YAML headers from Markdown.
// Replaces the old MDX-specific parseMDX.
// =============================================================================

import matter from 'gray-matter'
import type { Frontmatter, ContentType } from '@/lib/types'
import { CONTENT_TYPES } from '@/tokens/card-config'

// ---------------------------------------------------------------------------
// Parsed result
// ---------------------------------------------------------------------------

export interface ParsedFrontmatter {
  /** Structured frontmatter extracted from the YAML header. */
  frontmatter: Frontmatter
  /** The markdown body (everything after the frontmatter fence). */
  rawContent: string
}

// ---------------------------------------------------------------------------
// parseFrontmatter — extract frontmatter + body from a raw Markdown string
// ---------------------------------------------------------------------------

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const { data, content } = matter(raw)

  const frontmatter: Frontmatter = {
    title: ensureString(data, 'title'),
    title_en: data.title_en ? String(data.title_en) : undefined,
    date: data.date ? String(data.date) : undefined,
    description: data.description ? String(data.description) : undefined,
    type: inferContentType(data.type),
    tags: inferTags(data.tags),
    featured: data.featured === true,
    series: data.series ? String(data.series) : undefined,
    book: data.book ? String(data.book) : undefined,
    bookTitle: data.bookTitle ? String(data.bookTitle) : undefined,
    order: typeof data.order === 'number' ? data.order : undefined,
    chapter: typeof data.chapter === 'number' ? data.chapter : undefined,
    summary: data.summary ? String(data.summary) : undefined,
  }

  return { frontmatter, rawContent: content }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ensureString(obj: Record<string, unknown>, key: string): string {
  const value = obj[key]
  if (typeof value === 'string' && value.length > 0) {
    return value
  }
  return 'Untitled'
}

function inferContentType(value: unknown): ContentType | undefined {
  if (typeof value === 'string' && (CONTENT_TYPES as readonly string[]).includes(value)) {
    return value as ContentType
  }
  return undefined
}

function inferTags(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const tags = value.filter((t): t is string => typeof t === 'string')
    return tags.length > 0 ? tags : undefined
  }
  return undefined
}
