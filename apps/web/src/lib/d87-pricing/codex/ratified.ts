/** Ratified D87 pricing — source of truth consumed by DEX runtime. */
export const D87_DEX_PRICING_RATIFIED = {
  schema: 'melega.codex.D87_DEX_PRICING_RATIFIED',
  id: 'D87_DEX_PRICING_RATIFIED',
  version: '1.0.0',
  authority: 'KIRI Codex',
  status: 'ratified',
  services: {
    token_creation: {
      standardUsdc: 5,
      marcoUsdcEquivalent: 4,
      marcoDiscountPercent: 20,
    },
    token_self_listing: {
      free: true,
      standardUsdc: 0,
    },
    pool_creation: {
      free: true,
      standardUsdc: 0,
    },
    liquidity_provision: {
      free: true,
      standardUsdc: 0,
    },
    swap: {
      protocolFeeStandardBps: 30,
      protocolFeeBuyMarcoBps: 20,
      buyMarcoRule: 'output_token_is_marco',
    },
    farm_creation: {
      standardUsdc: 10,
      marcoUsdcEquivalent: 8,
      marcoDiscountPercent: 20,
    },
    staking_pool_creation: {
      standardUsdc: 10,
      marcoUsdcEquivalent: 8,
      marcoDiscountPercent: 20,
    },
    launchpad_integration: {
      free: true,
      standardUsdc: 0,
    },
  },
  lpFee: {
    policy: 'unaffected',
    note: 'LP fees remain entirely for Liquidity Providers. LP fees never enter FSC-01.',
  },
  referrals: {
    spec: 'SRD-01',
    localImplementation: false,
  },
  feeSplit: {
    constitution: 'FSC-01',
    dexPolicy: 'forward_protocol_fee_only',
    policyRef: 'codex://FSC-01',
  },
} as const

export const FSC_01 = {
  schema: 'melega.codex.FSC-01',
  id: 'FSC-01',
  version: '1.0.0',
  authority: 'KIRI Codex',
  status: 'ratified',
  policyRef: 'codex://FSC-01',
  owner: 'Treasury Runtime',
  dexPolicy: 'DEX forwards gross protocol fee only — never splits locally',
  splits: [
    { destination: 'treasury_melega', percent: 52.5 },
    { destination: 'civilization_treasury', percent: 22.5 },
    { destination: 'buyback_and_burn', percent: 10 },
    { destination: 'referral_distribution', percent: 10, referralSpec: 'SRD-01' },
    { destination: 'strategic_allocation', percent: 5 },
  ],
} as const
