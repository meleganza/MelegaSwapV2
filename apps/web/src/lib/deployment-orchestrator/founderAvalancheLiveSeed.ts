/**
 * Avalanche LIVE Founder seed — wrap AVAX, add MARCO/WAVAX liquidity, controlled swap.
 * Browser-wallet only. No KMS. No automatic broadcast.
 */
import { Interface } from '@ethersproject/abi'
import {
  MELEGA_AVAX_MARCO,
  MELEGA_AVAX_ROUTER,
  MELEGA_AVAX_WAVAX,
} from 'config/melegaChainRegistry'
import { AUTHORIZED_MELEGA_DEPLOYER } from './founderDeployer'

export const AVAX_LIVE_SEED_ROUTER = MELEGA_AVAX_ROUTER
export const AVAX_LIVE_SEED_WAVAX = MELEGA_AVAX_WAVAX
export const AVAX_LIVE_SEED_MARCO = MELEGA_AVAX_MARCO

const ERC20 = new Interface([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function deposit() payable',
])

const ROUTER = new Interface([
  'function addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity)',
  'function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable returns (uint256[] amounts)',
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
])

const WAVAX = new Interface(['function deposit() payable'])

/** Default seed sizes — small factual liquidity + micro swap (Founder can adjust in UI). */
export const AVAX_SEED_DEFAULTS = {
  /** AVAX to wrap + use as liquidity (keep gas headroom). */
  liquidityAvaxWei: 50_000_000_000_000_000n, // 0.05 AVAX
  /** MARCO side of the pair. */
  liquidityMarcoWei: 1_000_000_000_000_000_000_000n, // 1000 MARCO
  /** Micro swap AVAX → MARCO after liquidity. */
  swapAvaxWei: 1_000_000_000_000_000n, // 0.001 AVAX
} as const

export function encodeWavaxDeposit(): string {
  return WAVAX.encodeFunctionData('deposit', [])
}

export function encodeMarcoApprove(spender: string, amount: bigint): string {
  return ERC20.encodeFunctionData('approve', [spender, amount])
}

export function encodeAddLiquidityAvax(input: {
  marcoAmount: bigint
  avaxAmount: bigint
  to: string
  deadline: number
}): { data: string; valueWei: bigint } {
  return {
    data: ROUTER.encodeFunctionData('addLiquidityETH', [
      AVAX_LIVE_SEED_MARCO,
      input.marcoAmount,
      0n,
      0n,
      input.to,
      input.deadline,
    ]),
    valueWei: input.avaxAmount,
  }
}

export function encodeSwapExactAvaxForMarco(input: {
  avaxIn: bigint
  to: string
  deadline: number
}): { data: string; valueWei: bigint } {
  return {
    data: ROUTER.encodeFunctionData('swapExactETHForTokens', [
      0n,
      [AVAX_LIVE_SEED_WAVAX, AVAX_LIVE_SEED_MARCO],
      input.to,
      input.deadline,
    ]),
    valueWei: input.avaxIn,
  }
}

export function encodeGetAmountsOut(avaxIn: bigint): string {
  return ROUTER.encodeFunctionData('getAmountsOut', [
    avaxIn,
    [AVAX_LIVE_SEED_WAVAX, AVAX_LIVE_SEED_MARCO],
  ])
}

export function avalancheLiveSeedTargets() {
  return {
    router: AVAX_LIVE_SEED_ROUTER,
    wavax: AVAX_LIVE_SEED_WAVAX,
    marco: AVAX_LIVE_SEED_MARCO,
    deployer: AUTHORIZED_MELEGA_DEPLOYER,
    treasury: '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b' as const,
    feeAsset: 'AVAX' as const,
    feePercent: 25 as const,
  }
}
