/** R767 — bounded BSC RPC log reader for swap events when subgraph is absent. */

export const MELEGA_FACTORY_BSC = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'
export const MARCO_WBNB_PAIR_BSC = '0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e'
export const WBNB_BSC = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
export const MARCO_BSC = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'

/** keccak256("Swap(address,uint256,uint256,uint256,uint256,address)") */
export const SWAP_EVENT_TOPIC =
  '0xd78ad95fa46c994b655c0d0f448cbf7efa837466c05fc46eca8c283b072db6b'

const DEFAULT_RPC = 'https://bsc-dataseed.binance.org'

export interface RpcJsonResponse<T> {
  jsonrpc: string
  id: number
  result?: T
  error?: { code: number; message: string }
}

export async function rpcCall<T>(method: string, params: unknown[], rpcUrl = DEFAULT_RPC): Promise<T> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const json = (await res.json()) as RpcJsonResponse<T>
  if (json.error) throw new Error(json.error.message)
  if (json.result === undefined) throw new Error(`RPC ${method} returned no result`)
  return json.result
}

export async function getBlockNumber(rpcUrl?: string): Promise<number> {
  const hex = await rpcCall<string>('eth_blockNumber', [], rpcUrl)
  return parseInt(hex, 16)
}

export async function getLogs(
  filter: {
    address: string
    topics?: (string | null)[]
    fromBlock: string
    toBlock: string
  },
  rpcUrl?: string,
) {
  return rpcCall<
    Array<{
      address: string
      topics: string[]
      data: string
      blockNumber: string
      transactionHash: string
    }>
  >('eth_getLogs', [filter], rpcUrl)
}

export function decodeUint256(hex: string): bigint {
  return BigInt(hex)
}

/** Decode Swap log data: amount0In, amount1In, amount0Out, amount1Out (4 x uint256). */
export function decodeSwapAmounts(data: string): {
  amount0In: bigint
  amount1In: bigint
  amount0Out: bigint
  amount1Out: bigint
} {
  const raw = data.startsWith('0x') ? data.slice(2) : data
  const chunks = raw.match(/.{1,64}/g) ?? []
  return {
    amount0In: BigInt(`0x${chunks[0] ?? '0'}`),
    amount1In: BigInt(`0x${chunks[1] ?? '0'}`),
    amount0Out: BigInt(`0x${chunks[2] ?? '0'}`),
    amount1Out: BigInt(`0x${chunks[3] ?? '0'}`),
  }
}

export function formatTokenAmountFromWei(value: bigint, decimals: number): number {
  const divisor = 10 ** decimals
  return Number(value) / divisor
}
