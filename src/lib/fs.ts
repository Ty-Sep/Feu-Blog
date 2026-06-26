// =============================================================================
// File-system utilities — server-only (relies on Node.js fs / path).
// =============================================================================

import { readFile as nodeReadFile, readdir } from 'node:fs/promises'
import { resolve, extname, basename } from 'node:path'

// ---------------------------------------------------------------------------
// Simple in-memory cache
// ---------------------------------------------------------------------------

const fileCache = new Map<string, string>()
const dirCache  = new Map<string, string[]>()

// ---------------------------------------------------------------------------
// readFile — cached file reader
// ---------------------------------------------------------------------------

/**
 * Reads a file from disk with simple in-memory caching.
 * Path is resolved relative to the project root.
 */
export async function readFile(filePath: string): Promise<string> {
  const cached = fileCache.get(filePath)
  if (cached !== undefined) {
    return cached
  }

  const absolute = resolve(process.cwd(), filePath)
  const content = await nodeReadFile(absolute, 'utf-8')
  fileCache.set(filePath, content)
  return content
}

// ---------------------------------------------------------------------------
// getSlugs — list Markdown file stems in a directory
// ---------------------------------------------------------------------------

/**
 * Returns an array of slugs (file names without extensions) for all .md
 * files inside the given directory.
 *
 * Example:
 *   getSlugs('content/articles/zh')
 *     → ['hello-world', 'spring-ioc']
 */
export async function getSlugs(dir: string): Promise<string[]> {
  const cached = dirCache.get(dir)
  if (cached !== undefined) {
    return cached
  }

  const absolute = resolve(process.cwd(), dir)
  try {
    const entries = await readdir(absolute)
    const slugs = entries
      .filter((entry) => extname(entry) === '.md')
      .map((entry) => basename(entry, '.md'))
    dirCache.set(dir, slugs)
    return slugs
  } catch {
    // Directory may not exist yet (e.g. new content type with no posts).
    return []
  }
}

// ---------------------------------------------------------------------------
// clearCache — for development / test teardown
// ---------------------------------------------------------------------------

export function clearCache(): void {
  fileCache.clear()
  dirCache.clear()
}
