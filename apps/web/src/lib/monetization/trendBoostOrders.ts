/**
 * Trend Boost — commercial order store (memory + disk), treasury settlement.
 * No protocol changes.
 */
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { get, list, put } from '@vercel/blob'
import { FEATURED_PAYMENT_TOKENS, FEATURED_OFFER, type FeaturedPayAsset } from 'lib/featured-placement/constants'
import { isQuoteExpired } from 'lib/featured-placement/quote'
import {
  getVisibilityPackage,
  MONETIZATION_TREASURY,
  schedulePlacementWindow,
  type VisibilityProductId,
} from 'lib/monetization/packages'

export type TrendBoostOrderState =
  | 'DRAFT'
  | 'QUOTED'
  | 'AWAITING_WALLET'
  | 'SUBMITTED'
  | 'PAYMENT_CONFIRMED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'

export type TrendBoostOrder = {
  schema: 'melega.trend-boost-order.v1'
  orderId: string
  state: TrendBoostOrderState
  projectId: string
  projectSlug: string | null
  projectContract: string | null
  buyerWallet: string
  serviceId?: VisibilityProductId
  targetId?: string | null
  packageId: string
  durationMs: number
  paymentAsset: FeaturedPayAsset
  usdReferenceAmount: number
  tokenAmount: string | null
  tokenAmountRaw: string | null
  quoteExpiration: string | null
  unitPriceUsd: number | null
  quoteSource: string | null
  transactionHash: string | null
  paymentStatus: 'none' | 'submitted' | 'confirmed' | 'failed' | 'cancelled'
  scheduledStart: string | null
  scheduledEnd: string | null
  treasuryWallet: string
  chainId: 56
  createdAt: string
  updatedAt: string
  receiptVerified: boolean
  lastError: string | null
}

const MEMORY = new Map<string, TrendBoostOrder>()
const BLOB_PREFIX = 'monetization/v1/trend-boost/'

function blobToken(): string | null {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || null
}

function blobKey(orderId: string): string {
  return `${BLOB_PREFIX}${orderId}.json`
}

function hydrate(order: TrendBoostOrder | null): TrendBoostOrder | null {
  if (!order || order.schema !== 'melega.trend-boost-order.v1') return null
  MEMORY.set(order.orderId, order)
  return order
}

async function readBlobOrder(pathname: string, token: string): Promise<TrendBoostOrder | null> {
  const result = await get(pathname, { access: 'private', token, useCache: false })
  if (!result || result.statusCode !== 200) return null
  return hydrate((await new Response(result.stream).json()) as TrendBoostOrder)
}

function dataDir(): string {
  return process.env.TREND_BOOST_ORDERS_DIR || path.join(process.cwd(), 'data', 'trend-boost-orders')
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

function persist(order: TrendBoostOrder) {
  MEMORY.set(order.orderId, order)
  try {
    ensureDir()
    fs.writeFileSync(orderPath(order.orderId), JSON.stringify(order, null, 2))
  } catch {
    /* memory-only */
  }
}

export function getTrendBoostOrder(orderId: string): TrendBoostOrder | null {
  if (MEMORY.has(orderId)) return MEMORY.get(orderId)!
  try {
    return JSON.parse(fs.readFileSync(orderPath(orderId), 'utf8')) as TrendBoostOrder
  } catch {
    return null
  }
}

export function trendBoostOrderStorageReady(): boolean {
  return Boolean(blobToken()) || process.env.NODE_ENV !== 'production'
}

export async function hydrateTrendBoostOrder(orderId: string): Promise<TrendBoostOrder | null> {
  const existing = getTrendBoostOrder(orderId)
  if (existing) return existing
  const token = blobToken()
  if (!token) return null
  try {
    return await readBlobOrder(blobKey(orderId), token)
  } catch {
    return null
  }
}

export async function persistTrendBoostOrderDurably(order: TrendBoostOrder): Promise<TrendBoostOrder> {
  const token = blobToken()
  if (!token) {
    if (process.env.NODE_ENV === 'production') throw new Error('DURABLE_COMMERCIAL_ORDER_STORAGE_UNAVAILABLE')
    return order
  }
  await put(blobKey(order.orderId), JSON.stringify(order), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    token,
  })
  return order
}

export async function listTrendBoostOrdersDurably(): Promise<TrendBoostOrder[]> {
  const token = blobToken()
  if (!token) return listTrendBoostOrders()
  try {
    const blobs: Array<{ pathname: string }> = []
    let cursor: string | undefined
    do {
      const page = await list({ prefix: BLOB_PREFIX, limit: 1_000, cursor, token })
      blobs.push(...page.blobs)
      cursor = page.hasMore ? page.cursor : undefined
    } while (cursor)
    const orders = await Promise.all(
      blobs.map(async (blob) => {
        try {
          return await readBlobOrder(blob.pathname, token)
        } catch {
          return null
        }
      }),
    )
    return orders.filter((order): order is TrendBoostOrder => Boolean(order))
  } catch {
    return []
  }
}

export function listTrendBoostOrders(): TrendBoostOrder[] {
  ensureDir()
  const ids = new Set<string>([...MEMORY.keys()])
  try {
    for (const name of fs.readdirSync(dataDir())) {
      if (name.endsWith('.json')) ids.add(name.replace(/\.json$/, ''))
    }
  } catch {
    /* empty */
  }
  return [...ids].map((id) => getTrendBoostOrder(id)).filter((order): order is TrendBoostOrder => Boolean(order))
}

/** Public placement eligibility. Payment proof and the purchased time window are both mandatory. */
export function listActiveTrendBoostOrders(now = new Date()): TrendBoostOrder[] {
  const nowMs = now.getTime()
  return listTrendBoostOrders()
    .filter((order) => {
      if (order.state !== 'ACTIVE' || !order.receiptVerified || order.paymentStatus !== 'confirmed') return false
      const start = order.scheduledStart ? Date.parse(order.scheduledStart) : Number.NaN
      const end = order.scheduledEnd ? Date.parse(order.scheduledEnd) : Number.NaN
      return Number.isFinite(start) && Number.isFinite(end) && start <= nowMs && nowMs < end
    })
    .sort((a, b) => Date.parse(a.scheduledEnd || '') - Date.parse(b.scheduledEnd || ''))
}

export function createTrendBoostOrder(input: {
  projectId: string
  projectSlug?: string | null
  projectContract?: string | null
  buyerWallet: string
  paymentAsset: FeaturedPayAsset
  packageId?: string | null
  serviceId?: VisibilityProductId
  targetId?: string | null
}): TrendBoostOrder {
  const serviceId = input.serviceId ?? 'trend-boost'
  const pkg = getVisibilityPackage(serviceId, input.packageId)
  const now = new Date().toISOString()
  const order: TrendBoostOrder = {
    schema: 'melega.trend-boost-order.v1',
    orderId: `trend_${randomUUID().replace(/-/g, '').slice(0, 24)}`,
    state: 'DRAFT',
    projectId: input.projectId,
    projectSlug: input.projectSlug ?? null,
    projectContract: input.projectContract ?? null,
    buyerWallet: input.buyerWallet.toLowerCase(),
    serviceId,
    targetId: input.targetId?.trim() || null,
    packageId: pkg.id,
    durationMs: pkg.durationMs,
    paymentAsset: input.paymentAsset,
    usdReferenceAmount: pkg.usdPrice,
    tokenAmount: null,
    tokenAmountRaw: null,
    quoteExpiration: null,
    unitPriceUsd: null,
    quoteSource: null,
    transactionHash: null,
    paymentStatus: 'none',
    scheduledStart: null,
    scheduledEnd: null,
    treasuryWallet: MONETIZATION_TREASURY,
    chainId: 56,
    createdAt: now,
    updatedAt: now,
    receiptVerified: false,
    lastError: null,
  }
  persist(order)
  return order
}

export function updateTrendBoostOrder(orderId: string, patch: Partial<TrendBoostOrder>): TrendBoostOrder | null {
  const current = getTrendBoostOrder(orderId)
  if (!current) return null
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() }
  persist(next)
  return next
}

function toRawAmount(human: number, decimals: number): string {
  const [whole, frac = ''] = human.toFixed(decimals).split('.')
  return BigInt(whole + frac.padEnd(decimals, '0').slice(0, decimals)).toString()
}

export function buildTrendBoostQuote(input: {
  orderId: string
  paymentAsset: FeaturedPayAsset
  unitPriceUsd: number | null
  quoteSource: string
}) {
  const order = getTrendBoostOrder(input.orderId)
  if (!order) throw new Error('ORDER_NOT_FOUND')
  const meta = FEATURED_PAYMENT_TOKENS[input.paymentAsset]
  const usd = order.usdReferenceAmount
  let unit = input.unitPriceUsd
  let source = input.quoteSource
  if (input.paymentAsset === 'USDT' || input.paymentAsset === 'USDC') {
    unit = 1
    source = 'stablecoin-1usd'
  }
  if (unit == null || !(unit > 0)) throw new Error(`QUOTE_UNAVAILABLE:${input.paymentAsset}`)
  const tokenAmountNum = usd / unit
  const tokenAmount = tokenAmountNum.toFixed(Math.min(8, meta.decimals))
  const tokenAmountRaw = toRawAmount(Number(tokenAmount), meta.decimals)
  const quoteExpiration = new Date(Date.now() + FEATURED_OFFER.quoteTtlMs).toISOString()
  updateTrendBoostOrder(input.orderId, {
    state: 'QUOTED',
    paymentAsset: input.paymentAsset,
    tokenAmount,
    tokenAmountRaw,
    unitPriceUsd: unit,
    quoteSource: source,
    quoteExpiration,
  })
  return {
    orderId: input.orderId,
    paymentAsset: input.paymentAsset,
    usdReferenceAmount: usd,
    tokenAmount,
    tokenAmountRaw,
    unitPriceUsd: unit,
    quoteSource: source,
    quoteExpiration,
    treasuryWallet: MONETIZATION_TREASURY,
    chainId: 56 as const,
    decimals: meta.decimals,
    tokenAddress: meta.address,
  }
}

const ERC20_TRANSFER_SELECTOR = '0xa9059cbb'
function padAddress(addr: string): string {
  return addr.replace(/^0x/i, '').toLowerCase().padStart(64, '0')
}
function padUint256(raw: string): string {
  return BigInt(raw).toString(16).padStart(64, '0')
}

export function prepareTrendBoostPayment(input: {
  paymentAsset: FeaturedPayAsset
  tokenAmountRaw: string
  tokenAmount: string
  quoteExpiration: string
  usdReferenceAmount: number
}) {
  if (isQuoteExpired(input.quoteExpiration)) throw new Error('QUOTE_EXPIRED')
  const meta = FEATURED_PAYMENT_TOKENS[input.paymentAsset]
  const treasury = MONETIZATION_TREASURY
  if (meta.kind === 'native') {
    return {
      chainId: 56 as const,
      paymentAsset: input.paymentAsset,
      to: treasury,
      valueHex: `0x${BigInt(input.tokenAmountRaw).toString(16)}`,
      data: '0x',
      tokenAddress: null as string | null,
      tokenAmount: input.tokenAmount,
      tokenAmountRaw: input.tokenAmountRaw,
      usdReferenceAmount: input.usdReferenceAmount,
      quoteExpiration: input.quoteExpiration,
      kind: 'native' as const,
    }
  }
  if (!meta.address) throw new Error('TOKEN_ADDRESS_MISSING')
  return {
    chainId: 56 as const,
    paymentAsset: input.paymentAsset,
    to: meta.address,
    valueHex: '0x0',
    data: `${ERC20_TRANSFER_SELECTOR}${padAddress(treasury)}${padUint256(input.tokenAmountRaw)}`,
    tokenAddress: meta.address,
    tokenAmount: input.tokenAmount,
    tokenAmountRaw: input.tokenAmountRaw,
    usdReferenceAmount: input.usdReferenceAmount,
    quoteExpiration: input.quoteExpiration,
    kind: 'erc20' as const,
  }
}

export function activateVerifiedTrendBoostWindow(orderId: string) {
  const order = getTrendBoostOrder(orderId)
  if (!order) return null
  if (!order.receiptVerified || order.paymentStatus !== 'confirmed') return null
  const window = schedulePlacementWindow(order.durationMs)
  return updateTrendBoostOrder(orderId, {
    state: 'ACTIVE',
    scheduledStart: window.start,
    scheduledEnd: window.end,
  })
}

export function clearTrendBoostOrdersForTests() {
  MEMORY.clear()
  try {
    for (const name of fs.readdirSync(dataDir())) {
      if (name.endsWith('.json')) fs.unlinkSync(path.join(dataDir(), name))
    }
  } catch {
    /* ignore */
  }
}
