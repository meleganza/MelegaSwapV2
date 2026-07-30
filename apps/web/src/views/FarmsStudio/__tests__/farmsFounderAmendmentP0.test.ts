/**
 * Founder amendment P0-4 / P0-5 / P0-6 / P0-7 / P0-8 — targeted acceptance checks.
 * Does not modify contracts/router/wallet/MasterChef logic; source inspection only
 * plus pure view-model behavior for the Active Farmers KPI.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { buildFarmsOverviewKpisFromParts } from '../modules/buildFarmsOverviewKpis'

const STUDIO = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(STUDIO, rel), 'utf8')
}

describe('Founder amendment P0-4 — Active Farmers never shows a permanent skeleton', () => {
  it('surfaces a factual "Indexing…" value (not null) while the seed/index catches up', () => {
    const vm = buildFarmsOverviewKpisFromParts({
      previewCards: [],
      farmsLoading: false,
      account: null,
      userDataLoaded: true,
      cakePriceUsd: 0,
      emissionPerDay: null,
      emissionPerDayLabel: null,
      uniqueFarmersCount: null,
      uniqueFarmersLoading: true,
    })
    expect(vm.cards.find((c) => c.id === 'activeFarmers')?.value).toBe('Indexing…')
    expect(vm.cards.find((c) => c.id === 'activeFarmers')?.state).toBe('loading')
  })

  it('surfaces the certified seed/live count as soon as one is available, even mid-index', () => {
    const vm = buildFarmsOverviewKpisFromParts({
      previewCards: [],
      farmsLoading: false,
      account: null,
      userDataLoaded: true,
      cakePriceUsd: 0,
      emissionPerDay: null,
      emissionPerDayLabel: null,
      uniqueFarmersCount: 318,
      uniqueFarmersLoading: true,
    })
    expect(vm.cards.find((c) => c.id === 'activeFarmers')?.value).toBe('318')
  })

  it('KpisModule renders the factual Indexing… text instead of an indefinite skeleton', () => {
    const src = load('modules/FarmsOverviewKpisModule.tsx')
    expect(src).toContain('hasFactualLoadingValue')
    expect(src).toContain("model.id === 'activeFarmers'")
  })

  it('farmerParticipantIndex falls back to the certified seed in-memory even if the FS write fails', () => {
    const src = readFileSync(
      path.resolve(STUDIO, '../../lib/bsc-indexer/indexer/farmerParticipantIndex.ts'),
      'utf8',
    )
    expect(src).toContain('certifiedSeedFallbackState')
    expect(src).toContain('certifiedSeedFallbackWallets')
    expect(src).toMatch(/catch\s*\{[\s\S]{0,200}in-memory fallback/)
  })
})

describe('Founder amendment P0-5 — My Farms containment', () => {
  it('My Farms surface never clips action buttons (overflow:visible, height:auto)', () => {
    const src = load('modules/FarmsMyFarmsModule.tsx')
    const surfaceBlock = src.slice(src.indexOf('const Surface = styled.div`'), src.indexOf('const Header ='))
    expect(surfaceBlock).toContain('overflow: visible')
    expect(surfaceBlock).toContain('height: auto')
    // The actual CSS declaration must never clip (a code-comment mentioning the
    // old bug by name is fine — only a live "overflow: hidden;" rule would clip).
    expect(surfaceBlock).not.toMatch(/overflow:\s*hidden;/)
  })

  it('position action labels are Harvest / Stake More / Withdraw — never a generic Manage', () => {
    const src = load('modules/buildFarmsWalletPositions.ts')
    expect(src).toContain("label: 'Harvest'")
    expect(src).toContain("label: 'Stake More'")
    expect(src).toContain("label: 'Withdraw'")
    expect(src).not.toContain("label: 'Manage'")
    const card = load('modules/FarmsMyFarmCard.tsx')
    expect(card).toContain('BscScan ↗')
    expect(card).not.toContain('>Manage<')
  })
})

describe('Founder amendment P0-6 — Explore Farms density grid', () => {
  it('locks the mobile-first column cascade: 1 / 3 / 2 / 4 / 5', () => {
    const tokens = load('modules/farmsExploreFarmsTokens.ts')
    expect(tokens).toContain("smallTabletBreak: '768px'")
    expect(tokens).toContain("tabletPortraitBreak: '1025px'")
    expect(tokens).toContain("desktopBreak: '1200px'")
    expect(tokens).toContain("ultraWideBreak: '1920px'")

    const grid = load('modules/FarmsExploreFarmsModule.tsx')
    expect(grid).toContain('grid-template-columns: repeat(1, minmax(0, 1fr));')
    expect(grid).toMatch(/min-width: \$\{farmsExplore\.smallTabletBreak\}\)\s*\{\s*grid-template-columns: repeat\(3/)
    expect(grid).toMatch(/min-width: \$\{farmsExplore\.tabletPortraitBreak\}\)\s*\{\s*grid-template-columns: repeat\(2/)
    expect(grid).toMatch(/min-width: \$\{farmsExplore\.desktopBreak\}\)\s*\{\s*grid-template-columns: repeat\(4/)
    expect(grid).toMatch(/min-width: \$\{farmsExplore\.ultraWideBreak\}\)\s*\{\s*grid-template-columns: repeat\(5/)
  })

  it('compacts the Explore Farms card with short Farm ↗ / LP ↗ contract labels', () => {
    const card = load('modules/FarmsExploreFarmCard.tsx')
    expect(card).toContain('Farm ↗')
    expect(card).toContain('LP ↗')
    expect(card).not.toContain('Farm Contract ↗')
    expect(card).not.toContain('LP Contract ↗')
  })
})

describe('Founder amendment P0-7 — Finished Farms fully unmounted', () => {
  it('FarmsStudioScreen never mounts FarmsFinishedFarmsModule anywhere', () => {
    const screen = load('FarmsStudioScreen.tsx')
    expect(screen).not.toContain('FarmsFinishedFarmsModule')
    expect(screen).toContain('data-farms-module-005="unmounted"')
  })
})

describe('Founder amendment P0-8 — Create Farm mounted before Explore', () => {
  it('CreateFarmWorkspace mounts before FarmsExploreFarmsModule with the required test id', () => {
    const screen = load('FarmsStudioScreen.tsx')
    expect(screen.indexOf('<CreateFarmWorkspace')).toBeGreaterThan(-1)
    expect(screen.indexOf('<CreateFarmWorkspace')).toBeLessThan(screen.indexOf('<FarmsExploreFarmsModule'))
    expect(screen).toContain('data-farms-create-farm="mounted"')
    const workspace = load('modules/CreateFarmWorkspace.tsx')
    expect(workspace).toContain('data-testid="create-farm-workspace"')
  })
})
