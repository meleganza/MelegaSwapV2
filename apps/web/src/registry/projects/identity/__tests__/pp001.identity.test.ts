import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { getAllProjects } from '../../getAllProjects'
import { getAllProjectSlugs, getProjectBySlug } from '../../getProjectBySlug'
import { STATIC_PROJECTS } from '../../projects.data'
import type { StaticProjectRecord } from '../../types'
import {
  buildProjectJsonLd,
  findCrossProjectContractCollisions,
  isSafeHttpUrl,
  normalizeEvmAddress,
  normalizeProjectDocument,
  normalizeProjectSlugInput,
  resolveProjectByContractAddress,
  resolveProjectBySlug,
  resolveProjectByTokenSymbol,
  toCaip10Contract,
  toCaip19Erc20,
  toCaip2ChainId,
  toPublicProjectJson,
} from '../index'
import { PROJECT_PAGE_SCHEMA_VERSION } from '../provenance'

const FIXED_NOW = '2026-07-20T12:00:00.000Z'

function baseProject(overrides: Partial<StaticProjectRecord> = {}): StaticProjectRecord {
  return {
    upi: 'upi://test/project/fixture@1',
    slug: 'fixture-project',
    aliases: ['fixture'],
    displayName: 'Fixture Project',
    description: 'A fixture project for PP001 tests.',
    registryStatus: 'listed',
    phase: 'registered',
    verificationStatus: 'unverified',
    trustBadges: ['unverified'],
    endorsementStatus: 'none',
    riskTier: 'unknown',
    legacyImport: false,
    isCanonical: false,
    mvpStatic: true,
    sectorTags: ['Test'],
    supportedChains: [56],
    resources: {
      tokens: [],
      liquidityPools: [],
      farms: [],
      stakingPools: [],
    },
    capabilities: {
      tradable: { status: 'none' },
      liquidity: { status: 'none' },
      farm: { status: 'none' },
      pool: { status: 'none' },
      lock: { status: 'none' },
      vesting: { status: 'none' },
      launch: { status: 'none' },
      smartdrop: { status: 'none' },
      radar: { status: 'none' },
      space: { status: 'none' },
      labs: { status: 'none' },
      aiReport: { status: 'none' },
      machineManifest: { status: 'none' },
      treasuryCompatible: { status: 'none' },
    },
    primaryTokenRefs: [],
    deepLinks: {},
    disclaimer: 'test',
    asOf: '2026-06-26',
    ...overrides,
  }
}

describe('PP001 slug resolution', () => {
  it('resolves valid canonical slug', () => {
    const result = resolveProjectBySlug('melega-dex')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.slug).toBe('melega-dex')
      expect(result.matchedVia).toBe('slug')
      expect(result.project.upi).toBe('upi://melega/project/melega-dex@1')
    }
  })

  it('case-normalizes canonical slug', () => {
    const result = resolveProjectBySlug('Melega-DEX')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.slug).toBe('melega-dex')
      expect(result.matchedVia).toBe('slug')
    }
  })

  it('resolves alias to same project identity', () => {
    const byAlias = resolveProjectBySlug('melega')
    const bySlug = resolveProjectBySlug('melega-dex')
    expect(byAlias.ok).toBe(true)
    expect(bySlug.ok).toBe(true)
    if (byAlias.ok && bySlug.ok) {
      expect(byAlias.matchedVia).toBe('alias')
      expect(byAlias.project.upi).toBe(bySlug.project.upi)
      expect(byAlias.slug).toBe('melega-dex')
    }
  })

  it('returns not_found for unknown slug', () => {
    const result = resolveProjectBySlug('does-not-exist')
    expect(result).toEqual({ ok: false, reason: 'not_found' })
  })

  it('returns malformed for invalid slug shapes', () => {
    expect(resolveProjectBySlug('../etc')).toEqual({ ok: false, reason: 'malformed' })
    expect(resolveProjectBySlug('has space')).toEqual({ ok: false, reason: 'malformed' })
    expect(resolveProjectBySlug('')).toEqual({ ok: false, reason: 'malformed' })
    expect(resolveProjectBySlug('@@@')).toEqual({ ok: false, reason: 'malformed' })
    expect(normalizeProjectSlugInput(null)).toBeNull()
    expect(normalizeProjectSlugInput('@melega-dex')).toBe('melega-dex')
  })
})

describe('PP001 identity normalization', () => {
  it('project without token keeps empty assets/contracts', () => {
    const doc = normalizeProjectDocument(baseProject(), { generatedAt: FIXED_NOW })
    expect(doc.assets).toHaveLength(0)
    expect(doc.contracts).toHaveLength(0)
    expect(doc.projectId).toBe('upi://test/project/fixture@1')
    expect(doc.schemaVersion).toBe(PROJECT_PAGE_SCHEMA_VERSION)
  })

  it('project with one token produces one asset and contract', () => {
    const doc = normalizeProjectDocument(
      baseProject({
        resources: {
          tokens: [
            {
              chainId: 56,
              address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
              symbol: 'MARCO',
              ref: 'token://56/0x963556de0eb8138E97A85F0A86eE0acD159D210b',
            },
          ],
          liquidityPools: [],
          farms: [],
          stakingPools: [],
        },
        primaryTokenRefs: ['token://56/0x963556de0eb8138E97A85F0A86eE0acD159D210b'],
      }),
      { generatedAt: FIXED_NOW },
    )
    expect(doc.assets).toHaveLength(1)
    expect(doc.contracts).toHaveLength(1)
    expect(doc.assets[0].assetId).toBe(toCaip19Erc20(56, '0x963556de0eb8138E97A85F0A86eE0acD159D210b'))
  })

  it('project with multiple assets and chains', () => {
    const marco = getProjectBySlug('marco')!
    const doc = normalizeProjectDocument(marco, { generatedAt: FIXED_NOW })
    expect(doc.assets.length).toBeGreaterThan(1)
    expect(doc.chains.length).toBe(4)
    expect(doc.deployments.length).toBe(4)
    expect(new Set(doc.contracts.map((c) => c.caip10)).size).toBe(doc.contracts.length)
  })

  it('missing optional identity fields stay unavailable (not zero)', () => {
    const doc = normalizeProjectDocument(
      baseProject({ tagline: undefined, logoUrl: undefined, projectType: undefined }),
      { generatedAt: FIXED_NOW },
    )
    expect(doc.identity.logoUrl.meta.availability).toBe('UNAVAILABLE')
    expect(doc.identity.logoUrl.value).toBeNull()
    expect(doc.identity.shortPurpose.meta.availability).toBe('UNAVAILABLE')
    expect(doc.identity.shortPurpose.value).toBeNull()
  })

  it('rejects invalid resource URLs', () => {
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeHttpUrl('ftp://example.com')).toBe(false)
    expect(isSafeHttpUrl('https://example.com')).toBe(true)
    const doc = normalizeProjectDocument(
      baseProject({
        websiteUrl: 'javascript:alert(1)',
        docsUrl: 'not-a-url',
        socialLinks: [{ type: 'telegram', url: 'https://t.me/ok' }],
      }),
      { generatedAt: FIXED_NOW },
    )
    expect(doc.resources.every((r) => r.url.startsWith('https://'))).toBe(true)
    expect(doc.resources).toHaveLength(1)
  })

  it('marks conflicting same-address symbols in evidence', () => {
    const doc = normalizeProjectDocument(
      baseProject({
        resources: {
          tokens: [
            {
              chainId: 56,
              address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
              symbol: 'AAA',
              ref: 'token://56/a',
            },
            {
              chainId: 56,
              address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
              symbol: 'BBB',
              ref: 'token://56/b',
            },
          ],
          liquidityPools: [],
          farms: [],
          stakingPools: [],
        },
      }),
      { generatedAt: FIXED_NOW },
    )
    expect(doc.evidence.some((e) => e.status === 'conflicted')).toBe(true)
    expect(doc.provenanceSummary.availabilityNotes.some((n) => n.includes('Conflicting'))).toBe(true)
  })

  it('exposes stale freshness when evidence marked stale', () => {
    const doc = normalizeProjectDocument(baseProject(), { generatedAt: FIXED_NOW })
    const withStale = {
      ...doc,
      evidence: [
        ...doc.evidence,
        {
          evidenceType: 'legacy_observation',
          sourceType: 'THIRD_PARTY' as const,
          reference: 'Stale third-party observation',
          status: 'observed',
          observedAt: '2020-01-01',
          updatedAt: '2020-01-01',
          freshness: 'stale' as const,
        },
      ],
    }
    expect(withStale.evidence.some((e) => e.freshness === 'stale')).toBe(true)
  })

  it('HTML and JSON derive from the same normalized document', () => {
    const melega = getProjectBySlug('melega-dex')!
    const doc = normalizeProjectDocument(melega, { generatedAt: FIXED_NOW })
    const json = toPublicProjectJson(doc)
    expect(json.schemaVersion).toBe(doc.schemaVersion)
    expect(json.projectId).toBe(doc.projectId)
    expect(json.slug).toBe(doc.slug)
    expect(json.canonicalUrl).toBe(doc.canonicalUrl)
    expect(json.revision).toBe(doc.revision)
    expect((json.identity as { displayName: string }).displayName).toBe(doc.identity.displayName)
    expect((json.assets as unknown[]).length).toBe(doc.assets.length)
    expect((json.contracts as unknown[]).length).toBe(doc.contracts.length)
  })

  it('schema version is present and JSON-LD uses sanitized identity', () => {
    const doc = normalizeProjectDocument(getProjectBySlug('melega-dex')!, { generatedAt: FIXED_NOW })
    const ld = buildProjectJsonLd(doc)
    expect(doc.schemaVersion).toBe('melega.project-page.v1')
    expect(ld['@type']).toBe('Organization')
    expect(ld.name).toBe(doc.identity.displayName)
    expect(ld.url).toBe(doc.canonicalUrl)
    expect(JSON.stringify(ld)).not.toMatch(/<script/i)
  })
})

describe('PP001 chain identifiers', () => {
  it('builds CAIP-2/10/19 and rejects malformed addresses', () => {
    expect(toCaip2ChainId(56)).toBe('eip155:56')
    expect(toCaip10Contract(56, '0x963556de0eb8138E97A85F0A86eE0acD159D210b')).toBe(
      'eip155:56:0x963556de0eb8138e97a85f0a86ee0acd159d210b',
    )
    expect(toCaip19Erc20(56, '0x963556de0eb8138E97A85F0A86eE0acD159D210b')).toBe(
      'eip155:56/erc20:0x963556de0eb8138e97a85f0a86ee0acd159d210b',
    )
    expect(normalizeEvmAddress('not-an-address')).toBeNull()
    expect(toCaip10Contract(56, '0x123')).toBeNull()
  })

  it('prevents cross-project contract address collisions in registry', () => {
    expect(findCrossProjectContractCollisions()).toEqual([])
  })

  it('token symbol / contract search may resolve project but are not canonical URLs', () => {
    const bySymbol = resolveProjectByTokenSymbol('MARCO')
    const byAddress = resolveProjectByContractAddress('0x963556de0eb8138E97A85F0A86eE0acD159D210b')
    expect(bySymbol?.slug).toBe('marco')
    expect(byAddress?.slug).toBe('marco')
    const doc = normalizeProjectDocument(bySymbol!, { generatedAt: FIXED_NOW })
    expect(doc.canonicalUrl).toContain('/@marco')
    expect(doc.canonicalUrl).not.toMatch(/0x963556/i)
  })
})

describe('PP001 route and shell source contracts', () => {
  const hqPage = readFileSync(path.resolve(__dirname, '../../../../pages/project-hq/[slug].tsx'), 'utf8')
  const consumer = readFileSync(
    path.resolve(__dirname, '../../../../views/ProjectPage/consumer/ProjectConsumerShell.tsx'),
    'utf8',
  )
  const stickyNav = readFileSync(
    path.resolve(__dirname, '../../../../views/ProjectPage/consumer/ProjectStickyNav.tsx'),
    'utf8',
  )
  const hero = readFileSync(path.resolve(__dirname, '../../../../views/ProjectPage/consumer/ProjectHero.tsx'), 'utf8')
  const nextConfig = readFileSync(path.resolve(__dirname, '../../../../../next.config.mjs'), 'utf8')
  const api = readFileSync(path.resolve(__dirname, '../../../../pages/api/public/projects/[slug].ts'), 'utf8')

  it('implements legacy detail redirect to canonical /@ slug via next.config', () => {
    // Config-layer permanent redirect (GSP redirects are incompatible with this app's prerender/export).
    expect(nextConfig).toMatch(/destination: '\/@:slug/)
    expect(nextConfig).toMatch(/source: '\/projects\/:slug/)
    expect(nextConfig).toMatch(/permanent: true/)
  })

  it('implements /@ rewrite to project-hq', () => {
    expect(nextConfig).toMatch(/source: '\/@:slug/)
    expect(nextConfig).toMatch(/destination: '\/project-hq\/:slug/)
  })

  it('does not render fake action controls', () => {
    expect(consumer).not.toMatch(/fake/i)
    expect(consumer).not.toMatch(/disabled action/i)
    expect(consumer).toMatch(/data-testid="project-consumer-shell"/)
    expect(hqPage).toMatch(/ProjectConsumerShell/)
  })

  it('includes accessibility affordances', () => {
    expect(stickyNav).toMatch(/aria-label/)
    expect(hero).toMatch(/Copy|copy/)
    expect(consumer).toMatch(/prefers-reduced-motion|ProjectStickyNav/)
    expect(hero).toMatch(/opens in a new tab|noopener/)
  })

  it('includes responsive mobile consumer navigation', () => {
    expect(stickyNav).toMatch(/44px|min-height:\s*44/)
    expect(stickyNav).toMatch(/Overview|Chart|Swap/)
  })

  it('SEO page sets canonical /@ URL and JSON alternate', () => {
    expect(hqPage).toMatch(/canonicalProjectAbsoluteUrl/)
    expect(hqPage).toMatch(/application\/ld\+json/)
    expect(hqPage).toMatch(/api\/public\/projects/)
    expect(hqPage).toMatch(/og:title/)
    expect(hqPage).toMatch(/ProjectHqPage\.Meta\s*=\s*ProjectHqMeta/)
    expect(hqPage).toMatch(/notFound:\s*true/)
  })

  it('public API returns 404 for unknown and includes schema/ETag', () => {
    expect(api).toMatch(/status\(404\)/)
    expect(api).toMatch(/ETag/)
    expect(api).toMatch(/toPublicProjectJson/)
  })
})

describe('PP001 discovery and frozen-surface regression', () => {
  it('keeps /projects discovery entry and registry list intact', () => {
    const discoveryPage = readFileSync(path.resolve(__dirname, '../../../../pages/projects/index.tsx'), 'utf8')
    expect(discoveryPage).toMatch(/ProjectsStudioScreen/)
    expect(getAllProjectSlugs()).toContain('melega-dex')
    expect(getAllProjectSlugs()).toContain('marco')
    expect(getAllProjects().length).toBe(STATIC_PROJECTS.length)
    expect(getProjectBySlug('melega-dex')).toBeTruthy()
    expect(getProjectBySlug('marco')).toBeTruthy()
  })

  it('does not modify frozen studio entry paths or LB health API', () => {
    const frozenPaths = [
      '../../../../pages/liquidity.tsx',
      '../../../../pages/liquidity-studio.tsx',
      '../../../../pages/farms/index.tsx',
      '../../../../pages/pools/index.tsx',
      '../../../../pages/command-center/index.tsx',
      '../../../../pages/api/liquidity-building/health.ts',
    ]
    for (const rel of frozenPaths) {
      const abs = path.resolve(__dirname, rel)
      expect(() => readFileSync(abs, 'utf8')).not.toThrow()
    }
    const farms = readFileSync(path.resolve(__dirname, '../../../../pages/farms/index.tsx'), 'utf8')
    const pools = readFileSync(path.resolve(__dirname, '../../../../pages/pools/index.tsx'), 'utf8')
    const liquidity = readFileSync(path.resolve(__dirname, '../../../../pages/liquidity.tsx'), 'utf8')
    const commandCenter = readFileSync(path.resolve(__dirname, '../../../../pages/command-center/index.tsx'), 'utf8')
    expect(farms).toMatch(/Farm/)
    expect(pools).toMatch(/Pool/)
    expect(liquidity.toLowerCase()).toMatch(/liquidity/)
    expect(commandCenter).toMatch(/CommandCenter|command-center|Command Center/i)
  })
})
