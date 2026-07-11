import { id } from '@ethersproject/hash'

/** Canonical Uniswap V2 / PancakeSwap Pair event signatures — single source of truth (R773). */
export const SWAP_EVENT_SIGNATURE = 'Swap(address,uint256,uint256,uint256,uint256,address)'
export const MINT_EVENT_SIGNATURE = 'Mint(address,uint256,uint256)'
export const BURN_EVENT_SIGNATURE = 'Burn(address,uint256,uint256)'
export const SYNC_EVENT_SIGNATURE = 'Sync(uint112,uint112)'
export const PAIR_CREATED_EVENT_SIGNATURE = 'PairCreated(address,address,address,uint256)'

/** R772 historical defect — 63-nibble truncated Swap topic; do not use in active code. */
export const MALFORMED_SWAP_TOPIC_HISTORICAL =
  '0xd78ad95fa46c994b655c0d0f448cbf7efa837466c05fc46eca8c283b072db6b'

export const SWAP_TOPIC = id(SWAP_EVENT_SIGNATURE)
export const MINT_TOPIC = id(MINT_EVENT_SIGNATURE)
export const BURN_TOPIC = id(BURN_EVENT_SIGNATURE)
export const SYNC_TOPIC = id(SYNC_EVENT_SIGNATURE)
export const PAIR_CREATED_TOPIC = id(PAIR_CREATED_EVENT_SIGNATURE)

export const CANONICAL_EVENT_TOPICS = {
  swap: { name: 'SWAP_TOPIC', signature: SWAP_EVENT_SIGNATURE, topic: SWAP_TOPIC },
  mint: { name: 'MINT_TOPIC', signature: MINT_EVENT_SIGNATURE, topic: MINT_TOPIC },
  burn: { name: 'BURN_TOPIC', signature: BURN_EVENT_SIGNATURE, topic: BURN_TOPIC },
  sync: { name: 'SYNC_TOPIC', signature: SYNC_EVENT_SIGNATURE, topic: SYNC_TOPIC },
  pairCreated: {
    name: 'PAIR_CREATED_TOPIC',
    signature: PAIR_CREATED_EVENT_SIGNATURE,
    topic: PAIR_CREATED_TOPIC,
  },
} as const
