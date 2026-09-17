/**
 * Chain-bound V2 remove-liquidity call construction.
 *
 * Builds unsigned router arguments only. Never broadcasts, never signs,
 * never submits an approval. Spender / pair / WETH are resolved from the
 * selected position + canonical Melega registry — never from BSC defaults.
 */
import { ChainId, WNATIVE } from '@pancakeswap/sdk'
import {
  getMelegaChain,
  getMelegaFactoryAddress,
  getMelegaRouterAddress,
  isMelegaCapabilityEnabled,
} from 'config/melegaChainRegistry'

export const ETHEREUM_CHAIN_ID = ChainId.ETHEREUM
export const ETHEREUM_WETH = WNATIVE[ChainId.ETHEREUM]?.address ?? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
export const BIPS_DENOMINATOR = 10_000n

export type RemoveLiquidityMethod = 'removeLiquidity' | 'removeLiquidityETH'

export type RemoveLiquidityCallStatus =
  | 'ready'
  | 'approval_required'
  | 'wrong_chain'
  | 'missing_pair'
  | 'unsupported_chain'
  | 'incomplete_amounts'
  | 'wallet_required'

export type RemoveLiquidityTokenInput = {
  address?: string | null
  isNative?: boolean
}

export type BuildRemoveLiquidityCallInput = {
  chainId?: number | null
  walletChainId?: number | null
  account?: string | null
  tokenA?: RemoveLiquidityTokenInput | null
  tokenB?: RemoveLiquidityTokenInput | null
  lpTokenAddress?: string | null
  liquidityRaw?: string | null
  amountARaw?: string | null
  amountBRaw?: string | null
  /** User slippage tolerance in basis points (50 = 0.50%). */
  allowedSlippageBips?: number
  /** Unix seconds. */
  deadlineUnix?: number | string | null
  recipient?: string | null
  receiveNative?: boolean
  /** Raw ERC-20 allowance of the LP token for the chain router. null = unknown. */
  lpAllowanceRaw?: string | null
}

export type RemoveLiquidityCall = {
  status: RemoveLiquidityCallStatus
  message: string
  chainId?: number
  requiredChainId?: number
  requiredChainLabel?: string
  router?: string
  factory?: string
  weth?: string
  spender?: string
  lpToken?: string
  method?: RemoveLiquidityMethod
  args?: string[]
  value?: '0'
  amountAMin?: string
  amountBMin?: string
  deadline?: string
  recipient?: string
  enableRemove: boolean
  requireApprove: boolean
  requireSwitch: boolean
}

const ZERO = 0n

function normalizeAddress(value?: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return null
  return trimmed
}

function parseRawAmount(value?: string | null): bigint | null {
  if (value == null) return null
  const trimmed = String(value).trim()
  if (!trimmed || trimmed === '0x') return null
  try {
    const parsed = trimmed.startsWith('0x') ? BigInt(trimmed) : BigInt(trimmed)
    if (parsed < ZERO) return null
    return parsed
  } catch {
    return null
  }
}

export function applySlippageMin(amountRaw: string, allowedSlippageBips: number): string {
  const amount = parseRawAmount(amountRaw)
  if (amount == null) return '0'
  const bips = Number.isFinite(allowedSlippageBips) ? Math.max(0, Math.min(10_000, Math.floor(allowedSlippageBips))) : 0
  return ((amount * BigInt(BIPS_DENOMINATOR - BigInt(bips))) / BIPS_DENOMINATOR).toString()
}

export function isCanonicalWrappedNative(address: string | null | undefined, chainId: number): boolean {
  const token = normalizeAddress(address)
  const wrapped = WNATIVE[chainId]?.address
  return Boolean(token && wrapped && token.toLowerCase() === wrapped.toLowerCase())
}

export function resolveRemoveLiquidityMethod(input: {
  tokenAIsNative?: boolean
  tokenBIsNative?: boolean
  tokenAIsWrappedNative?: boolean
  tokenBIsWrappedNative?: boolean
  receiveNative?: boolean
}): RemoveLiquidityMethod {
  if (input.tokenAIsNative || input.tokenBIsNative) return 'removeLiquidityETH'
  if (input.receiveNative && (input.tokenAIsWrappedNative || input.tokenBIsWrappedNative)) {
    return 'removeLiquidityETH'
  }
  return 'removeLiquidity'
}

function chainLabel(chainId: number): string {
  return getMelegaChain(chainId)?.name ?? `chain ${chainId}`
}

function fail(
  status: RemoveLiquidityCallStatus,
  message: string,
  extra: Partial<RemoveLiquidityCall> = {},
): RemoveLiquidityCall {
  return {
    status,
    message,
    enableRemove: false,
    requireApprove: status === 'approval_required',
    requireSwitch: status === 'wrong_chain',
    ...extra,
  }
}

/**
 * Construct a remove-liquidity router call without touching the wallet.
 * Approval / switch / missing-pair outcomes stay controlled in-surface.
 */
export function buildRemoveLiquidityCall(input: BuildRemoveLiquidityCallInput): RemoveLiquidityCall {
  const chainId = input.chainId ?? null
  if (chainId == null || !Number.isInteger(chainId)) {
    return fail('unsupported_chain', 'Select a supported Melega network to remove liquidity.')
  }

  const router = getMelegaRouterAddress(chainId)
  const factory = getMelegaFactoryAddress(chainId)
  const weth = WNATIVE[chainId]?.address
  const bindings = { chainId, router: router ?? undefined, factory: factory ?? undefined, weth }

  if (!isMelegaCapabilityEnabled(chainId, 'swap') || !router || !factory || !weth) {
    return fail(
      'unsupported_chain',
      `Remove liquidity is not bound on ${chainLabel(chainId)} — missing canonical router/factory/WETH.`,
      bindings,
    )
  }

  if (!input.account) {
    return fail('wallet_required', 'Connect Wallet', bindings)
  }

  const walletChainId = input.walletChainId ?? null
  if (walletChainId == null || walletChainId !== chainId) {
    return fail('wrong_chain', `Switch to ${chainLabel(chainId)}`, {
      ...bindings,
      requiredChainId: chainId,
      requiredChainLabel: chainLabel(chainId),
      spender: router,
    })
  }

  const tokenAAddress = normalizeAddress(input.tokenA?.address)
  const tokenBAddress = normalizeAddress(input.tokenB?.address)
  const lpToken = normalizeAddress(input.lpTokenAddress)
  if (!tokenAAddress || !tokenBAddress || !lpToken) {
    return fail('missing_pair', 'This pair is not available for removal.', {
      ...bindings,
      spender: router,
      lpToken: lpToken ?? undefined,
    })
  }

  const liquidity = parseRawAmount(input.liquidityRaw)
  const amountA = parseRawAmount(input.amountARaw)
  const amountB = parseRawAmount(input.amountBRaw)
  const deadline = parseRawAmount(input.deadlineUnix == null ? null : String(input.deadlineUnix))
  const recipient = normalizeAddress(input.recipient ?? input.account)
  if (liquidity == null || liquidity === ZERO || amountA == null || amountB == null || deadline == null || !recipient) {
    return fail('incomplete_amounts', 'Choose a removal percentage before confirming.', {
      ...bindings,
      spender: router,
      lpToken,
    })
  }

  const allowance = input.lpAllowanceRaw == null ? null : parseRawAmount(input.lpAllowanceRaw)
  if (allowance == null || allowance < liquidity) {
    return fail('approval_required', 'Approve LP Token', {
      ...bindings,
      spender: router,
      lpToken,
    })
  }

  const slippage = input.allowedSlippageBips ?? 0
  const amountAMin = applySlippageMin(liquidity === ZERO ? '0' : amountA.toString(), slippage)
  const amountBMin = applySlippageMin(amountB.toString(), slippage)
  const tokenAIsWrappedNative = isCanonicalWrappedNative(tokenAAddress, chainId)
  const tokenBIsWrappedNative = isCanonicalWrappedNative(tokenBAddress, chainId)
  const method = resolveRemoveLiquidityMethod({
    tokenAIsNative: Boolean(input.tokenA?.isNative),
    tokenBIsNative: Boolean(input.tokenB?.isNative),
    tokenAIsWrappedNative,
    tokenBIsWrappedNative,
    receiveNative: Boolean(input.receiveNative),
  })

  const deadlineRaw = deadline.toString()
  let args: string[]
  if (method === 'removeLiquidityETH') {
    const tokenIsB = tokenBIsWrappedNative || Boolean(input.tokenB?.isNative)
    const tokenAddress = tokenIsB ? tokenAAddress : tokenBAddress
    const tokenMinimum = tokenIsB ? amountAMin : amountBMin
    const nativeMinimum = tokenIsB ? amountBMin : amountAMin
    args = [tokenAddress, liquidity.toString(), tokenMinimum, nativeMinimum, recipient, deadlineRaw]
  } else {
    args = [tokenAAddress, tokenBAddress, liquidity.toString(), amountAMin, amountBMin, recipient, deadlineRaw]
  }

  return {
    status: 'ready',
    message: 'Remove Liquidity',
    chainId,
    router,
    factory,
    weth,
    spender: router,
    lpToken,
    method,
    args,
    value: '0',
    amountAMin,
    amountBMin,
    deadline: deadlineRaw,
    recipient,
    enableRemove: true,
    requireApprove: false,
    requireSwitch: false,
  }
}

export function resolveRemoveLiquidityCta(call: Pick<RemoveLiquidityCall, 'status' | 'message' | 'requiredChainLabel'>): {
  label: string
  disabled: boolean
  enableRemove: boolean
} {
  switch (call.status) {
    case 'wallet_required':
      return { label: 'Connect Wallet', disabled: false, enableRemove: false }
    case 'wrong_chain':
      return { label: call.requiredChainLabel ? `Switch to ${call.requiredChainLabel}` : 'Switch Network', disabled: false, enableRemove: false }
    case 'approval_required':
      return { label: 'Approve LP Token', disabled: false, enableRemove: false }
    case 'missing_pair':
    case 'unsupported_chain':
      return { label: call.message, disabled: true, enableRemove: false }
    case 'incomplete_amounts':
      return { label: 'Calculating withdrawal…', disabled: true, enableRemove: false }
    case 'ready':
      return { label: 'Remove Liquidity', disabled: false, enableRemove: true }
    default:
      return { label: call.message || 'Remove Liquidity', disabled: true, enableRemove: false }
  }
}
