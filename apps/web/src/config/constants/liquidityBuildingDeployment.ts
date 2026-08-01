/**
 * Canonical Liquidity Building deployment binding for the web app.
 * Mirrors deployments/liquidity-building/chain-56/deployed-addresses.v1.json.
 * Do not scatter address literals — update the chain-56 artifact, then sync this module.
 */

export const LB_CHAIN_ID = 56 as const

export const LB_MELEGA_AMM = {
  factory: '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C',
  router: '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3',
} as const

/**
 * Production LB program bindings.
 * Sync from deployments/liquidity-building/chain-56/deployed-addresses.v1.json after verified mainnet deploys.
 * Steps 1–5 bound. Factory remains null until validated — never fabricate.
 */
export const LB_CANONICAL_DEPLOYED_ADDRESSES = {
  lbFactory: null as string | null,
  /** Step 3 — LiquidityBuildingExecutionAuthorizerV1 @ tx 0xd81e1a41…3790 */
  lbAuthorizer: '0xA0c48D603BD07A012666b003Bd8089aA3dD49471' as string | null,
  /** Step 4 — LiquidityBuildingTreasuryFeeSinkV1 @ tx 0x14d7e29d…fa98 */
  lbFeeSink: '0xF984e1b1e9C35BF6E0cA801cd9dcea59faaA10AF' as string | null,
  /** Step 2 — LiquidityBuildingTreasuryFeeReceiverV1 @ tx 0x17770c7f…a9c5 */
  lbFeeReceiver: '0x5f3b45ab1b4d149761f3749a3d7954a37a6a1ff5' as string | null,
  /** Step 5 — LiquidityBuildingProgramV1 @ tx 0xd04fd0d7…285e */
  lbProgramImplementation: '0x722EbCb0101CFFB585Be71B8B5d7c8fd6F73c491' as string | null,
  /** Step 1 — LiquidityBuildingExecutionMathV1 @ tx 0x04c394f9…950cbd */
  lbExecutionMathLibrary: '0xA6434254ef3c859230d1c46a03A5928979fa379f' as string | null,
  programAddress: null as string | null,
} as const

export type LbCanonicalDeployedAddresses = {
  lbFactory: string | null
  lbAuthorizer: string | null
  lbFeeSink: string | null
  programAddress: string | null
}

export function readCanonicalLbAddresses(): LbCanonicalDeployedAddresses {
  return {
    lbFactory: LB_CANONICAL_DEPLOYED_ADDRESSES.lbFactory,
    lbAuthorizer: LB_CANONICAL_DEPLOYED_ADDRESSES.lbAuthorizer,
    lbFeeSink: LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeSink,
    programAddress: LB_CANONICAL_DEPLOYED_ADDRESSES.programAddress,
  }
}

export function lbCoreContractsBound(addrs: LbCanonicalDeployedAddresses = readCanonicalLbAddresses()): boolean {
  return Boolean(addrs.lbFactory && addrs.lbAuthorizer && addrs.lbFeeSink)
}
