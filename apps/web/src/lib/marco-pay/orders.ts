import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'
import { get, head, put } from '@vercel/blob'
import {
  createFeaturedOrder,
  getFeaturedOrder,
  persistFeaturedOrderDurably,
  updateFeaturedOrder,
} from 'lib/featured-placement/orderStore'
import { scheduleFeaturedWindow } from 'lib/featured-placement/eligibility'
import {
  activateVerifiedTrendBoostWindow,
  createTrendBoostOrder,
  persistTrendBoostOrderDurably,
  updateTrendBoostOrder,
} from 'lib/monetization/trendBoostOrders'
import {
  getFeaturedPackage,
  getVisibilityPackage,
  type VisibilityProductId,
} from 'lib/monetization/packages'
import type { CommercialServiceId } from 'views/shared/monetization/commercialCheckoutTypes'
import type { MarcoPayCompletedEvent } from './contract'

export type MarcoPayOrderState =
  | 'CREATED'
  | 'PAYMENT_CONFIRMED'
  | 'ACTIVATING'
  | 'ACTIVE'
  | 'TEST_VERIFIED'
  | 'FAILED'

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
  receiptRef: string | null
  marcoAmountMinor: string | null
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
  MEMORY.set(order.orderId, order)
  return order
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

export async function updateMarcoPayOrder(
  orderId: string,
  patch: Partial<MarcoPayOrder>,
): Promise<MarcoPayOrder | null> {
  const current = (await hydrateMarcoPayOrder(orderId)) ?? getMarcoPayOrder(orderId)
  if (!current) return null
  const next = { ...current, ...patch, orderId: current.orderId, updatedAt: new Date().toISOString() }
  return persistMarcoPayOrder(next)
}

export function marcoPayProductRef(packageId: string): string | null {
  const raw = process.env.MARCO_PAY_PRODUCT_REFS_JSON?.trim()
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const value = parsed[packageId]
    return typeof value === 'string' && value.trim() ? value.trim() : null
  } catch {
    return null
  }
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
  const productRef = marcoPayProductRef(String(pkg.id))
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
    productRef,
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
    receiptRef: null,
    marcoAmountMinor: null,
    testMode: null,
    createdAt: now,
    updatedAt: now,
    activatedAt: null,
    lastError: null,
  }
  return persistMarcoPayOrder(order)
}

async function claimOnce(kind: 'event' | 'payment', reference: string): Promise<boolean> {
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
}

async function activateOrder(order: MarcoPayOrder): Promise<MarcoPayOrder> {
  if (order.state === 'ACTIVE') return order
  await updateMarcoPayOrder(order.orderId, { state: 'ACTIVATING' })
  if (order.serviceId === 'featured') {
    const existing = getFeaturedOrder(order.legacyOrderId)
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
          lastError: null,
        })
    if (!legacy) throw new Error('FULFILMENT_ORDER_MISSING')
    await persistFeaturedOrderDurably(legacy)
  } else {
    const confirmed = updateTrendBoostOrder(order.legacyOrderId, {
      state: 'PAYMENT_CONFIRMED',
      paymentStatus: 'confirmed',
      receiptVerified: true,
      lastError: null,
    })
    if (!confirmed) throw new Error('FULFILMENT_ORDER_MISSING')
    const activated = activateVerifiedTrendBoostWindow(order.legacyOrderId)
    if (!activated) throw new Error('ACTIVATION_PRECONDITION_FAILED')
    await persistTrendBoostOrderDurably(activated)
  }
  return (await updateMarcoPayOrder(order.orderId, {
    state: 'ACTIVE',
    activatedAt: new Date().toISOString(),
    lastError: null,
  }))!
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
    return { duplicate: true, order: duplicateOrder, testMode: false }
  }
  const paymentClaimed = await claimOnce('payment', event.payment_ref)
  if (!paymentClaimed) {
    const current = (await hydrateMarcoPayOrder(order.orderId)) ?? order
    if (current.state === 'PAYMENT_CONFIRMED' || current.state === 'ACTIVATING') {
      return { duplicate: true, order: await activateOrder(current), testMode: false }
    }
    return { duplicate: true, order: current, testMode: false }
  }
  const confirmed = await updateMarcoPayOrder(order.orderId, {
    state: 'PAYMENT_CONFIRMED',
    paymentRef: event.payment_ref,
    intentRef: event.intent_ref,
    receiptRef: event.receipt_ref,
    marcoAmountMinor: event.marco_amount_minor,
    testMode: false,
  })
  if (!confirmed) throw new Error('ORDER_NOT_FOUND')
  return { duplicate: false, order: await activateOrder(confirmed), testMode: false }
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
