/**
 * On-chain vs indexed eligibility enforcement model for Public Farm Factory.
 * Frontend is never the sole economic gate.
 */
export const PUBLIC_FARM_ELIGIBILITY_ENFORCEMENT = {
  schema: 'melega.dex.v1.public-farm-eligibility-enforcement',
  minimumTvlBnb: 0.25,
  onChainEnforceable: [
    {
      requirement: 'pair_contract_validity',
      mechanism: 'IMelegaPairFactory.getPair(token0,token1) == lpToken && lpToken != address(0)',
    },
    {
      requirement: 'lp_token_validity',
      mechanism: 'lpToken must equal factory pair address; IERC20 interface check on reward + LP',
    },
    {
      requirement: 'reward_not_marco',
      mechanism: 'require(rewardToken != marcoToken); immutable MARCO address at factory construction',
    },
    {
      requirement: 'fee_rule',
      mechanism:
        'msg.value == 0 when pairContainsMarco else msg.value == 0.25 ether; forward immediately to treasury',
    },
    {
      requirement: 'reward_funding',
      mechanism: 'creator must transfer rewardBudget to the new farm in the same createFarm call path',
    },
  ],
  indexedOrAttested: [
    {
      requirement: 'current_tvl_bnb',
      mechanism: 'indexer reserves → 2×WBNB; cannot be proven safely on-chain without oracle',
    },
    {
      requirement: 'indexed_status',
      mechanism: 'runtime pair registry classification',
    },
    {
      requirement: 'active_market_status',
      mechanism: 'classification tradeable | liquidity_present',
    },
  ],
  attestationModel: {
    kind: 'signed_eligibility_authorization',
    authority: 'Melega eligibility signer (protocol-operated; not frontend wallet)',
    payload: [
      'chainId',
      'factory',
      'lpToken',
      'currentTvlBnbRay',
      'minimumTvlBnbRay',
      'sourceBlock',
      'deadline',
      'nonce',
    ],
    replayProtection: 'per-creator nonce + deadline; factory consumes nonce on successful createFarm',
    unsafeOracleRejected: true,
    frontendSoleGateRejected: true,
    status: 'DESIGNED_NOT_DEPLOYED',
    note:
      'Until the factory + attestation verifier are deployed, UI eligibility is advisory and createFarm remains execution-blocked (B_FACTORY_DEPLOYMENT_REQUIRED).',
  },
} as const
