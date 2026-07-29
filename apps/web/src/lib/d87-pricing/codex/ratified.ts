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
  /** Economic beneficiary — not a runtime service. */
  owner: 'MELEGA TREASURY WALLET',
  dexPolicy:
    'DEX-owned application fees route directly to MELEGA TREASURY WALLET — never via Treasury Runtime; no local redistribution',
  /** Historical policy reference only — not executed by DEX application code. */
  splits: [
    { destination: 'treasury_melega', percent: 52.5, label: 'Melega treasury (historical policy)' },
    { destination: 'civilization_treasury', percent: 22.5, label: 'Civilization treasury (historical policy)' },
    { destination: 'buyback_and_burn', percent: 10, label: 'Buyback and burn (historical policy)' },
    { destination: 'referral_distribution', percent: 10, referralSpec: 'SRD-01', label: 'Referral (historical policy)' },
    { destination: 'strategic_allocation', percent: 5, label: 'Strategic allocation (historical policy)' },
  ],
} as const
