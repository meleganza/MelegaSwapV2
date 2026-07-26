/**
 * SMART_SWAP_MODULE_004 — Fee Transparency tests (presentation only).
 */
import { createHash } from 'crypto'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  FSC_01_POLICY_REF,
  getFsc01Constitution,
  getSwapProtocolFeeBps,
  resolveSwapProtocolFeeContextFromFields,
} from 'lib/d87-pricing'
import { D87_DEX_PRICING_RATIFIED, FSC_01 } from 'lib/d87-pricing/codex/ratified'
import { SMART_SWAP_ARCHITECTURE_ID } from 'lib/smart-swap-architecture/smartSwapArchitecture000Contracts'
import {
  SMART_SWAP_FEE_TRANSPARENCY_OWNERSHIP,
  buildSmartSwapFeeTransparency,
} from '../index'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(WEB, '../..')
const MARCO = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'
const USDT = '0x55d398326f99059ff775485246999027b3197955'
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'

describe('SMART_SWAP_MODULE_004 Fee Transparency', () => {
  it('keeps Architecture freeze + SmartSwapForm / D87 / FSC-01 unchanged', () => {
    expect(SMART_SWAP_ARCHITECTURE_ID).toBe('SMART_SWAP_ARCHITECTURE_000')

    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    expect(form).toContain('SmartSwapForm')
    expect(form).not.toContain('smart-swap-fee-transparency')
    expect(form).not.toContain('SmartSwapFeeTransparency')

    const arch = path.join(WEB, 'src/lib/smart-swap-architecture/smartSwapArchitecture000Contracts.ts')
    expect(existsSync(arch)).toBe(true)
    expect(createHash('sha256').update(readFileSync(arch)).digest('hex').length).toBe(64)

    // D87 / FSC-01 ratified values untouched (consume-only).
    expect(D87_DEX_PRICING_RATIFIED.services.swap.protocolFeeStandardBps).toBe(30)
    expect(D87_DEX_PRICING_RATIFIED.services.swap.protocolFeeBuyMarcoBps).toBe(20)
    expect(FSC_01.owner).toBe('Treasury Runtime')
    expect(FSC_01.policyRef).toBe(FSC_01_POLICY_REF)

    const module = readFileSync(
      path.join(WEB, 'src/views/SmartSwapStudio/modules/SmartSwapExecutionPreview/SmartSwapExecutionPreviewModule.tsx'),
      'utf8',
    )
    expect(module).toContain('SmartSwapFeeTransparencyPanel')

    const status = execSync('git status --porcelain', { cwd: REPO }).toString()
    expect(status).not.toMatch(/views\/Swap\/SmartSwap\//)
    expect(status).not.toMatch(/d87-pricing\//)
    expect(status).not.toMatch(/treasury-handoff\//)
    expect(status).not.toMatch(/kerl/)
    expect(status).not.toMatch(/melega-smart-router\//)
  })

  it('shows fee available with factual Treasury + KERL labels (no fabricated rewards)', () => {
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
      pricingSourceId: ctx.codexId,
      feeSplitPolicyRef: ctx.feeSplitPolicyRef,
      treasuryStatus: 'available',
      kerlStatus: 'available',
      freshness: '2026-07-26T03:00:00.000Z',
    })
    expect(model.state).toBe('AVAILABLE')
    expect(model.feeAmount).toBe('3')
    expect(model.feeAsset).toBe('USDT')
    expect(model.protocolFee.bps).toBe(getSwapProtocolFeeBps({ chainId: 56, outputAddress: WBNB }))
    expect(model.treasuryDestination).toBe(getFsc01Constitution().owner)
    expect(model.economicAttribution).toBe('KERL')
    expect(model.explanation).toMatch(/Protocol fees contribute to ecosystem economic flows/)
    expect(model.explanation.toLowerCase()).not.toContain('guaranteed rewards')
    expect(model.flowSteps.map((s) => s.label)).toEqual(
      expect.arrayContaining(['Swap', 'Protocol fee', 'Economic destination', 'Economic attribution']),
    )
    // Never surface FSC-01 split percentages.
    expect(JSON.stringify(model)).not.toMatch(/52\.5/)
    expect(JSON.stringify(model)).not.toMatch(/buyback/)
  })

  it('handles fee unavailable without inventing values', () => {
    const model = buildSmartSwapFeeTransparency(null)
    expect(model.state).toBe('UNAVAILABLE')
    expect(model.feeAmount).toBeNull()
    expect(model.feeRate).toBeNull()
    expect(model.unavailableReason).toMatch(/Fee information unavailable/)
    expect(model.flowSteps.some((s) => s.value === 'Fee information unavailable')).toBe(true)
  })

  it('keeps known fee visible when Treasury / KERL attribution is partial', () => {
    const model = buildSmartSwapFeeTransparency({
      swapAmount: '1000',
      feeAmount: '3',
      feeAsset: 'USDT',
      chainId: 56,
      outputAddress: WBNB,
      treasuryStatus: 'unavailable',
      kerlStatus: 'pending',
    })
    expect(model.state).toBe('PARTIAL')
    expect(model.feeAmount).toBe('3')
    expect(model.protocolFee.bps).toBe(30)
    expect(model.treasuryDestination).toBeNull()
    expect(model.economicAttribution).toBeNull()
    expect(model.explanation).toMatch(/Protocol fee available/)
    expect(model.flowSteps.some((s) => /Treasury attribution unavailable/i.test(s.value))).toBe(true)
    expect(model.flowSteps.some((s) => /attribution pending/i.test(s.value))).toBe(true)
  })

  it('supports Treasury unavailable and KERL unavailable states', () => {
    const treasuryDown = buildSmartSwapFeeTransparency({
      swapAmount: '10',
      feeAmount: '0.03',
      feeAsset: 'USDT',
      chainId: 56,
      outputAddress: WBNB,
      treasuryStatus: 'unavailable',
      kerlStatus: 'unavailable',
    })
    expect(treasuryDown.state).toBe('PARTIAL')
    expect(treasuryDown.allocationStatus).toBe('unavailable')
    expect(treasuryDown.economicAttribution).toBeNull()

    const kerlDown = buildSmartSwapFeeTransparency({
      swapAmount: '10',
      feeAmount: '0.03',
      feeAsset: 'USDT',
      chainId: 56,
      outputAddress: WBNB,
      treasuryStatus: 'available',
      kerlStatus: 'unavailable',
    })
    expect(kerlDown.state).toBe('PARTIAL')
    expect(kerlDown.treasuryDestination).toBe('Treasury Runtime')
    expect(kerlDown.economicAttribution).toBeNull()
  })

  it('uses different fee assets and buy-MARCO rate from canonical engine', () => {
    const usdt = buildSmartSwapFeeTransparency({
      swapAmount: '500',
      feeAmount: '1.5',
      feeAsset: 'USDT',
      chainId: 56,
      outputAddress: WBNB,
      treasuryStatus: 'available',
      kerlStatus: 'available',
    })
    expect(usdt.feeAsset).toBe('USDT')
    expect(usdt.protocolFee.bps).toBe(30)

    const buyMarco = buildSmartSwapFeeTransparency({
      swapAmount: '1',
      feeAmount: '0.002',
      feeAsset: 'BNB',
      chainId: 56,
      outputAddress: MARCO,
      treasuryStatus: 'available',
      kerlStatus: 'available',
    })
    expect(buyMarco.feeAsset).toBe('BNB')
    expect(buyMarco.protocolFee.bps).toBe(20)
    expect(buyMarco.protocolFee.buyMarcoApplied).toBe(true)
  })

  it('supports native and ERC20 swap fee display snapshots', () => {
    const native = buildSmartSwapFeeTransparency({
      swapAmount: '0.5',
      feeAmount: '0.0015',
      feeAsset: 'BNB',
      chainId: 56,
      inputAddress: null,
      outputAddress: USDT,
      treasuryStatus: 'available',
      kerlStatus: 'available',
    })
    expect(native.state).toBe('AVAILABLE')
    expect(native.feeAsset).toBe('BNB')

    const erc20 = buildSmartSwapFeeTransparency({
      swapAmount: '100',
      feeAmount: '0.3',
      feeAsset: 'USDT',
      chainId: 56,
      inputAddress: USDT,
      outputAddress: WBNB,
      treasuryStatus: 'available',
      kerlStatus: 'available',
    })
    expect(erc20.state).toBe('AVAILABLE')
    expect(erc20.swapAmount).toBe('100')
  })

  it('supports STALE and NOT_APPLICABLE without empty success fabrication', () => {
    const stale = buildSmartSwapFeeTransparency({
      swapAmount: '1',
      feeAmount: '0.003',
      feeAsset: 'USDT',
      chainId: 56,
      outputAddress: WBNB,
      stale: true,
      treasuryStatus: 'available',
      kerlStatus: 'available',
    })
    expect(stale.state).toBe('STALE')
    expect(stale.unavailableReason).toMatch(/stale/i)

    const na = buildSmartSwapFeeTransparency({ notApplicable: true, swapAmount: '0' })
    expect(na.state).toBe('NOT_APPLICABLE')
    expect(na.feeAmount).toBeNull()
  })

  it('documents ownership — presentation only', () => {
    expect(SMART_SWAP_FEE_TRANSPARENCY_OWNERSHIP.owns).toEqual(
      expect.arrayContaining(['fee presentation', 'economic visibility copy']),
    )
    expect(SMART_SWAP_FEE_TRANSPARENCY_OWNERSHIP.doesNotOwn).toEqual(
      expect.arrayContaining([
        'fee calculation',
        'fee mutation',
        'D87 fee rules',
        'FSC-01 split',
        'Treasury settlement',
        'KERL mint / allocate / reward simulation',
      ]),
    )
    expect(SMART_SWAP_FEE_TRANSPARENCY_OWNERSHIP.engine).toMatch(/SmartSwapForm unchanged/)
  })
})
