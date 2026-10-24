/**
 * NG008 shadow diagnostic. Compares a supplied BNB quote with read-only
 * balance and allowance facts. It does not build, sign, or broadcast a transaction.
 * Unsigned calldata stays in the live SmartSwap adapter named below.
 */
import { BNB_QUOTE_VENUES, BSC_CHAIN_ID, parseDecimalAmount, quoteIsStale, quotePaths, STALE_QUOTE_MS, tokenBySymbol } from './bscQuote'
import { isPublicAddress } from './portfolioRead'

/** Copied from apps/web `BSC_SMARTSWAP_EXECUTOR_V2_ADDRESS`. Not an import. */
export const SHADOW_EXECUTOR_ADDRESS = '0x7c07082839edd5797737640bba6af47992b9861e'

export const SHADOW_ADAPTER = {
  module: 'apps/web/src/lib/smartswap-universal-engine/v2ExecutionBinding.ts',
  function: 'prepareV2UserTransactions',
  reused: false,
} as const

export const MAX_SHADOW_RPC_CALLS = 4
export const SHADOW_TIMEOUT_MS = 1_200
const ALLOWANCE = 'dd62ed3e'

const PERMANENT_BLOCKERS = [
  'WALLET_NOT_CONNECTED',
  'UNSIGNED_TX_BLOCKED',
  'FEE_NOT_CERTIFIED',
  'GAS_NOT_ESTIMATED',
  'TRANSACTIONS_DISABLED',
] as const

export type ShadowCode =
  | 'CHAIN_MISMATCH'
  | 'ADDRESS_REJECTED'
  | 'QUOTE_REQUIRED'
  | 'QUOTE_STALE'
  | 'QUOTE_REJECTED'
  | 'QUOTE_TIMEOUT'
  | 'READ_FAILED'

export interface ShadowQuoteInput {
  quotedAt?: string
  staleAfterMs?: number
  sell?: string
  buy?: string
  amount?: string
  amountInRaw?: string
  amountOutRaw?: string
  router?: string
  venueId?: string
  path?: string[]
}

export interface AcceptedShadowQuote {
  sell: string
  buy: string
  token: string
  amountInRaw: string
  amountOutRaw: string
  router: string
  venueLabel: string
  path: string[]
  quotedAt: string
}

export type AllowanceStatus = 'covers' | 'short' | 'unread' | 'failed'
export type BalanceStatus = 'sufficient' | 'insufficient' | 'unread' | 'failed'

export interface ShadowReadiness {
  ok: boolean
  code?: ShadowCode
  schema: 'melega.next-gen.shadow-readiness.v1'
  chainId: 56 | null
  address: string | null
  executable: false
  broadcast: false
  signed: false
  feeCollected: false
  feeAmount: null
  gasUnits: null
  unsignedTx: null
  walletConnected: false
  adapter: typeof SHADOW_ADAPTER
  rpcCalls: number
  durationMs: number
  quote: { status: 'fresh' | 'stale' | 'rejected' | 'missing'; venueLabel: string | null; amountOutRaw: string | null }
  balance: { status: BalanceStatus; raw: string | null }
  allowance: {
    executor: { spender: string; status: AllowanceStatus; raw: string | null }
    router: { spender: string | null; status: AllowanceStatus; raw: string | null }
  }
  blockers: string[]
}

export function encodeAllowance(owner: string, spender: string): string {
  const pad = (value: string) => value.toLowerCase().replace(/^0x/, '').padStart(64, '0')
  return `0x${ALLOWANCE}${pad(owner)}${pad(spender)}`
}

export function acceptShadowQuote(quote: ShadowQuoteInput | null | undefined, nowMs: number): AcceptedShadowQuote | ShadowCode {
  if (!quote) return 'QUOTE_REQUIRED'
  const sell = tokenBySymbol(quote.sell ?? '')
  const buy = tokenBySymbol(quote.buy ?? '')
  if (!sell || !buy || sell.symbol === buy.symbol) return 'QUOTE_REJECTED'
  const amountInRaw = quote.amount ? parseDecimalAmount(quote.amount, sell.decimals) : null
  if (!amountInRaw || amountInRaw !== quote.amountInRaw) return 'QUOTE_REJECTED'
  if (!/^[1-9][0-9]*$/.test(quote.amountOutRaw ?? '')) return 'QUOTE_REJECTED'
  if (quote.staleAfterMs !== STALE_QUOTE_MS) return 'QUOTE_REJECTED'
  if (!quote.quotedAt || Number.isNaN(Date.parse(quote.quotedAt))) return 'QUOTE_REJECTED'
  const venue = BNB_QUOTE_VENUES.find((item) => item.id === quote.venueId && item.router.toLowerCase() === quote.router?.toLowerCase())
  if (!venue) return 'QUOTE_REJECTED'
  const path = (quote.path ?? []).map((item) => item.toLowerCase())
  const allowed = quotePaths(sell.address, buy.address).map((item) => item.join(','))
  if (!allowed.includes(path.join(','))) return 'QUOTE_REJECTED'
  if (quoteIsStale(quote.quotedAt, nowMs, STALE_QUOTE_MS)) return 'QUOTE_STALE'
  return {
    sell: sell.symbol,
    buy: buy.symbol,
    token: sell.address,
    amountInRaw,
    amountOutRaw: quote.amountOutRaw as string,
    router: venue.router,
    venueLabel: venue.label,
    path,
    quotedAt: quote.quotedAt,
  }
}

export function emptyShadow(code: ShadowCode | undefined, rpcCalls: number, started: number, nowMs: number, quote?: ShadowQuoteInput | null): ShadowReadiness {
  const quoteCode = quote ? acceptShadowQuote(quote, nowMs) : 'QUOTE_REQUIRED'
  const quoteStatus =
    quoteCode === 'QUOTE_STALE' ? 'stale' : quoteCode === 'QUOTE_REQUIRED' ? 'missing' : typeof quoteCode === 'string' ? 'rejected' : 'fresh'
  const blockers: string[] = [...PERMANENT_BLOCKERS]
  if (code === 'CHAIN_MISMATCH') blockers.push('CHAIN_MISMATCH')
  if (code === 'ADDRESS_REJECTED') blockers.push('ADDRESS_REJECTED')
  if (quoteStatus === 'stale') blockers.push('QUOTE_STALE')
  if (quoteStatus === 'missing' || quoteStatus === 'rejected') blockers.push('QUOTE_UNUSABLE')
  if (code === 'QUOTE_TIMEOUT' || code === 'READ_FAILED') blockers.push('RPC_FAILED')
  return {
    ok: false,
    code,
    schema: 'melega.next-gen.shadow-readiness.v1',
    chainId: code === 'CHAIN_MISMATCH' ? null : 56,
    address: null,
    executable: false,
    broadcast: false,
    signed: false,
    feeCollected: false,
    feeAmount: null,
    gasUnits: null,
    unsignedTx: null,
    walletConnected: false,
    adapter: SHADOW_ADAPTER,
    rpcCalls,
    durationMs: Date.now() - started,
    quote: {
      status: quoteStatus,
      venueLabel: null,
      amountOutRaw: null,
    },
    balance: { status: code === 'QUOTE_TIMEOUT' || code === 'READ_FAILED' ? 'failed' : 'unread', raw: null },
    allowance: {
      executor: { spender: SHADOW_EXECUTOR_ADDRESS, status: code === 'QUOTE_TIMEOUT' || code === 'READ_FAILED' ? 'failed' : 'unread', raw: null },
      router: { spender: null, status: code === 'QUOTE_TIMEOUT' || code === 'READ_FAILED' ? 'failed' : 'unread', raw: null },
    },
    blockers,
  }
}

export function finishShadowRead(input: {
  quote: AcceptedShadowQuote
  address: string
  balanceRaw: string | null
  executorAllowanceRaw: string | null
  routerAllowanceRaw: string | null
  rpcCalls: number
  started: number
}): ShadowReadiness {
  const { balanceRaw, executorAllowanceRaw, routerAllowanceRaw } = input
  if (balanceRaw === null || executorAllowanceRaw === null || routerAllowanceRaw === null) {
    const failed = emptyShadow('READ_FAILED', input.rpcCalls, input.started, Date.now(), null)
    failed.address = input.address
    failed.quote = { status: 'fresh', venueLabel: input.quote.venueLabel, amountOutRaw: input.quote.amountOutRaw }
    failed.blockers = failed.blockers.filter((item) => item !== 'QUOTE_UNUSABLE')
    return failed
  }
  const enough = BigInt(balanceRaw) >= BigInt(input.quote.amountInRaw)
  const executorCovers = BigInt(executorAllowanceRaw) >= BigInt(input.quote.amountInRaw)
  const routerCovers = BigInt(routerAllowanceRaw) >= BigInt(input.quote.amountInRaw)
  const blockers: string[] = [...PERMANENT_BLOCKERS]
  if (!enough) blockers.push('INSUFFICIENT_BALANCE')
  if (!executorCovers) blockers.push('EXECUTOR_ALLOWANCE_SHORT')
  if (!routerCovers) blockers.push('ROUTER_ALLOWANCE_SHORT')
  return {
    ok: true,
    schema: 'melega.next-gen.shadow-readiness.v1',
    chainId: BSC_CHAIN_ID,
    address: input.address,
    executable: false,
    broadcast: false,
    signed: false,
    feeCollected: false,
    feeAmount: null,
    gasUnits: null,
    unsignedTx: null,
    walletConnected: false,
    adapter: SHADOW_ADAPTER,
    rpcCalls: input.rpcCalls,
    durationMs: Date.now() - input.started,
    quote: { status: 'fresh', venueLabel: input.quote.venueLabel, amountOutRaw: input.quote.amountOutRaw },
    balance: { status: enough ? 'sufficient' : 'insufficient', raw: balanceRaw },
    allowance: {
      executor: { spender: SHADOW_EXECUTOR_ADDRESS, status: executorCovers ? 'covers' : 'short', raw: executorAllowanceRaw },
      router: { spender: input.quote.router, status: routerCovers ? 'covers' : 'short', raw: routerAllowanceRaw },
    },
    blockers,
  }
}

export function rejectAddress(address: string | undefined): boolean {
  return !address || !isPublicAddress(address)
}
