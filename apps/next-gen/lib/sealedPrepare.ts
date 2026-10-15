/**
 * Server adapter. The sealed candidate comes only from runAuthorizedEvmShadowCompetition.
 * This file does not compute fee bps.
 */
import { evmContract } from '@melega/smartswap-v2-prepare/src/assetIdentity'
import { evmNetwork } from '@melega/smartswap-v2-prepare/src/domain'
import {
  assertSealedShadowCandidate,
  prepareV2UserTransactions,
  RAW_QUOTE_NOT_SEALED_CANDIDATE,
} from '@melega/smartswap-v2-prepare'
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

const CERTIFIED_BSC_EXECUTOR = '0x7c07082839edd5797737640bba6af47992b9861e'

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
  allowanceRaw: string | null
  unsignedTx: { to: string; data: string; value: string; chainId: number } | null
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
    unsignedTx: null,
    ...extra,
  }
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
  input: { chainId?: number; sell?: string; buy?: string; amount?: string; user?: string; slippageBps?: number },
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
  if (BigInt(allowanceRaw) < BigInt(winner.originalInputAmountRaw ?? amountInRaw)) {
    return closed('ALLOWANCE_SHORT', {
      allowanceRaw,
      feeBps: winner.smartSwapFeeBps,
      feeAmountRaw: winner.sealedFee?.feeAmountRaw ?? null,
    })
  }
  const token = winner.quote?.inputAsset.location.kind === 'contract' ? winner.quote.inputAsset.location.address : sell.address
  const prepared = prepareV2UserTransactions({
    request,
    winner,
    user: input.user as string,
    deadline: Math.floor(now().getTime() / 1000) + 120,
    nonce: '0',
    nowIso,
    currentChainId: 56,
    executorAddress: CERTIFIED_BSC_EXECUTOR,
    observedAllowance: {
      chainId: 56,
      token,
      owner: input.user as string,
      spender: CERTIFIED_BSC_EXECUTOR,
      amountRaw: allowanceRaw,
    },
  })
  if (prepared.approvalTransactions.length > 0) return closed('APPROVAL_NOT_SENT', { allowanceRaw })
  const gasUnits = winner.quote?.estimatedGasUnits && /^\d+$/.test(winner.quote.estimatedGasUnits) ? winner.quote.estimatedGasUnits : null
  return {
    ok: true,
    chainId: 56,
    broadcast: false,
    signed: false,
    approved: false,
    executable: false,
    feeBps: winner.smartSwapFeeBps,
    feeAmountRaw: winner.sealedFee?.feeAmountRaw ?? null,
    gasUnits,
    allowanceRaw,
    unsignedTx: {
      to: prepared.swapTransaction.to,
      data: prepared.swapTransaction.data,
      value: prepared.swapTransaction.value,
      chainId: prepared.swapTransaction.chainId,
    },
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
