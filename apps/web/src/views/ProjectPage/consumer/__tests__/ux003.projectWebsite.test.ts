import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { GLOBAL_HEADER_NAV } from 'app-shell/config/globalHeaderNav'
import { ds001Layout } from 'design-system/melega/tokens/ds001'
import { isTokenProjectTemplate } from '../helpers'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'

const CONSUMER = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(CONSUMER, rel), 'utf8')
}

function stubDocument(partial: {
  slug: string
  projectType: string
  hasPrimaryToken: boolean
}): CanonicalProjectDocument {
  return {
    schemaVersion: 'melega.project-page.v1',
    projectId: `upi://melega/project/${partial.slug}@1`,
    slug: partial.slug,
    aliases: [],
    canonicalUrl: `/@${partial.slug}`,
    revision: 'test',
    generatedAt: new Date().toISOString(),
    updatedAt: null,
    identity: {
      projectId: `upi://melega/project/${partial.slug}@1`,
      slug: partial.slug,
      aliases: [],
      displayName: partial.slug,
      shortPurpose: { value: 'test', meta: { availability: 'AVAILABLE', source: 'REGISTRY', confidence: 'HIGH', observedAt: null, updatedAt: null } },
      description: { value: null, meta: { availability: 'UNAVAILABLE', source: 'NONE', confidence: 'NONE', observedAt: null, updatedAt: null } },
      projectType: {
        value: partial.projectType,
        meta: { availability: 'AVAILABLE', source: 'REGISTRY', confidence: 'HIGH', observedAt: null, updatedAt: null },
      },
      lifecycleStatus: { value: null, meta: { availability: 'UNAVAILABLE', source: 'NONE', confidence: 'NONE', observedAt: null, updatedAt: null } },
      categories: [],
      tags: [],
      logoUrl: { value: null, meta: { availability: 'UNAVAILABLE', source: 'NONE', confidence: 'NONE', observedAt: null, updatedAt: null } },
      verificationState: { value: 'observed', meta: { availability: 'AVAILABLE', source: 'REGISTRY', confidence: 'HIGH', observedAt: null, updatedAt: null } },
      readiness: { value: null, meta: { availability: 'UNAVAILABLE', source: 'NONE', confidence: 'NONE', observedAt: null, updatedAt: null } },
      updatedAt: null,
    },
    chains: [{ chainId: 56, caip2: 'eip155:56', label: 'BNB Smart Chain', availability: 'AVAILABLE' }],
    assets: partial.hasPrimaryToken
      ? [
          {
            assetId: 'a1',
            assetType: 'fungible_token',
            name: { value: 'MARCO', meta: { availability: 'AVAILABLE', source: 'REGISTRY', confidence: 'HIGH', observedAt: null, updatedAt: null } },
            symbol: { value: 'MARCO', meta: { availability: 'AVAILABLE', source: 'REGISTRY', confidence: 'HIGH', observedAt: null, updatedAt: null } },
            decimals: { value: 18, meta: { availability: 'AVAILABLE', source: 'REGISTRY', confidence: 'HIGH', observedAt: null, updatedAt: null } },
            chainId: 56,
            caip2: 'eip155:56',
            caip19: null,
            contractAddress: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
            projectRole: 'primary',
            relationship: 'canonical',
          },
        ]
      : [],
    deployments: [],
    contracts: [],
    resources: [],
    evidence: [],
    declaredCapabilities: [],
    navSections: [],
    provenanceSummary: { sourcesPresent: [], availabilityNotes: [] },
  } as CanonicalProjectDocument
}

describe('UX003 Project Website mode & header nav', () => {
  it('token vs protocol template is derived from registry assets/type, not slug hacks', () => {
    const marco = stubDocument({ slug: 'marco', projectType: 'Cryptocurrency', hasPrimaryToken: true })
    const dex = stubDocument({
      slug: 'melega-dex',
      projectType: 'Decentralized exchange',
      hasPrimaryToken: false,
    })
    expect(isTokenProjectTemplate(marco)).toBe(true)
    expect(isTokenProjectTemplate(dex)).toBe(false)

    const helpers = load('helpers.ts')
    const fn = helpers.slice(helpers.indexOf('export function isTokenProjectTemplate'))
    expect(fn).toContain('projectRole')
    expect(fn).not.toMatch(/slug === ['"]marco['"]/)
  })

  it('consumer shell mounts dense website composition', () => {
    const shell = load('ProjectConsumerShell.tsx')
    expect(shell).toContain('ProjectWebsiteHero')
    expect(shell).toContain('ProjectMetricsStrip')
    expect(shell).toContain('ProjectWebsiteInfoRow')
    expect(shell).toContain('ChartSwapRow')
    expect(shell).toContain('data-project-website="true"')
    expect(shell).not.toContain("import ProjectHero from './ProjectHero'")
  })

  it('metrics strip never hardcodes mockup illustrative values', () => {
    const strip = load('ProjectMetricsStrip.tsx')
    expect(strip).toContain('Not available')
    expect(strip).not.toContain('$0.000040')
    expect(strip).not.toContain('$5.36M')
    expect(strip).not.toContain('133.9B')
  })

  it('header primary nav matches mockup Build menu', () => {
    expect(GLOBAL_HEADER_NAV.map((i) => i.label)).toEqual([
      'Trade',
      'Liquidity',
      'Farms',
      'Pools',
      'Projects',
      'Build',
    ])
    expect(ds001Layout.headerHeight).toBe('64px')
  })

  it('earn cards use lucide-style icons, not emojis', () => {
    const earn = load('ProjectEarnSection.tsx')
    expect(earn).toContain('IconDroplet')
    expect(earn).not.toMatch(/💧|🌾|🏊|📈/)
  })

  it('desktop project sticky nav uses underline active style', () => {
    const nav = load('ProjectStickyNav.tsx')
    expect(nav).toContain('inset 0 -2px 0')
    expect(nav).toContain('top: 64px')
  })
})
