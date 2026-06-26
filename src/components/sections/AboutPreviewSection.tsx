// =============================================================================
// AboutPreviewSection — profile teaser card on the homepage.
//
// Renders avatar, short bio, skill tags, and a contact link inside a
// hand-drawn sticky-note frame.  A "more about me →" link points to /about.
//
// Dependencies:
//   - HandDrawnBorder (Phase 4A)
//   - Title           (Phase 4A)
//   - ProfileData     (@/types)
// =============================================================================

import React from 'react'
import Link from 'next/link'

import type { Locale, ProfileData } from '@/types'
import { HandDrawnBorder } from '@/components/primitives/HandDrawnBorder'
import { Title } from '@/components/typography/Title'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AboutPreviewSectionProps {
  profile: ProfileData
  locale: Locale
  /** Skill / tag labels shown below the bio. */
  skills: string[]
  className?: string
}

// ---------------------------------------------------------------------------
// Locale labels
// ---------------------------------------------------------------------------

const LABELS: Record<Locale, { title: string; more: string }> = {
  zh: { title: '🙋 关于我', more: '了解更多 →' },
  en: { title: '🙋 About Me', more: 'More about me →' },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AboutPreviewSection({
  profile,
  locale,
  skills,
  className = '',
}: AboutPreviewSectionProps): React.ReactElement {
  const { avatar, bio, contact } = profile

  return (
    <section className={className}>
      <Title as="h2" className="mb-[var(--space-6)]">
        {LABELS[locale].title}
      </Title>

      <HandDrawnBorder variant="sticky-note">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-[var(--space-6)] p-[var(--space-4)]">
          {/* ── Avatar ── */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt="Avatar"
            className="w-[4.5rem] h-[4.5rem] rounded-full object-cover shrink-0"
            style={{
              border: '2px solid var(--ink-primary)',
              backgroundColor: 'var(--bg-page)',
            }}
            loading="lazy"
          />

          {/* ── Info ── */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-[var(--space-3)]">
            {/* Bio */}
            <p
              className="text-sm leading-relaxed max-w-[28rem]"
              style={{ color: 'var(--ink-secondary)' }}
            >
              {bio}
            </p>

            {/* Skill tags */}
            {skills.length > 0 && (
              <ul className="flex flex-wrap gap-[var(--space-1)]">
                {skills.map((skill) => (
                  <li key={skill}>
                    <span
                      className="
                        inline-block
                        px-[var(--space-2)] py-[var(--space-1)]
                        rounded-full
                        text-[0.6875rem] font-medium
                        select-none
                      "
                      style={{
                        backgroundColor: 'var(--sticky-yellow)',
                        color: 'var(--ink-primary)',
                      }}
                    >
                      {skill}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Contact + more link */}
            <div className="flex items-center gap-[var(--space-4)] text-sm flex-wrap justify-center sm:justify-start">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:underline underline-offset-[3px] transition-colors"
                  style={{ color: 'var(--ink-secondary)' }}
                >
                  {contact.email}
                </a>
              )}

              <Link
                href={`/${locale}/about`}
                className="
                  font-medium
                  hover:underline underline-offset-[3px]
                  transition-colors
                "
                style={{ color: 'var(--ink-primary)' }}
              >
                {LABELS[locale].more}
              </Link>
            </div>
          </div>
        </div>
      </HandDrawnBorder>
    </section>
  )
}
