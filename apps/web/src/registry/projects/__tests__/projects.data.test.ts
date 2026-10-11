import { describe, expect, it } from 'vitest'
import { getProjectBySlug, getAllProjectSlugs } from '../getProjectBySlug'
import { getAllProjects } from '../getAllProjects'
import { STATIC_PROJECTS } from '../projects.data'

describe('projects.data', () => {
  it('has unique slugs', () => {
    const slugs = STATIC_PROJECTS.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('melega-dex is canonical; MARCO token identity owns multi-chain token refs', () => {
    const project = STATIC_PROJECTS.find((p) => p.slug === 'melega-dex')
    const marco = STATIC_PROJECTS.find((p) => p.slug === 'marco')
    expect(project?.isCanonical).toBe(true)
    // Token contracts live on the MARCO project identity to avoid cross-project collisions.
    expect(project?.resources.tokens).toHaveLength(0)
    expect(marco?.resources.tokens).toHaveLength(7)
    const polygon = marco?.resources.tokens.filter((token) => token.chainId === 137) ?? []
    expect(polygon.map((token) => token.address.toLowerCase())).toEqual([
      '0xf31a621a0e75d90fda320eee52956d718fa34615',
      '0xd3e28c74177b812d1543a406ad1a97ee3c398ac2',
    ])
    expect(marco?.primaryTokenRefs).toContain('token://137/0xF31A621A0e75d90fdA320EeE52956D718Fa34615')
    expect(marco?.primaryTokenRefs).not.toContain('token://137/0xD3e28c74177B812d1543A406aD1A97ee3C398AC2')
    expect(project?.trustBadges).toContain('canonical')
    expect(project?.trustBadges).toContain('observed')
    expect(project?.trustBadges).not.toContain('unverified')
  })

  it('includes founder-acceptance featured project identities', () => {
    for (const slug of ['mm72', 'eyed', 'young-degens', 'blion']) {
      expect(STATIC_PROJECTS.some((p) => p.slug === slug)).toBe(true)
    }
  })

  it('indexes AARON as a listed BSC project identity', () => {
    const project = STATIC_PROJECTS.find((p) => p.slug === 'aaron')
    expect(project?.displayName).toBe('AARON')
    expect(project?.resources.tokens[0]?.address).toBe('0x31B5BE085aF875B675392f5B37a1d0B8c3860222')
    expect(project?.resources.tokens[0]?.chainId).toBe(56)
    expect(project?.supportedChains).toEqual([56])
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
