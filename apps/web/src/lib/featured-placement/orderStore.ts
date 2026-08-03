import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import {
  CASHBACK_STATES,
  FEATURED_OFFER,
  getFeaturedPackage,
  type FeaturedOrderState,
  type FeaturedPackageId,
  type FeaturedPayAsset,
} from './constants'
import type { FeaturedOrder, RotationCandidate } from './types'
import { marcoCashbackAmount, resolveCashbackState } from './cashback'
import { isRotationEligible } from './eligibility'

const MEMORY = new Map<string, FeaturedOrder>()

function dataDir(): string {
  return (
    process.env.FEATURED_ORDERS_DIR ||
    path.join(process.cwd(), 'data', 'featured-orders')
  )
}

function orderPath(orderId: string): string {
  return path.join(dataDir(), `${orderId}.json`)
}

function ensureDir() {
  try {
    fs.mkdirSync(dataDir(), { recursive: true })
  } catch {
    /* ignore */
  }
}

function persist(order: FeaturedOrder) {
  MEMORY.set(order.orderId, order)
  try {
    ensureDir()
    fs.writeFileSync(orderPath(order.orderId), JSON.stringify(order, null, 2))
  } catch {
    /* memory-only fallback */
  }
}

function loadFromDisk(orderId: string): FeaturedOrder | null {
  try {
    const raw = fs.readFileSync(orderPath(orderId), 'utf8')
    return JSON.parse(raw) as FeaturedOrder
  } catch {
    return null
  }
}

export function getFeaturedOrder(orderId: string): FeaturedOrder | null {
  return MEMORY.get(orderId) ?? loadFromDisk(orderId)
}

export function listFeaturedOrders(): FeaturedOrder[] {
  ensureDir()
  const ids = new Set<string>([...MEMORY.keys()])
  try {
    for (const name of fs.readdirSync(dataDir())) {
      if (name.endsWith('.json')) ids.add(name.replace(/\.json$/, ''))
    }
  } catch {
    /* empty */
  }
  return [...ids]
    .map((id) => getFeaturedOrder(id))
    .filter((o): o is FeaturedOrder => Boolean(o))
}

export function createFeaturedOrder(input: {
  projectId: string
  projectSlug?: string | null
  projectContract?: string | null
  buyerWallet: string
  paymentAsset: FeaturedPayAsset
  sourceFlow: FeaturedOrder['sourceFlow']
  packageId?: FeaturedPackageId | string | null
}): FeaturedOrder {
  const now = new Date().toISOString()
  const cashback = resolveCashbackState(input.paymentAsset)
  const pkg = getFeaturedPackage(input.packageId)
  const order: FeaturedOrder = {
    schema: 'melega.featured-home-order.v1',
    orderId: `feat_${randomUUID().replace(/-/g, '').slice(0, 24)}`,
    state: 'DRAFT',
    projectId: input.projectId,
    projectSlug: input.projectSlug ?? null,
    projectContract: input.projectContract ?? null,
    buyerWallet: input.buyerWallet.toLowerCase(),
    packageId: pkg.id as FeaturedPackageId,
    durationMs: pkg.durationMs,
    paymentAsset: input.paymentAsset,
    usdReferenceAmount: pkg.usdPrice,
    tokenAmount: null,
    tokenAmountRaw: null,
    quoteSource: null,
    quoteTimestamp: null,
    quoteExpiration: null,
    unitPriceUsd: null,
    transactionHash: null,
    paymentStatus: 'none',
    eligibilityStatus: 'none',
    scheduledStart: null,
    scheduledEnd: null,
    rotationStatus: 'none',
    cashbackEligibility: cashback,
    cashbackAmountMCredits: cashback === 'ELIGIBLE_PENDING' ? marcoCashbackAmount() : null,
    cashbackFulfillmentStatus: cashback,
    cashbackPct: cashback === 'ELIGIBLE_PENDING' ? FEATURED_OFFER.marcoCashbackPct : null,
    sourceFlow: input.sourceFlow,
    treasuryWallet: FEATURED_OFFER.treasuryWallet,
    chainId: 56,
    createdAt: now,
    updatedAt: now,
    lastError: null,
    receiptVerified: false,
  }
  persist(order)
  return order
}

export function updateFeaturedOrder(
  orderId: string,
  patch: Partial<FeaturedOrder> & { state?: FeaturedOrderState },
): FeaturedOrder | null {
  const prev = getFeaturedOrder(orderId)
  if (!prev) return null
  const next: FeaturedOrder = {
    ...prev,
    ...patch,
    orderId: prev.orderId,
    updatedAt: new Date().toISOString(),
  }
  persist(next)
  return next
}

export function listRotationCandidates(now = new Date()): RotationCandidate[] {
  return listFeaturedOrders()
    .filter((o) => isRotationEligible(o, now))
    .map((o) => ({
      orderId: o.orderId,
      projectId: o.projectId,
      projectSlug: o.projectSlug,
      projectContract: o.projectContract,
      buyerWallet: o.buyerWallet,
      scheduledStart: o.scheduledStart!,
      scheduledEnd: o.scheduledEnd!,
      paymentConfirmedAt: o.updatedAt,
      state: o.state,
    }))
}

/** Test helper — clear memory + optional disk for fixtures. */
export function clearFeaturedOrdersForTests() {
  MEMORY.clear()
  try {
    for (const name of fs.readdirSync(dataDir())) {
      if (name.endsWith('.json')) fs.unlinkSync(path.join(dataDir(), name))
    }
  } catch {
    /* ignore */
  }
}

export { CASHBACK_STATES }
