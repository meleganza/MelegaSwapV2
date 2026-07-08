import { TradeType } from '@pancakeswap/sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CIVILIZATION_ROUTER_CONTRACT_SCHEMA,
  CIVILIZATION_ROUTER_SCHEMA,
  buildBlockerAuditTable,
  buildChainRegistry,
  buildCivilizationRouterContract,
  buildRouteTypeMatrix,
  classifySwapRouteType,
  getBnbMainnetReadiness,
  getBnbTestnetReadiness,
  getCivilizationRouterVerdict,
  getNarrativeTradeStatus,
  getTreasuryRuntimeIntegrationStatus,
  prepareCivilizationRoute,
  prepareCivilizationSwapRoute,
} from 'lib/melega-smart-router'

const MARCO_BSC = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const USDT = '0x55d398326f99059fF775485246999027B3197955'
const COLLECTOR = '0x1111111111111111111111111111111111111111'

const mockCurrency = (address?: string, symbol = 'TOKEN', isNative = false) => ({
  isNative,
  symbol,
  decimals: 18,
  wrapped: { address: address ?? '0x0000000000000000000000000000000000000000' },
})

const mockAmount = (value: string, currency: ReturnType<typeof mockCurrency>) => ({
  currency,
  toSignificant: () => value,
})

describe('Civilization Smart Router', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_TREASURY_COLLECTOR_BSC', COLLECTOR)
  })

  it('Phase 0 blocker audit marks wrapper and collector as BLOCKED', () => {
    const audit = buildBlockerAuditTable()
    expect(audit.some((r) => r.requirement.includes('wrapper') && r.status === 'BLOCKED')).toBe(true)
    expect(audit.some((r) => r.requirement.includes('Treasury Collector') && r.status === 'BLOCKED')).toBe(true)
    expect(audit.some((r) => r.requirement.includes('D90') && r.status === 'BLOCKED')).toBe(true)
  })

  it('chain registry uses null addresses — no placeholders', () => {
    const registry = buildChainRegistry()
    expect(registry['56'].wrapperAddress).toBeNull()
    expect(registry['56'].treasuryCollector).toBeNull()
    expect(registry['97'].underlyingRouter).toBeNull()
    expect(registry['97'].MARCO).toBeNull()
    expect(registry['97'].status).toBe('blocked')
  })

  it('BNB testnet is explicitly blocked', () => {
    const readiness = getBnbTestnetReadiness()
    expect(readiness.status).toBe('BNB_TESTNET_BLOCKED')
    expect(readiness.quoteStandardSwap).toBe(false)
  })

  it('BNB mainnet is partial adapter only', () => {
    const readiness = getBnbMainnetReadiness()
    expect(readiness.status).toBe('BNB_MAINNET_PARTIAL_ADAPTER_ONLY')
    expect(readiness.wrapperDeployed).toBe(false)
    expect(readiness.canonicalRouting).toBe(false)
  })

  it('narrative trade is blocked — not enabled', () => {
    const status = getNarrativeTradeStatus()
    expect(status.supported).toBe(false)
    expect(status.status).toBe('NARRATIVE_TRADE_BLOCKED_BY_MISSING_ROUTER_CONTRACT')

    const result = prepareCivilizationRoute({
      routeType: 'NARRATIVE_TRADE',
      chainId: 56,
      metadata: {
        narrativeId: 'nar-1',
        sourceOrgan: 'labs',
        initiator: '0x0000000000000000000000000000000000000001',
        asset: MARCO_BSC,
        pricingRef: 'D87_DEX_PRICING_RATIFIED',
        feeRef: 'FSC-01',
        settlementRef: 'treasury-runtime',
        treasuryRef: 'FSC-01',
        KERLRef: 'kerl',
        machineReadable: true,
      },
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('NARRATIVE_TRADE_BLOCKED_BY_MISSING_ROUTER_CONTRACT')
  })

  it('prepares swap route with execution manifest and treasury handoff metadata', () => {
    const result = prepareCivilizationSwapRoute({
      chainId: 56,
      tradeType: TradeType.EXACT_INPUT,
      inputAmount: mockAmount('100', mockCurrency(USDT, 'USDT')),
      outputAmount: mockAmount('10', mockCurrency(MARCO_BSC, 'MARCO')),
      inputAddress: USDT,
      outputAddress: MARCO_BSC,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.schema).toBe(CIVILIZATION_ROUTER_SCHEMA)
    expect(result.routeType).toBe('BUY_MARCO')
    expect(result.executionManifest.status).toBe('prepared')
    expect(result.treasuryHandoff?.settlementOwnedBy).toBe('Treasury Runtime')
    expect(result.treasuryHandoff?.forbiddenLocalSplit).toBe(true)
  })

  it('classifies swap routes by MARCO address only', () => {
    expect(classifySwapRouteType({ chainId: 56, outputAddress: MARCO_BSC })).toBe('BUY_MARCO')
    expect(classifySwapRouteType({ chainId: 56, inputAddress: MARCO_BSC, outputAddress: USDT })).toBe('SELL_MARCO')
    expect(classifySwapRouteType({ chainId: 56, inputAddress: USDT, outputAddress: USDT })).toBe('STANDARD_SWAP')
  })

  it('treasury integration forbids local FSC-01 split fields', () => {
    const integration = getTreasuryRuntimeIntegrationStatus()
    expect(integration.bypassAllowed).toBe(false)
    expect(integration.forbiddenDexFields).toContain('settlement_id')
    expect(integration.d90Defined).toBe(false)
    expect(integration.d99Defined).toBe(false)
  })

  it('route type matrix declares blocked civilization routes', () => {
    const matrix = buildRouteTypeMatrix()
    expect(matrix.find((r) => r.id === 'NARRATIVE_TRADE')?.blocked).toBe(true)
    expect(matrix.find((r) => r.id === 'AI_SERVICE')?.blocked).toBe(true)
    expect(matrix.find((r) => r.id === 'STANDARD_SWAP')?.supported).toBe(true)
  })

  it('machine contract has null wrapper and blocked status', () => {
    const contract = buildCivilizationRouterContract('2026-07-08')
    expect(contract.schema).toBe(CIVILIZATION_ROUTER_CONTRACT_SCHEMA)
    expect(contract.wrapperAddress).toBeNull()
    expect(contract.wrapperStatus).toBe('BLOCKED_WRAPPER_NOT_DEPLOYED')
    expect(contract.labsBinding.narrative_trade_support).toBe(false)
    expect(contract.ABI.deployed).toBe(false)
    expect(getCivilizationRouterVerdict()).toBe('CIVILIZATION_SMART_ROUTER_PARTIAL')
  })

  it('blocks chain 97 without fake routing', () => {
    const result = prepareCivilizationRoute({
      routeType: 'STANDARD_SWAP',
      chainId: 97,
      tradeType: TradeType.EXACT_INPUT,
      inputAmount: mockAmount('1', mockCurrency(USDT)),
      outputAmount: mockAmount('1', mockCurrency(MARCO_BSC)),
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('BNB_TESTNET_BLOCKED')
  })
})
