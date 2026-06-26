// =============================================================================
// ProfileCard — archive right-panel profile block.
//
// PaperCSS style, rounded-rect avatar, sketch-style contact buttons.
// Integrated language toggle slider, about link, search tip sticky note.
//
// Dependencies:
//   - @/lib/types.ts: ProfileData, SocialLink, Locale
//   - HandDrawnBorder (Phase 4A)
//   - SketchDivider (Phase 4A)
// =============================================================================

'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'

import type { ProfileData, SocialLink, Locale } from '@/lib/types'
import { HandDrawnBorder } from '@/components/primitives/HandDrawnBorder'
import { SketchDivider } from '@/components/primitives/SketchDivider'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProfileCardProps {
  profile: ProfileData
  locale: Locale
  className?: string
}

// PaperCSS 不规则手绘圆角
const paperBorderRadius = '255px 15px 225px 15px / 15px 225px 15px 255px'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function SocialIcon({ link }: { link: SocialLink }): React.ReactElement {
  return (
    <li className="w-full">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="
          block w-full text-center
          px-[var(--space-4)] py-[var(--space-2)]
          text-base
          transition-all duration-fade
          hover:-rotate-[0.5deg] hover:bg-[var(--bg-card)]
        "
        style={{
          color: 'var(--ink-secondary)',
          border: '1.5px solid var(--ink-secondary)',
          borderRadius: paperBorderRadius,
        }}
      >
        {link.label}
      </a>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProfileCard({
  profile,
  locale,
  className = '',
}: ProfileCardProps): React.ReactElement {
  const { avatar, bio, contact } = profile
  const router = useRouter()
  const pathname = usePathname()

  // 语言切换逻辑：替换路径中的语言前缀，保留当前页面
  const toggleLanguage = () => {
    const targetLang = locale === 'zh' ? 'en' : 'zh'
    const pathSegments = pathname.split('/')
    pathSegments[1] = targetLang
    router.push(pathSegments.join('/'))
  }

  return (
    <HandDrawnBorder variant="sticky-note" className={className}>
      <div className="flex flex-col items-center text-center gap-[var(--space-5)] py-[var(--space-6)] px-[var(--space-5)] flex-1">
        {/* ── Avatar: 不规则圆角矩形 ── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar}
          alt="Avatar"
          className="w-36 h-36 object-cover flex-shrink-0"
          style={{
            border: '2px solid var(--ink-primary)',
            borderRadius: paperBorderRadius,
          }}
          loading="lazy"
        />

        {/* ── Bio ── */}
        <p
          className="text-base leading-relaxed"
          style={{ color: 'var(--ink-secondary)', fontFamily: 'var(--font-title)' }}
        >
          {bio}
        </p>

        {/* ── Contact links: PaperCSS 轮廓按钮风格 ── */}
        <ul className="flex flex-col gap-[var(--space-3)] w-full">
          {contact.email && (
            <li className="w-full">
              <a
                href={`mailto:${contact.email}`}
                className="
                  block w-full text-center
                  px-[var(--space-4)] py-[var(--space-2)]
                  text-base
                  transition-all duration-fade
                  hover:-rotate-[0.5deg] hover:bg-[var(--bg-card)]
                "
                style={{
                  color: 'var(--ink-secondary)',
                  border: '1.5px solid var(--ink-secondary)',
                  borderRadius: paperBorderRadius,
                }}
              >
                {contact.email}
              </a>
            </li>
          )}

          {contact.github && (
            <li className="w-full">
              <a
                href={contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  block w-full text-center
                  px-[var(--space-4)] py-[var(--space-2)]
                  text-base
                  transition-all duration-fade
                  hover:-rotate-[0.5deg] hover:bg-[var(--bg-card)]
                "
                style={{
                  color: 'var(--ink-secondary)',
                  border: '1.5px solid var(--ink-secondary)',
                  borderRadius: paperBorderRadius,
                }}
              >
                GitHub
              </a>
            </li>
          )}

          {contact.socials?.map((s) => (
            <SocialIcon key={s.url} link={s} />
          ))}
        </ul>

        {/* 手绘分割线 */}
        <SketchDivider className="w-full" />

        {/* ── 关于我 + 中英切换滑块 同一行 ── */}
        <div className="w-full flex items-center justify-between">
          {/* 关于我链接 */}
          <a
            href="/about"
            className="
              text-base
              hover:underline underline-offset-[3px]
              transition-colors
            "
            style={{
              color: 'var(--ink-primary)',
              fontFamily: 'var(--font-title)',
            }}
          >
            关于我
          </a>

          {/* 中英切换滑块 */}
          <div className="flex items-center gap-[var(--space-2)]">
            <span
              style={{
                fontWeight: locale === 'zh' ? 700 : 400,
                color: 'var(--ink-primary)',
                fontFamily: 'var(--font-title)',
                fontSize: '0.95rem',
              }}
            >
              中
            </span>
            <button
              type="button"
              onClick={toggleLanguage}
              className="relative w-14 h-6 cursor-pointer transition-all duration-fade hover:-rotate-[0.3deg]"
              style={{
                border: '1.5px solid var(--ink-primary)',
                borderRadius: paperBorderRadius,
                backgroundColor: 'var(--bg-page)',
                padding: 0,
              }}
              aria-label="切换语言"
            >
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-300"
                style={{
                  left: locale === 'zh' ? '3px' : 'calc(100% - 19px)',
                  backgroundColor: 'var(--ink-primary)',
                  borderRadius: '50%',
                }}
              />
            </button>
            <span
              style={{
                fontWeight: locale === 'en' ? 700 : 400,
                color: 'var(--ink-primary)',
                fontFamily: 'var(--font-title)',
                fontSize: '0.95rem',
              }}
            >
              EN
            </span>
          </div>
        </div>

        {/* ── 搜索提示便签（醒目版） ── */}
        <div
          className="w-full px-[var(--space-3)] py-[var(--space-2)] text-center text-sm"
          style={{
            backgroundColor: 'var(--sticky-yellow)',
            border: '1.5px solid var(--ink-primary)',
            borderRadius: paperBorderRadius,
            color: 'var(--ink-primary)',
            fontFamily: 'var(--font-title)',
            transform: 'rotate(-0.8deg)',
          }}
        >
           点击纸飞机可以搜索文章
        </div>
      </div>
    </HandDrawnBorder>
  )
}