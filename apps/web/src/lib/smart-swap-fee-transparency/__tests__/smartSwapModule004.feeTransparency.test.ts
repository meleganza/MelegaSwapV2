/**
 * SMART_SWAP_MODULE_004 — Fee Transparency tests (presentation only).
 */
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  FSC_01_POLICY_REF,
  getSwapProtocolFeeBps,
  resolveSwapProtocolFeeContextFromFields,
} from 'lib/d87-pricing'
import { D87_DEX_PRICING_RATIFIED, FSC_01 } from 'lib/d87-pricing/codex/ratified'
import { SMART_SWAP_ARCHITECTURE_ID } from 'lib/smart-swap-architecture/smartSwapArchitecture000Contracts'
import {
  MELEGA_TREASURY_WALLET_ADDRESS,
  MELEGA_TREASURY_WALLET_LABEL,
} from 'config/dexEconomicAuthority'
import {
  SMART_SWAP_FEE_TRANSPARENCY_OWNERSHIP,
  buildSmartSwapFeeTransparency,
} from '../index'

const WEB = path.resolve(__dirname, '../../../../')
const MARCO = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'
const USDT = '0x55d398326f99059ff775485246999027b3197955'
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'

describe('SMART_SWAP_MODULE_004 Fee Transparency', () => {
  it('keeps Architecture freeze + SmartSwapForm + D87 fee bps', () => {
    expect(SMART_SWAP_ARCHITECTURE_ID).toBe('SMART_SWAP_ARCHITECTURE_000')

    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    expect(form).toContain('SmartSwapForm')
    expect(form).not.toContain('smart-swap-fee-transparency')
    expect(form).not.toContain('SmartSwapFeeTransparency')

    expect(existsSync(path.join(WEB, 'src/lib/smart-swap-architecture/smartSwapArchitecture000Contracts.ts'))).toBe(
      true,
    )

    expect(D87_DEX_PRICING_RATIFIED.services.swap.protocolFeeStandardBps).toBe(30)
    expect(D87_DEX_PRICING_RATIFIED.services.swap.protocolFeeBuyMarcoBps).toBe(20)
    expect(FSC_01.owner).toBe(MELEGA_TREASURY_WALLET_LABEL)
    expect(FSC_01.policyRef).toBe(FSC_01_POLICY_REF)

    const module = readFileSync(
      path.join(WEB, 'src/views/SmartSwapStudio/modules/SmartSwapExecutionPreview/SmartSwapExecutionPreviewModule.tsx'),
      'utf8',
    )
    expect(module).toContain('SmartSwapFeeTransparencyPanel')
  })

  it('does not show Treasury Runtime or KERL attribution in fee model', () => {
    const model = buildSmartSwapFeeTransparency({
      swapAmount: '1000',
      feeAmount: '3',
      feeAsset: 'USDT',
      protocolFeeBps: 30,
      buyMarcoApplied: false,
      treasuryStatus: 'available',
      kerlStatus: 'available',
      feeCollectionProven: true,
      freshness: '2026-07-26T03:00:00.000Z',
    })
    expect(model.treasuryDestination).toContain(MELEGA_TREASURY_WALLET_LABEL)
    expect(model.treasuryDestination).toContain(MELEGA_TREASURY_WALLET_ADDRESS)
    expect(model.economicAttribution).toBeNull()
    expect(JSON.stringify(model)).not.toMatch(/Treasury Runtime/)
    expect(JSON.stringify(model)).not.toMatch(/Allocated through/)
    expect(JSON.stringify(model)).not.toMatch(/KERL/)
    expect(model.flowSteps.map((s) => s.label)).toEqual(
      expect.arrayContaining(['Protocol fee', 'Fee destination', 'Execution']),
    )
    expect(JSON.stringify(model)).not.toMatch(/52\.5/)
  })

  it('hides unproven protocol fee collection while disclosing destination', () => {
    const ctx = resolveSwapProtocolFeeContextFromFields({
      chainId: 56,
      inputAddress: USDT,
      outputAddress: WBNB,
      outputSymbol: 'WBNB',
    })
    const model = buildSmartSwapFeeTransparency({
      swapAmount: '1000',
      feeAmount: '3',
      feeAsset: 'USDT',
      protocolFeeBps: ctx.protocolFeeBps,
      buyMarcoApplied: ctx.buyMarcoApplied,
      treasuryStatus: 'available',
      feeCollectionProven: false,
      forceShowDestinationOnly: true,
    })
    expect(model.feeAmount).toBeNull()
    expect(model.protocolFee.bps).toBeNull()
    expect(model.treasuryDestination).toContain(MELEGA_TREASURY_WALLET_ADDRESS)
    expect(model.flowSteps.find((s) => s.label === 'Fee destination')?.value).toContain(
      MELEGA_TREASURY_WALLET_ADDRESS,
    )
  })

  it('handles fee unavailable without inventing values', () => {
    const model = buildSmartSwapFeeTransparency(null)
    expect(model.state).toBe('UNAVAILABLE')
    expect(model.feeAmount).toBeNull()
    expect(model.feeRate).toBeNull()
    expect(model.unavailableReason).toMatch(/Fee information unavailable/)
  })

  it('uses buy-MARCO rate only when fee collection is proven', () => {
    const buyMarco = buildSmartSwapFeeTransparency({
      swapAmount: '1',
      feeAmount: '0.002',
      feeAsset: 'BNB',
      chainId: 56,
      outputAddress: MARCO,
      treasuryStatus: 'available',
      feeCollectionProven: true,
    })
    expect(buyMarco.protocolFee.bps).toBe(getSwapProtocolFeeBps({ chainId: 56, outputAddress: MARCO }))
    expect(buyMarco.protocolFee.buyMarcoApplied).toBe(true)
  })

  it('supports STALE and NOT_APPLICABLE', () => {
    const stale = buildSmartSwapFeeTransparency({
      swapAmount: '1',
      feeAmount: '0.003',
      feeAsset: 'USDT',
      chainId: 56,
      outputAddress: WBNB,
      stale: true,
      treasuryStatus: 'available',
      feeCollectionProven: true,
    })
    expect(stale.state).toBe('STALE')

    const na = buildSmartSwapFeeTransparency({ notApplicable: true, swapAmount: '0' })
    expect(na.state).toBe('NOT_APPLICABLE')
    expect(na.feeAmount).toBeNull()
  })

  it('documents ownership — presentation only, no TR settlement authority', () => {
    expect(SMART_SWAP_FEE_TRANSPARENCY_OWNERSHIP.settlementAuthority).toMatch(/NONE/)
    expect(SMART_SWAP_FEE_TRANSPARENCY_OWNERSHIP.feeDestination).toBe(MELEGA_TREASURY_WALLET_LABEL)
    expect(SMART_SWAP_FEE_TRANSPARENCY_OWNERSHIP.doesNotOwn).toEqual(
      expect.arrayContaining(['fee calculation', 'fee mutation', 'D87 fee rules']),
    )
  })

  it('panel source forbids obsolete Smart Swap fee copy', () => {
    const panel = readFileSync(
      path.join(WEB, 'src/views/SmartSwapStudio/modules/SmartSwapFeeTransparency/SmartSwapFeeTransparencyPanel.tsx'),
      'utf8',
    )
    expect(panel).not.toContain('Treasury Runtime')
    expect(panel).not.toContain('Allocated through')
    expect(panel).not.toContain('KERL attribution')
    expect(panel).toContain('Fee destination')
    expect(panel).toContain('MELEGA_TREASURY_WALLET')
  })
})
