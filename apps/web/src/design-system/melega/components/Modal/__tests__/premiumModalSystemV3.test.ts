/**
 * MELEGASWAP_V2_PREMIUM_MODAL_SYSTEM_V3
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const WEB = path.resolve(__dirname, '../../../../../../')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_PREMIUM_MODAL_SYSTEM_V3', () => {
  const modal = load('src/design-system/melega/components/Modal/MelegaModal.tsx')
  const farm = load('src/views/FarmsStudio/modules/PublicFarmFactoryWorkspace.tsx')
  const pool = load('src/views/PoolsStudio/components/CreatePoolCta.tsx')
  const network = load('src/components/Menu/UserMenu/NetworkSwitchModal.tsx')

  it('MelegaModal V3: viewport-safe geometry, footer, focus trap, brand header', () => {
    expect(modal).toContain("maxWidthMd: '740px'")
    expect(modal).toContain("maxWidthSm: '480px'")
    expect(modal).toContain("maxHeight: 'min(82vh, 760px)'")
    expect(modal).toContain('data-melega-modal-system="v3"')
    expect(modal).toContain('data-melega-modal-footer')
    expect(modal).toContain('data-melega-modal-title')
    expect(modal).toContain('getFocusable')
    expect(modal).toContain('closeOnBackdrop')
    expect(modal).toContain('previouslyFocused')
    expect(modal).toContain('aria-modal')
  })

  it('exports footer/preview/status primitives', () => {
    const idx = load('src/design-system/melega/components/Modal/index.ts')
    expect(idx).toContain('MelegaModalFooter')
    expect(idx).toContain('MelegaModalPreview')
    expect(idx).toContain('MelegaModalStatus')
    expect(idx).toContain('MelegaAccordionSection')
  })

  it('Create Farm: one title path, accordion steps, no duplicate liquidity CTA', () => {
    expect(farm).toContain('title="Step 1"')
    expect(farm).toContain('title="Step 2"')
    expect(farm).toContain('title="Step 3"')
    expect(farm).toContain('title="Advanced"')
    expect(farm).toContain('create-farm-acc-advanced')
    expect(farm).toContain('public-farm-low-liquidity-remediation')
    expect(farm).not.toContain('data-testid="create-farm-next-increase"')
    expect(farm).not.toContain('<StepLabel>Step 2</StepLabel>')
    expect(farm).toContain('position: sticky')
  })

  it('Create Pool: Tokens → Rewards → Safety → Review funnel', () => {
    expect(pool).toContain("'Tokens'")
    expect(pool).toContain("'Rewards'")
    expect(pool).toContain("'Safety'")
    expect(pool).toContain("'Review'")
    expect(pool).toContain('Melega Treasury')
    expect(pool).not.toMatch(/Fee destination:[\s\S]*0x[a-fA-F0-9]{40}/)
    expect(pool).toContain('data-create-pool-accordion')
    expect(pool).toContain('position: sticky')
  })

  it('Switch Network: compact grid + in-modal error containment', () => {
    expect(network).toContain('size="sm"')
    expect(network).toContain('network-switch-error')
    expect(network).toContain('setError')
    expect(network).toContain('grid-template-columns: repeat(3')
    expect(network).toContain('preparing.length > 0')
  })

  it('Farms/Pools screens mount MelegaModal with one shell title', () => {
    const farms = load('src/views/FarmsStudio/FarmsStudioScreen.tsx')
    const pools = load('src/views/PoolsStudio/PoolsStudioScreen.tsx')
    expect(farms).toContain('create-farm-modal')
    expect(farms).toContain('title="Create Farm"')
    expect(pools).toContain('create-pool-modal')
    expect(pools).toContain('title="Create Pool"')
    expect(existsSync(path.join(WEB, 'src/design-system/melega/components/Modal/MelegaModal.tsx'))).toBe(true)
  })
})
