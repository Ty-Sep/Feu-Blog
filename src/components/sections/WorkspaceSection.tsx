// =============================================================================
// WorkspaceSection — hand-drawn desk with 4 notebook entry cards (Phase 2H).
//
// workplace.png (1536×1024, 3:2) displayed at 92%-width via an aspect-ratio
// lock so the full outline is visible without cropping.  Cards sit on the
// lower portion of the desk with deliberate hand-placed offsets.  Decorations
// are placed near their companion cards inside the background boundary.
//
// z-index stack:
//   z:0   workplace.png background
//   z:1   decorations  (glasses / coffee / pen)
//   z:2   title sticker (paper.png)
//   z:10  cards
//
// Dependencies:
//   - HandDrawnBorder (Phase 4A)
//   - framer-motion   (Phase 9)
//   - src/image/p1-p4.png, workplace.png, glasses.png, coffee.png, pen.png,
//     paper.png
// =============================================================================

'use client'

import React from 'react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'

import type { Locale } from '@/types'

import p1Img from '@/image/p1.png'
import p2Img from '@/image/p2.png'
import p3Img from '@/image/p3.png'
import p4Img from '@/image/p4.png'

import workplaceImg from '@/image/workplace.png'

// Add paper.png to src/image/ — used as the title sticker.
import paperStickerImg from '@/image/paper.png'

import glassesImg from '@/image/glasses.png'
import coffeeImg from '@/image/coffee.png'
import penImg from '@/image/pen.png'

import { HandDrawnBorder } from '@/components/primitives/HandDrawnBorder'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WorkspaceSectionProps {
  locale: Locale
  className?: string
}

interface WorkspaceEntry {
  href: (locale: Locale) => string
  image: string
  label: Record<Locale, string>
  rotation: number
  offsetX: number
  offsetY: number
  scale: number
  /** Card wrapper width in px (default: auto from grid). */
  width?: number
  /** Card wrapper height in px (default: fill grid row). */
  height?: number
}

const ENTRIES: WorkspaceEntry[] = [
  {
    href: (l) => `/${l}/study-notes`,
    image: p1Img.src,
    label: { zh: '学习笔记', en: 'Study Notes' },
    rotation: -2.5,
    offsetX: -40,
    offsetY: -1,
    scale: 1.1,
    width: 250,
    height: 150,
  },
  {
    href: (l) => `/${l}/articles`,
    image: p2Img.src,
    label: { zh: '技术文章', en: 'Articles' },
    rotation: 8,
    offsetX: -10,
    offsetY: -100,
    scale: 1.2,
    width: 250,
    height: 270,
  },
  {
    href: (l) => `/${l}/guestbook`,
    image: p3Img.src,
    label: { zh: '留言板', en: 'Guestbook' },
    rotation: -10,
    offsetX: 200,
    offsetY: -200,
    scale: 1.2,
    width: 240,
    height: 250,
  },
  {
    href: (l) => `/${l}/lab`,
    image: p4Img.src,
    label: { zh: '实验室', en: 'Lab' },
    rotation: 1.5,
    offsetX: -25,
    offsetY: -150,
    scale: 0.92,
    width: 235,
    height: 240,
  },
]

// ---------------------------------------------------------------------------
// Framer Motion variants
// ---------------------------------------------------------------------------

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkspaceSection({
  locale,
  className = '',
}: WorkspaceSectionProps): React.ReactElement {
  return (
    <section id="workspace" className={className}>
      {/* ── Outer frame: max-width 1400px, centred ── */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* ═══════════════════════════════════════════════
            Background stage — 92%-width, 3:2 aspect
            locked to workplace.png proportions.
            ═══════════════════════════════════════════════ */}
        <div
          style={{
            width: '102%',
            margin: '0 auto',
            position: 'relative',
            aspectRatio: '3 / 2',
          }}
        >
          {/* ── z:0 · workplace.png background ── */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${workplaceImg.src})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.7,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />

          {/* ═══════════════════════════════════════════════
              z:1 · Desk decorations (30% larger, inside bg)
              ═══════════════════════════════════════════════ */}

          {/* glasses — near 学习笔记 (top-left card area) */}
          <img
            src={glassesImg.src}
            alt=""
            aria-hidden="true"
            className="hidden sm:block"
            style={{
              position: 'absolute',
              top: '5%',
              left: '25%',
              width: '250px',
              height: 'auto',
              opacity: 0.85,
              pointerEvents: 'none',
              zIndex: 11,
            }}
          />

          {/* coffee — near 技术文章 (top-right card area) */}
          <img
            src={coffeeImg.src}
            alt=""
            aria-hidden="true"
            className="hidden sm:block"
            style={{
              position: 'absolute',
              top: '4%',
              right: '-5%',
              width: '400px',
              height: 'auto',
              opacity: 1,
              pointerEvents: 'none',
              zIndex: 11,
            }}
          />

          {/* pen — near 实验室 (bottom-right card area) */}
          <img
            src={penImg.src}
            alt=""
            aria-hidden="true"
            className="hidden sm:block"
            style={{
              position: 'absolute',
              bottom: '14%',
              right: '7%',
              width: '250px',
              height: 'auto',
              opacity: 0.85,
              pointerEvents: 'none',
              zIndex: 11,
            }}
          />

          {/* ═══════════════════════════════════════════════
              z:2 · Title sticker — paper.png, top-left
              ═══════════════════════════════════════════════ */}
          <img
            src={paperStickerImg.src}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '40px',
              left: '120px',
              zIndex: 2,
              display: 'block',
              width: '180px',
              height: 'auto',
              transform: 'rotate(-8deg)',
            }}
          />

          {/* ═══════════════════════════════════════════════
              z:10 · Card grid — shifted down to expose
              the upper desk surface.
              ═══════════════════════════════════════════════ */}
          <div
            style={{
              position: 'absolute',
              top: '26%',
              left: '4%',
              right: '4%',
              bottom: '5%',
              zIndex: 10,
            }}
          >
            <motion.div
              className="
                grid
                grid-cols-1 sm:grid-cols-2
                gap-6
                h-full
                items-start
              "
              variants={gridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {ENTRIES.map((entry) => (
                <motion.div
                  key={entry.label.en}
                  variants={cardVariants}
                  style={{ zIndex: 10 }}
                >
                  {/* Inner wrapper — static layout transform.
                      Separated from motion.div so Framer Motion's
                      animate (opacity / y) doesn't overwrite
                      translate / rotate / scale. */}
                  <div
                    style={{
                      width: entry.width != null ? `${entry.width}px` : undefined,
                      height: entry.height != null ? `${entry.height}px` : '100%',
                      transform: `translate(${entry.offsetX}px, ${entry.offsetY}px) rotate(${entry.rotation}deg) scale(${entry.scale ?? 1})`,
                    }}
                  >
                    <HandDrawnBorder variant="square">
                    <Link
                      href={entry.href(locale)}
                      className="ws-entry-card flex flex-col h-full"
                    >
                      {/* Card image — fills upper portion */}
                      <img
                        src={entry.image}
                        alt=""
                        className="w-full flex-1 object-cover block min-h-0"
                      />

                      {/* Card body */}
                      <div
                        className="flex flex-col justify-center flex-shrink-0"
                        style={{ padding: 'var(--space-3)' }}
                      >
                        <h4
                          className="leading-tight mb-[var(--space-1)]"
                          style={{
                            fontFamily: 'var(--font-title)',
                            fontSize: '1.25rem',
                            color: 'var(--ink-primary)',
                          }}
                        >
                          {entry.label[locale]}
                        </h4>
                      </div>
                    </Link>
                  </HandDrawnBorder>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Hover lift ── */}
      <style>{`
        .ws-entry-card {
          transition: transform 300ms ease;
        }
        .ws-entry-card:hover {
          transform: translateY(-4px);
        }
      `}</style>
    </section>
  )
}
