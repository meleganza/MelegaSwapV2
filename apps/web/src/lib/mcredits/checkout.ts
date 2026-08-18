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
import type { CommercialServiceId } from 'views/shared/monetization/commercialCheckoutTypes'

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
  identityToken?: string | null
  fetchImpl?: typeof fetch
}

const MEMORY = new Map<string, MCreditsOrder>()

function marcoOrigin(): string {
  return 'https://marco.melega.ai'
}

async function postMCredits(
  path: string,
  body: Record<string, unknown>,
  identityToken: string,
  fetchImpl: typeof fetch,
): Promise<{ ok: boolean; reservation_id?: string; error?: string }> {
  const response = await fetchImpl(`${marcoOrigin()}${path}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${identityToken}`,
    },
    body: JSON.stringify(body),
  })
  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean
    reservation_id?: string
    error?: string
  }
  return { ok: response.ok && payload.ok !== false, reservation_id: payload.reservation_id, error: payload.error }
}

export async function spendMCreditsForBoost(input: SpendInput): Promise<MCreditsOrder> {
  if (input.identityToken?.startsWith('mpk_') || input.identityToken?.startsWith('whsec')) {
    throw new MCreditsGatewayError('MCREDITS_SECRET_REJECTED', 'M-Credits cannot use MARCO Pay server secrets.')
  }
  if (!input.identityToken?.trim()) {
    throw new MCreditsGatewayError('MCREDITS_IDENTITY_REQUIRED', 'M-Credits require a MARCO Passport session.')
  }
  const pkg =
    input.serviceId === 'featured'
      ? getFeaturedPackage(input.packageId)
      : getVisibilityPackage(input.serviceId as VisibilityProductId, input.packageId)
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
  MEMORY.set(order.orderId, order)
  const fetchImpl = input.fetchImpl ?? fetch
  const identity = input.identityToken.trim()
  const amountMinor = order.referenceAmountMinor
  let reservationId: string | null = null
  try {
    const reserved = await postMCredits(
      '/api/public/mcredits/reserve',
      {
        merchant_order_ref: order.orderId,
        amount_minor: amountMinor,
        currency: 'USD',
        item: input.serviceId,
      },
      identity,
      fetchImpl,
    )
    if (!reserved.ok || !reserved.reservation_id) {
      throw new MCreditsGatewayError(reserved.error || 'MCREDITS_RESERVE_FAILED', 'M-Credits could not reserve this purchase.')
    }
    reservationId = reserved.reservation_id
    order.reservationId = reservationId
    order.state = 'RESERVED'
    MEMORY.set(order.orderId, { ...order })

    const confirmed = await postMCredits(
      '/api/public/mcredits/confirm',
      { reservation_id: reservationId, merchant_order_ref: order.orderId },
      identity,
      fetchImpl,
    )
    if (!confirmed.ok) {
      throw new MCreditsGatewayError(confirmed.error || 'MCREDITS_CONFIRM_FAILED', 'M-Credits could not confirm this purchase.')
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
      if (!activated) throw new MCreditsGatewayError('MCREDITS_ACTIVATION_FAILED', 'M-Credits fulfilment failed.')
      await persistTrendBoostOrderDurably(activated)
    }
    order.state = 'FULFILLED'
    MEMORY.set(order.orderId, { ...order })
    return order
  } catch (cause) {
    if (reservationId) {
      await postMCredits(
        '/api/public/mcredits/release',
        { reservation_id: reservationId, merchant_order_ref: order.orderId },
        identity,
        fetchImpl,
      ).catch(() => ({ ok: false }))
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
}

export function getMCreditsOrder(orderId: string): MCreditsOrder | null {
  return MEMORY.get(orderId) ?? null
}
