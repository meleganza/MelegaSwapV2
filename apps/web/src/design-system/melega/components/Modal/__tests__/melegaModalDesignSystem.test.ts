import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const WEB = path.resolve(__dirname, '../../../../../../')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_MODAL_DESIGN_SYSTEM_REFACTOR', () => {
  it('ships canonical MelegaModal with shared tokens', () => {
    const modal = load('src/design-system/melega/components/Modal/MelegaModal.tsx')
    expect(modal).toContain('melegaModalTokens')
    expect(modal).toContain('data-melega-modal')
    expect(modal).toContain('data-melega-modal-close')
    expect(modal).toContain('radius')
    expect(modal).toContain('shadow')
    expect(existsSync(path.join(WEB, 'src/design-system/melega/components/Modal/MelegaAccordionSection.tsx'))).toBe(
      true,
    )
  })

  it('applies MelegaModal to Create Farm and Create Pool screens', () => {
    const farms = load('src/views/FarmsStudio/FarmsStudioScreen.tsx')
    const pools = load('src/views/PoolsStudio/PoolsStudioScreen.tsx')
    expect(farms).toContain('MelegaModal')
    expect(farms).toContain('create-farm-modal')
    expect(pools).toContain('MelegaModal')
    expect(pools).toContain('create-pool-modal')
  })

  it('styles Chain Switch surfaces with Melega modal family', () => {
    const network = load('src/components/Menu/UserMenu/NetworkSwitchModal.tsx')
    const confirm = load('src/components/ChainSwitchConfirmDialog.tsx')
    expect(network).toContain('MelegaModal')
    expect(network).toContain('testId="network-switch-modal"')
    expect(confirm).toContain('MelegaModal')
    expect(confirm).toContain('chain-switch-confirm-dialog')
    expect(confirm).toContain('This product is available on')
  })

  it('Create Farm / Create Pool use md MelegaModal (720–760px band)', () => {
    const farms = load('src/views/FarmsStudio/FarmsStudioScreen.tsx')
    const pools = load('src/views/PoolsStudio/PoolsStudioScreen.tsx')
    const modal = load('src/design-system/melega/components/Modal/MelegaModal.tsx')
    expect(farms).toContain('size="md"')
    expect(pools).toContain('size="md"')
    expect(farms).not.toContain('size="lg"')
    expect(pools).not.toContain('size="lg"')
    expect(modal).toContain("maxWidthMd: '740px'")
    expect(modal).toContain("maxHeight: 'min(82vh, 760px)'")
    expect(modal).toContain('data-melega-modal-brand')
    expect(modal).toContain('data-melega-modal-system="v3"')
    expect(modal).toContain('data-melega-modal-footer')
  })

  it('Create Farm uses accordion + sticky preview', () => {
    const farm = load('src/views/FarmsStudio/modules/PublicFarmFactoryWorkspace.tsx')
    expect(farm).toContain('data-create-farm-accordion')
    expect(farm).toContain('MelegaAccordionSection')
    expect(farm).toContain('create-farm-acc-pair')
    expect(farm).toContain('create-farm-acc-liquidity')
    expect(farm).toContain('create-farm-acc-reward')
    expect(farm).toContain('create-farm-acc-budget')
    expect(farm).toContain('create-farm-acc-advanced')
    expect(farm).toContain('title="Step 1"')
    expect(farm).toContain('title="Step 2"')
    expect(farm).toContain("showInlineLiquidity ? 'Step 4' : 'Step 3'")
    expect(farm).toContain('title="Advanced"')
    expect(farm).not.toContain('create-farm-acc-duration')
    expect(farm).toContain('position: sticky')
  })

  it('Create Pool uses MelegaAccordionSection steps', () => {
    const pool = load('src/views/PoolsStudio/components/CreatePoolCta.tsx')
    expect(pool).toContain('MelegaAccordionSection')
    expect(pool).toContain('create-pool-acc-')
    expect(pool).toContain('data-create-pool-accordion')
    expect(pool).toContain('position: sticky')
  })
})
