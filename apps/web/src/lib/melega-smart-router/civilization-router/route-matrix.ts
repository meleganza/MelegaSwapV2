import type { CivilizationRouteType, RouteTypeDefinition } from './types'
import { readSmartRouterChainProfile } from '../registry/smartRouterRegistry'

const SETTLEMENT_SWAP = 'Treasury Runtime FSC-01 post-confirmation'
const SETTLEMENT_RUNTIME = 'Treasury Runtime intake required'
const SETTLEMENT_SCHEMA = 'Schema publication required'

/** Phase 9 — canonical route type matrix. */
export function buildRouteTypeMatrix(): RouteTypeDefinition[] {
  return [
    {
      id: 'STANDARD_SWAP',
      supported: true,
      planned: false,
      blocked: false,
      blockerReason: 'Exact-input swap via ADAPTER when registry prerequisites met on chain 56',
      requiredInputs: ['chainId', 'inputAmount', 'outputAmount', 'tradeType'],
      requiredRegistries: ['KERL MARCO', 'Treasury Collector', 'Underlying Router'],
      requiredSettlement: SETTLEMENT_SWAP,
      machineSchema: 'melega.smart-router.quote.v1',
    },
    {
      id: 'BUY_MARCO',
      supported: true,
      planned: false,
      blocked: false,
      blockerReason: 'Output token equals chain MARCO address — 20 bps D87 incentive',
      requiredInputs: ['chainId', 'outputAddress', 'inputAmount', 'outputAmount'],
      requiredRegistries: ['KERL MARCO', 'Treasury Collector', 'Underlying Router'],
      requiredSettlement: SETTLEMENT_SWAP,
      machineSchema: 'melega.smart-router.quote.v1',
    },
    {
      id: 'SELL_MARCO',
      supported: true,
      planned: false,
      blocked: false,
      blockerReason: 'Input token equals chain MARCO address — 30 bps standard fee',
      requiredInputs: ['chainId', 'inputAddress', 'inputAmount', 'outputAmount'],
      requiredRegistries: ['KERL MARCO', 'Treasury Collector', 'Underlying Router'],
      requiredSettlement: SETTLEMENT_SWAP,
      machineSchema: 'melega.smart-router.quote.v1',
    },
    {
      id: 'NARRATIVE_TRADE',
      supported: false,
      planned: true,
      blocked: true,
      blockerReason: 'NARRATIVE_TRADE_BLOCKED_BY_MISSING_ROUTER_CONTRACT — no executable wrapper route',
      requiredInputs: [
        'narrativeId',
        'sourceOrgan',
        'initiator',
        'asset',
        'pricingRef',
        'feeRef',
        'settlementRef',
        'treasuryRef',
        'KERLRef',
        'executionManifest',
      ],
      requiredRegistries: ['KERL', 'Treasury Runtime', 'Smart Router Wrapper', 'D90', 'D99'],
      requiredSettlement: SETTLEMENT_RUNTIME,
      machineSchema: 'melega.civilization-router.narrative-trade.v1',
    },
    {
      id: 'AI_SERVICE',
      supported: false,
      planned: true,
      blocked: true,
      blockerReason: 'AI_SERVICE_BLOCKED_BY_MISSING_ROUTER_CONTRACT — no marketplace execution surface',
      requiredInputs: ['serviceId', 'agentId', 'buyer', 'seller', 'pricingRef', 'policyRef', 'treasuryRef', 'settlementRef'],
      requiredRegistries: ['KERL', 'Treasury Runtime', 'Smart Router Wrapper'],
      requiredSettlement: SETTLEMENT_RUNTIME,
      machineSchema: 'melega.civilization-router.ai-service.v1',
    },
    {
      id: 'MARKETPLACE_SERVICE',
      supported: false,
      planned: true,
      blocked: true,
      blockerReason: 'MARKETPLACE_SERVICE_BLOCKED_BY_MISSING_ROUTER_CONTRACT',
      requiredInputs: ['serviceId', 'buyer', 'seller', 'pricingRef', 'policyRef', 'treasuryRef'],
      requiredRegistries: ['KERL', 'Treasury Runtime'],
      requiredSettlement: SETTLEMENT_RUNTIME,
      machineSchema: 'melega.civilization-router.marketplace-service.v1',
    },
    {
      id: 'MARKETPLACE_SETTLEMENT',
      supported: false,
      planned: true,
      blocked: true,
      blockerReason: 'MARKETPLACE_SETTLEMENT_BLOCKED_BY_MISSING_ROUTER_CONTRACT — no fake marketplace settlement',
      requiredInputs: ['serviceId', 'settlementRef', 'treasuryRef', 'executionManifest'],
      requiredRegistries: ['Treasury Runtime', 'KERL'],
      requiredSettlement: SETTLEMENT_RUNTIME,
      machineSchema: 'melega.civilization-router.marketplace-settlement.v1',
    },
    {
      id: 'TREASURY_TRANSFER',
      supported: false,
      planned: true,
      blocked: true,
      blockerReason: 'TREASURY_TRANSFER_BLOCKED_BY_MISSING_RUNTIME',
      requiredInputs: ['treasuryRef', 'settlementRef', 'amount', 'asset'],
      requiredRegistries: ['Treasury Runtime'],
      requiredSettlement: SETTLEMENT_RUNTIME,
      machineSchema: 'melega.civilization-router.treasury-transfer.v1',
    },
    {
      id: 'INTERNAL_ROUTING',
      supported: false,
      planned: true,
      blocked: true,
      blockerReason: 'INTERNAL_ROUTING_BLOCKED_BY_MISSING_SCHEMA',
      requiredInputs: ['routeRef', 'policyRef'],
      requiredRegistries: ['KERL', 'Smart Router Registry'],
      requiredSettlement: SETTLEMENT_SCHEMA,
      machineSchema: 'melega.civilization-router.internal-routing.v1',
    },
    {
      id: 'REFERRAL',
      supported: false,
      planned: true,
      blocked: true,
      blockerReason: 'REFERRAL_BLOCKED_BY_MISSING_RUNTIME — SRD-01 owned by Treasury Runtime',
      requiredInputs: ['referralRef', 'settlementRef'],
      requiredRegistries: ['Treasury Runtime', 'SRD-01'],
      requiredSettlement: SETTLEMENT_RUNTIME,
      machineSchema: 'melega.civilization-router.referral.v1',
    },
    {
      id: 'PROPAGATION',
      supported: false,
      planned: true,
      blocked: true,
      blockerReason: 'PROPAGATION_BLOCKED_BY_MISSING_SCHEMA',
      requiredInputs: ['sourceOrgan', 'targetOrgan', 'policyRef'],
      requiredRegistries: ['KERL', 'Treasury Runtime'],
      requiredSettlement: SETTLEMENT_SCHEMA,
      machineSchema: 'melega.civilization-router.propagation.v1',
    },
  ]
}

export function getRouteTypeDefinition(routeType: CivilizationRouteType): RouteTypeDefinition | undefined {
  return buildRouteTypeMatrix().find((r) => r.id === routeType)
}

export function getBnbTestnetReadiness() {
  const entry = buildRouteTypeMatrix()
  const profile = readSmartRouterChainProfile(97)
  const wrapperAddress = profile?.wrapperAddress ?? null
  const wrapperDeployed = Boolean(wrapperAddress)
  return {
    status: wrapperDeployed ? 'ACTIVE_TESTNET' : 'BNB_TESTNET_BLOCKED',
    chainId: 97,
    wrapperAddress,
    wrapperVersion: wrapperDeployed ? 2 : null,
    validationStatus: wrapperDeployed ? 'passed' : 'pending',
    marcoAddress: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    marcoRegistryRef: '/registry/assets/marco-bsc-testnet.json',
    underlyingRouter: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
    treasuryCollector: '0xe674b1d925d79f5A0053e40cC7cdED7841AD4164',
    dexAdapterActive: true,
    wrapperDeployed,
    quoteStandardSwap: wrapperDeployed,
    quoteBuyMarco: wrapperDeployed,
    quoteSellMarco: wrapperDeployed,
    routeNarrativeTrade: false,
    routeAIService: false,
    executionManifest: wrapperDeployed
      ? 'TreasuryHandoffPrepared emitted on-chain per validated swap'
      : 'blocked-only until registry prerequisites met',
    treasuryHandoff: 'collector active_testnet',
    executableRouteTypes: wrapperDeployed ? ['STANDARD_SWAP', 'BUY_MARCO', 'SELL_MARCO'] : [],
    reasons: wrapperDeployed ? [] : ['BLOCKED_WRAPPER_NOT_DEPLOYED'],
    blockedRouteTypes: entry.filter((r) => r.blocked).map((r) => r.id),
    validationCertificate: wrapperDeployed
      ? '/registry/smart-router/testnet-validation-certificate.json'
      : null,
  }
}

export function getBnbMainnetReadiness() {
  return {
    status: 'BNB_MAINNET_PARTIAL_ADAPTER_ONLY',
    chainId: 56,
    wrapperDeployed: false,
    adapterActive: true,
    underlyingRouter: '0xC6665d98Efd81f47B03801187eB46cbC63F328B0',
    marcoAddress: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    treasuryCollector: null,
    canonicalRouting: false,
    note: 'Do not claim canonical mainnet routing until wrapper exists',
  }
}

export function getNarrativeTradeStatus() {
  return {
    supported: false,
    status: 'NARRATIVE_TRADE_BLOCKED_BY_MISSING_ROUTER_CONTRACT',
    executable: false,
    labsVerdict: 'BLOCKED_BY_MISSING_ROUTER_CONTRACT',
  }
}

export function getAIServiceRoutingStatus() {
  return {
    supported: false,
    routeTypes: ['AI_SERVICE', 'MARKETPLACE_SERVICE', 'MARKETPLACE_SETTLEMENT'],
    status: 'AI_SERVICE_BLOCKED_BY_MISSING_ROUTER_CONTRACT',
    executable: false,
  }
}
