/**
 * MELEGASWAP_V2_PRODUCT_CONSISTENCY_AND_RUNTIME_REPAIR — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const WEB = path.resolve(__dirname, '../..')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_PRODUCT_CONSISTENCY_AND_RUNTIME_REPAIR', () => {
  it('P0 header nav uses navigatePrimary with hard-fallback', () => {
    const header = load('design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx')
    expect(header).toContain('navigatePrimary')
    expect(header).toContain('window.location.assign')
    expect(header).toContain('event.preventDefault()')
  })

  it('P0 chain switch uses MelegaModal and product availability copy', () => {
    const network = load('components/Menu/UserMenu/NetworkSwitchModal.tsx')
    const confirm = load('components/ChainSwitchConfirmDialog.tsx')
    expect(network).toContain('MelegaModal')
    expect(network).toContain('safePick')
    expect(confirm).toContain('This product is available on')
    expect(confirm).not.toMatch(/\{productLabel\} is on/)
  })

  it('Create Farm/Pool modals are 720px (md)', () => {
    expect(load('views/FarmsStudio/FarmsStudioScreen.tsx')).toContain('size="md"')
    expect(load('views/PoolsStudio/PoolsStudioScreen.tsx')).toContain('size="md"')
  })

  it('Home Top Farms/Pools prefer active-chain runtime then inventory pad', () => {
    const data = load('views/HomeTrade/useHomeTradeData.ts')
    expect(data).toContain('farmRewards')
    expect(data).toContain('listLiveFarmInventoryPreview')
    expect(data).toContain('listLivePoolInventoryPreview')
    expect(data).toContain('Prefer active-chain farms')
  })

  it('Liquidity snapshot exposes TVL, Volume, Fees, Positions', () => {
    const snap = load('views/LiquidityStudio/onePage/DexLiquiditySnapshot.tsx')
    expect(snap).toContain('useCanonicalMarketSnapshot')
    expect(snap).toContain('Fees (24H LP)')
    expect(snap).toContain('liq-snap-positions')
    expect(snap).toContain('LP_HOLDERS_FEE')
  })

  it('Portfolio removes Passport identity CTAs and aligns uxRebuild tokens', () => {
    const model = load('views/Passport/v1/buildPassportV1Model.ts')
    const theme = load('views/Passport/v1/theme.ts')
    const shell = load('views/Passport/v1/PassportV1Shell.tsx')
    expect(model).not.toContain('View Passport')
    expect(model).not.toContain('Create Passport')
    expect(model).not.toContain('Verify Identity')
    expect(theme).toContain('uxRebuildFont')
    expect(theme).toContain('uxRebuildLayout.contentMax')
    expect(shell).toContain('Your Portfolio')
    expect(shell).not.toContain('Privacy / verification info')
  })

  it('Project page prep shares uxRebuild tokens', () => {
    const theme = load('views/ProjectPage/v1/theme.ts')
    expect(theme).toContain('uxRebuildFont')
    expect(theme).toContain('uxRebuildColors.gold')
  })

  it('ships mission evidence report', () => {
    expect(
      existsSync(
        path.resolve(__dirname, '../../../docs/runtime/product-consistency-runtime-repair/REPORT.md'),
      ),
    ).toBe(true)
  })
})
