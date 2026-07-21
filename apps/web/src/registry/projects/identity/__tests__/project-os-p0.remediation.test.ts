/**
 * PROJECT_OS_P0 — production-blocking remediation tests.
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { resolveProjectBySlug, getAllResolvableProjectSlugs, loadProjectMachineDocument } from '../index'
import { runImportAnalysis } from 'views/BuildStudio/buildRuntime/buildImportAnalysis'
import { discoverProjectFromContract } from 'views/ProjectsStudio/projectsRuntime/discoverProjectFromContract'

const ROOT = path.join(__dirname, '../../../../')

describe('PROJECT_OS_P0 remediation', () => {
  it('P0-01/P0-05: melega-dex and marco resolve as distinct identities (UX001)', () => {
    expect(resolveProjectBySlug('melega-dex').ok).toBe(true)
    expect(resolveProjectBySlug('melega').ok).toBe(true)
    expect(resolveProjectBySlug('marco').ok).toBe(true)
    const a = resolveProjectBySlug('melega-dex')
    const b = resolveProjectBySlug('marco')
    const alias = resolveProjectBySlug('melega')
    expect(a.ok && b.ok && alias.ok).toBe(true)
    if (a.ok && b.ok && alias.ok) {
      expect(a.project.upi).not.toBe(b.project.upi)
      expect(a.slug).toBe('melega-dex')
      expect(b.slug).toBe('marco')
      expect(alias.slug).toBe('melega-dex')
      expect(alias.project.upi).toBe(a.project.upi)
    }
    const slugs = getAllResolvableProjectSlugs()
    expect(slugs).toContain('melega-dex')
    expect(slugs).toContain('marco')
  })

  it('P0-01: edge rewrite + next rewrite + vercel rewrite present', () => {
    const mw = readFileSync(path.join(ROOT, 'middleware.ts'), 'utf8')
    expect(mw).toContain("pathname.match(/^\\/@([a-z0-9-]+)\\/?$/)")
    expect(mw).toContain('/project-hq/')
    expect(mw).toContain("'/@:slug'")
    const nextCfg = readFileSync(path.join(ROOT, '../next.config.mjs'), 'utf8')
    expect(nextCfg).toContain("'/@:slug'")
    expect(nextCfg).toContain("'/project-hq/:slug'")
    const vercel = readFileSync(path.join(ROOT, '../../../vercel.json'), 'utf8')
    expect(vercel).toContain('/@:slug')
    expect(vercel).toContain('/project-hq/:slug')
  })

  it('P0-03: MARCO BSC contract resolves to canonical MARCO project', () => {
    const marco = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
    const discovery = discoverProjectFromContract(marco, 56)
    expect(discovery.found).toBe(true)
    expect(discovery.registryTier).toBe('canonical')
    expect(discovery.project?.slug).toBe('marco')
    const analysis = runImportAnalysis(marco, 'bnb')
    expect(analysis.found).toBe(true)
    expect(analysis.project?.slug).toBe('marco')
    expect(analysis.projectName).not.toMatch(/unknown/i)
  })

  it('P0-03: pending path never silent Unknown Project without reason', () => {
    const discovery = discoverProjectFromContract('0x00000000000000000000000000000000000000aa', 56, {
      name: 'Test Token',
      symbol: 'TT',
    })
    expect(discovery.registryTier).toBe('pending')
    expect(discovery.pending?.name.available || discovery.pending?.symbol.available).toBe(true)
    expect(discovery.name || discovery.ticker).toBeTruthy()
  })

  it('P0-02: navigation entries point at certified flows', () => {
    const homeCta = readFileSync(path.join(ROOT, 'views/HomeTrade/ListProjectCta.tsx'), 'utf8')
    expect(homeCta).toContain('/import-existing-token')
    expect(homeCta).toContain('Create / Import Project')
    const projectsHeader = readFileSync(
      path.join(ROOT, 'views/ProjectsStudio/components/ProjectsStudioPageHeader.tsx'),
      'utf8',
    )
    expect(projectsHeader).toContain('Import Existing Token')
    expect(projectsHeader).toContain('Claim Existing Project')
    expect(projectsHeader).toContain('/import-existing-token')
  })

  it('P0-04: Open Project Page uses /@slug', () => {
    const trade = readFileSync(path.join(ROOT, 'views/Trade/components/TradePageHeader.tsx'), 'utf8')
    expect(trade).toContain('/@marco/')
    expect(trade).toContain('Open Project Page')
    const cards = readFileSync(path.join(ROOT, 'views/ProjectsStudio/components/ProjectGridCard.tsx'), 'utf8')
    expect(cards).toContain('/@${project.slug}/')
    expect(cards).toContain('Open Project Page')
    const search = readFileSync(path.join(ROOT, 'lib/global-search/buildGlobalSearchIndex.ts'), 'utf8')
    expect(search).toContain('/@${project.slug}/')
  })

  it('P0-05: /@marco loads MARCO Project OS machine document', () => {
    const machine = loadProjectMachineDocument('marco', '2026-07-21T00:00:00.000Z')
    expect(machine).not.toBeNull()
    expect(machine!.slug).toBe('marco')
    expect(machine!.projectId).toBe('upi://melega/project/marco@1')
    expect(machine!.capabilities.length).toBeGreaterThan(0)
    expect(machine!.schemas.some((s) => s.hub === 'PP014')).toBe(true)
  })

  it('onboard API fetches on-chain identity helper exists', () => {
    expect(existsSync(path.join(ROOT, 'registry/projects/pending/fetchErc20OnChainIdentity.ts'))).toBe(true)
    const onboard = readFileSync(path.join(ROOT, 'pages/api/registry/projects/onboard.ts'), 'utf8')
    expect(onboard).toContain('fetchErc20OnChainIdentity')
  })
})
