# Route Structure

## Overview

Bilingual (zh / en) Next.js 15 App Router structure. All content routes live under `[lang]` with middleware handling locale detection and redirect.

---

## Route Map

```
/
├── middleware.ts                          # Locale detection & redirect
├── app/
│   ├── layout.tsx                         # Root layout (html > body)
│   ├── [lang]/
│   │   ├── layout.tsx                     # Shared layout (nav, footer, theme)
│   │   ├── page.tsx                       # Homepage
│   │   ├── archive/
│   │   │   └── page.tsx                   # Archive
│   │   ├── about/
│   │   │   └── page.tsx                   # About
│   │   ├── articles/
│   │   │   ├── page.tsx                   # Article list
│   │   │   └── [slug]/
│   │   │       └── page.tsx               # Article detail
│   │   ├── java/
│   │   │   ├── page.tsx                   # Java notes list
│   │   │   └── [slug]/
│   │   │       └── page.tsx               # Java note detail
│   │   ├── 408/
│   │   │   ├── page.tsx                   # 408 notes list
│   │   │   └── [slug]/
│   │   │       └── page.tsx               # 408 note detail
│   │   ├── software-exam/
│   │   │   ├── page.tsx                   # Software exam notes list
│   │   │   └── [slug]/
│   │   │       └── page.tsx               # Software exam note detail
│   │   └── projects/
│   │       ├── page.tsx                   # Project list
│   │       └── [slug]/
│   │           └── page.tsx               # Project detail
│   └── api/
│       └── search/
│           └── route.ts                   # Search API (optional)
├── content/                               # MDX content (co-located or separate)
│   ├── articles/
│   │   ├── en/
│   │   └── zh/
│   ├── java/
│   │   ├── en/
│   │   └── zh/
│   ├── 408/
│   │   ├── en/
│   │   └── zh/
│   ├── software-exam/
│   │   ├── en/
│   │   └── zh/
│   └── projects/
│       ├── en/
│       └── zh/
└── public/
    └── images/
```

---

## Route Table

| Route | Page | Description |
|-------|------|-------------|
| `/` | redirect | Redirect to `/[detected-locale]` |
| `/en` | Homepage | English homepage — hand-drawn workspace with card modules |
| `/zh` | Homepage | Chinese homepage |
| `/en/archive` | Archive | Archive — left: categories & collections, right: avatar, bio, contact, social |
| `/zh/archive` | Archive | Chinese archive |
| `/en/about` | About | About page — personal info, site intro |
| `/zh/about` | About | Chinese about |
| `/en/articles` | Article list | All technical articles, paginated |
| `/zh/articles` | Article list | Chinese article list |
| `/en/articles/[slug]` | Article detail | Single article with Giscus comments |
| `/zh/articles/[slug]` | Article detail | Chinese article detail |
| `/en/java` | Java notes list | All Java notes |
| `/zh/java` | Java notes list | Chinese Java notes list |
| `/en/java/[slug]` | Java note detail | Single Java note |
| `/zh/java/[slug]` | Java note detail | Chinese Java note detail |
| `/en/408` | 408 notes list | All 408 exam notes |
| `/zh/408` | 408 notes list | Chinese 408 notes list |
| `/en/408/[slug]` | 408 note detail | Single 408 note |
| `/zh/408/[slug]` | 408 note detail | Chinese 408 note detail |
| `/en/software-exam` | Software exam notes list | All software exam notes |
| `/zh/software-exam` | Software exam notes list | Chinese software exam notes list |
| `/en/software-exam/[slug]` | Software exam note detail | Single exam note |
| `/zh/software-exam/[slug]` | Software exam note detail | Chinese exam note detail |
| `/en/projects` | Project list | All project summaries |
| `/zh/projects` | Project list | Chinese project list |
| `/en/projects/[slug]` | Project detail | Single project summary |
| `/zh/projects/[slug]` | Project detail | Chinese project detail |

---

## Design Decisions

### Why `[lang]` prefix over middleware-only i18n

- Clean URL structure: `/en/java/spring-ioc` vs `/java/spring-ioc?lang=en`
- SEO: each locale has its own indexed URL
- Static generation: `generateStaticParams` per locale is straightforward
- Matches Next.js 15 recommended i18n pattern

### Why separate listing + detail per content type

- Each content type (Java, 408, software-exam, articles, projects) has its own identity and card style
- Enables type-specific metadata filtering without query params
- Cleaner breadcrumbs and navigation context
- Matches the homepage module card design

### Why `/archive` is a single page, not per-category

- CLAUDE.md specifies archive as one page: left panel (categories, collections) + right panel (avatar, bio, contact)
- All navigation happens within the archive page itself — no sub-routes needed

### Why `/about` is separate from archive

- Archive is a content navigation hub; about is a personal intro page
- Different layout needs: archive is two-panel, about is a single flowing page
- Keeps concerns separated for future expansion

---

## Data Flow

```
content/[type]/[lang]/[slug].mdx
        │
        ▼
  MDX loader (fs + frontmatter)
        │
        ▼
  generateStaticParams ──► [lang]/[type]/[slug]/page.tsx
        │
        ▼
  MDX component ──► Article layout (hand-drawn borders, sticky notes, Giscus)
```

All content is file-system based. No CMS. No database. Category metadata lives in MDX frontmatter.

---

## Locale Handling

```
middleware.ts
  ├── Check Accept-Language header or cookie
  ├── Redirect `/` to `/en` or `/zh`
  └── Pass locale to layout via header
```

- Default locale: `zh`
- Supported: `zh`, `en`
- Language switcher in nav toggles between same-path different locale
