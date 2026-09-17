import { randomBytes } from 'crypto'
import {
  createFeaturedOrder,
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
import {
  isMCreditsFulfillableService,
  type MCreditsFulfillableService,
} from 'lib/monetization/visibilityRuntime'
import { getMarcoPayApplicationRef } from 'lib/marco-pay/contract'
import { resolveMarcoPayWebhookSecret } from 'lib/marco-pay/connectionGrant'
import { signMarcoPayMerchantRequest } from 'lib/marco-pay/gateway'

export class MCreditsGatewayError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message)
    this.name = 'MCreditsGatewayError'
  }
}

export type MCreditsOrder = {
  orderId: string
  reservationId: string | null
  state: 'CREATED' | 'RESERVED' | 'FULFILLED' | 'RELEASED' | 'FAILED'
  serviceId: MCreditsFulfillableService
  packageId: string
  projectId: string
  buyerWallet: string
  referenceAmountMinor: string
  createdAt: string
}

type SpendInput = {
  projectId: string
  projectSlug?: string | null
  projectContract?: string | null
  buyerWallet: string
  serviceId: string
  packageId?: string | null
  targetId?: string | null
  identityToken?: string | null
  mcreditsAuthorization?: string | null
  applicationRef?: string | null
  signingSecret?: string | null
  existingOrderId?: string | null
  fetchImpl?: typeof fetch
}

const MEMORY = new Map<string, MCreditsOrder>()
const IDEMPOTENCY = new Map<string, string>()

const MCREDITS_ORDER_PATHS = {
  balance: '/api/public/mcredits/order/balance',
  reserve: '/api/public/mcredits/order/reserve',
  confirm: '/api/public/mcredits/order/confirm',
  release: '/api/public/mcredits/order/release',
} as const

function marcoOrigin(): string {
  return 'https://marco.melega.ai'
}

function idempotencyKey(input: {
  buyerWallet: string
  serviceId: string
  packageId: string
  projectId: string
}): string {
  return `${input.buyerWallet.toLowerCase()}:${input.serviceId}:${input.packageId}:${input.projectId}`
}

function resolvePackage(serviceId: MCreditsFulfillableService, packageId?: string | null) {
  return serviceId === 'featured'
    ? getFeaturedPackage(packageId)
    : getVisibilityPackage(serviceId as VisibilityProductId, packageId)
}

function resolveSpendAuthorization(input: Pick<SpendInput, 'identityToken' | 'mcreditsAuthorization'>): string {
  const token = (input.mcreditsAuthorization || input.identityToken || '').trim()
  if (token.startsWith('mpk_') || token.startsWith('whsec')) {
    throw new MCreditsGatewayError('MCREDITS_SECRET_REJECTED', 'M-Credits cannot use MARCO Pay server secrets.')
  }
  if (!token) {
    throw new MCreditsGatewayError('MCREDITS_IDENTITY_REQUIRED', 'M-Credits require a MARCO Passport session.')
  }
  return token
}

function assertFulfillableService(serviceId: string): asserts serviceId is MCreditsFulfillableService {
  if (!isMCreditsFulfillableService(serviceId)) {
    throw new MCreditsGatewayError(
      'SERVICE_NOT_FULFILLABLE',
      'M-Credits cannot settle a service that has no production fulfillment binding.',
    )
  }
}

function persistOrder(order: MCreditsOrder) {
  MEMORY.set(order.orderId, order)
  IDEMPOTENCY.set(
    idempotencyKey({
      buyerWallet: order.buyerWallet,
      serviceId: order.serviceId,
      packageId: order.packageId,
      projectId: order.projectId,
    }),
    order.orderId,
  )
}

export function prepareMCreditsOrder(input: SpendInput): MCreditsOrder {
  assertFulfillableService(input.serviceId)
  const pkg = resolvePackage(input.serviceId, input.packageId)
  const key = idempotencyKey({
    buyerWallet: input.buyerWallet,
    serviceId: input.serviceId,
    packageId: String(pkg.id),
    projectId: input.projectId,
  })
  const existingId = input.existingOrderId?.trim() || IDEMPOTENCY.get(key)
  if (existingId) {
    const existing = MEMORY.get(existingId)
    if (existing) return existing
  }
  const now = new Date().toISOString()
  const order: MCreditsOrder = {
    orderId: `mc_${randomBytes(12).toString('hex')}`,
    reservationId: null,
    state: 'CREATED',
    serviceId: input.serviceId,
    packageId: String(pkg.id),
    projectId: input.projectId,
    buyerWallet: input.buyerWallet.toLowerCase(),
    referenceAmountMinor: String(Math.round(pkg.usdPrice * 100)),
    createdAt: now,
  }
  persistOrder(order)
  return order
}

async function postMCredits(
  path: string,
  body: Record<string, unknown>,
  authorization: string | null,
  fetchImpl: typeof fetch,
  signing: { applicationRef: string; secret: string },
): Promise<{
  ok: boolean
  reservation_id?: string
  available_minor?: string
  available?: string
  error?: string
  message?: string
}> {
  const rawBody = JSON.stringify(body)
  const signed = signMarcoPayMerchantRequest({
    rawBody,
    secret: signing.secret,
    timestampSeconds: Math.floor(Date.now() / 1000),
  })
  const response = await fetchImpl(`${marcoOrigin()}${path}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'marco-application': signing.applicationRef,
      'marco-timestamp': signed.timestamp,
      'marco-signature': signed.signature,
      ...(authorization ? { authorization: `Bearer ${authorization}` } : {}),
    },
    body: rawBody,
  })
  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean
    reservation_id?: string
    available_minor?: string
    available?: string
    error?: string
    message?: string
  }
  return {
    ok: response.ok && payload.ok !== false,
    reservation_id: payload.reservation_id,
    available_minor: payload.available_minor,
    available: payload.available,
    error: payload.error,
    message: payload.message,
  }
}

async function resolveSigning(input: SpendInput): Promise<{ applicationRef: string; secret: string }> {
  const applicationRef = input.applicationRef?.trim() || getMarcoPayApplicationRef()
  const secret = input.signingSecret?.trim() || (await resolveMarcoPayWebhookSecret())
  if (!applicationRef) {
    throw new MCreditsGatewayError('MCREDITS_APPLICATION_MISSING', 'M-Credits are temporarily unavailable.')
  }
  if (!secret) {
    throw new MCreditsGatewayError('MCREDITS_SIGNING_UNAVAILABLE', 'M-Credits are temporarily unavailable.')
  }
  return { applicationRef, secret }
}

function insufficientError(code?: string, message?: string): boolean {
  const haystack = `${code || ''} ${message || ''}`.toUpperCase()
  return /INSUFFICIENT/.test(haystack)
}

export async function quoteMCreditsBalance(input: SpendInput): Promise<{
  order: MCreditsOrder
  availableMinor: string | null
  insufficient: boolean
}> {
  const order = prepareMCreditsOrder(input)
  let authorization: string | null = null
  try {
    authorization = resolveSpendAuthorization(input)
  } catch (cause) {
    if (cause instanceof MCreditsGatewayError && cause.code === 'MCREDITS_IDENTITY_REQUIRED') {
      return { order, availableMinor: null, insufficient: false }
    }
    throw cause
  }
  const fetchImpl = input.fetchImpl ?? fetch
  const signing = await resolveSigning(input)
  const quoted = await postMCredits(
    MCREDITS_ORDER_PATHS.balance,
    {
      application_ref: signing.applicationRef,
      merchant_order_ref: order.orderId,
      amount_minor: order.referenceAmountMinor,
      currency: 'USD',
    },
    authorization,
    fetchImpl,
    signing,
  )
  if (insufficientError(quoted.error, quoted.message)) {
    return { order, availableMinor: quoted.available_minor || quoted.available || null, insufficient: true }
  }
  const availableMinor = quoted.available_minor || quoted.available || null
  if (availableMinor && /^\d+$/.test(availableMinor)) {
    return {
      order,
      availableMinor,
      insufficient: BigInt(availableMinor) < BigInt(order.referenceAmountMinor),
    }
  }
  return { order, availableMinor, insufficient: false }
}

async function activateBoost(input: SpendInput, order: MCreditsOrder): Promise<void> {
  const pkg = resolvePackage(order.serviceId, order.packageId)
  if (order.serviceId === 'featured') {
    const legacy = createFeaturedOrder({
      projectId: input.projectId,
      projectSlug: input.projectSlug ?? null,
      projectContract: input.projectContract ?? null,
      buyerWallet: input.buyerWallet,
      paymentAsset: 'MARCO',
      packageId: String(pkg.id),
      sourceFlow: 'project-page',
    })
    const window = scheduleFeaturedWindow(new Date(), pkg.durationMs, 'ms')
    const activated =
      updateFeaturedOrder(legacy.orderId, {
        state: 'ELIGIBILITY_PENDING',
        paymentStatus: 'confirmed',
        receiptVerified: true,
        eligibilityStatus: 'pending',
        scheduledStart: window.start,
        scheduledEnd: window.end,
        rotationStatus: 'candidate',
        lastError: null,
      }) ?? legacy
    await persistFeaturedOrderDurably(activated)
    return
  }
  const legacy = createTrendBoostOrder({
    projectId: input.projectId,
    projectSlug: input.projectSlug ?? null,
    projectContract: input.projectContract ?? null,
    buyerWallet: input.buyerWallet,
    paymentAsset: 'MARCO',
    packageId: String(pkg.id),
    serviceId: order.serviceId,
    targetId: input.targetId ?? null,
  })
  updateTrendBoostOrder(legacy.orderId, {
    state: 'PAYMENT_CONFIRMED',
    paymentStatus: 'confirmed',
    receiptVerified: true,
    lastError: null,
  })
  const activated = activateVerifiedTrendBoostWindow(legacy.orderId)
  if (!activated) throw new MCreditsGatewayError('MCREDITS_ACTIVATION_FAILED', 'M-Credits fulfilment failed.')
  await persistTrendBoostOrderDurably(activated)
}

export async function spendMCreditsForBoost(input: SpendInput): Promise<MCreditsOrder> {
  assertFulfillableService(input.serviceId)
  const authorization = resolveSpendAuthorization(input)
  const order = prepareMCreditsOrder(input)
  if (order.state === 'FULFILLED') return order
  const fetchImpl = input.fetchImpl ?? fetch
  const signing = await resolveSigning(input)
  const amountMinor = order.referenceAmountMinor
  let reservationId = order.reservationId
  try {
    if (order.state !== 'RESERVED' || !reservationId) {
      const reserved = await postMCredits(
        MCREDITS_ORDER_PATHS.reserve,
        {
          application_ref: signing.applicationRef,
          merchant_order_ref: order.orderId,
          amount_minor: amountMinor,
          currency: 'USD',
          item: input.serviceId,
          mcredits_authorization: authorization,
        },
        authorization,
        fetchImpl,
        signing,
      )
      if (insufficientError(reserved.error, reserved.message)) {
        throw new MCreditsGatewayError(
          reserved.error || 'INSUFFICIENT_BALANCE',
          reserved.message || 'Insufficient M-Credits balance for this purchase.',
        )
      }
      if (!reserved.ok || !reserved.reservation_id) {
        throw new MCreditsGatewayError(
          reserved.error || 'MCREDITS_RESERVE_FAILED',
          reserved.message || 'M-Credits could not reserve this purchase.',
        )
      }
      reservationId = reserved.reservation_id
      order.reservationId = reservationId
      order.state = 'RESERVED'
      persistOrder({ ...order })
    }

    const confirmed = await postMCredits(
      MCREDITS_ORDER_PATHS.confirm,
      {
        application_ref: signing.applicationRef,
        reservation_id: reservationId,
        merchant_order_ref: order.orderId,
        mcredits_authorization: authorization,
      },
      authorization,
      fetchImpl,
      signing,
    )
    if (insufficientError(confirmed.error, confirmed.message)) {
      throw new MCreditsGatewayError(
        confirmed.error || 'INSUFFICIENT_BALANCE',
        confirmed.message || 'Insufficient M-Credits balance for this purchase.',
      )
    }
    if (!confirmed.ok) {
      throw new MCreditsGatewayError(
        confirmed.error || 'MCREDITS_CONFIRM_FAILED',
        confirmed.message || 'M-Credits could not confirm this purchase.',
      )
    }

    await activateBoost(input, order)
    order.state = 'FULFILLED'
    persistOrder({ ...order })
    return order
  } catch (cause) {
    if (reservationId) {
      await postMCredits(
        MCREDITS_ORDER_PATHS.release,
        {
          application_ref: signing.applicationRef,
          reservation_id: reservationId,
          merchant_order_ref: order.orderId,
        },
        authorization,
        fetchImpl,
        signing,
      ).catch(() => ({ ok: false }))
      order.state = 'RELEASED'
    } else {
      order.state = 'FAILED'
    }
    persistOrder({ ...order })
    throw cause
  }
}

export function clearMCreditsOrdersForTests() {
  MEMORY.clear()
  IDEMPOTENCY.clear()
}

export function getMCreditsOrder(orderId: string): MCreditsOrder | null {
  return MEMORY.get(orderId) ?? null
}
