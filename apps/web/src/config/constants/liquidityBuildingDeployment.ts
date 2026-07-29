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
 * Remain null until deployed-addresses.v1.json is updated from a verified mainnet deploy.
 */
export const LB_CANONICAL_DEPLOYED_ADDRESSES = {
  lbFactory: null as string | null,
  lbAuthorizer: null as string | null,
  lbFeeSink: null as string | null,
  lbFeeReceiver: null as string | null,
  lbProgramImplementation: null as string | null,
  lbExecutionMathLibrary: null as string | null,
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
