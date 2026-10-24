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
import { canAcceptMCreditsPayment } from 'lib/monetization/visibilityRuntime'
import type { CommercialServiceId } from 'views/shared/monetization/commercialCheckoutTypes'
import {
  confirmPassportMcredits,
  releasePassportMcredits,
  reservePassportMcredits,
  type McreditsRuntime,
} from 'lib/marco-mcredits/server'

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
  serviceId: Exclude<CommercialServiceId, 'liquidity' | 'create-farm' | 'create-pool' | 'claim-project'>
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
  serviceId: MCreditsOrder['serviceId']
  packageId?: string | null
  targetId?: string | null
  merchantOrderRef?: string
  customerAuthorization?: string | null
  fetchImpl?: typeof fetch
  mcreditsRuntime?: McreditsRuntime
}

const MEMORY = new Map<string, MCreditsOrder>()
const IDEMPOTENCY = new Map<string, string>()

export async function spendMCreditsForBoost(input: SpendInput): Promise<MCreditsOrder> {
  if (input.customerAuthorization?.startsWith('mpk_') || input.customerAuthorization?.startsWith('whsec')) {
    throw new MCreditsGatewayError('MCREDITS_SECRET_REJECTED', 'Mcredits cannot use MARCO Pay server secrets.')
  }
  if (!input.customerAuthorization?.trim()) {
    throw new MCreditsGatewayError('MCREDITS_AUTHORIZATION_REQUIRED', 'Mcredits require explicit MARCO Passport authorization.')
  }
  if (!canAcceptMCreditsPayment(input.serviceId)) {
    throw new MCreditsGatewayError('SERVICE_NOT_FULFILLABLE', 'This service cannot be fulfilled with Mcredits yet.')
  }
  const pkg =
    input.serviceId === 'featured'
      ? getFeaturedPackage(input.packageId)
      : getVisibilityPackage(input.serviceId as VisibilityProductId, input.packageId)
  const expectedOrderRef = `${String(input.projectContract ?? '').toLowerCase()}:${input.serviceId}:${pkg.id}`
  if (!/^0x[a-f0-9]{40}:/.test(expectedOrderRef) || input.merchantOrderRef !== expectedOrderRef) {
    throw new MCreditsGatewayError('MCREDITS_ORDER_REFERENCE_INVALID', 'The Mcredits authorization does not match this order.')
  }
  const idempotencyKey = `${input.buyerWallet.toLowerCase()}|${input.serviceId}|${pkg.id}|${input.projectId}`
  const existingId = IDEMPOTENCY.get(idempotencyKey)
  const existing = existingId ? MEMORY.get(existingId) : null
  if (existing?.state === 'FULFILLED') return existing
  if (existing && existing.state !== 'FAILED' && existing.state !== 'RELEASED') {
    throw new MCreditsGatewayError('MCREDITS_IN_FLIGHT', 'This purchase is already in progress.')
  }
  const now = new Date().toISOString()
  const order: MCreditsOrder = {
    orderId: input.merchantOrderRef,
    reservationId: null,
    state: 'CREATED',
    serviceId: input.serviceId,
    packageId: String(pkg.id),
    projectId: input.projectId,
    buyerWallet: input.buyerWallet.toLowerCase(),
    referenceAmountMinor: String(Math.round(pkg.usdPrice * 100)),
    createdAt: now,
  }
  MEMORY.set(order.orderId, order)
  IDEMPOTENCY.set(idempotencyKey, order.orderId)
  const runtime: McreditsRuntime = { ...input.mcreditsRuntime, fetch: input.mcreditsRuntime?.fetch ?? input.fetchImpl }
  const authorization = input.customerAuthorization.trim()
  const amountMinor = order.referenceAmountMinor
  let reservationId: string | null = null
  try {
    const reserved = await reservePassportMcredits({
      customerAuthorization: authorization,
      orderRef: order.orderId,
      amountMinor,
      item: input.serviceId,
    }, runtime)
    if ('gate' in reserved) {
      throw new MCreditsGatewayError(reserved.gate, 'Mcredits could not reserve this purchase.')
    }
    reservationId = reserved.paymentId
    order.reservationId = reservationId
    order.state = 'RESERVED'
    MEMORY.set(order.orderId, { ...order })

    const confirmed = await confirmPassportMcredits(reservationId, runtime)
    if ('gate' in confirmed) {
      throw new MCreditsGatewayError(confirmed.gate, 'Mcredits could not confirm this purchase.')
    }

    if (input.serviceId === 'featured') {
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
    } else {
      const legacy = createTrendBoostOrder({
        projectId: input.projectId,
        projectSlug: input.projectSlug ?? null,
        projectContract: input.projectContract ?? null,
        buyerWallet: input.buyerWallet,
        paymentAsset: 'MARCO',
        packageId: String(pkg.id),
        serviceId: input.serviceId as VisibilityProductId,
        targetId: input.targetId ?? null,
      })
      updateTrendBoostOrder(legacy.orderId, {
        state: 'PAYMENT_CONFIRMED',
        paymentStatus: 'confirmed',
        receiptVerified: true,
        lastError: null,
      })
      const activated = activateVerifiedTrendBoostWindow(legacy.orderId)
      if (!activated) throw new MCreditsGatewayError('MCREDITS_ACTIVATION_FAILED', 'Mcredits fulfilment failed.')
      await persistTrendBoostOrderDurably(activated)
    }
    order.state = 'FULFILLED'
    MEMORY.set(order.orderId, { ...order })
    IDEMPOTENCY.set(idempotencyKey, order.orderId)
    return order
  } catch (cause) {
    if (reservationId) {
      await releasePassportMcredits(reservationId, 'DEX_ORDER_FAILED', runtime).catch(() => ({ ok: false as const, gate: 'PASSPORT_MCREDITS_UNREACHABLE' as const }))
      order.state = 'RELEASED'
    } else {
      order.state = 'FAILED'
    }
    MEMORY.set(order.orderId, { ...order })
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
