import { STATIC_PROJECTS } from './projects.data'
import { StaticProjectRecord } from './types'

export const getProjectBySlug = (slug: string): StaticProjectRecord | undefined =>
  STATIC_PROJECTS.find((project) => project.slug === slug)

export const getAllProjectSlugs = (): string[] => STATIC_PROJECTS.map((project) => project.slug)
