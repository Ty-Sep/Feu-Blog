# Component Architecture

## Layering Strategy

```
Design Tokens → Primitives → Typography → Navigation
                                          → Cards
                                          → Content
                                          → Comments
                                          → Sections → Layouts → Pages
```

Each layer only depends on layers below it. Pages compose layouts; layouts compose sections; sections compose primitives + cards + content.

---

## 1. Design Tokens (tailwind.config.ts)

Not components, but the foundation. Every component consumes these — no hardcoded values anywhere.

| Token Group | Purpose |
|-------------|---------|
| `colors.*` | Notebook paper, ink, accent, sticky-note palette |
| `spacing.*` | Consistent gutter, card gap, section padding |
| `borderRadius.*` | Hand-drawn feels slightly irregular — one token controls all |
| `fontFamily.*` | `title` (Caveat / Kalam), `body` (Noto Sans SC / Source Han Sans) |
| `animation.*` | Shared Framer Motion presets: `fadeIn`, `slideUp`, `stagger` |

---

## 2. Primitives

Atomic, stateless, purely visual. No business logic.

### `HandDrawnBorder`

```
Props: { children, variant: "square" | "sticky-note" | "sketch", className? }
```

Renders an SVG border around children. `variant` picks the stroke style (rough, slightly offset double-line, or sticky-note fold). Used by cards, article shells, and comment notes.

### `HandDrawnButton`

```
Props: { children, href?, onClick?, variant: "primary" | "ghost", className? }
```

A button or link that looks hand-sketched — irregular stroke, slight rotation offset. Used for the archive menu button and any future CTA.

### `StickyNote`

```
Props: { children, color?: "yellow" | "blue" | "pink", rotation?: number, className? }
```

Absolutely-positioned decorative sticky note. Rotation randomized per instance but seeded by content for SSR stability. Used on article pages and as comment wrappers.

### `SketchDivider`

```
Props: { className? }
```

A squiggly horizontal line SVG. Used between sections.

### `NotebookPaper`

```
Props: { children, lined?: boolean, className? }
```

Wraps children in a paper-texture background. `lined` adds ruled lines. Used as the inner shell for article content areas.

---

## 3. Typography

### `Title`

```
Props: { as: "h1" | "h2" | "h3" | "h4", children, className? }
```

Renders with `font-title` (Caveat/Kalam). The `as` prop controls the HTML tag for SEO while keeping the visual style consistent.

### `Body`

```
Props: { children, className? }
```

Renders with `font-body` (Noto Sans SC/Source Han Sans). Used for prose content — wraps MDX output.

---

## 4. Navigation

### `NavBar`

```
Props: { lang: "zh" | "en" }
```

Fixed or sticky top bar. Contains: site title (hand-drawn text), `LanguageSwitcher`, `HandDrawnMenuButton`. Minimal — only what's needed.

### `LanguageSwitcher`

```
Props: { currentLang: "zh" | "en", currentPath: string }
```

Toggle button. Switches `[lang]` segment, preserves the rest of the path. Renders as a small underlined text link.

### `HandDrawnMenuButton`

```
Props: { href: string }
```

Links to `/archive`. Rendered as a `HandDrawnButton` with `variant="ghost"`. Top-right corner.

---

## 5. Cards

**One component, data-driven. Not five variants.**

### `ContentCard`

```
Props: {
  type: "java" | "408" | "software-exam" | "articles" | "projects"
  title: string
  description?: string
  date?: string
  tags?: string[]
  slug: string
  lang: "zh" | "en"
}
```

Single card component. The `type` field determines:

- Icon / accent color (via a `CARD_CONFIG` lookup map)
- Which list route to link to
- Optional: slight visual differentiation (e.g. Java cards have a coffee-cup icon, 408 cards have a textbook icon)

Renders inside a `HandDrawnBorder`. All five content types use this same component — adding a sixth type means adding one entry to `CARD_CONFIG`, not creating a new component.

### `CardGrid`

```
Props: { cards: ContentCardProps[], columns?: 2 | 3 }
```

Responsive grid of `ContentCard` instances. Used on the homepage and on list pages.

### `CardList`

```
Props: { cards: ContentCardProps[] }
```

Vertical stacked list variant. Used on list pages as an alternative to grid view.

---

## 6. Content

### `MDXRenderer`

```
Props: { source: MDXContent, components?: MDXComponents }
```

Renders compiled MDX. Passes custom components (code blocks, images, callouts) for notebook-style rendering. This is the single entry point for all MDX → JSX conversion.

### `ArticleShell`

```
Props: { children, frontmatter: { title, date, tags, type } }
```

Outer decoration layer for article/detail pages. Renders:

- `HandDrawnBorder` around the entire content
- Decorative `StickyNote` elements in the margins
- Title rendered with `Title`
- Date and tag chips

The inner content area is plain white/paper — clean reading surface inside notebook decoration.

### `ContentPagination`

```
Props: { prev?: { slug, title }, next?: { slug, title }, lang }
```

Previous/next navigation between articles of the same type. Rendered as hand-drawn arrows.

---

## 7. Comments

### `CommentStickyNotes`

```
Props: { giscusConfig: GiscusProps }
```

Wraps Giscus in a `StickyNote`-style container. Each comment thread renders as a pinned note appearance. Uses Giscus under the hood — this component is a thin visual wrapper.

---

## 8. Sections
### WorkspaceBoard

Purpose:

Homepage hero section.

Acts as a hand-drawn workspace containing the major content categories.

Contains:

- Java Notes
- 408 Notes
- Software Exam Notes
- Articles
- Projects

The board should feel like a personal study desk rather than a standard blog grid.

Uses ContentCard internally.

Composite components that combine primitives + cards + content into reusable blocks.

### `HomepageModule`

```
Props: { type: ContentCardProps["type"], cards: ContentCardProps[], lang }
```

A single homepage module block (e.g. "Java Notes" row). Renders:

1. Section heading (`Title` as h2, with a hand-drawn underline)
2. `CardGrid` of the top N cards
3. "View all →" link to the list page

Each content type on the homepage uses this same component with different data.

### `CategoryList`

```
Props: { categories: { label, count, href }[], lang }
```

Left panel of the archive page. Renders a list of category links with post counts.

### `CollectionList`

```
Props: { collections: { label, href }[] }
```

"Notes Collections" section in the archive left panel.

### `ProfileCard`

```
Props: { avatar, bio, contact: { email?, github?, socials?: { label, url }[] }, featuredLinks?, lang }
```

Right panel of the archive page. Avatar, bio paragraph, contact links, GitHub link, social icons.

---

## 9. Layouts

Page-level layout components. Each layout is a Server Component that composes sections.

### `HomepageLayout`

```
Props: { modules: { type, cards }[], lang }
```

Iterates over modules data, renders a `HomepageModule` for each. This is the Homepage consists of:

1. WorkspaceBoard (primary visual focus)
2. Featured content modules
3. Recent updates

WorkspaceBoard defines the overall homepage identity.

### `ArchiveLayout`

```
Props: { categories, collections, profile, lang }
```

Two-panel layout: left (`CategoryList` + `CollectionList`), right (`ProfileCard`). One component, one page — no sub-routes.

### `ListLayout`

```
Props: { type: ContentCardProps["type"], cards, lang, pagination? }
```

Shared layout for all list pages (`/java`, `/articles`, etc.). Renders:

1. Page title (`Title`)
2. `CardGrid` or `CardList` of all cards
3. `ContentPagination`

All five content type list pages use this same layout.

### `DetailLayout`

```
Props: { children, frontmatter, comments, lang }
```

Shared layout for all detail pages (`/java/[slug]`, `/articles/[slug]`, etc.). Renders:

1. `ArticleShell` wrapping the MDX content
2. `ContentPagination`
3. `CommentStickyNotes`

All five content type detail pages use this same layout.

### `AboutLayout`

```
Props: { content: MDXContent, lang }
```

Single flowing page for `/about`. Simpler than detail — no pagination or comments, just `ArticleShell` wrapping MDX content.

### `SharedLayout`

```
Props: { children, lang }
```

Wraps every `[lang]` page. Contains `NavBar` at top and a minimal footer. Also handles theme provider injection.

---

## 10. File Tree

```
src/
├── tokens/
│   └── card-config.ts          # CARD_CONFIG map: type → icon, color, route
├── components/
│   ├── primitives/
│   │   ├── HandDrawnBorder.tsx
│   │   ├── HandDrawnButton.tsx
│   │   ├── StickyNote.tsx
│   │   ├── SketchDivider.tsx
│   │   └── NotebookPaper.tsx
│   ├── typography/
│   │   ├── Title.tsx
│   │   └── Body.tsx
│   ├── navigation/
│   │   ├── NavBar.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   └── HandDrawnMenuButton.tsx
│   ├── cards/
│   │   ├── ContentCard.tsx
│   │   ├── CardGrid.tsx
│   │   └── CardList.tsx
│   ├── content/
│   │   ├── MDXRenderer.tsx
│   │   ├── ArticleShell.tsx
│   │   └── ContentPagination.tsx
│   ├── comments/
│   │   └── CommentStickyNotes.tsx
│   ├── sections/
│   │   ├── WorkspaceBoard.tsx
│   │   ├── HomepageModule.tsx
│   │   ├── CategoryList.tsx
│   │   ├── CollectionList.tsx
│   │   └── ProfileCard.tsx
│   └── layouts/
│       ├── SharedLayout.tsx
│       ├── HomepageLayout.tsx
│       ├── ArchiveLayout.tsx
│       ├── ListLayout.tsx
│       ├── DetailLayout.tsx
│       └── AboutLayout.tsx
└── pages/                       # Route handlers — thin, just fetch data + render layout
    ├── [lang]/
    │   ├── page.tsx             # → HomepageLayout
    │   ├── archive/page.tsx     # → ArchiveLayout
    │   ├── about/page.tsx       # → AboutLayout
    │   ├── articles/
    │   │   ├── page.tsx         # → ListLayout
    │   │   └── [slug]/page.tsx  # → DetailLayout
    │   ├── java/
    │   │   ├── page.tsx         # → ListLayout
    │   │   └── [slug]/page.tsx  # → DetailLayout
    │   ├── 408/
    │   │   ├── page.tsx         # → ListLayout
    │   │   └── [slug]/page.tsx  # → DetailLayout
    │   ├── software-exam/
    │   │   ├── page.tsx         # → ListLayout
    │   │   └── [slug]/page.tsx  # → DetailLayout
    │   └── projects/
    │       ├── page.tsx         # → ListLayout
    │       └── [slug]/page.tsx  # → DetailLayout
```

---

## 11. Data-Driven Design

### `CARD_CONFIG` (single source of truth)

```ts
const CARD_CONFIG: Record<ContentType, {
  label: { zh: string; en: string }
  route: string           // e.g. "/java"
  icon: string            // icon name
  accent: string          // semantic token — resolves to a CSS variable defined by the theme system
}> = {
  java:        { label: { zh: "Java 笔记", en: "Java Notes" },    route: "java",         icon: "coffee",    accent: "accent-java" },
  "408":       { label: { zh: "408 笔记", en: "408 Notes" },      route: "408",          icon: "book",      accent: "accent-408" },
  "software-exam": { label: { zh: "软考笔记", en: "Exam Notes" },  route: "software-exam", icon: "clipboard", accent: "accent-exam" },
  articles:    { label: { zh: "技术文章", en: "Articles" },        route: "articles",     icon: "pen",       accent: "accent-articles" },
  projects:    { label: { zh: "项目总结", en: "Projects" },        route: "projects",     icon: "folder",    accent: "accent-projects" },
}
```

Each `accent` value is a semantic token. It must resolve to a CSS variable defined in the theme system (e.g. `var(--accent-java)` or `hsl(var(--accent-java))` via the Shadcn/UI convention). Components must never reference raw color values directly. The `accent` field maps a content type to its theme variable — it is not a hardcoded Tailwind color.

Adding a new content type requires:

1. Add an entry to `CARD_CONFIG`
2. Add MDX files under `content/[type]/[lang]/`
3. Create two thin page files (list + detail) that render `ListLayout` / `DetailLayout`

No component changes needed.

---

## 12. Animation Strategy

All motion uses Framer Motion, governed by design tokens:

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `fadeIn` | 0.3s | ease-out | Page and section entry |
| `slideUp` | 0.4s | ease-out | Cards stagger on list pages |
| `stagger` | — | — | `staggerChildren: 0.08` applied to `CardGrid` |

Rules:

- Animate only on mount (not on every re-render)
- Respect `prefers-reduced-motion`
- Stagger cards by index for list/grid, but never animate the article content body itself
- Navigation transitions between major sections may use Framer Motion (`AnimatePresence`).
- Notebook page turn effects must be implemented using Framer Motion and CSS 3D transforms (`rotateY` + `perspective`). No additional library required.
- All navigation motion must respect `prefers-reduced-motion` and degrade to instant cuts when the user prefers reduced motion.

Allowed:
- fade
- slide
- notebook page turn

Duration:
300ms ~ 500ms

Transitions should feel smooth and intentional.

Avoid:
- particles
- parallax
- flashy effects

---

## 13. Component Dependency Graph

```
Design Tokens
    │
    ▼
Primitives ◄── Typography
    │              │
    │              ▼
    │         Navigation
    │              │
    ▼              ▼
Cards ──────► Sections ◄── Content ◄── Comments
                  │          │
                  ▼          ▼
              Layouts ◄──────┘
                  │
                  ▼
               Pages
```

- Primitives and Typography know nothing about the blog domain.
- Cards depend on Primitives + tokens.
- Sections compose Cards + Primitives + Typography.
- Content (MDX, ArticleShell) depends on Primitives + Typography.
- Layouts compose Sections + Content + Comments.
- Pages are thin data fetchers that render a single Layout.
