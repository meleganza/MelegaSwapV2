/**
 * Isolated SHADOW preflight. Does not change legacy preview.
 * Never prepares unsigned V2 transactions or invents an executor address.
 * Multiple consumers share one in-flight competition per requestKey.
 */

import { useEffect, useMemo, useState } from 'react'
import { BSC_RPC_URLS } from 'config/constants/rpc'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { useDerivedSwapInfoWithStableSwap } from 'views/Swap/SmartSwap/hooks/useDerivedSwapInfoWithStableSwap'
import { evmContract, evmNative, type CanonicalAssetId } from 'lib/smartswap-universal-engine/assetIdentity'
import { evmNetwork, isEvmNetwork } from 'lib/smartswap-universal-engine/domain'
import { runAuthorizedEvmShadowCompetition } from 'lib/smartswap-universal-engine/authorizedShadowRun'
import {
  PRODUCTION_EXECUTION_MODE,
  SMARTSWAP_OPERATING_MODE,
  UNIVERSAL_ENGINE_MODE,
  isProductionCutoverAllowed,
} from 'lib/smartswap-universal-engine/operatingMode'
import type { SmartSwapRequest } from 'lib/smartswap-universal-engine/quote'
import type { ShadowCandidate } from 'lib/smartswap-universal-engine/shadowCompetition'
import {
  SMARTSWAP_AUTHORIZED_RUNTIME,
  bindAuthorizedHostSession,
} from 'lib/smartswap-universal-engine/widget'

export const SHADOW_RUNTIME_EXACT_OUT = 'EXACT_OUT' as const
export const SHADOW_RUNTIME_TIMEOUT = 'TIMEOUT' as const
export const SHADOW_RUNTIME_ERROR = 'ERROR' as const
export const SHADOW_RUNTIME_FOT_UNPROVEN = 'FOT_UNPROVEN' as const
export const SHADOW_PREFLIGHT_TIMEOUT_MS = 8_000

export type ShadowRuntimeStatus = 'idle' | 'loading' | 'ready' | 'unavailable'

export interface ShadowRuntimePreflight {
  status: ShadowRuntimeStatus
  reason: string | null
  requestKey: string | null
  generation: number
  winnerVenueId: string | null
  winner: ShadowCandidate | null
  v2Available: boolean
  productionExecutionCapable: false
  productionCutoverAllowed: false
  productionExecutionMode: typeof SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION
  universalEngineMode: typeof SMARTSWAP_OPERATING_MODE.SHADOW
}

export const IDLE_SHADOW_RUNTIME_PREFLIGHT: ShadowRuntimePreflight = {
  status: 'idle',
  reason: null,
  requestKey: null,
  generation: 0,
  winnerVenueId: null,
  winner: null,
  v2Available: false,
  productionExecutionCapable: false,
  productionCutoverAllowed: false,
  productionExecutionMode: SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION,
  universalEngineMode: SMARTSWAP_OPERATING_MODE.SHADOW,
}

type FormCurrency = {
  isNative?: boolean
  address?: string
  decimals: number
  symbol?: string
  chainId?: number
} | null | undefined

export function readOnlyRpcUrlByChain(): Partial<Record<number, string>> {
  return {
    56: BSC_RPC_URLS[2],
    1: 'https://rpc.ankr.com/eth',
  }
}

export function shadowRuntimeRequestKey(input: {
  chainId: number
  inputAsset: CanonicalAssetId
  outputAsset: CanonicalAssetId
  inputAmountRaw: string
  slippageBps: number
}): string {
  const inKey =
    input.inputAsset.location.kind === 'native'
      ? 'native'
      : input.inputAsset.location.kind === 'contract'
      ? input.inputAsset.location.address
      : 'unknown'
  const outKey =
    input.outputAsset.location.kind === 'native'
      ? 'native'
      : input.outputAsset.location.kind === 'contract'
      ? input.outputAsset.location.address
      : 'unknown'
  return `${input.chainId}:${inKey}:${outKey}:${input.inputAmountRaw}:${input.slippageBps}`
}

export function acceptShadowGeneration(started: number, current: number): boolean {
  return started === current
}

export function currencyToCanonicalAsset(currency: FormCurrency, chainId: number): CanonicalAssetId | null {
  if (!currency || !Number.isInteger(chainId) || chainId <= 0) return null
  if (currency.isNative) return evmNative(chainId, currency.symbol, currency.decimals)
  if (!currency.address) return null
  return evmContract(chainId, currency.address, currency.symbol, currency.decimals)
}

export function buildShadowRuntimeRequest(input: {
  chainId: number
  inputCurrency: FormCurrency
  outputCurrency: FormCurrency
  inputAmountRaw: string | null
  exactOut: boolean
  slippageBps: number
  requestId?: string
}): { request: SmartSwapRequest | null; unavailableReason: string | null; requestKey: string | null } {
  if (input.exactOut) {
    return { request: null, unavailableReason: SHADOW_RUNTIME_EXACT_OUT, requestKey: null }
  }
  const inputAsset = currencyToCanonicalAsset(input.inputCurrency, input.chainId)
  const outputAsset = currencyToCanonicalAsset(input.outputCurrency, input.chainId)
  if (!inputAsset || !outputAsset || !input.inputAmountRaw || !/^\d+$/.test(input.inputAmountRaw)) {
    return { request: null, unavailableReason: null, requestKey: null }
  }
  if (!isEvmNetwork(inputAsset.network) || inputAsset.network.chainId !== input.chainId) {
    return { request: null, unavailableReason: null, requestKey: null }
  }
  const request: SmartSwapRequest = {
    requestId: input.requestId ?? `shadow-preflight:${input.chainId}:${input.inputAmountRaw}`,
    network: evmNetwork(input.chainId),
    inputAsset,
    outputAsset,
    inputAmountRaw: input.inputAmountRaw,
    exactOut: false,
    slippageBps: input.slippageBps,
  }
  return {
    request,
    unavailableReason: null,
    requestKey: shadowRuntimeRequestKey({
      chainId: input.chainId,
      inputAsset,
      outputAsset,
      inputAmountRaw: input.inputAmountRaw,
      slippageBps: input.slippageBps,
    }),
  }
}

export function unavailableShadowRuntime(
  reason: string,
  generation: number,
  requestKey: string | null = null,
): ShadowRuntimePreflight {
  return {
    ...IDLE_SHADOW_RUNTIME_PREFLIGHT,
    status: 'unavailable',
    reason,
    generation,
    requestKey,
    v2Available: false,
  }
}

export function applyShadowRuntimeResult(input: {
  startedGeneration: number
  currentGeneration: number
  requestKey: string | null
  winner: ShadowCandidate | null
  error?: string | null
}): ShadowRuntimePreflight | null {
  if (!acceptShadowGeneration(input.startedGeneration, input.currentGeneration)) return null
  if (input.error) {
    const fot = /FOT_UNPROVEN|MELEGA_DEX_FOT_UNPROVEN/.test(input.error)
    return unavailableShadowRuntime(
      fot ? SHADOW_RUNTIME_FOT_UNPROVEN : /TIMEOUT/.test(input.error) ? SHADOW_RUNTIME_TIMEOUT : SHADOW_RUNTIME_ERROR,
      input.currentGeneration,
      input.requestKey,
    )
  }
  if (!input.winner || input.winner.status !== 'ok') {
    return unavailableShadowRuntime(SHADOW_RUNTIME_ERROR, input.currentGeneration, input.requestKey)
  }
  return {
    status: 'ready',
    reason: null,
    requestKey: input.requestKey,
    generation: input.currentGeneration,
    winnerVenueId: input.winner.venueId,
    winner: input.winner,
    v2Available: true,
    productionExecutionCapable: false,
    productionCutoverAllowed: false,
    productionExecutionMode: SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION,
    universalEngineMode: SMARTSWAP_OPERATING_MODE.SHADOW,
  }
}

export async function runShadowRuntimePreflightAttempt(input: {
  generation: number
  currentGeneration: () => number
  request: SmartSwapRequest | null
  requestKey: string | null
  unavailableReason: string | null
  timeoutMs?: number
  nowIso?: string
  rpcUrlByChain?: Partial<Record<number, string>>
  fetchImpl?: typeof fetch
  runAuthorized?: typeof runAuthorizedEvmShadowCompetition
}): Promise<ShadowRuntimePreflight | null> {
  if (PRODUCTION_EXECUTION_MODE !== SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION) {
    return unavailableShadowRuntime('PRODUCTION_MODE_DRIFT', input.generation, input.requestKey)
  }
  if (UNIVERSAL_ENGINE_MODE !== SMARTSWAP_OPERATING_MODE.SHADOW || isProductionCutoverAllowed()) {
    return unavailableShadowRuntime('ENGINE_MODE_DRIFT', input.generation, input.requestKey)
  }
  if (input.unavailableReason) {
    return unavailableShadowRuntime(input.unavailableReason, input.generation, input.requestKey)
  }
  if (!input.request) return { ...IDLE_SHADOW_RUNTIME_PREFLIGHT, generation: input.generation }
  const runAuthorized = input.runAuthorized ?? runAuthorizedEvmShadowCompetition
  const timeoutMs = input.timeoutMs ?? SHADOW_PREFLIGHT_TIMEOUT_MS
  const session = bindAuthorizedHostSession({
    walletConnected: false,
    walletAddress: null,
    network: input.request.network,
    requestedInput: input.request.inputAsset,
    requestedOutput: input.request.outputAsset,
    runtimeEnvironment: SMARTSWAP_AUTHORIZED_RUNTIME.MELEGA_DEX,
  })
  try {
    const result = await Promise.race([
      runAuthorized({
        session,
        request: input.request,
        productionQuote: null,
        melegaSnapshot: null,
        nowIso: input.nowIso,
        rpcUrlByChain: input.rpcUrlByChain ?? readOnlyRpcUrlByChain(),
        fetchImpl: input.fetchImpl,
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(SHADOW_RUNTIME_TIMEOUT)), timeoutMs)
      }),
    ])
    return applyShadowRuntimeResult({
      startedGeneration: input.generation,
      currentGeneration: input.currentGeneration(),
      requestKey: input.requestKey,
      winner: result.shadowWinner,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return applyShadowRuntimeResult({
      startedGeneration: input.generation,
      currentGeneration: input.currentGeneration(),
      requestKey: input.requestKey,
      winner: null,
      error: message,
    })
  }
}

export interface SmartSwapShadowRuntimeFacts {
  request: SmartSwapRequest | null
  requestKey: string | null
  shadow: ShadowRuntimePreflight
}

type SharedShadowBuilt = {
  request: SmartSwapRequest | null
  requestKey: string | null
  unavailableReason: string | null
}

type SharedShadowEntry = {
  key: string
  generation: number
  result: ShadowRuntimePreflight
  listeners: Set<(next: ShadowRuntimePreflight) => void>
  built: SharedShadowBuilt
  /** True while the entry's current generation competition is unresolved (dedupes same-request refreshes). */
  inflight: boolean
}

const sharedShadowEntries = new Map<string, SharedShadowEntry>()
let sharedShadowGeneration = 0

function sharedShadowKey(built: SharedShadowBuilt): string {
  if (built.unavailableReason) return `unavail:${built.unavailableReason}:${built.requestKey ?? ''}`
  if (!built.request || !built.requestKey) return 'idle'
  return `run:${built.requestKey}`
}

function publishSharedShadow(entry: SharedShadowEntry, next: ShadowRuntimePreflight): void {
  entry.result = next
  entry.listeners.forEach((listener) => listener(next))
}

function loadingSharedShadow(requestKey: string | null, generation: number): ShadowRuntimePreflight {
  return {
    ...IDLE_SHADOW_RUNTIME_PREFLIGHT,
    status: 'loading' as const,
    requestKey,
    generation,
  }
}

/** Runs the entry's CURRENT generation. Only that generation may publish; superseded/evicted results are discarded. */
function runSharedShadowGeneration(entry: SharedShadowEntry): void {
  const { generation, built } = entry
  entry.inflight = true
  void runShadowRuntimePreflightAttempt({
    generation,
    currentGeneration: () => entry.generation,
    request: built.request,
    requestKey: built.requestKey,
    unavailableReason: built.unavailableReason,
  })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error)
      return applyShadowRuntimeResult({
        startedGeneration: generation,
        currentGeneration: entry.generation,
        requestKey: built.requestKey,
        winner: null,
        error: message,
      })
    })
    .then((next) => {
      if (!acceptShadowGeneration(generation, entry.generation)) return
      entry.inflight = false
      if (!next) return
      publishSharedShadow(entry, next)
    })
}

function getOrStartSharedShadow(built: SharedShadowBuilt): SharedShadowEntry {
  const key = sharedShadowKey(built)
  const existing = sharedShadowEntries.get(key)
  if (existing) return existing

  sharedShadowGeneration += 1
  const generation = sharedShadowGeneration
  const initial = !built.request && !built.unavailableReason
    ? { ...IDLE_SHADOW_RUNTIME_PREFLIGHT, generation }
    : built.unavailableReason
      ? unavailableShadowRuntime(built.unavailableReason, generation, built.requestKey)
      : loadingSharedShadow(built.requestKey, generation)
  const entry: SharedShadowEntry = {
    key,
    generation,
    result: initial,
    listeners: new Set(),
    built,
    inflight: false,
  }
  sharedShadowEntries.set(key, entry)

  if (built.request || built.unavailableReason) runSharedShadowGeneration(entry)

  return entry
}

/**
 * Same-request refresh (plan freshness expiry or the user's "Refresh price"): re-runs the factual competition for the
 * EXISTING shared entry of `requestKey` under a new generation. requestKey identity is preserved, consumers see
 * `loading` while it runs, late results of the superseded generation are discarded, and an unresolved generation is
 * reused instead of starting a duplicate competition. Returns true only when a new competition started.
 */
export function refreshSharedShadowRuntime(requestKey: string | null): boolean {
  if (!requestKey) return false
  const entry = sharedShadowEntries.get(`run:${requestKey}`)
  if (!entry || !entry.built.request || entry.inflight || entry.listeners.size === 0) return false
  sharedShadowGeneration += 1
  entry.generation = sharedShadowGeneration
  publishSharedShadow(entry, loadingSharedShadow(requestKey, entry.generation))
  runSharedShadowGeneration(entry)
  return true
}

/** Evict an entry once no consumer is subscribed (bounded cache; an old amount never resurrects an old result). */
function releaseSharedShadow(entry: SharedShadowEntry): void {
  if (entry.listeners.size > 0) return
  // Deferred so an effect re-subscribing in the same commit keeps the entry.
  void Promise.resolve().then(() => {
    if (entry.listeners.size > 0 || sharedShadowEntries.get(entry.key) !== entry) return
    sharedShadowEntries.delete(entry.key)
    entry.generation = -1
    entry.inflight = false
  })
}

/** Test-only view of the shared cache size. */
export function sharedShadowRuntimeEntryCountForTests(): number {
  return sharedShadowEntries.size
}

export function resetSharedShadowRuntimeForTests(): void {
  sharedShadowEntries.clear()
  sharedShadowGeneration = 0
}

export function useCurrentSmartSwapShadowRequest(): {
  request: SmartSwapRequest | null
  requestKey: string | null
  unavailableReason: string | null
} {
  const {
    independentField,
    typedValue,
    recipient,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const [allowedSlippage] = useUserSlippageTolerance()
  const { chainId } = useActiveChainId()
  const { parsedAmount } = useDerivedSwapInfoWithStableSwap(
    independentField,
    typedValue,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    recipient,
  )

  const exactOut = independentField === Field.OUTPUT
  const resolvedChainId = Number(chainId || inputCurrency?.chainId || 0)
  const inputAmountRaw = !exactOut && parsedAmount?.quotient ? parsedAmount.quotient.toString() : null
  return useMemo(
    () =>
      buildShadowRuntimeRequest({
        chainId: resolvedChainId,
        inputCurrency,
        outputCurrency,
        inputAmountRaw,
        exactOut,
        slippageBps: allowedSlippage,
      }),
    [resolvedChainId, inputCurrency, outputCurrency, inputAmountRaw, exactOut, allowedSlippage],
  )
}

export function useSmartSwapShadowRuntimeFacts(): SmartSwapShadowRuntimeFacts {
  const built = useCurrentSmartSwapShadowRequest()
  const [state, setState] = useState<ShadowRuntimePreflight>(IDLE_SHADOW_RUNTIME_PREFLIGHT)

  useEffect(() => {
    const entry = getOrStartSharedShadow(built)
    setState(entry.result)
    entry.listeners.add(setState)
    return () => {
      entry.listeners.delete(setState)
      releaseSharedShadow(entry)
    }
  }, [built])

  // Until the effect subscribes to the current request's entry, never expose another request's (or idle) result.
  const shadow =
    state.requestKey !== built.requestKey && built.request && built.requestKey && !built.unavailableReason
      ? loadingSharedShadow(built.requestKey, 0)
      : state

  return {
    request: built.request,
    requestKey: built.requestKey,
    shadow,
  }
}

export function useShadowRuntimePreflight(): ShadowRuntimePreflight {
  return useSmartSwapShadowRuntimeFacts().shadow
}
