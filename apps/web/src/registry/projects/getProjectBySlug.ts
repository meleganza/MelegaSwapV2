import { STATIC_PROJECTS } from './projects.data'
import { StaticProjectRecord } from './types'
import { resolveProjectBySlug } from './identity/resolveProject'

/**
 * Lookup by canonical slug or registered alias (case-normalized).
 * Prefer identity.resolveProjectBySlug when match reason is needed.
 */
export const getProjectBySlug = (slug: string): StaticProjectRecord | undefined => {
  const resolved = resolveProjectBySlug(slug)
  return resolved.ok ? resolved.project : undefined
}

export const getAllProjectSlugs = (): string[] => STATIC_PROJECTS.map((project) => project.slug)
