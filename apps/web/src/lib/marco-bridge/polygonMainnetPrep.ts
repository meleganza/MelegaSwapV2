/**
 * Polygon PoS MAINNET OFT prep — certified LayerZero V2 + Founder Safe.
 * Isolated from Wave-1 public activation. Do not add this chain to MMN/DEX
 * quote routes until a 0-supply OFT exists, peers are wired, and canaries pass.
 *
 * Live-verified 2026-09-20 against LayerZero metadata + chain RPCs.
 */

import {
  CANONICAL_MARCO_DECIMALS,
  CANONICAL_MARCO_NAME,
  CANONICAL_MARCO_SHARED_DECIMALS,
  CANONICAL_MARCO_SYMBOL,
  MarcoIdentityError,
  assertNewOftIdentity,
} from './marcoIdentityGuard'

export const POLYGON_POS_CHAIN_ID = 137
export const POLYGON_POS_CHAIN_ID_HEX = '0x89'
export const POLYGON_LZ_EID = 30109

/** Official LayerZero V2 EndpointV2 (metadata.layerzero-api.com chainKey=polygon). */
export const POLYGON_ENDPOINT_V2 = '0x1a44076050125825900e736c501f859c50fe728c'
export const POLYGON_SEND_ULN302 = '0x6c26c61a97006888ea9e4fa36584c7df57cd9da3'
export const POLYGON_RECEIVE_ULN302 = '0x1322871e4ab09bc7f5717189434f97bbd9546e95'
export const POLYGON_EXECUTOR = '0xcd3f213ad101472e1713c72b1697e727c803885b'

export const BSC_LZ_EID = 30102
export const BSC_ENDPOINT_V2 = '0x1a44076050125825900e736c501f859c50fe728c'
export const BSC_SEND_ULN302 = '0x9f8c645f2d0b2159767bd6e0839de4be49e823de'
export const BSC_RECEIVE_ULN302 = '0xb217266c3a98c8b2709ee26836c98cf12f6ccec1'
export const BSC_EXECUTOR = '0x3ebd570ed38b1b3b4bc886999fcf507e9d584859'

export const BNB_CONSUMER_MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
export const BNB_OFT_ADAPTER = '0xC92B49ddF9312cbfc01Ad397963dF915C7a2399E'

/** Observed Economic Presence only — standalone ERC20, 10M pre-mint, NOT an OFT. Never peer this. */
export const STALE_POLYGON_MARCO_ERC20 = '0xD3e28c74177B812d1543A406aD1A97ee3C398AC2'

/**
 * Gnosis Safe 1.4.1 that already owns the BNB adapter and Robinhood OFT.
 * 2-of-3. Live on BSC. Not yet deployed on Polygon (code=0). Redeploy via
 * Safe{Wallet} Add network so CREATE2 keeps this exact address.
 */
export const LZ_GOVERNANCE_SAFE = '0x840410fef54ca6a922eb248c8a12011144e17508'
export const LZ_GOVERNANCE_SAFE_THRESHOLD = 2
export const LZ_GOVERNANCE_SAFE_OWNERS = [
  '0xb3e79a5f594e7fc70325b228febdf4cec57ff80a',
  '0xce313c446591cf01bd7111256de431077aa84d5c',
  '0x4c2eed26f77cc2295f56012fd5441854455ce16d',
] as const

/** Same 2-of-2 DVN pair used on the live BNB↔Robinhood adapter pathway. */
export const BSC_REQUIRED_DVNS_SORTED = [
  '0x31f748a368a893bdb5abb67ec95f232507601a73', // Nethermind
  '0xfd6865c841c2d64565562fcc7e05e619a30615f0', // LayerZero Labs
] as const

export const POLYGON_REQUIRED_DVNS_SORTED = [
  '0x23de2fe932d9043291f870324b74f820e11dc81a', // LayerZero Labs (polygon metadata)
  '0x31f748a368a893bdb5abb67ec95f232507601a73', // Nethermind
] as const

export const ULN_CONFIRMATIONS = 20
export const ULN_REQUIRED_DVN_COUNT = 2
export const EXECUTOR_MAX_MESSAGE_SIZE = 10_000

/** Type-3 executor lzReceive: 200_000 gas, value 0 — copy of live BNB→Robinhood enforcedOptions. */
export const ENFORCED_LZ_RECEIVE_200K = '0x00030100110100000000000000000000000000030d40'
export const ENFORCED_LZ_RECEIVE_GAS = 200_000

export const POLYGON_RPC_URL = 'https://polygon-bor-rpc.publicnode.com'
export const POLYGON_EXPLORER_URL = 'https://polygonscan.com'

/** Current native gas token is POL (same asset LZ metadata still labels MATIC). */
export const POLYGON_NATIVE_CURRENCY = { name: 'POL', symbol: 'POL', decimals: 18 } as const

export const POLYGON_WALLET_NETWORK = {
  chainId: POLYGON_POS_CHAIN_ID_HEX,
  chainName: 'Polygon',
  nativeCurrency: POLYGON_NATIVE_CURRENCY,
  rpcUrls: [POLYGON_RPC_URL, 'https://1rpc.io/matic'],
  blockExplorerUrls: [POLYGON_EXPLORER_URL],
} as const

/** Not deployed. CREATE2 is unknown — this repo has no OFT bytecode/salt. */
export const POLYGON_OFT_ADDRESS: string | null = null

export const POLYGON_OFT_CONSTRUCTOR = {
  name: CANONICAL_MARCO_NAME,
  symbol: CANONICAL_MARCO_SYMBOL,
  decimals: CANONICAL_MARCO_DECIMALS,
  sharedDecimals: CANONICAL_MARCO_SHARED_DECIMALS,
  endpoint: POLYGON_ENDPOINT_V2,
  ownerOrDelegate: LZ_GOVERNANCE_SAFE,
  initialSupply: 0,
} as const

const sameAddr = (left: string, right: string) => left.toLowerCase() === right.toLowerCase()

export function isStalePolygonMarco(address: string): boolean {
  return sameAddr(address, STALE_POLYGON_MARCO_ERC20)
}

export function assertNotStalePolygonMarco(address: string): true {
  if (isStalePolygonMarco(address)) {
    throw new MarcoIdentityError(
      '0xD3e28c… is a standalone Polygon ERC20 with 10M pre-mint. It is not an OFT and must never be the canonical bridge token.',
    )
  }
  return true
}

export function assertLzGovernanceSafe(address: string): true {
  if (!sameAddr(address, LZ_GOVERNANCE_SAFE)) {
    throw new MarcoIdentityError(
      `Polygon OFT owner/delegate must be the existing LZ Safe ${LZ_GOVERNANCE_SAFE}. Do not invent a temporary admin.`,
    )
  }
  return true
}

export function assertPolygonOftReadyForPeer(input: {
  oftAddress: string
  name: string
  symbol: string
  decimals: number
  sharedDecimals: number
  totalSupply: string | number | bigint
  owner: string
  endpoint: string
}): true {
  assertNotStalePolygonMarco(input.oftAddress)
  assertNewOftIdentity({
    name: input.name,
    symbol: input.symbol,
    decimals: input.decimals,
    sharedDecimals: input.sharedDecimals,
    totalSupply: input.totalSupply,
  })
  assertLzGovernanceSafe(input.owner)
  if (!sameAddr(input.endpoint, POLYGON_ENDPOINT_V2)) {
    throw new MarcoIdentityError(`Polygon OFT endpoint must be ${POLYGON_ENDPOINT_V2}.`)
  }
  return true
}

export function peerBytes32(evmAddress: string): string {
  const hex = evmAddress.trim().toLowerCase().replace(/^0x/, '')
  if (!/^[0-9a-f]{40}$/.test(hex)) {
    throw new MarcoIdentityError('Peer must be a 20-byte EVM address.')
  }
  return `0x${'00'.repeat(12)}${hex}`
}

export const EXPECTED_POLYGON_TO_BNB_PEER = peerBytes32(BNB_OFT_ADAPTER)

/** Official Safe 1.4.1 CREATE2 factory used on BSC creation — same address is live on Polygon. */
export const SAFE_PROXY_FACTORY_1_4_1 = '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67'
export const SAFE_SINGLETON_1_4_1 = '0x41675C099F32341bf84BFc5382aF534df5C7461a'
export const SAFE_L2_SINGLETON_1_4_1 = '0x29fcB43b46531BcA003ddC8FCB67FFE91900C762'
export const SAFE_CREATION_SALT_NONCE = '0'
export const SAFE_BSC_CREATION_TX =
  '0xfe39ad956774b56f32b251d18c7ade860e8b0227e11108f7adbf2a2938650ff8'

export const SAFE_UI_BSC_HOME =
  'https://app.safe.global/home?safe=bnb:0x840410fef54CA6A922Eb248c8a12011144E17508'
export const SAFE_UI_POLYGON_HOME_AFTER_DEPLOY =
  'https://app.safe.global/home?safe=matic:0x840410fef54CA6A922Eb248c8a12011144E17508'

/**
 * First Founder signature only. Official Safe{Wallet} replays BSC CREATE2
 * onto Polygon. This is an owner-EOA factory tx, not a 2-of-3 Safe tx.
 * Do not deploy OFT, do not peer, do not use a temporary EOA.
 */
export const POLYGON_SAFE_FIRST_SIGNATURE = {
  action: 'ADD_POLYGON_TO_EXISTING_SAFE',
  ui: SAFE_UI_BSC_HOME,
  clicks: [
    'Open the official Safe{Wallet} URL above (BNB Safe).',
    'Connect ONE current owner: 0xB3E79A5f594e7fc70325b228febDf4cec57Ff80A, 0xCE313C446591CF01bd7111256de431077aa84D5c, or 0x4C2eEd26f77cc2295F56012FD5441854455ce16d.',
    'Header / sidebar network selector → Add network → Polygon (chainId 137).',
    'Confirm Deploy Safe on Polygon at the same address.',
    'Sign the factory transaction in the connected owner wallet. Switch that wallet to Polygon if prompted. Pay gas in POL from the owner EOA.',
    'STOP. Do not create a contract, do not open Transaction Builder, do not deploy OFT.',
  ],
  expectedAddress: LZ_GOVERNANCE_SAFE,
  expectedFactory: SAFE_PROXY_FACTORY_1_4_1,
  forbiddenDeployers: [
    '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0',
    STALE_POLYGON_MARCO_ERC20,
  ],
  funding: {
    requiredNow: false,
    reason: 'All three Safe owners already hold ≥0.98 POL. The first tx is paid by the connected owner EOA, not by the Safe.',
    ifTopUpNeeded: {
      token: 'POL',
      amount: '0.25',
      to: 'the connected Safe owner EOA on Polygon — not a new wallet, not 0xB6eEb3ab…',
    },
    laterAfterSafeExists: {
      token: 'POL',
      amount: '3',
      to: LZ_GOVERNANCE_SAFE,
      purpose: 'Future Safe-owned OFT deploy only. Do not send this before the Safe exists on Polygon unless you accept counterfactual receipt.',
    },
  },
  verifyAfter: [
    'Polygonscan contract code at 0x840410fef54CA6A922Eb248c8a12011144E17508 is non-empty.',
    'owner list is the same 3 addresses, threshold 2.',
    'Safe{Wallet} opens https://app.safe.global/home?safe=matic:0x840410fef54CA6A922Eb248c8a12011144E17508',
    'Return the Polygon deploy tx hash. Do not proceed to OFT until that is verified.',
  ],
} as const

export const POLYGON_DEPLOY_OPERATOR_STEPS = [
  'FIRST SIGNATURE ONLY: official Safe{Wallet} → BNB Safe → network selector → Add network → Polygon. Same address 0x840410fe… via official CREATE2 factory 0x4e1DCf7A…. Owner EOA pays POL. No temporary EOA.',
  'STOP and return the Polygon Safe deploy tx. Do not deploy OFT yet.',
  'After verification: fund Safe with ≥ 3 POL, then Safe-owned LayerZero V2 OFT (MELEGA/MARCO/18/shared6/supply0, endpoint Polygon EndpointV2, owner=Safe).',
  'Reject MARCO/MARCO and reject stale ERC20 0xD3e28c….',
  'No peers, no Base, no liquidity until the OFT is verified.',
] as const
