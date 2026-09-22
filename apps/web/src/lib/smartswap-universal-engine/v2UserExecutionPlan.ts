/**
 * Build the complete V2 user execution plan from current SmartSwap runtime facts.
 * Fail closed to LEGACY. Production CTA stays on legacy while cutover=false.
 * The test-only gate can consume a prepared plan; it is not activated in production.
 */

import { getAddress } from '@ethersproject/address'
import { isEvmNetwork } from './domain'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from './feeEnforcement'
import {
  PRODUCTION_EXECUTION_MODE,
  SMARTSWAP_OPERATING_MODE,
  UNIVERSAL_ENGINE_MODE,
  isProductionCutoverAllowed,
} from './operatingMode'
import { quoteIsStale, type SmartSwapRequest } from './quote'
import type { ShadowCandidate } from './shadowCompetition'
import {
  TEAM_OPERATOR_REF,
  V2_EXECUTION_RUNTIME_CONFIG,
  isV2ExecutorRuntimeEnabled,
  resolveV2ExecutorConfig,
  type V2ExecutorChainConfig,
  type V2ExecutorConfigTable,
} from './v2ExecutionRuntimeConfig'
import {
  V2_BINDING_NONCE_INVALID,
  assertNoV1SignerFields,
  buildV2ExecutionBinding,
  certifiedVenueForExecutorV2,
  prepareV2UserTransactions,
  type ObservedAllowanceIdentity,
  type UnsignedUserTransaction,
  type V2ExecutionBinding,
  type V2UserTransactionPreparation,
} from './v2ExecutionBinding'

export const V2_CTA_DECISION = {
  LEGACY: 'LEGACY',
  V2_CANARY_READY_BUT_DISABLED: 'V2_CANARY_READY_BUT_DISABLED',
} as const

export type V2CtaDecision = (typeof V2_CTA_DECISION)[keyof typeof V2_CTA_DECISION]

export const V2_PUBLIC_ACTION = {
  LEGACY: 'LEGACY',
  V2_EXECUTE: 'V2_EXECUTE',
} as const

export type V2PublicAction = (typeof V2_PUBLIC_ACTION)[keyof typeof V2_PUBLIC_ACTION]

/** Production remains false. Tests pass true only into consume/select helpers. */
export const V2_TEST_ONLY_CTA_EXECUTION_GATE = false as const

export const V2_USER_LOCAL_NONCE_SOURCE = 'USER_LOCAL_MONOTONIC' as const
export const V2_USER_LOCAL_NONCE_STORAGE_PREFIX = 'melega:v2-user-local-nonce' as const
const UINT256_MAX = (BigInt(1) << BigInt(256)) - BigInt(1)

export const V2_PLAN_REASON = {
  EXECUTOR_NOT_CONFIGURED: 'EXECUTOR_NOT_CONFIGURED',
  EXECUTOR_DISABLED: 'EXECUTOR_DISABLED',
  USER_INVALID: 'USER_INVALID',
  SHADOW_NOT_READY: 'SHADOW_NOT_READY',
  SHADOW_STALE: 'SHADOW_STALE',
  WINNER_NOT_OK: 'WINNER_NOT_OK',
  REQUEST_MISMATCH: 'REQUEST_MISMATCH',
  CHAIN_MISMATCH: 'CHAIN_MISMATCH',
  QUOTE_EXPIRED: 'QUOTE_EXPIRED',
  VENUE_NOT_CERTIFIED: 'VENUE_NOT_CERTIFIED',
  ALLOWANCE_UNREAD: 'ALLOWANCE_UNREAD',
  PREPARE_FAILED: 'PREPARE_FAILED',
  MODE_DRIFT: 'MODE_DRIFT',
} as const

export type V2PlanReason = (typeof V2_PLAN_REASON)[keyof typeof V2_PLAN_REASON]

export interface V2ShadowRuntimeFacts {
  status: string
  requestKey: string | null
  winner: ShadowCandidate | null
  v2Available: boolean
}

export interface BuildV2UserExecutionPlanInput {
  user: string | null | undefined
  walletChainId: number | null | undefined
  request: SmartSwapRequest | null
  requestKey: string | null
  shadow: V2ShadowRuntimeFacts | null
  observedAllowance?: ObservedAllowanceIdentity
  allowanceReadStatus: 'ok' | 'unread' | 'native'
  nowIso: string
  deadline: number
  nonce?: string | number
  staleAfterMs?: number
  executorConfigByChain?: V2ExecutorConfigTable
}

export interface V2UserExecutionPlan {
  ok: boolean
  decision: V2CtaDecision
  reason: string
  requestKey: string | null
  executorAddress: string | null
  winnerVenueId: string | null
  binding: V2ExecutionBinding | null
  preparation: V2UserTransactionPreparation | null
  nonce: string | null
  nonceSource: typeof V2_USER_LOCAL_NONCE_SOURCE
  approvalSpender: string | null
  teamIsSigner: false
  teamIsSpender: false
  treasuryIsSigner: false
  treasuryIsSpender: false
  productionExecutionCapable: false
  productionCutoverAllowed: false
  productionExecutionMode: typeof SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION
  universalEngineMode: typeof SMARTSWAP_OPERATING_MODE.SHADOW
}

export interface V2CtaDecisionResult {
  decision: V2CtaDecision
  publicAction: V2PublicAction
  reason: string
}

export interface V2CtaSelection {
  kind: V2PublicAction
  run: (() => Promise<string>) | null
}

const TEAM = getAddress(TEAM_OPERATOR_REF)
const TREASURY = getAddress(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)

function closedLegacy(reason: string, extra: Partial<V2UserExecutionPlan> = {}): V2UserExecutionPlan {
  return {
    ok: false,
    decision: V2_CTA_DECISION.LEGACY,
    reason,
    requestKey: extra.requestKey ?? null,
    executorAddress: extra.executorAddress ?? null,
    winnerVenueId: extra.winnerVenueId ?? null,
    binding: null,
    preparation: null,
    nonce: extra.nonce ?? null,
    nonceSource: V2_USER_LOCAL_NONCE_SOURCE,
    approvalSpender: null,
    teamIsSigner: false,
    teamIsSpender: false,
    treasuryIsSigner: false,
    treasuryIsSpender: false,
    productionExecutionCapable: false,
    productionCutoverAllowed: false,
    productionExecutionMode: SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION,
    universalEngineMode: SMARTSWAP_OPERATING_MODE.SHADOW,
  }
}

/** Format a known millisecond clock value. Collision-safe allocation uses allocateV2UserPlanNonce. */
export function nextV2UserLocalNonce(nowMs: number): string {
  return toUint256Decimal(requireSafeNowMs(nowMs))
}

export interface V2UserLocalNonceClock {
  next(nowMs: number, user?: string | null): string
  allocate(user: string, requestKey: string, nowMs: number): string
  peekPin(user: string, requestKey: string): string | null
}

function requireSafeNowMs(nowMs: number): bigint {
  if (!Number.isSafeInteger(nowMs) || nowMs <= 0) {
    throw new Error(V2_BINDING_NONCE_INVALID)
  }
  return BigInt(nowMs)
}

function toUint256Decimal(value: bigint): string {
  if (value < BigInt(0) || value > UINT256_MAX) {
    throw new Error(V2_BINDING_NONCE_INVALID)
  }
  return value.toString(10)
}

function nonceStorageKey(user: string): string {
  return `${V2_USER_LOCAL_NONCE_STORAGE_PREFIX}:${user.toLowerCase()}`
}

function pinKey(user: string, requestKey: string): string {
  return `${user.toLowerCase()}:${requestKey}`
}

function readBrowserLastIssued(user: string): bigint | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(nonceStorageKey(user))
    if (!raw || !/^\d+$/.test(raw)) return null
    return BigInt(raw)
  } catch {
    return null
  }
}

function writeBrowserLastIssued(user: string, value: string): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(nonceStorageKey(user), value)
  } catch {
    // Private mode / unavailable storage: in-memory last-issued still advances.
  }
}

function readBrowserPin(user: string, requestKey: string): string | null {
  try {
    if (typeof sessionStorage === 'undefined') return null
    const raw = sessionStorage.getItem(`${V2_USER_LOCAL_NONCE_STORAGE_PREFIX}:pin:${pinKey(user, requestKey)}`)
    return raw && /^\d+$/.test(raw) ? raw : null
  } catch {
    return null
  }
}

function writeBrowserPin(user: string, requestKey: string, nonce: string): void {
  try {
    if (typeof sessionStorage === 'undefined') return
    sessionStorage.setItem(`${V2_USER_LOCAL_NONCE_STORAGE_PREFIX}:pin:${pinKey(user, requestKey)}`, nonce)
  } catch {
    // Pin remains in the in-memory map for this tab.
  }
}

/** Browser-local monotonic clock. Pins stay tab-local so two tabs cannot silently reuse a nonce. */
export function createV2UserLocalNonceClock(options?: {
  lastIssuedByUser?: Map<string, bigint>
  pins?: Map<string, string>
  persistBrowser?: boolean
}): V2UserLocalNonceClock {
  const lastIssuedByUser = options?.lastIssuedByUser ?? new Map<string, bigint>()
  const pins = options?.pins ?? new Map<string, string>()
  const persistBrowser = options?.persistBrowser !== false

  const next = (nowMs: number, user?: string | null): string => {
    const fromClock = requireSafeNowMs(nowMs)
    const owner = user && user.trim() ? user.toLowerCase() : '*'
    const stored = lastIssuedByUser.get(owner) ?? (persistBrowser && user ? readBrowserLastIssued(user) : null)
    const candidate = stored != null && stored >= fromClock ? stored + BigInt(1) : fromClock
    const decimal = toUint256Decimal(candidate)
    lastIssuedByUser.set(owner, candidate)
    if (persistBrowser && user) writeBrowserLastIssued(user, decimal)
    return decimal
  }

  return {
    next,
    allocate(user: string, requestKey: string, nowMs: number): string {
      if (!user || !requestKey) throw new Error(V2_BINDING_NONCE_INVALID)
      const key = pinKey(user, requestKey)
      const pinned = pins.get(key) ?? (persistBrowser ? readBrowserPin(user, requestKey) : null)
      if (pinned) {
        pins.set(key, pinned)
        return pinned
      }
      const nonce = next(nowMs, user)
      pins.set(key, nonce)
      if (persistBrowser) writeBrowserPin(user, requestKey, nonce)
      return nonce
    },
    peekPin(user: string, requestKey: string): string | null {
      return pins.get(pinKey(user, requestKey)) ?? (persistBrowser ? readBrowserPin(user, requestKey) : null)
    },
  }
}

const defaultNonceClockHolder: { current: V2UserLocalNonceClock } = {
  current: createV2UserLocalNonceClock(),
}

export function allocateV2UserPlanNonce(user: string, requestKey: string, nowMs: number): string {
  return defaultNonceClockHolder.current.allocate(user, requestKey, nowMs)
}

export function resetV2UserLocalNonceStateForTests(): void {
  defaultNonceClockHolder.current = createV2UserLocalNonceClock({ persistBrowser: false })
  try {
    const clear = (storage: Storage) => {
      const keys: string[] = []
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i)
        if (key && key.startsWith(V2_USER_LOCAL_NONCE_STORAGE_PREFIX)) keys.push(key)
      }
      keys.forEach((key) => storage.removeItem(key))
    }
    if (typeof localStorage !== 'undefined') clear(localStorage)
    if (typeof sessionStorage !== 'undefined') clear(sessionStorage)
  } catch {
    // Test environments without Web Storage stay on the in-memory clock.
  }
}

export function shouldReadV2ExecutorAllowance(input: {
  config: V2ExecutorChainConfig
  request: SmartSwapRequest | null
  requestKey: string | null
  shadow: V2ShadowRuntimeFacts | null
  user: string | null | undefined
  walletChainId: number
}): boolean {
  if (!isV2ExecutorRuntimeEnabled(input.config)) return false
  if (!checksumUser(input.user)) return false
  const request = input.request
  if (!request || !isEvmNetwork(request.network)) return false
  if (request.inputAsset.location.kind === 'native') return false
  if (!input.requestKey || input.requestKey !== currentRequestKeyOf(request)) return false
  if (request.network.chainId !== input.walletChainId) return false
  const shadow = input.shadow
  if (!shadow || shadow.status !== 'ready' || shadow.v2Available !== true || !shadow.winner) return false
  if (shadow.requestKey !== input.requestKey) return false
  if (shadow.winner.status !== 'ok') return false
  return true
}

export interface V2UserWalletTransport {
  sendTransaction?: (...args: any[]) => Promise<{ hash: string }>
  provider?: {
    waitForTransaction?: (...args: any[]) => Promise<{ status?: number } | null | undefined>
  }
  waitForTransaction?: (...args: any[]) => Promise<{ status?: number } | null | undefined>
}

export function createV2UserWalletTransactionAdapter(wallet: V2UserWalletTransport): {
  submitUserTransaction: (tx: UnsignedUserTransaction) => Promise<{ hash: string }>
  waitForReceipt: (hash: string) => Promise<{ status: number }>
} {
  return {
    async submitUserTransaction(tx: UnsignedUserTransaction) {
      const submit = wallet.sendTransaction
      if (typeof submit !== 'function') {
        throw new Error('V2_WALLET_NOT_CONNECTED')
      }
      const sent = await submit({
        from: tx.from,
        to: tx.to,
        data: tx.data,
        value: tx.value,
        chainId: tx.chainId,
      })
      if (!sent?.hash) throw new Error('V2_WALLET_SUBMIT_FAILED')
      return { hash: sent.hash }
    },
    async waitForReceipt(hash: string) {
      const wait = wallet.waitForTransaction ?? wallet.provider?.waitForTransaction
      if (typeof wait !== 'function') {
        throw new Error('V2_WALLET_WAIT_UNAVAILABLE')
      }
      const receipt = await wait(hash)
      return { status: receipt?.status ?? 0 }
    },
  }
}

export function currentRequestKeyOf(request: SmartSwapRequest | null): string | null {
  if (!request || !isEvmNetwork(request.network)) return null
  const inKey =
    request.inputAsset.location.kind === 'native'
      ? 'native'
      : request.inputAsset.location.kind === 'contract'
        ? request.inputAsset.location.address
        : 'unknown'
  const outKey =
    request.outputAsset.location.kind === 'native'
      ? 'native'
      : request.outputAsset.location.kind === 'contract'
        ? request.outputAsset.location.address
        : 'unknown'
  return `${request.network.chainId}:${inKey}:${outKey}:${request.inputAmountRaw}:${request.slippageBps}`
}

function quoteExpired(winner: ShadowCandidate, nowIso: string, staleAfterMs: number): boolean {
  const quote = winner.quote
  if (!quote) return true
  if (quote.stale === true) return true
  if (quoteIsStale(quote, nowIso, staleAfterMs)) return true
  if (quote.expiresAt) {
    const expires = Date.parse(quote.expiresAt)
    const now = Date.parse(nowIso)
    if (!Number.isFinite(expires) || !Number.isFinite(now) || now > expires) return true
  }
  return false
}

function checksumUser(user: string | null | undefined): string | null {
  if (!user) return null
  try {
    const address = getAddress(user)
    if (address === TEAM || address === TREASURY || address === '0x0000000000000000000000000000000000000000') {
      return null
    }
    return address
  } catch {
    return null
  }
}

export function buildV2UserExecutionPlan(input: BuildV2UserExecutionPlanInput): V2UserExecutionPlan {
  if (
    PRODUCTION_EXECUTION_MODE !== SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION ||
    UNIVERSAL_ENGINE_MODE !== SMARTSWAP_OPERATING_MODE.SHADOW ||
    isProductionCutoverAllowed() !== false
  ) {
    return closedLegacy(V2_PLAN_REASON.MODE_DRIFT, { requestKey: input.requestKey })
  }

  if (!Number.isInteger(input.walletChainId) || (input.walletChainId as number) <= 0) {
    return closedLegacy(V2_PLAN_REASON.CHAIN_MISMATCH, { requestKey: input.requestKey })
  }
  const walletChainId = input.walletChainId as number
  const config: V2ExecutorChainConfig = resolveV2ExecutorConfig(
    walletChainId,
    input.executorConfigByChain ?? V2_EXECUTION_RUNTIME_CONFIG,
  )
  if (config.status !== 'CONFIGURED' || !config.executorAddress) {
    return closedLegacy(V2_PLAN_REASON.EXECUTOR_NOT_CONFIGURED, { requestKey: input.requestKey })
  }
  if (!isV2ExecutorRuntimeEnabled(config)) {
    return closedLegacy(V2_PLAN_REASON.EXECUTOR_DISABLED, {
      requestKey: input.requestKey,
      executorAddress: config.executorAddress,
    })
  }

  const user = checksumUser(input.user)
  if (!user) return closedLegacy(V2_PLAN_REASON.USER_INVALID, { requestKey: input.requestKey })

  const request = input.request
  if (!request || !isEvmNetwork(request.network)) {
    return closedLegacy(V2_PLAN_REASON.REQUEST_MISMATCH, { requestKey: input.requestKey })
  }
  const requestChainId = request.network.chainId
  const expectedKey = input.requestKey ?? currentRequestKeyOf(request)
  if (!expectedKey || expectedKey !== currentRequestKeyOf(request)) {
    return closedLegacy(V2_PLAN_REASON.REQUEST_MISMATCH, { requestKey: input.requestKey })
  }

  if (walletChainId !== requestChainId) {
    return closedLegacy(V2_PLAN_REASON.CHAIN_MISMATCH, {
      requestKey: expectedKey,
      executorAddress: config.executorAddress,
    })
  }

  const shadow = input.shadow
  if (!shadow || shadow.status !== 'ready' || shadow.v2Available !== true || !shadow.winner) {
    return closedLegacy(V2_PLAN_REASON.SHADOW_NOT_READY, {
      requestKey: expectedKey,
      executorAddress: config.executorAddress,
    })
  }
  if (shadow.requestKey !== expectedKey) {
    return closedLegacy(V2_PLAN_REASON.REQUEST_MISMATCH, {
      requestKey: expectedKey,
      executorAddress: config.executorAddress,
      winnerVenueId: shadow.winner.venueId,
    })
  }
  if (shadow.winner.status === 'stale') {
    return closedLegacy(V2_PLAN_REASON.SHADOW_STALE, {
      requestKey: expectedKey,
      executorAddress: config.executorAddress,
      winnerVenueId: shadow.winner.venueId,
    })
  }
  if (shadow.winner.status !== 'ok') {
    return closedLegacy(V2_PLAN_REASON.WINNER_NOT_OK, {
      requestKey: expectedKey,
      executorAddress: config.executorAddress,
      winnerVenueId: shadow.winner.venueId,
    })
  }

  const staleAfterMs = input.staleAfterMs ?? 15_000
  if (quoteExpired(shadow.winner, input.nowIso, staleAfterMs)) {
    return closedLegacy(V2_PLAN_REASON.QUOTE_EXPIRED, {
      requestKey: expectedKey,
      executorAddress: config.executorAddress,
      winnerVenueId: shadow.winner.venueId,
    })
  }

  const venue = certifiedVenueForExecutorV2(shadow.winner.venueId)
  if (!venue || !venue.routers[requestChainId]) {
    return closedLegacy(V2_PLAN_REASON.VENUE_NOT_CERTIFIED, {
      requestKey: expectedKey,
      executorAddress: config.executorAddress,
      winnerVenueId: shadow.winner.venueId,
    })
  }

  const nativeIn = request.inputAsset.location.kind === 'native'
  if (!nativeIn && input.allowanceReadStatus !== 'ok') {
    return closedLegacy(V2_PLAN_REASON.ALLOWANCE_UNREAD, {
      requestKey: expectedKey,
      executorAddress: config.executorAddress,
      winnerVenueId: shadow.winner.venueId,
    })
  }

  let nonce: string
  try {
    const nowMs = Date.parse(input.nowIso)
    nonce =
      input.nonce === undefined
        ? allocateV2UserPlanNonce(user, expectedKey, nowMs)
        : String(input.nonce).trim()
    if (!/^\d+$/.test(nonce) || BigInt(nonce) > UINT256_MAX) {
      throw new Error(V2_BINDING_NONCE_INVALID)
    }
  } catch {
    return closedLegacy(V2_PLAN_REASON.PREPARE_FAILED, {
      requestKey: expectedKey,
      executorAddress: config.executorAddress,
      winnerVenueId: shadow.winner.venueId,
    })
  }

  try {
    const binding = buildV2ExecutionBinding({
      request,
      winner: shadow.winner,
      user,
      deadline: input.deadline,
      nonce,
      nowIso: input.nowIso,
      staleAfterMs,
    })
    assertNoV1SignerFields(binding.intent)
    const preparation = prepareV2UserTransactions({
      request,
      winner: shadow.winner,
      user,
      deadline: input.deadline,
      nonce,
      nowIso: input.nowIso,
      staleAfterMs,
      currentChainId: input.walletChainId as number,
      executorAddress: config.executorAddress,
      observedAllowance: nativeIn ? undefined : input.observedAllowance,
    })
    if (preparation.swapTransaction.from !== user || preparation.swapTransaction.to !== config.executorAddress) {
      return closedLegacy(V2_PLAN_REASON.PREPARE_FAILED, {
        requestKey: expectedKey,
        executorAddress: config.executorAddress,
        winnerVenueId: shadow.winner.venueId,
        nonce,
      })
    }
    if (preparation.swapTransaction.from === TEAM || preparation.swapTransaction.to === TEAM) {
      return closedLegacy(V2_PLAN_REASON.PREPARE_FAILED, { requestKey: expectedKey, nonce })
    }
    if (preparation.swapTransaction.from === TREASURY || preparation.swapTransaction.to === TREASURY) {
      return closedLegacy(V2_PLAN_REASON.PREPARE_FAILED, { requestKey: expectedKey, nonce })
    }
    return {
      ok: true,
      decision: V2_CTA_DECISION.V2_CANARY_READY_BUT_DISABLED,
      reason: V2_CTA_DECISION.V2_CANARY_READY_BUT_DISABLED,
      requestKey: expectedKey,
      executorAddress: config.executorAddress,
      winnerVenueId: shadow.winner.venueId,
      binding,
      preparation,
      nonce,
      nonceSource: V2_USER_LOCAL_NONCE_SOURCE,
      approvalSpender: nativeIn ? null : config.executorAddress,
      teamIsSigner: false,
      teamIsSpender: false,
      treasuryIsSigner: false,
      treasuryIsSpender: false,
      productionExecutionCapable: false,
      productionCutoverAllowed: false,
      productionExecutionMode: SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION,
      universalEngineMode: SMARTSWAP_OPERATING_MODE.SHADOW,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return closedLegacy(`${V2_PLAN_REASON.PREPARE_FAILED}:${message}`, {
      requestKey: expectedKey,
      executorAddress: config.executorAddress,
      winnerVenueId: shadow.winner.venueId,
      nonce,
    })
  }
}

export function resolveSmartSwapCtaDecision(input: {
  planOk: boolean
  cutoverAllowed: boolean
  testOnlyExecutionGate: boolean
  planReason?: string
}): V2CtaDecisionResult {
  if (input.cutoverAllowed) {
    return {
      decision: V2_CTA_DECISION.LEGACY,
      publicAction: V2_PUBLIC_ACTION.LEGACY,
      reason: 'CUTOVER_FORBIDDEN',
    }
  }
  if (!input.planOk) {
    return {
      decision: V2_CTA_DECISION.LEGACY,
      publicAction: V2_PUBLIC_ACTION.LEGACY,
      reason: input.planReason ?? V2_CTA_DECISION.LEGACY,
    }
  }
  return {
    decision: V2_CTA_DECISION.V2_CANARY_READY_BUT_DISABLED,
    publicAction: input.testOnlyExecutionGate ? V2_PUBLIC_ACTION.V2_EXECUTE : V2_PUBLIC_ACTION.LEGACY,
    reason: input.testOnlyExecutionGate
      ? 'V2_TEST_ONLY_GATE'
      : V2_CTA_DECISION.V2_CANARY_READY_BUT_DISABLED,
  }
}

const consumeLocks = new Map<string, Promise<string>>()

function consumeLockKey(plan: V2UserExecutionPlan): string {
  return `${plan.nonce ?? ''}:${plan.requestKey ?? ''}:${plan.preparation?.swapTransaction.from ?? ''}`
}

export function resetV2CtaConsumeLocksForTests(): void {
  consumeLocks.clear()
}

export async function consumePreparedV2UserPlan(input: {
  plan: V2UserExecutionPlan
  testOnlyExecutionGate: boolean
  cutoverAllowed: boolean
  submitUserTransaction: (tx: UnsignedUserTransaction) => Promise<{ hash: string }>
  waitForReceipt: (hash: string) => Promise<{ status: number }>
}): Promise<string> {
  if (input.cutoverAllowed) {
    throw new Error('V2_CTA_CUTOVER_FORBIDDEN')
  }
  if (!input.testOnlyExecutionGate) {
    throw new Error('V2_CTA_GATE_DISABLED')
  }
  if (!input.plan.ok || !input.plan.preparation) {
    throw new Error('V2_CTA_PLAN_NOT_READY')
  }

  const lockKey = consumeLockKey(input.plan)
  const existing = consumeLocks.get(lockKey)
  if (existing) return existing

  const run = consumePreparedV2UserPlanUnlocked(input).finally(() => {
    consumeLocks.delete(lockKey)
  })
  consumeLocks.set(lockKey, run)
  return run
}

async function consumePreparedV2UserPlanUnlocked(input: {
  plan: V2UserExecutionPlan
  submitUserTransaction: (tx: UnsignedUserTransaction) => Promise<{ hash: string }>
  waitForReceipt: (hash: string) => Promise<{ status: number }>
}): Promise<string> {
  let submittedV2 = false
  const approvals = input.plan.preparation!.approvalTransactions
  for (const approval of approvals) {
    try {
      submittedV2 = true
      const sent = await input.submitUserTransaction(approval)
      const receipt = await input.waitForReceipt(sent.hash)
      if (receipt.status !== 1) {
        throw new Error('V2_APPROVAL_FAILED')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(message.startsWith('V2_') ? message : `V2_APPROVAL_REJECTED:${message}`)
    }
  }

  try {
    submittedV2 = true
    const sent = await input.submitUserTransaction(input.plan.preparation!.swapTransaction)
    const receipt = await input.waitForReceipt(sent.hash)
    if (receipt.status !== 1) {
      throw new Error('V2_EXECUTE_FAILED')
    }
    return sent.hash
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      submittedV2
        ? message.startsWith('V2_')
          ? message
          : `V2_EXECUTE_FAILED:${message}`
        : message,
    )
  }
}

export function selectSmartSwapCtaExecution(input: {
  decision: V2CtaDecisionResult
  plan: V2UserExecutionPlan
  legacyCallback: (() => Promise<string>) | null
  consumeV2: () => Promise<string>
}): V2CtaSelection {
  if (input.decision.publicAction !== V2_PUBLIC_ACTION.V2_EXECUTE || !input.plan.ok) {
    return { kind: V2_PUBLIC_ACTION.LEGACY, run: input.legacyCallback }
  }
  return { kind: V2_PUBLIC_ACTION.V2_EXECUTE, run: input.consumeV2 }
}
