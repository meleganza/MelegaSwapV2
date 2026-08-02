/**
 * MELEGA_DEX_V1_SMART_SWAP_PROTOCOL_FEE_SETTLEMENT — UI / wiring assertions
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  calculateSmartRouterGasProtocolFee,
  isCanonicalTreasuryRecipient,
} from 'lib/smart-swap-gas-protocol-fee'

const WEB = path.resolve(__dirname, '../../..')

function load(rel: string) {
  return readFileSync(path.join(WEB, rel), 'utf8')
}

describe('MELEGA_DEX_V1_SMART_SWAP_PROTOCOL_FEE_SETTLEMENT wiring', () => {
  it('Smart Swap callback settles gas protocol fee before router call', () => {
    const cb = load('src/views/Swap/SmartSwap/hooks/useSwapCallback.ts')
    expect(cb).toContain('buildGasProtocolFeeSettlementPlan')
    expect(cb).toContain('settleGasProtocolFeeOnChain')
    expect(cb).toContain('25% of estimated DEX gas')
    expect(cb).not.toMatch(/treasury\.melega\.ai/i)
    expect(cb).not.toMatch(/isKerlRoutingAuthorityEnforced/)
  })

  it('preview exposes estimated gas, protocol fee, and Melega Treasury', () => {
    const mod = load(
      'src/views/SmartSwapStudio/modules/SmartSwapExecutionPreview/SmartSwapExecutionPreviewModule.tsx',
    )
    expect(mod).toContain('Estimated gas')
    expect(mod).toContain('Protocol fee')
    expect(mod).toContain('25% of estimated gas → Melega Treasury')
    expect(mod).not.toMatch(/free swap/i)
  })

  it('fee transparency surfaces Founder gas fee destination', () => {
    const fee = load(
      'src/views/SmartSwapStudio/modules/SmartSwapFeeTransparency/useSmartSwapFeeTransparency.ts',
    )
    expect(fee).toContain('25% of estimated gas')
    expect(fee).toContain('MELEGA_TREASURY_WALLET_ADDRESS')
    expect(fee).toContain('no intermediary settlement authority')
    expect(fee).not.toContain('feeCollectionProven: false')
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
