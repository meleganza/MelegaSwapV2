import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { CANONICAL_EXAMPLE_ASSETS, evmNative } from '../assetIdentity'
import { PROTOCOL_FEE_STATE, canMarkRouteProductionCapable, evaluateProtocolFeeState } from '../fee'
import { FEE_ENFORCEMENT_METHOD, assertCanonicalFeeBeneficiary } from '../feeEnforcement'
import { MELEGA_TREASURY_FEE_DESTINATION } from 'config/constants/feeSchedule'
import { VENUE_HEALTH_STATE, healthSnapshot } from '../health'
import { DEFAULT_LATENCY_BUDGET } from '../latency'
import { computeNetUserOutput } from '../netExecution'
import { isProductionCutoverAllowed, isUniversalEngineShadowOnly } from '../operatingMode'
import { evaluateRevenuePolicy } from '../evaluateRevenuePolicy'
import {
  REVENUE_REASON,
  SMARTSWAP_REVENUE_POLICY_V1,
  resolveRevenuePolicy,
} from '../revenuePolicy'
import { computeStructuralRouteCost, computeTotalExecutionCost } from '../costTaxonomy'
import {
  FEE_ASSET_SOURCE,
  QUOTE_FEE_CHANGED,
  QUOTE_FEE_EXPIRED,
  assertQuoteFeeImmutable,
  sealSmartSwapFee,
} from '../quoteFee'
import { evaluateRouteEligibility, previewOnlyCannotBeProduction } from '../routeEligibility'
import { selectBestNetRoute } from '../routeSelection'
import {
  MELEGA_FACTUAL_LP_FEE_BPS,
  SHADOW_OBSERVATION_KIND,
  SYNTHETIC_SWAP_VALUES_USD,
  observeFactualMelegaLpShadow,
  runSyntheticNotionalSimulation,
} from '../shadowEconomics'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'
import { normalizeMelegaLegacyQuote, type LegacyMelegaQuoteSnapshot } from '../melegaDexAdapter'
import { assertHostDoesNotSupplyFee, hostMustNotOverrideRevenuePolicy } from '../widget'
import { EXECUTION_DOMAIN, evmNetwork, solanaNetwork } from '../domain'
import { solanaMint } from '../assetIdentity'

const WEB = path.resolve(__dirname, '../../../..')
const FREEZE_MANIFEST = path.join(WEB, 'docs/runtime/smartswap-universal-engine-m1/ux-freeze.manifest.json')

const LEGACY: LegacyMelegaQuoteSnapshot = {
  chainId: 56,
  input: {
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    symbol: 'WBNB',
    decimals: 18,
  },
  output: {
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    symbol: 'USDC',
    decimals: 18,
  },
  inputAmountRaw: '1000000000000000000',
  expectedOutputRaw: '1770000000000000000000',
  pathAddresses: [
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  ],
  priceImpactPercent: 0.2,
  gasUnits: 220000,
  freshness: '2026-08-19T18:00:00.000Z',
  slippageBps: 50,
}

function bandFor(structural: number) {
  return evaluateRevenuePolicy({
    structuralRouteCostBps: structural,
    swapValueNormalized: 1000,
    inputAmountRaw: '1000',
    feeEnforcementState: PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY,
  })
}

describe('SmartSwap Universal Engine M2 dynamic revenue policy', () => {
  it('versions the canonical policy and caps the maximum at 25 bps', () => {
    expect(SMARTSWAP_REVENUE_POLICY_V1.id).toBe('SMARTSWAP_REVENUE_POLICY_V1')
    expect(SMARTSWAP_REVENUE_POLICY_V1.version).toBe('1.0.0')
    expect(SMARTSWAP_REVENUE_POLICY_V1.maxProtocolFeeBps).toBe(25)
    expect(SMARTSWAP_REVENUE_POLICY_V1.bands.map((band) => band.feeBps)).toEqual([25, 20, 15, 10, 5])
    expect(Math.max(...SMARTSWAP_REVENUE_POLICY_V1.bands.map((band) => band.feeBps))).toBe(25)
  })

  it('applies dynamic bands including every required boundary', () => {
    const cases: Array<[number, number, string]> = [
      [0, 25, 'BAND_0_10'],
      [5, 25, 'BAND_0_10'],
      [10, 25, 'BAND_0_10'],
      [11, 20, 'BAND_11_25'],
      [25, 20, 'BAND_11_25'],
      [26, 15, 'BAND_26_40'],
      [40, 15, 'BAND_26_40'],
      [41, 10, 'BAND_41_60'],
      [60, 10, 'BAND_41_60'],
      [61, 5, 'BAND_61_PLUS'],
      [100, 5, 'BAND_61_PLUS'],
    ]
    for (const [structural, fee, band] of cases) {
      const result = bandFor(structural)
      expect(result.feeBps, `structural ${structural}`).toBe(fee)
      expect(result.feeBand, `structural ${structural}`).toBe(band)
      expect(result.feeBps! <= 25).toBe(true)
    }
  })

  it('excludes gas from structural fee-band selection and retains gas in total execution cost', () => {
    const structural = computeStructuralRouteCost({
      venueFeesBps: 10,
      bridgeCostsBps: 0,
      gasCostBps: 80,
      venueFeesEmbeddedInGross: true,
      bridgeCostsEmbeddedInGross: true,
    })
    expect(structural.structuralRouteCostBps).toBe(10)
    const policy = evaluateRevenuePolicy({
      structuralRouteCostBps: structural.structuralRouteCostBps,
      swapValueNormalized: 500,
      inputAmountRaw: '1',
      feeEnforcementState: PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY,
    })
    expect(policy.feeBps).toBe(25)
    const total = computeTotalExecutionCost({
      structural,
      gasCostBps: 80,
      smartSwapFeeBps: policy.feeBps,
    })
    expect(total.totalExecutionCostBps).toBe(10 + 80 + 25)
  })

  it('treats 50 bps as a target, not a venue-cost manipulator', () => {
    expect(bandFor(5).structuralPlusFeeBps).toBe(30)
    expect(bandFor(20).structuralPlusFeeBps).toBe(40)
    expect(bandFor(30).structuralPlusFeeBps).toBe(45)
    expect(bandFor(40).structuralPlusFeeBps).toBe(55)
    expect(bandFor(40).withinTarget).toBe(false)
    expect(bandFor(60).structuralPlusFeeBps).toBe(70)
    expect(bandFor(60).withinTarget).toBe(false)
    expect(bandFor(5).withinTarget).toBe(true)
  })

  it('keeps minimum revenue architecture disabled / observe-only', () => {
    const result = bandFor(10)
    expect(SMARTSWAP_REVENUE_POLICY_V1.minimumRevenue.enabled).toBe(false)
    expect(result.minimumRevenue).toEqual({ enabled: false, mode: 'OBSERVE_ONLY', wouldBind: false })
    expect(result.reasonCodes).toContain(REVENUE_REASON.MINIMUM_REVENUE_OBSERVE_ONLY)
  })

  it('seals quote fees immutably for the validity window', () => {
    const assessment = bandFor(10)
    const sealed = sealSmartSwapFee({
      assessment,
      baseAmountRaw: '1000000',
      feeAssetSource: FEE_ASSET_SOURCE.OUTPUT,
      feeAsset: evmNative(56, 'BNB'),
      quoteTimestamp: '2026-08-19T18:00:00.000Z',
      quoteExpiry: '2026-08-19T18:00:30.000Z',
    })
    expect(sealed.feeBps).toBe(25)
    expect(sealed.feeAmountRaw).toBe('2500')
    expect(sealed.policyVersion).toBe('1.0.0')
    assertQuoteFeeImmutable(sealed, { ...sealed }, '2026-08-19T18:00:10.000Z')
    expect(() =>
      assertQuoteFeeImmutable(sealed, { ...sealed, feeBps: 5, feeAmountRaw: '500' }, '2026-08-19T18:00:10.000Z'),
    ).toThrow(QUOTE_FEE_CHANGED)
    expect(() => assertQuoteFeeImmutable(sealed, sealed, '2026-08-19T18:00:31.000Z')).toThrow(QUOTE_FEE_EXPIRED)
  })

  it('computes net user output without double-counting embedded venue fees', () => {
    const net = computeNetUserOutput({
      grossOutputRaw: '1000',
      venueFeeRaw: '40',
      venueFeesEmbeddedInGross: true,
      bridgeCostRaw: '0',
      bridgeCostsEmbeddedInGross: true,
      gasCostInOutputRaw: '10',
      smartSwapFeeRaw: '25',
      smartSwapFeeEmbeddedInGross: false,
    })
    expect(net.subtractedVenueRaw).toBe('0')
    expect(net.netUserOutputRaw).toBe('965')
    const notEmbedded = computeNetUserOutput({
      ...{
        grossOutputRaw: '1000',
        venueFeeRaw: '40',
        venueFeesEmbeddedInGross: false,
        bridgeCostRaw: '0',
        bridgeCostsEmbeddedInGross: true,
        gasCostInOutputRaw: '10',
        smartSwapFeeRaw: '25',
        smartSwapFeeEmbeddedInGross: false,
      },
    })
    expect(notEmbedded.netUserOutputRaw).toBe('925')
  })

  it('selects the best net route with no Melega home-venue preference', () => {
    const winner = selectBestNetRoute([
      { quoteId: 'melega', venueId: 'melega-dex', netUserOutputRaw: '1755', confidenceOk: true },
      { quoteId: 'external', venueId: 'unenabled-shadow-peer', netUserOutputRaw: '1766', confidenceOk: true },
    ])
    expect(winner.selectedQuoteId).toBe('external')
    expect(winner.selectedVenueId).not.toBe('melega-dex')
    expect(winner.productionActivation).toBe(false)
  })

  it('rejects preview-only and unavailable fees for production execution', () => {
    const preview = evaluateProtocolFeeState({
      calculated: true,
      displayedInFrozenUx: true,
      includedInExecutionPlan: false,
      collectionEnforceable: false,
      destinationCanonical: true,
      collectionProven: false,
      atomicWithSwap: false,
    })
    expect(preview.state).toBe(PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY)
    expect(previewOnlyCannotBeProduction(preview)).toBe(true)
    expect(canMarkRouteProductionCapable(preview)).toBe(false)
    expect(isProductionCutoverAllowed()).toBe(false)
    expect(FEE_ENFORCEMENT_METHOD.NOT_ENFORCEABLE).toBe('NOT_ENFORCEABLE')
  })

  it('is venue-independent and domain-independent for the same structural cost', () => {
    const melega = bandFor(25)
    const pancake = evaluateRevenuePolicy({
      structuralRouteCostBps: 25,
      swapValueNormalized: 1000,
      inputAmountRaw: '1',
      feeEnforcementState: PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY,
    })
    const solana = evaluateRevenuePolicy({
      structuralRouteCostBps: 25,
      swapValueNormalized: 1000,
      inputAmountRaw: '1',
      feeEnforcementState: PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY,
    })
    expect(melega.feeBps).toBe(pancake.feeBps)
    expect(pancake.feeBps).toBe(solana.feeBps)
    expect(evmNetwork(56).domain).toBe(EXECUTION_DOMAIN.EVM)
    expect(solanaNetwork().domain).toBe(EXECUTION_DOMAIN.SOLANA)
    expect(CANONICAL_EXAMPLE_ASSETS.usdcSolana.domain).toBe(EXECUTION_DOMAIN.SOLANA)
    expect(solanaMint('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'USDC', 6).domain).toBe(
      EXECUTION_DOMAIN.SOLANA,
    )
  })

  it('forbids widget hosts from overriding canonical economics', () => {
    expect(hostMustNotOverrideRevenuePolicy()).toBe(true)
    expect(resolveRevenuePolicy()).toBe(SMARTSWAP_REVENUE_POLICY_V1)
    expect(() => resolveRevenuePolicy({ feeBps: 1 })).toThrow(REVENUE_REASON.HOST_CANNOT_OVERRIDE_REVENUE_POLICY)
    expect(() =>
      assertHostDoesNotSupplyFee({
        walletConnected: false,
        walletAddress: null,
        network: null,
        requestedInput: null,
        requestedOutput: null,
        feeBps: 25,
      } as never),
    ).toThrow('HOST_CANNOT_OVERRIDE_REVENUE_POLICY')
  })

  it('handles unknown cost, zero input, and does not fabricate live prices', () => {
    const unknown = evaluateRevenuePolicy({
      structuralRouteCostBps: null,
      swapValueNormalized: null,
      inputAmountRaw: '0',
      feeEnforcementState: PROTOCOL_FEE_STATE.FEE_UNAVAILABLE,
    })
    expect(unknown.feeBps).toBeNull()
    expect(unknown.reasonCodes).toContain(REVENUE_REASON.ROUTE_COST_UNCERTIFIED)
    expect(unknown.reasonCodes).toContain(REVENUE_REASON.ZERO_INPUT)
    expect(unknown.reasonCodes).toContain(REVENUE_REASON.QUOTE_VALUE_UNAVAILABLE)
  })

  it('blocks stale and degraded venues from production while allowing shadow isolation', () => {
    const live = normalizeMelegaLegacyQuote(LEGACY)
    const stale = evaluateRouteEligibility({
      quote: { ...live, stale: true },
      health: healthSnapshot('melega-dex', VENUE_HEALTH_STATE.DEGRADED),
      nowIso: '2026-08-19T19:00:00.000Z',
      staleAfterMs: DEFAULT_LATENCY_BUDGET.staleQuoteMs,
      expectedNetwork: evmNetwork(56),
      expectedInput: live.inputAsset,
      expectedOutput: live.outputAsset,
      requireSimulation: false,
      simulationOk: null,
    })
    expect(stale.competeInShadow).toBe(false)
    expect(stale.productionExecutionEligible).toBe(false)
    const degraded = evaluateRouteEligibility({
      quote: live,
      health: healthSnapshot('melega-dex', VENUE_HEALTH_STATE.DEGRADED),
      nowIso: live.quotedAt,
      staleAfterMs: DEFAULT_LATENCY_BUDGET.staleQuoteMs,
      expectedNetwork: evmNetwork(56),
      expectedInput: live.inputAsset,
      expectedOutput: live.outputAsset,
      requireSimulation: false,
      simulationOk: null,
    })
    expect(degraded.competeInShadow).toBe(true)
    expect(degraded.productionExecutionEligible).toBe(false)
  })

  it('runs synthetic notional simulations separately from factual Melega LP shadow', () => {
    const synthetic = runSyntheticNotionalSimulation(10)
    expect(synthetic).toHaveLength(SYNTHETIC_SWAP_VALUES_USD.length)
    expect(synthetic.every((row) => row.kind === SHADOW_OBSERVATION_KIND.SYNTHETIC_TEST)).toBe(true)
    expect(synthetic.every((row) => row.smartSwapFeeBps === 25)).toBe(true)
    expect(synthetic.every((row) => row.liveQuoteMutated === false)).toBe(true)

    const live = normalizeMelegaLegacyQuote(LEGACY)
    const before = JSON.stringify(live)
    const factual = observeFactualMelegaLpShadow(live)
    expect(factual.kind).toBe(SHADOW_OBSERVATION_KIND.LIVE_FACTUAL_SHADOW)
    expect(factual.structuralRouteCostBps).toBe(MELEGA_FACTUAL_LP_FEE_BPS)
    expect(factual.smartSwapFeeBps).toBe(20)
    expect(factual.liveQuoteMutated).toBe(false)
    expect(JSON.stringify(live)).toBe(before)
    expect(isUniversalEngineShadowOnly()).toBe(true)
  })

  it('does not change production quotes and locks the existing treasury destination', () => {
    expect(assertCanonicalFeeBeneficiary(MELEGA_TREASURY_FEE_DESTINATION)).toBe(
      '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
    )
    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    const callback = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/hooks/useSwapCallback.ts'), 'utf8')
    expect(form).not.toContain('SMARTSWAP_REVENUE_POLICY_V1')
    expect(callback).not.toContain('evaluateRevenuePolicy')
    expect(callback).not.toContain('settleGasProtocolFeeOnChain')
  })

  it('keeps the approved SmartSwap UX freeze at zero diff', () => {
    const manifest = JSON.parse(readFileSync(FREEZE_MANIFEST, 'utf8')) as { files: Record<string, string> }
    const current: Record<string, string> = {}
    for (const rel of SMARTSWAP_UX_FREEZE_FILES) {
      const abs = path.join(WEB, rel)
      expect(existsSync(abs), rel).toBe(true)
      current[rel] = createHash('sha256').update(readFileSync(abs)).digest('hex')
    }
    expect(current).toEqual(manifest.files)
  })
})
