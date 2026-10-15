/**
 * Server adapter. The sealed candidate comes only from runAuthorizedEvmShadowCompetition.
 * This file does not compute fee bps.
 */
import { evmContract } from '@melega/smartswap-v2-prepare/src/assetIdentity'
import { evmNetwork } from '@melega/smartswap-v2-prepare/src/domain'
import { assertSealedShadowCandidate, RAW_QUOTE_NOT_SEALED_CANDIDATE } from '@melega/smartswap-v2-prepare'
import { quoteIsStale, type SmartSwapRequest } from '@melega/smartswap-v2-prepare/src/quote'
import type { ShadowCandidate } from '@melega/smartswap-v2-prepare/src/shadowCandidate'
import { bindAuthorizedHostSession } from '../../web/src/lib/smartswap-universal-engine/widget'
import { runAuthorizedEvmShadowCompetition } from '../../web/src/lib/smartswap-universal-engine/authorizedShadowRun'
import {
  assertReadonlyRpc,
  DEFAULT_BSC_READONLY_RPC,
  parseDecimalAmount,
  STALE_QUOTE_MS,
  tokenBySymbol,
} from './bscQuote'
import { decodeQuantity, isPublicAddress } from './portfolioRead'
import { encodeAllowance } from './shadowReadiness'
import type { PublicUserTx } from './userSwapFlow'
import {
  buildV2UserExecutionPlan,
  currentRequestKeyOf,
  V2_CTA_DECISION,
} from '../../web/src/lib/smartswap-universal-engine/v2UserExecutionPlan'
import { BSC_SMARTSWAP_EXECUTOR_V2_ADDRESS } from '../../web/src/lib/smartswap-universal-engine/v2ExecutionRuntimeConfig'

const CERTIFIED_BSC_EXECUTOR = BSC_SMARTSWAP_EXECUTOR_V2_ADDRESS
const APPROVE_SELECTOR = '095ea7b3'

export interface SealedPreparation {
  ok: boolean
  code?: string
  chainId: 56 | null
  broadcast: false
  signed: false
  approved: false
  executable: false
  feeBps: number | null
  feeAmountRaw: string | null
  gasUnits: string | null
  nonce?: string | null
  deadline?: number | null
  allowanceRaw: string | null
  venueLabel: string | null
  amountInRaw: string | null
  amountOutRaw: string | null
  slippageBps: number | null
  destination: string | null
  approvalTx: PublicUserTx | null
  unsignedTx: PublicUserTx | null
}

function closed(code: string, extra: Partial<SealedPreparation> = {}): SealedPreparation {
  return {
    ok: false,
    code,
    chainId: code === 'CHAIN_MISMATCH' ? null : 56,
    broadcast: false,
    signed: false,
    approved: false,
    executable: false,
    feeBps: null,
    feeAmountRaw: null,
    gasUnits: null,
    allowanceRaw: null,
    venueLabel: null,
    amountInRaw: null,
    amountOutRaw: null,
    slippageBps: null,
    destination: null,
    approvalTx: null,
    unsignedTx: null,
    ...extra,
  }
}

function publicCall(tx: { to?: string; data?: string; value?: string; chainId?: number } | null | undefined): PublicUserTx | null {
  if (!tx || tx.chainId !== 56 || tx.value !== '0x0') return null
  if (typeof tx.to !== 'string' || !/^0x[0-9a-fA-F]{40}$/.test(tx.to)) return null
  if (typeof tx.data !== 'string' || !/^0x[0-9a-fA-F]+$/.test(tx.data) || tx.data.length < 10) return null
  return { to: tx.to, data: tx.data, value: '0x0', chainId: 56 }
}

export function acceptSealedWinner(winner: unknown, nowIso: string): { ok: false; code: string } | { ok: true; winner: ShadowCandidate } {
  if (!winner || typeof winner !== 'object') return { ok: false, code: 'NO_SEALED_CANDIDATE' }
  const row = winner as ShadowCandidate
  if (row.status === 'stale') return { ok: false, code: 'QUOTE_STALE' }
  if (row.status !== 'ok') return { ok: false, code: 'NO_SEALED_CANDIDATE' }
  try {
    assertSealedShadowCandidate(winner)
  } catch (error) {
    return { ok: false, code: error instanceof Error ? error.message : RAW_QUOTE_NOT_SEALED_CANDIDATE }
  }
  if (!row.quote || quoteIsStale(row.quote, nowIso, STALE_QUOTE_MS)) return { ok: false, code: 'QUOTE_STALE' }
  return { ok: true, winner: row }
}

type Compete = (input: {
  request: SmartSwapRequest
  user: string
  nowIso: string
}) => Promise<{ shadowWinner: unknown }>

async function defaultCompete(input: { request: SmartSwapRequest; user: string; nowIso: string }): Promise<{ shadowWinner: unknown }> {
  const rpc = assertReadonlyRpc(process.env.BETA_BSC_READONLY_RPC ?? DEFAULT_BSC_READONLY_RPC)
  const session = bindAuthorizedHostSession({
    walletConnected: true,
    walletAddress: input.user,
    network: input.request.network,
    requestedInput: input.request.inputAsset,
    requestedOutput: input.request.outputAsset,
    runtimeEnvironment: 'melega-dex',
  })
  return runAuthorizedEvmShadowCompetition({
    session,
    request: input.request,
    productionQuote: null,
    melegaSnapshot: null,
    nowIso: input.nowIso,
    rpcUrlByChain: { 56: rpc },
  })
}

export async function prepareSealedBnbSwap(
  input: { chainId?: number; sell?: string; buy?: string; amount?: string; user?: string; slippageBps?: number; nonce?: string; deadline?: number },
  deps: { now?: () => Date; compete?: Compete; allowanceRaw?: string | null } = {},
): Promise<SealedPreparation> {
  if (input.chainId !== 56) return closed('CHAIN_MISMATCH')
  if (!isPublicAddress(input.user ?? '')) return closed('ADDRESS_REJECTED')
  const sell = tokenBySymbol(input.sell ?? '')
  const buy = tokenBySymbol(input.buy ?? '')
  const amountInRaw = sell && input.amount ? parseDecimalAmount(input.amount, sell.decimals) : null
  if (!sell || !buy || sell.symbol === buy.symbol || !amountInRaw) return closed('PAIR_REJECTED')
  if (!Number.isInteger(input.slippageBps) || (input.slippageBps as number) < 0 || (input.slippageBps as number) > 100) {
    return closed('SLIPPAGE_REJECTED')
  }
  const now = deps.now ?? (() => new Date())
  const nowIso = now().toISOString()
  const nowSeconds = Math.floor(Date.parse(nowIso) / 1000)
  const deadline = input.deadline ?? nowSeconds + 120
  if (!Number.isSafeInteger(deadline) || deadline <= nowSeconds || deadline > nowSeconds + 120) return closed('QUOTE_EXPIRED')
  if (input.nonce !== undefined && (!/^\d{1,78}$/.test(input.nonce) || BigInt(input.nonce) > (BigInt(1) << BigInt(256)) - BigInt(1))) return closed('NONCE_REJECTED')
  const request: SmartSwapRequest = {
    requestId: `next-gen:${sell.symbol}:${buy.symbol}:${amountInRaw}`,
    network: evmNetwork(56),
    inputAsset: evmContract(56, sell.address, sell.symbol, sell.decimals),
    outputAsset: evmContract(56, buy.address, buy.symbol, buy.decimals),
    inputAmountRaw: amountInRaw,
    exactOut: false,
    slippageBps: input.slippageBps as number,
  }
  let competition: { shadowWinner: unknown }
  try {
    competition = await (deps.compete ?? defaultCompete)({ request, user: input.user as string, nowIso })
  } catch {
    return closed('COMPETITION_UNAVAILABLE')
  }
  const accepted = acceptSealedWinner(competition.shadowWinner, nowIso)
  if (!accepted.ok) return closed(accepted.code)
  const winner = accepted.winner
  const allowanceRaw = deps.allowanceRaw === undefined ? await readAllowance(input.user as string, sell.address) : deps.allowanceRaw
  if (allowanceRaw === null) return closed('ALLOWANCE_UNREAD', { feeBps: winner.smartSwapFeeBps, feeAmountRaw: winner.sealedFee?.feeAmountRaw ?? null })
  const token = winner.quote?.inputAsset.location.kind === 'contract' ? winner.quote.inputAsset.location.address : sell.address
  const requestKey = currentRequestKeyOf(request)
  const plan = buildV2UserExecutionPlan({
    user: input.user,
    walletChainId: 56,
    request,
    requestKey,
    shadow: { status: 'ready', requestKey, winner, v2Available: true },
    observedAllowance: {
      chainId: 56,
      token,
      owner: input.user as string,
      spender: CERTIFIED_BSC_EXECUTOR,
      amountRaw: allowanceRaw,
    },
    allowanceReadStatus: 'ok',
    nowIso,
    deadline,
    nonce: input.nonce,
  })
  const summary = {
    nonce: plan.nonce,
    deadline,
    allowanceRaw,
    feeBps: winner.smartSwapFeeBps,
    feeAmountRaw: winner.sealedFee?.feeAmountRaw ?? null,
    gasUnits: winner.quote?.estimatedGasUnits && /^\d+$/.test(winner.quote.estimatedGasUnits) ? winner.quote.estimatedGasUnits : null,
    venueLabel: winner.quote?.venueLabel ?? winner.venueId,
    amountInRaw: winner.originalInputAmountRaw,
    amountOutRaw: winner.quote?.netUserOutputRaw ?? winner.quote?.grossOutputRaw ?? null,
    slippageBps: request.slippageBps,
    destination: plan.preparation?.swapTransaction.to ?? plan.executorAddress,
  }
  if (!plan.ok || !plan.productionCutoverAllowed || plan.decision !== V2_CTA_DECISION.V2_PRODUCTION_READY || !plan.preparation) {
    return closed(plan.reason || 'PLAN_NOT_READY', summary)
  }
  const approval = plan.preparation.approvalTransactions[0]
  if (approval) {
    const approvalTx = publicCall(approval)
    if (!approvalTx || !approvalTx.data.toLowerCase().startsWith(`0x${APPROVE_SELECTOR}`)) {
      return closed('APPROVAL_UNAVAILABLE', summary)
    }
    return closed('ALLOWANCE_SHORT', { ...summary, approvalTx, destination: approvalTx.to })
  }
  const unsignedTx = publicCall(plan.preparation.swapTransaction)
  if (!unsignedTx || unsignedTx.to.toLowerCase() !== CERTIFIED_BSC_EXECUTOR.toLowerCase()) {
    return closed('SWAP_UNAVAILABLE', summary)
  }
  if (!summary.gasUnits) return closed('GAS_UNAVAILABLE', { ...summary, destination: unsignedTx.to })
  return {
    ok: true,
    chainId: 56,
    broadcast: false,
    signed: false,
    approved: false,
    executable: false,
    ...summary,
    destination: unsignedTx.to,
    approvalTx: null,
    unsignedTx,
  }
}

async function readAllowance(owner: string, token: string): Promise<string | null> {
  try {
    const rpc = assertReadonlyRpc(process.env.BETA_BSC_READONLY_RPC ?? DEFAULT_BSC_READONLY_RPC)
    const response = await fetch(rpc, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{ to: token, data: encodeAllowance(owner, CERTIFIED_BSC_EXECUTOR) }, 'latest'],
      }),
    })
    if (!response.ok) return null
    const payload = (await response.json()) as { result?: string }
    return decodeQuantity(typeof payload.result === 'string' ? payload.result : null)
  } catch {
    return null
  }
}
