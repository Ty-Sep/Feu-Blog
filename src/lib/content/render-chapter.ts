// =============================================================================
// renderChapter — server-side Markdown → HTML pipeline.
//
// Uses the same remark / rehype plugins as the DetailPage MarkdownAsync path so
// the rendered output is visually identical.  Called from the loadChapter
// Server Action for on-demand chapter rendering in BookPage.
//
// PROFILING NOTE: This pipeline is functionally identical to what MarkdownAsync
// does internally (same remark + rehype plugins).  Timings here are directly
// representative of MarkdownAsync's internal timings.
// =============================================================================

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeShikiOriginal from '@shikijs/rehype'
import rehypeStringify from 'rehype-stringify'
import type { Root, Element } from 'hast'
import { visit } from 'unist-util-visit'

// ---------------------------------------------------------------------------
// First-call detection
// ---------------------------------------------------------------------------

let renderChapterCallCount = 0

// ---------------------------------------------------------------------------
// Profiled rehypeShiki — times both plugin-factory and transform steps
// ---------------------------------------------------------------------------

function profiledRehypeShiki(options: { theme: string }) {
  console.time('[Perf] rehypeShiki: plugin factory')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformer = (rehypeShikiOriginal as any)(options)
  console.timeEnd('[Perf] rehypeShiki: plugin factory')

  return async (tree: Root, file?: unknown) => {
    // Count code blocks for context
    let codeBlockCount = 0
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'pre') codeBlockCount++
    })

    const label = `[Perf] rehypeShiki: transform (${codeBlockCount} code blocks)`
    console.time(label)
    if (transformer) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (transformer as any)(tree, file)
    }
    console.timeEnd(label)
  }
}

// ---------------------------------------------------------------------------
// rehypeNotebookClasses — mirrors the React component overrides from page.tsx
// ---------------------------------------------------------------------------

function rehypeNotebookClasses(): (tree: Root) => void {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      const { tagName, properties } = node

      switch (tagName) {
        // ── Headings (matches h1–h4 components in page.tsx) ──
        case 'h1':
          properties.className =
            (properties.className ? String(properties.className) + ' ' : '') +
            'font-title text-4xl leading-tight mt-12 mb-6'
          properties.style = mergeStyle(properties.style, 'font-family:var(--font-title)')
          break

        case 'h2':
          properties.className =
            (properties.className ? String(properties.className) + ' ' : '') +
            'font-title text-2xl leading-tight mt-10 mb-4'
          properties.style = mergeStyle(properties.style, 'font-family:var(--font-title)')
          break

        case 'h3':
          properties.className =
            (properties.className ? String(properties.className) + ' ' : '') +
            'font-title text-xl leading-tight mt-8 mb-3'
          properties.style = mergeStyle(properties.style, 'font-family:var(--font-title)')
          break

        case 'h4':
          properties.className =
            (properties.className ? String(properties.className) + ' ' : '') +
            'font-title text-lg leading-tight mt-6 mb-2'
          properties.style = mergeStyle(properties.style, 'font-family:var(--font-title)')
          break

        // ── Images (matches img component in page.tsx) ──
        case 'img':
          properties.className =
            (properties.className ? String(properties.className) + ' ' : '') +
            'max-w-full h-auto rounded-sketch'
          properties.loading = 'lazy'
          break

        // ── Blockquotes (matches blockquote component in page.tsx) ──
        case 'blockquote':
          properties.className =
            (properties.className ? String(properties.className) + ' ' : '') +
            'border-l-[3px] my-6 pl-4 italic'
          properties.style = mergeStyle(
            properties.style,
            'border-color:var(--sticky-yellow);color:var(--ink-secondary)',
          )
          break

        // ── Links (matches a component in page.tsx) ──
        case 'a': {
          properties.className =
            (properties.className ? String(properties.className) + ' ' : '') +
            'underline underline-offset-[3px] transition-colors'
          properties.style = mergeStyle(properties.style, 'text-decoration-color:var(--ink-muted)')

          const href = typeof properties.href === 'string' ? properties.href : ''
          if (href.startsWith('http://') || href.startsWith('https://')) {
            properties.target = '_blank'
            properties.rel = 'noopener noreferrer'
          }
          break
        }

        // ── Inline code — CSS already handles overflow-wrap via .prose-notebook
        //    and :not(pre) > code rules in globals.css.  No additional attrs
        //    needed here.

        default:
          break
      }
    })
  }
}

function mergeStyle(
  existing: unknown,
  append: string,
): string {
  const base = typeof existing === 'string' ? existing : ''
  const separator = base && !base.endsWith(';') ? ';' : ''
  return base + separator + append
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Renders raw Markdown to an HTML string using the same pipeline as the
 * MarkdownAsync server component (remarkGfm → rehypeSlug → rehypeShiki).
 *
 * The output matches what `<MarkdownAsync>` produces with the component
 * overrides defined in `page.tsx` (headings, images, links, blockquotes,
 * inline code).
 */
export async function renderChapter(rawContent: string): Promise<string> {
  renderChapterCallCount++
  const isFirstCall = renderChapterCallCount === 1

  if (isFirstCall) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('[Perf] renderChapter FIRST CALL — Shiki highlighter cold start')
    console.log(`[Perf] Content size: ${rawContent.length} chars`)
  } else {
    console.log(`[Perf] renderChapter call #${renderChapterCallCount} (Shiki warm) — ${rawContent.length} chars`)
  }

  console.time('[Perf] renderChapter total')

  // ── Step 1: Pipeline setup (.use() calls — plugin factories only) ──
  console.time('[Perf]   ├─ pipeline setup (.use calls)')
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(profiledRehypeShiki, { theme: 'github-light' })
    .use(rehypeNotebookClasses)
    .use(rehypeStringify, { allowDangerousHtml: true })
  console.timeEnd('[Perf]   ├─ pipeline setup (.use calls)')

  // ── Step 2: .process() — the real work ──
  console.time('[Perf]   └─ .process() — remark→mdast→hast→Shiki→HTML')
  const result = await processor.process(rawContent)
  console.timeEnd('[Perf]   └─ .process() — remark→mdast→hast→Shiki→HTML')

  console.timeEnd('[Perf] renderChapter total')

  if (isFirstCall) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }

  return String(result.value)
}
