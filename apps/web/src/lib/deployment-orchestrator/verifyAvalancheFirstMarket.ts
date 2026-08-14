/**
 * Avalanche first-market canary — on-chain verification helpers (read-only RPC).
 * No broadcast. Used after Founder-signed seed/swap.
 */
import { Interface } from '@ethersproject/abi'
import {
  MELEGA_AVAX_FACTORY,
  MELEGA_AVAX_MARCO,
  MELEGA_AVAX_ROUTER,
  MELEGA_AVAX_WAVAX,
} from 'config/melegaChainRegistry'
import { calculateSmartRouterGasProtocolFee } from 'lib/smart-swap-gas-protocol-fee'

export const AVAX_CANARY_RPC = 'https://api.avax.network/ext/bc/C/rpc'
export const AVAX_CANARY_TREASURY = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b' as const
export const AVAX_CANARY_DEPLOYER = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0' as const

const FACTORY_IFACE = new Interface([
  'function allPairsLength() view returns (uint256)',
  'function getPair(address,address) view returns (address)',
])
const PAIR_IFACE = new Interface([
  'function getReserves() view returns (uint112,uint112,uint32)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
])
const ROUTER_IFACE = new Interface([
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
])

async function rpcCall(to: string, data: string, rpcUrl = AVAX_CANARY_RPC): Promise<string> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to, data }, 'latest'],
    }),
  })
  const json = (await res.json()) as { result?: string; error?: { message: string } }
  if (json.error) throw new Error(json.error.message)
  if (typeof json.result !== 'string') throw new Error('eth_call empty')
  return json.result
}

async function rpcCode(address: string, rpcUrl = AVAX_CANARY_RPC): Promise<string> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getCode',
      params: [address, 'latest'],
    }),
  })
  const json = (await res.json()) as { result?: string }
  return json.result || '0x'
}

function decodeUint(ret: string): bigint {
  if (!ret || ret === '0x') return 0n
  return BigInt(ret)
}

function decodeAddress(ret: string): string {
  if (!ret || ret === '0x') return '0x0000000000000000000000000000000000000000'
  return `0x${ret.slice(-40)}`
}

export type AvalancheMarketState = {
  factory: string
  router: string
  marco: string
  wavax: string
  allPairsLength: string
  pair: string
  pairHasBytecode: boolean
  reserve0: string
  reserve1: string
  totalSupply: string
  lpBalanceDeployer: string
  token0: string
  token1: string
  quoteAmountOut: string | null
  quoteOk: boolean
  marketReady: boolean
}

/** Read-only market verification against public Avalanche RPC. */
export async function verifyAvalancheFirstMarket(input?: {
  rpcUrl?: string
  quoteAmountInWei?: bigint
}): Promise<AvalancheMarketState> {
  const rpc = input?.rpcUrl ?? AVAX_CANARY_RPC
  const quoteIn = input?.quoteAmountInWei ?? 1_000_000_000_000_000n

  const allPairsLength = decodeUint(
    await rpcCall(MELEGA_AVAX_FACTORY, FACTORY_IFACE.encodeFunctionData('allPairsLength', []), rpc),
  ).toString()

  const pair = decodeAddress(
    await rpcCall(
      MELEGA_AVAX_FACTORY,
      FACTORY_IFACE.encodeFunctionData('getPair', [MELEGA_AVAX_MARCO, MELEGA_AVAX_WAVAX]),
      rpc,
    ),
  )

  const zero = '0x0000000000000000000000000000000000000000'
  if (pair.toLowerCase() === zero) {
    return {
      factory: MELEGA_AVAX_FACTORY,
      router: MELEGA_AVAX_ROUTER,
      marco: MELEGA_AVAX_MARCO,
      wavax: MELEGA_AVAX_WAVAX,
      allPairsLength,
      pair,
      pairHasBytecode: false,
      reserve0: '0',
      reserve1: '0',
      totalSupply: '0',
      lpBalanceDeployer: '0',
      token0: zero,
      token1: zero,
      quoteAmountOut: null,
      quoteOk: false,
      marketReady: false,
    }
  }

  const code = await rpcCode(pair, rpc)
  const pairHasBytecode = code.length > 4

  const reservesRaw = await rpcCall(pair, PAIR_IFACE.encodeFunctionData('getReserves', []), rpc)
  const reservesDecoded = PAIR_IFACE.decodeFunctionResult('getReserves', reservesRaw)
  const reserve0 = BigInt(reservesDecoded[0].toString()).toString()
  const reserve1 = BigInt(reservesDecoded[1].toString()).toString()

  const totalSupply = decodeUint(
    await rpcCall(pair, PAIR_IFACE.encodeFunctionData('totalSupply', []), rpc),
  ).toString()
  const lpBalanceDeployer = decodeUint(
    await rpcCall(
      pair,
      PAIR_IFACE.encodeFunctionData('balanceOf', [AVAX_CANARY_DEPLOYER]),
      rpc,
    ),
  ).toString()
  const token0 = decodeAddress(await rpcCall(pair, PAIR_IFACE.encodeFunctionData('token0', []), rpc))
  const token1 = decodeAddress(await rpcCall(pair, PAIR_IFACE.encodeFunctionData('token1', []), rpc))

  let quoteAmountOut: string | null = null
  let quoteOk = false
  try {
    const quoteRaw = await rpcCall(
      MELEGA_AVAX_ROUTER,
      ROUTER_IFACE.encodeFunctionData('getAmountsOut', [
        quoteIn,
        [MELEGA_AVAX_WAVAX, MELEGA_AVAX_MARCO],
      ]),
      rpc,
    )
    const amounts = ROUTER_IFACE.decodeFunctionResult('getAmountsOut', quoteRaw)[0] as { toString(): string }[]
    quoteAmountOut = amounts[1]?.toString?.() ?? null
    quoteOk = Boolean(quoteAmountOut && BigInt(quoteAmountOut) > 0n)
  } catch {
    quoteOk = false
  }

  const marketReady =
    BigInt(allPairsLength) >= 1n &&
    pairHasBytecode &&
    BigInt(reserve0) > 0n &&
    BigInt(reserve1) > 0n &&
    BigInt(totalSupply) > 0n &&
    quoteOk

  return {
    factory: MELEGA_AVAX_FACTORY,
    router: MELEGA_AVAX_ROUTER,
    marco: MELEGA_AVAX_MARCO,
    wavax: MELEGA_AVAX_WAVAX,
    allPairsLength,
    pair,
    pairHasBytecode,
    reserve0,
    reserve1,
    totalSupply,
    lpBalanceDeployer,
    token0,
    token1,
    quoteAmountOut,
    quoteOk,
    marketReady,
  }
}

/** Canonical fee plan for canary Smart Swap (does not broadcast). */
export function buildAvalancheCanaryFeePlan(input: {
  gasEstimateUnits: bigint | number | string
  gasPriceWei: bigint | number | string
}) {
  return calculateSmartRouterGasProtocolFee({
    gasEstimateUnits: input.gasEstimateUnits,
    gasPriceWei: input.gasPriceWei,
    chainId: 43114,
  })
}

export function encodeFactoryGetPair(): string {
  return FACTORY_IFACE.encodeFunctionData('getPair', [MELEGA_AVAX_MARCO, MELEGA_AVAX_WAVAX])
}

export function encodeFactoryAllPairsLength(): string {
  return FACTORY_IFACE.encodeFunctionData('allPairsLength', [])
}
