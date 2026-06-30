import { describe, expect, it } from 'vitest'
import { getProjectBySlug, getAllProjectSlugs } from '../getProjectBySlug'
import { getAllProjects } from '../getAllProjects'
import { STATIC_PROJECTS } from '../projects.data'

describe('projects.data', () => {
  it('has unique slugs', () => {
    const slugs = STATIC_PROJECTS.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('melega-dex is canonical with MARCO on four chains', () => {
    const project = STATIC_PROJECTS.find((p) => p.slug === 'melega-dex')
    expect(project?.isCanonical).toBe(true)
    expect(project?.resources.tokens).toHaveLength(4)
    expect(project?.trustBadges).toContain('canonical')
    expect(project?.trustBadges).toContain('observed')
    expect(project?.trustBadges).not.toContain('unverified')
  })

  it('does not mark AI report as live', () => {
    const project = getProjectBySlug('melega-dex')
    expect(project?.capabilities.aiReport.status).toBe('planned')
  })
})

describe('getProjectBySlug', () => {
  it('returns melega-dex', () => {
    const project = getProjectBySlug('melega-dex')
    expect(project?.upi).toBe('upi://melega/project/melega-dex@1')
  })

  it('returns undefined for invalid slug', () => {
    expect(getProjectBySlug('invalid')).toBeUndefined()
  })
})

describe('getAllProjectSlugs', () => {
  it('includes melega-dex', () => {
    expect(getAllProjectSlugs()).toContain('melega-dex')
  })

  it('matches getAllProjects length', () => {
    expect(getAllProjectSlugs().length).toBe(getAllProjects().length)
  })
})
