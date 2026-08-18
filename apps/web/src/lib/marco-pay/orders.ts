import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'
import { get, head, list, put } from '@vercel/blob'
import {
  createFeaturedOrder,
  getFeaturedOrder,
  hydrateFeaturedOrder,
  persistFeaturedOrderDurably,
  updateFeaturedOrder,
} from 'lib/featured-placement/orderStore'
import { scheduleFeaturedWindow } from 'lib/featured-placement/eligibility'
import {
  activateVerifiedTrendBoostWindow,
  createTrendBoostOrder,
  hydrateTrendBoostOrder,
  persistTrendBoostOrderDurably,
  updateTrendBoostOrder,
} from 'lib/monetization/trendBoostOrders'
import {
  getFeaturedPackage,
  getVisibilityPackage,
  MONETIZATION_TREASURY,
  type VisibilityProductId,
} from 'lib/monetization/packages'
import type { CommercialServiceId } from 'views/shared/monetization/commercialCheckoutTypes'
import type { MarcoPayCompletedEvent, MarcoPayLifecycleEvent, MarcoPaySignedEvent } from './contract'
import { isCanonicalMarcoPaySettlementWallet, MARCO_PAY_SETTLEMENT_WALLET, usdCopiedToMarco } from './settlement'
import { MARCO_PAY_CHAIN_ID } from './walletTransfer'
import { readMarcoPaySettlementState, type MarcoPaySettlementState } from './gateway'

export type MarcoPayOrderState =
  | 'CREATED'
  | 'AWAITING_WALLET'
  | 'SUBMITTED'
  | 'ONCHAIN_PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'ACTIVATING'
  | 'ACTIVE'
  | 'TEST_VERIFIED'
  | 'FAILED'

export const MARCO_PAY_FULFILLED_STATE: MarcoPayOrderState = 'ACTIVE'

export type MarcoPayOrder = {
  schema: 'melega.marco-pay-order.v1'
  orderId: string
  state: MarcoPayOrderState
  applicationRef: string
  productRef: string | null
  projectId: string
  projectSlug: string | null
  projectContract: string | null
  buyerWallet: string
  serviceId: Exclude<CommercialServiceId, 'liquidity' | 'create-farm' | 'create-pool' | 'claim-project'>
  targetId: string | null
  packageId: string
  durationMs: number
  referenceCurrency: 'USD'
  referenceAmountMinor: string
  legacyOrderId: string
  paymentRef: string | null
  intentRef: string | null
  approvalUrl: string | null
  receiptRef: string | null
  marcoAmountMinor: string | null
  destinationWallet: string | null
  chainId: number | null
  txHash: string | null
  testMode: boolean | null
  createdAt: string
  updatedAt: string
  activatedAt: string | null
  lastError: string | null
}

const MEMORY = new Map<string, MarcoPayOrder>()
const LOCAL_CLAIMS = new Set<string>()
const BLOB_PREFIX = 'monetization/v1/marco-pay/'

function blobToken(): string | null {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || null
}

function orderKey(orderId: string): string {
  return `${BLOB_PREFIX}orders/${orderId}.json`
}

function claimKey(kind: 'event' | 'payment', reference: string): string {
  return `${BLOB_PREFIX}claims/${kind}/${encodeURIComponent(reference)}.json`
}

function dataDir(): string {
  return process.env.MARCO_PAY_ORDERS_DIR || path.join(process.cwd(), 'data', 'marco-pay-orders')
}

function orderPath(orderId: string): string {
  return path.join(dataDir(), `${orderId}.json`)
}

function persistLocal(order: MarcoPayOrder) {
  MEMORY.set(order.orderId, order)
  try {
    fs.mkdirSync(dataDir(), { recursive: true })
    fs.writeFileSync(orderPath(order.orderId), JSON.stringify(order, null, 2))
  } catch {
    /* memory-only outside production */
  }
}

function hydrate(order: MarcoPayOrder | null): MarcoPayOrder | null {
  if (!order || order.schema !== 'melega.marco-pay-order.v1') return null
  const next = {
    ...order,
    approvalUrl: order.approvalUrl ?? null,
    destinationWallet: order.destinationWallet ?? null,
    chainId: order.chainId ?? null,
    txHash: order.txHash ?? null,
  }
  MEMORY.set(next.orderId, next)
  return next
}

export function marcoPayStorageReady(): boolean {
  return Boolean(blobToken()) || process.env.NODE_ENV !== 'production'
}

export function getMarcoPayOrder(orderId: string): MarcoPayOrder | null {
  if (MEMORY.has(orderId)) return MEMORY.get(orderId)!
  try {
    return hydrate(JSON.parse(fs.readFileSync(orderPath(orderId), 'utf8')) as MarcoPayOrder)
  } catch {
    return null
  }
}

export async function hydrateMarcoPayOrder(orderId: string): Promise<MarcoPayOrder | null> {
  const local = getMarcoPayOrder(orderId)
  if (local) return local
  const token = blobToken()
  if (!token) return null
  try {
    const result = await get(orderKey(orderId), { access: 'private', token, useCache: false })
    if (!result || result.statusCode !== 200) return null
    return hydrate((await new Response(result.stream).json()) as MarcoPayOrder)
  } catch {
    return null
  }
}

export async function persistMarcoPayOrder(order: MarcoPayOrder): Promise<MarcoPayOrder> {
  persistLocal(order)
  const token = blobToken()
  if (!token) {
    if (process.env.NODE_ENV === 'production') throw new Error('DURABLE_COMMERCIAL_ORDER_STORAGE_UNAVAILABLE')
    return order
  }
  await put(orderKey(order.orderId), JSON.stringify(order), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    token,
  })
  return order
}

export async function listMarcoPayOrdersDurably(): Promise<MarcoPayOrder[]> {
  const token = blobToken()
  if (!token) return [...MEMORY.values()]
  try {
    const blobs: Array<{ pathname: string }> = []
    let cursor: string | undefined
    do {
      const page = await list({ prefix: `${BLOB_PREFIX}orders/`, limit: 1_000, cursor, token })
      blobs.push(...page.blobs)
      cursor = page.hasMore ? page.cursor : undefined
    } while (cursor)
    const orders = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const result = await get(blob.pathname, { access: 'private', token, useCache: false })
          if (!result || result.statusCode !== 200) return null
          return hydrate((await new Response(result.stream).json()) as MarcoPayOrder)
        } catch {
          return null
        }
      }),
    )
    return orders.filter((order): order is MarcoPayOrder => Boolean(order))
  } catch {
    return [...MEMORY.values()]
  }
}

export async function updateMarcoPayOrder(
  orderId: string,
  patch: Partial<MarcoPayOrder>,
): Promise<MarcoPayOrder | null> {
  const current = (await hydrateMarcoPayOrder(orderId)) ?? getMarcoPayOrder(orderId)
  if (!current) return null
  const next = { ...current, ...patch, orderId: current.orderId, updatedAt: new Date().toISOString() }
  return persistMarcoPayOrder(next)
}

export async function createMarcoPayOrder(input: {
  applicationRef: string
  projectId: string
  projectSlug?: string | null
  projectContract?: string | null
  buyerWallet: string
  serviceId: MarcoPayOrder['serviceId']
  packageId?: string | null
  targetId?: string | null
}): Promise<MarcoPayOrder> {
  const pkg =
    input.serviceId === 'featured'
      ? getFeaturedPackage(input.packageId)
      : getVisibilityPackage(input.serviceId as VisibilityProductId, input.packageId)
  const now = new Date().toISOString()
  const buyerWallet = input.buyerWallet.toLowerCase()
  const common = {
    projectId: input.projectId,
    projectSlug: input.projectSlug ?? null,
    projectContract: input.projectContract ?? null,
    buyerWallet,
    paymentAsset: 'MARCO' as const,
    packageId: String(pkg.id),
  }
  let legacyOrderId: string
  if (input.serviceId === 'featured') {
    const legacy = createFeaturedOrder({ ...common, sourceFlow: 'project-page' })
    await persistFeaturedOrderDurably(legacy)
    legacyOrderId = legacy.orderId
  } else {
    const legacy = createTrendBoostOrder({
      ...common,
      serviceId: input.serviceId as VisibilityProductId,
      targetId: input.targetId ?? null,
    })
    await persistTrendBoostOrderDurably(legacy)
    legacyOrderId = legacy.orderId
  }
  const order: MarcoPayOrder = {
    schema: 'melega.marco-pay-order.v1',
    orderId: `mp_${randomBytes(12).toString('hex')}`,
    state: 'CREATED',
    applicationRef: input.applicationRef,
    // Melega DEX is a canonical CHECKOUT_INTEGRATION. Its server-owned order
    // reference, amount and currency are the commercial authority; no MARCO
    // catalogue product or product mapping participates in this flow.
    productRef: null,
    projectId: input.projectId,
    projectSlug: input.projectSlug ?? null,
    projectContract: input.projectContract ?? null,
    buyerWallet,
    serviceId: input.serviceId,
    targetId: input.targetId?.trim() || null,
    packageId: String(pkg.id),
    durationMs: pkg.durationMs,
    referenceCurrency: 'USD',
    referenceAmountMinor: String(Math.round(pkg.usdPrice * 100)),
    legacyOrderId,
    paymentRef: null,
    intentRef: null,
    approvalUrl: null,
    receiptRef: null,
    marcoAmountMinor: null,
    destinationWallet: null,
    chainId: null,
    txHash: null,
    testMode: null,
    createdAt: now,
    updatedAt: now,
    activatedAt: null,
    lastError: null,
  }
  return persistMarcoPayOrder(order)
}

async function claimOnce(kind: 'event' | 'payment' | 'fulfilment', reference: string): Promise<boolean> {
  const localKey = `${kind}:${reference}`
  const token = blobToken()
  if (!token) {
    if (LOCAL_CLAIMS.has(localKey)) return false
    LOCAL_CLAIMS.add(localKey)
    return true
  }
  const pathname = claimKey(kind, reference)
  try {
    await put(pathname, JSON.stringify({ kind, reference, claimedAt: new Date().toISOString() }), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: 'application/json',
      token,
    })
    return true
  } catch (cause) {
    try {
      await head(pathname, { token })
      return false
    } catch {
      throw cause
    }
  }
}

function reconcileEvent(order: MarcoPayOrder, event: MarcoPayCompletedEvent) {
  if (event.merchant_order_ref !== order.orderId) throw new Error('ORDER_REFERENCE_MISMATCH')
  if (event.reference_currency !== order.referenceCurrency) throw new Error('ORDER_CURRENCY_MISMATCH')
  if (event.reference_amount_minor !== order.referenceAmountMinor) throw new Error('ORDER_AMOUNT_MISMATCH')
  if (order.productRef && event.product_ref !== order.productRef) throw new Error('ORDER_PRODUCT_MISMATCH')
  if (!event.test_mode && !event.receipt_ref) throw new Error('RECEIPT_REQUIRED')
  if (order.marcoAmountMinor && event.marco_amount_minor !== order.marcoAmountMinor) {
    throw new Error('MARCO_QUANTITY_MISMATCH')
  }
  if (
    !event.test_mode &&
    usdCopiedToMarco({ usdMinor: event.reference_amount_minor, marcoMinor: event.marco_amount_minor })
  ) {
    throw new Error('MARCO_CONVERSION_INVALID')
  }
}

function assertLiveFulfilmentPreconditions(order: MarcoPayOrder) {
  if (order.testMode || order.state === 'TEST_VERIFIED') throw new Error('TEST_AUTHORITY_CANNOT_ACTIVATE')
  if (order.referenceCurrency !== 'USD') throw new Error('ORDER_CURRENCY_MISMATCH')
  if (order.destinationWallet && !isCanonicalMarcoPaySettlementWallet(order.destinationWallet)) {
    throw new Error('SETTLEMENT_WALLET_NOT_TREASURY')
  }
  if (order.chainId != null && order.chainId !== MARCO_PAY_CHAIN_ID) throw new Error('CHAIN_MISMATCH')
  if (
    order.marcoAmountMinor &&
    usdCopiedToMarco({ usdMinor: order.referenceAmountMinor, marcoMinor: order.marcoAmountMinor })
  ) {
    throw new Error('MARCO_CONVERSION_INVALID')
  }
}

async function activatePlacement(order: MarcoPayOrder): Promise<void> {
  if (order.serviceId === 'featured') {
    const existing = (await hydrateFeaturedOrder(order.legacyOrderId)) ?? getFeaturedOrder(order.legacyOrderId)
    if (existing?.treasuryWallet && !isCanonicalMarcoPaySettlementWallet(existing.treasuryWallet)) {
      throw new Error('SETTLEMENT_WALLET_NOT_TREASURY')
    }
    const alreadyScheduled = Boolean(
      existing?.receiptVerified &&
        existing.paymentStatus === 'confirmed' &&
        existing.scheduledStart &&
        existing.scheduledEnd,
    )
    const window = alreadyScheduled
      ? { start: existing!.scheduledStart!, end: existing!.scheduledEnd! }
      : scheduleFeaturedWindow(new Date(), order.durationMs, 'ms')
    const legacy = alreadyScheduled
      ? existing
      : updateFeaturedOrder(order.legacyOrderId, {
          state: 'ELIGIBILITY_PENDING',
          paymentStatus: 'confirmed',
          receiptVerified: true,
          eligibilityStatus: 'pending',
          scheduledStart: window.start,
          scheduledEnd: window.end,
          rotationStatus: 'candidate',
          treasuryWallet: MARCO_PAY_SETTLEMENT_WALLET,
          lastError: null,
        })
    if (!legacy) throw new Error('FULFILMENT_ORDER_MISSING')
    await persistFeaturedOrderDurably(legacy)
    return
  }
  await hydrateTrendBoostOrder(order.legacyOrderId)
  const current = updateTrendBoostOrder(order.legacyOrderId, {
    state: 'PAYMENT_CONFIRMED',
    paymentStatus: 'confirmed',
    receiptVerified: true,
    treasuryWallet: MONETIZATION_TREASURY,
    lastError: null,
  })
  if (!current) throw new Error('FULFILMENT_ORDER_MISSING')
  if (!isCanonicalMarcoPaySettlementWallet(current.treasuryWallet)) {
    throw new Error('SETTLEMENT_WALLET_NOT_TREASURY')
  }
  if (current.chainId !== MARCO_PAY_CHAIN_ID) throw new Error('CHAIN_MISMATCH')
  const activated = activateVerifiedTrendBoostWindow(order.legacyOrderId)
  if (!activated) throw new Error('ACTIVATION_PRECONDITION_FAILED')
  await persistTrendBoostOrderDurably(activated)
}

export async function fulfilPaidBoostOrder(orderRef: string): Promise<MarcoPayOrder> {
  const order = (await hydrateMarcoPayOrder(orderRef)) ?? getMarcoPayOrder(orderRef)
  if (!order) throw new Error('ORDER_NOT_FOUND')
  if (order.state === 'ACTIVE') return order
  assertLiveFulfilmentPreconditions(order)
  if (!order.paymentRef || !order.receiptRef) throw new Error('RECEIPT_REQUIRED')
  await claimOnce('fulfilment', order.orderId)
  const latest = (await hydrateMarcoPayOrder(order.orderId)) ?? order
  if (latest.state === 'ACTIVE') return latest
  await updateMarcoPayOrder(latest.orderId, { state: 'ACTIVATING', lastError: null })
  await activatePlacement(latest)
  return (await updateMarcoPayOrder(latest.orderId, {
    state: 'ACTIVE',
    activatedAt: latest.activatedAt ?? new Date().toISOString(),
    lastError: null,
  }))!
}

function settlementIsPaid(state: MarcoPaySettlementState): boolean {
  if (state.testMode) return false
  if (state.completed === true) return true
  const status = (state.status || '').toUpperCase()
  return status === 'COMPLETED' || status === 'PAID' || status === 'SETTLED'
}

export async function reconcileMarcoPayOrder(orderRef: string): Promise<MarcoPayOrder | null> {
  const order = await hydrateMarcoPayOrder(orderRef)
  if (!order) return null
  if (order.state === 'ACTIVE' || order.state === 'FAILED' || order.state === 'TEST_VERIFIED') return order
  if (order.state === 'PAYMENT_CONFIRMED' || order.state === 'ACTIVATING') {
    return fulfilPaidBoostOrder(order.orderId)
  }
  if (!order.paymentRef) return order
  const state = await readMarcoPaySettlementState({
    applicationRef: order.applicationRef,
    paymentId: order.paymentRef,
  })
  if (!settlementIsPaid(state)) return order
  if (state.merchantOrderRef && state.merchantOrderRef !== order.orderId) throw new Error('ORDER_REFERENCE_MISMATCH')
  if (state.referenceAmountMinor && state.referenceAmountMinor !== order.referenceAmountMinor) {
    throw new Error('ORDER_AMOUNT_MISMATCH')
  }
  if (state.marcoAmountMinor && order.marcoAmountMinor && state.marcoAmountMinor !== order.marcoAmountMinor) {
    throw new Error('MARCO_QUANTITY_MISMATCH')
  }
  if (state.destinationWallet && !isCanonicalMarcoPaySettlementWallet(state.destinationWallet)) {
    throw new Error('SETTLEMENT_WALLET_NOT_TREASURY')
  }
  if (state.chainId != null && state.chainId !== MARCO_PAY_CHAIN_ID) throw new Error('CHAIN_MISMATCH')
  if (!state.receiptRef && !order.receiptRef) throw new Error('RECEIPT_REQUIRED')
  const confirmed = await updateMarcoPayOrder(order.orderId, {
    state: 'PAYMENT_CONFIRMED',
    receiptRef: state.receiptRef || order.receiptRef,
    marcoAmountMinor: state.marcoAmountMinor || order.marcoAmountMinor,
    destinationWallet: MARCO_PAY_SETTLEMENT_WALLET,
    chainId: MARCO_PAY_CHAIN_ID,
    txHash: state.txHash || order.txHash,
    testMode: false,
  })
  if (!confirmed) throw new Error('ORDER_NOT_FOUND')
  return fulfilPaidBoostOrder(confirmed.orderId)
}

export async function recoverPaidUnfulfilledMarcoPayOrders(): Promise<{
  scanned: number
  recovered: Array<{ orderId: string; paymentRef: string | null; txHash: string | null; serviceId: string }>
  skipped: Array<{ orderId: string; reason: string }>
}> {
  const orders = await listMarcoPayOrdersDurably()
  const recovered: Array<{ orderId: string; paymentRef: string | null; txHash: string | null; serviceId: string }> = []
  const skipped: Array<{ orderId: string; reason: string }> = []
  for (const order of orders) {
    if (order.state === 'ACTIVE' || order.state === 'FAILED' || order.state === 'TEST_VERIFIED' || order.testMode) {
      continue
    }
    if (!order.paymentRef && order.state === 'CREATED') continue
    try {
      const next = await reconcileMarcoPayOrder(order.orderId)
      if (next?.state === 'ACTIVE' && order.state !== 'ACTIVE') {
        recovered.push({
          orderId: next.orderId,
          paymentRef: next.paymentRef,
          txHash: next.txHash,
          serviceId: next.serviceId,
        })
      }
    } catch (cause) {
      skipped.push({ orderId: order.orderId, reason: cause instanceof Error ? cause.message : 'RECOVERY_FAILED' })
    }
  }
  return { scanned: orders.length, recovered, skipped }
}

export async function processMarcoPayCompletedEvent(event: MarcoPayCompletedEvent): Promise<{
  duplicate: boolean
  order: MarcoPayOrder | null
  testMode: boolean
}> {
  if (event.test_mode) {
    const eventClaimed = await claimOnce('event', event.event_id)
    if (!eventClaimed) {
      const duplicateOrder = event.merchant_order_ref ? await hydrateMarcoPayOrder(event.merchant_order_ref) : null
      return { duplicate: true, order: duplicateOrder, testMode: true }
    }
    if (!event.merchant_order_ref) return { duplicate: false, order: null, testMode: true }
    const order = await hydrateMarcoPayOrder(event.merchant_order_ref)
    if (!order) return { duplicate: false, order: null, testMode: true }
    reconcileEvent(order, event)
    const verified = await updateMarcoPayOrder(order.orderId, {
      state: 'TEST_VERIFIED',
      paymentRef: event.payment_ref,
      intentRef: event.intent_ref,
      receiptRef: event.receipt_ref,
      marcoAmountMinor: event.marco_amount_minor,
      testMode: true,
    })
    return { duplicate: false, order: verified, testMode: true }
  }
  if (!event.merchant_order_ref) throw new Error('ORDER_REFERENCE_REQUIRED')
  const order = await hydrateMarcoPayOrder(event.merchant_order_ref)
  if (!order) throw new Error('ORDER_NOT_FOUND')
  reconcileEvent(order, event)
  const eventClaimed = await claimOnce('event', event.event_id)
  if (!eventClaimed) {
    const duplicateOrder = (await hydrateMarcoPayOrder(order.orderId)) ?? order
    if (duplicateOrder.state === 'ACTIVE') return { duplicate: true, order: duplicateOrder, testMode: false }
    if (duplicateOrder.paymentRef && duplicateOrder.receiptRef && duplicateOrder.state !== 'FAILED') {
      return { duplicate: true, order: await fulfilPaidBoostOrder(duplicateOrder.orderId), testMode: false }
    }
    return { duplicate: true, order: duplicateOrder, testMode: false }
  }
  const paymentClaimed = await claimOnce('payment', event.payment_ref)
  if (!paymentClaimed) {
    const current = (await hydrateMarcoPayOrder(order.orderId)) ?? order
    if (current.state === 'ACTIVE') return { duplicate: true, order: current, testMode: false }
    return { duplicate: true, order: await fulfilPaidBoostOrder(current.orderId), testMode: false }
  }
  const confirmed = await updateMarcoPayOrder(order.orderId, {
    state: 'PAYMENT_CONFIRMED',
    paymentRef: event.payment_ref,
    intentRef: event.intent_ref,
    receiptRef: event.receipt_ref,
    marcoAmountMinor: event.marco_amount_minor,
    destinationWallet: order.destinationWallet || MARCO_PAY_SETTLEMENT_WALLET,
    chainId: order.chainId || MARCO_PAY_CHAIN_ID,
    testMode: false,
  })
  if (!confirmed) throw new Error('ORDER_NOT_FOUND')
  return { duplicate: false, order: await fulfilPaidBoostOrder(confirmed.orderId), testMode: false }
}

export type MarcoPayEventResult = {
  duplicate: boolean
  order: MarcoPayOrder | null
  testMode: boolean
  activated: boolean
  effect: 'activated' | 'test_verified' | 'failed' | 'acknowledged' | 'none'
}

async function processMarcoPayLifecycleEvent(event: MarcoPayLifecycleEvent): Promise<MarcoPayEventResult> {
  const eventClaimed = await claimOnce('event', event.event_id)
  const existing = event.merchant_order_ref ? await hydrateMarcoPayOrder(event.merchant_order_ref) : null
  if (!eventClaimed) {
    return {
      duplicate: true,
      order: existing,
      testMode: event.test_mode,
      activated: existing?.state === 'ACTIVE',
      effect: 'none',
    }
  }

  const terminalFailure =
    event.event_type === 'payment.failed' ||
    event.event_type === 'payment.expired' ||
    event.event_type === 'payment.refunded'

  if (terminalFailure && existing) {
    if (existing.state === 'ACTIVE' || existing.state === 'TEST_VERIFIED') {
      return {
        duplicate: false,
        order: existing,
        testMode: event.test_mode,
        activated: existing.state === 'ACTIVE',
        effect: 'acknowledged',
      }
    }
    const failed = await updateMarcoPayOrder(existing.orderId, {
      state: 'FAILED',
      paymentRef: event.payment_ref,
      intentRef: event.intent_ref,
      receiptRef: event.receipt_ref,
      marcoAmountMinor: event.marco_amount_minor,
      testMode: event.test_mode,
      lastError: event.event_type,
    })
    return {
      duplicate: false,
      order: failed,
      testMode: event.test_mode,
      activated: false,
      effect: 'failed',
    }
  }

  return {
    duplicate: false,
    order: existing,
    testMode: event.test_mode,
    activated: false,
    effect: 'acknowledged',
  }
}

export async function processMarcoPaySignedEvent(signed: MarcoPaySignedEvent): Promise<MarcoPayEventResult> {
  if (signed.kind === 'completed') {
    const result = await processMarcoPayCompletedEvent(signed.event)
    return {
      duplicate: result.duplicate,
      order: result.order,
      testMode: result.testMode,
      activated: result.order?.state === 'ACTIVE',
      effect: result.testMode ? 'test_verified' : result.order?.state === 'ACTIVE' ? 'activated' : 'none',
    }
  }
  return processMarcoPayLifecycleEvent(signed.event)
}

export function clearMarcoPayOrdersForTests() {
  MEMORY.clear()
  LOCAL_CLAIMS.clear()
  try {
    for (const name of fs.readdirSync(dataDir())) {
      if (name.endsWith('.json')) fs.unlinkSync(path.join(dataDir(), name))
    }
  } catch {
    /* empty */
  }
}
