# Design System

## Colors
Theme support is required.

All colors must be defined as CSS variables.

Future themes may replace the color palette without changing component code.

```
Paper
  bg-page          #faf8f5    (warm off-white, main background)
  bg-card          #fefdfb    (card surface)
  bg-prose         #ffffff    (article reading area)

Ink
  ink-primary      #2c2c2c    (body text)
  ink-secondary    #5c5c5c    (meta, dates, labels)
  ink-muted        #9a9a9a    (captions, dividers)

Accent (content types)
  accent-java      #d4a574    (warm brown)
  accent-408        #7b9eb3    (muted blue)
  accent-exam      #8b9e7b    (muted green)
  accent-articles  #b38b6b    (sepia)
  accent-projects  #9b8ec4    (muted violet)

Sticky Notes
  sticky-yellow    #f8f0c6
  sticky-blue      #cce0f0
  sticky-pink      #f0d4da
```

No pure black (`#000`) or pure white (`#fff`) anywhere. All colors have subtle warmth.

---

## Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Title | Caveat | 600 | Page titles, section headings |
| Subtitle | Kalam | 400 | Card titles, nav items |
| Body | Noto Sans SC | 400 | Chinese prose |
| Body | Source Han Sans | 400 | English prose |
| Code | JetBrains Mono | 400 | Inline code, code blocks |

Scale (Desktop → Mobile):

| Level | Desktop | Mobile |
|-------|---------|--------|
| h1 | 2.25rem | 1.75rem |
| h2 | 1.5rem | 1.25rem |
| h3 | 1.25rem | 1.125rem |
| body | 1rem | 0.9375rem |
| small | 0.8125rem | 0.75rem |

Line height: `1.75` for prose, `1.4` for titles.

---

## Spacing

```
space-1   0.25rem     (4px)
space-2   0.5rem      (8px)
space-3   0.75rem     (12px)
space-4   1rem        (16px)
space-5   1.25rem     (20px)
space-6   1.5rem      (24px)
space-8   2rem        (32px)
space-10  2.5rem      (40px)
space-12  3rem        (48px)
space-16  4rem        (64px)
```

- Card padding: `space-5` (20px)
- Card gap: `space-4` (16px) grid, `space-3` (12px) stack
- Section gap: `space-12` (48px)
- Content max-width: `42rem` (672px)
- Homepage max-width: `64rem` (1024px)

---

## Borders

No CSS `border` properties. All borders are SVG strokes with slight irregularity.

| Variant | Stroke | Usage |
|---------|--------|-------|
| `rough` | Single line, slight wobble | Cards, article shell |
| `double` | Two parallel lines, offset | Archive panel separators |
| `fold` | Corner fold + shadow | Sticky notes |

Border radius: `0.25rem` (4px), intentionally small — hand-drawn lines don't round sharply.

---

## Shadows

Minimal. Overuse kills the notebook feel.

```
shadow-card    0 1px 3px rgba(0,0,0,0.06)     (card lift)
shadow-note    0 2px 6px rgba(0,0,0,0.08)     (sticky note)
```

No glow, no colored shadows.

---

## Animation

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `fade-in` | 200ms | `ease-out` | Page mount |
| `slide-up` | 300ms | `ease-out` | Card stagger entry |
| `stagger` | 60ms/child | — | Card grid children |

Rules:
- One `animate` per element max. No chained animations.
- Skip all motion when `prefers-reduced-motion: reduce`.
- Page transitions are instant. Only content within a page animates.

---

## Iconography

Use `lucide-react` exclusively. Stroke width: `1.5` (matches hand-drawn line weight). Size: `1.125rem` inline, `1.5rem` standalone.

---

## Component Conventions

- Every visual component is a Server Component unless it needs interactivity.
- Interactive components (`HandDrawnButton`, `LanguageSwitcher`, `CommentStickyNotes`) are Client Components isolated from the server tree.
- No component accepts `style` props — all styling through `className` or design tokens.
- Decorative elements (`StickyNote`, `SketchDivider`) accept `className` for positioning only.

---

## Content Type Identity

Each content type maps to an accent color and a Lucide icon. Defined in one place (`src/tokens/card-config.ts`). Used everywhere — cards, list pages, detail pages, homepage modules.
