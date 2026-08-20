import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from './feeEnforcement'
import { PANCAKE_SWAP_VENUE } from './certifiedVenues'
import { EVM_CHAIN_IDS } from './domain'

export const FIRST_CANARY_SPEC = {
  status: 'CANARY_PREPARED' as const,
  executed: false,
  chainId: EVM_CHAIN_IDS.BSC,
  venueId: 'pancakeswap' as const,
  pair: {
    input: 'WBNB',
    output: 'USDC',
    inputAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    outputAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  },
  inputAmountRaw: '10000000000000000',
  expectedFeeBps: 20,
  expectedTreasury: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
  router: PANCAKE_SWAP_VENUE.routers[EVM_CHAIN_IDS.BSC],
  maxEconomicExposureNote: '0.01 WBNB notional. Not funded. Not broadcast.',
  gasCeilingUnits: 400_000,
  quoteExpirySeconds: 30,
  disable: 'Pause SmartSwapExecutorV1; keep ACTIVE_V2_ROLLOUT=LEGACY_PRODUCTION',
} as const
