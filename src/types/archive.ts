// =============================================================================
// Archive types — archive page, profile, homepage modules.
// =============================================================================

import type { ContentType, ContentCardProps } from './article'

export interface SocialLink {
  label: string
  url: string
}

export interface CategoryLink {
  label: string
  count: number
  href: string
}

export interface CollectionLink {
  label: string
  href: string
}

export interface ProfileData {
  avatar: string
  bio: string
  contact: {
    email?: string
    github?: string
    socials?: SocialLink[]
  }
  featuredLinks?: SocialLink[]
}

export interface ArchiveData {
  categories: CategoryLink[]
  collections: CollectionLink[]
  profile: ProfileData
}

export interface HomepageModuleData {
  type: ContentType
  cards: ContentCardProps[]
}
