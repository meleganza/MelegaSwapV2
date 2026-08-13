/**
 * MELEGA_DEX_V1_SMART_SWAP_PROTOCOL_FEE_SETTLEMENT — UI / wiring assertions
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { calculateSmartRouterGasProtocolFee, isCanonicalTreasuryRecipient } from 'lib/smart-swap-gas-protocol-fee'

const WEB = path.resolve(__dirname, '../../..')

function load(rel: string) {
  return readFileSync(path.join(WEB, rel), 'utf8')
}

describe('MELEGA_DEX_V1_SMART_SWAP_PROTOCOL_FEE_SETTLEMENT wiring', () => {
  it('does not charge a separate non-atomic protocol fee before the router call', () => {
    const cb = load('src/views/Swap/SmartSwap/hooks/useSwapCallback.ts')
    expect(cb).not.toContain('buildGasProtocolFeeSettlementPlan')
    expect(cb).not.toContain('settleGasProtocolFeeOnChain')
    expect(cb).toContain('return contract[methodName]')
    expect(cb).not.toMatch(/treasury\.melega\.ai/i)
    expect(cb).not.toMatch(/isKerlRoutingAuthorityEnforced/)
  })

  it('preview exposes estimated gas without claiming a collected protocol fee', () => {
    const mod = load('src/views/SmartSwapStudio/modules/SmartSwapExecutionPreview/SmartSwapExecutionPreviewModule.tsx')
    expect(mod).toContain('Estimated gas')
    expect(mod).toContain('Protocol fee')
    expect(mod).toContain('Not collected')
    expect(mod).not.toMatch(/free swap/i)
  })

  it('fee transparency marks collection as unproven', () => {
    const fee = load('src/views/SmartSwapStudio/modules/SmartSwapFeeTransparency/useSmartSwapFeeTransparency.ts')
    expect(fee).toContain('Separate protocol fee is not collected')
    expect(fee).toContain('feeCollectionProven: false')
  })

  it('recipient lock', () => {
    const f = calculateSmartRouterGasProtocolFee({
      gasEstimateUnits: 100000,
      gasPriceWei: 1e9,
    })
    expect(isCanonicalTreasuryRecipient(f.recipient)).toBe(true)
    expect(f.recipient).toBe('0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b')
  })
})
