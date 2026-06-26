// =============================================================================
// Common types — Locale, CardConfigEntry (leaf node, zero dependencies).
// =============================================================================

export type Locale = 'zh' | 'en'

export interface CardConfigEntry {
  /** Human-readable category labels per locale */
  label: Record<Locale, string>
  /** URL segment, e.g. "java" */
  route: string
  /** lucide-react icon name */
  icon: string
  /** Semantic token — resolves via CSS variable, e.g. "accent-java" */
  accent: string
}
