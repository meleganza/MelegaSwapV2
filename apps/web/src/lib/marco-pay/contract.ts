import { createHmac, timingSafeEqual } from 'crypto'

export const MARCO_MACHINE_ORIGIN = 'https://marco.melega.ai'
export const MARCO_PAY_BASE_URL = MARCO_MACHINE_ORIGIN
export const MARCO_PAY_WIDGET_URL = `${MARCO_MACHINE_ORIGIN}/widgets/marco-pay-mark.v1.js`
export const MARCO_PAY_EVENT_VERSION = '1'
export const MARCO_PAY_SIGNATURE_VERSION = 'v1'
export const MARCO_PAY_FRESHNESS_SECONDS = 300
export const MARCO_PAY_AUTHORITATIVE_ACTIVATION_EVENT = 'payment.completed' as const

export const MARCO_PAY_CANONICAL_EVENT_TYPES = [
  'payment.completed',
  'payment.failed',
  'payment.expired',
  'reward.available',
] as const

export const MARCO_PAY_ACK_EVENT_TYPES = ['payment.created', 'payment.pending', 'payment.refunded'] as const

export const MARCO_PAY_EVENT_TYPES = [...MARCO_PAY_CANONICAL_EVENT_TYPES, ...MARCO_PAY_ACK_EVENT_TYPES] as const

export type MarcoPayEventType = (typeof MARCO_PAY_EVENT_TYPES)[number]

export const MARCO_PAY_HEADERS = {
  eventId: 'marco-event-id',
  eventType: 'marco-event-type',
  timestamp: 'marco-timestamp',
  signature: 'marco-signature',
  signatureVersion: 'marco-signature-version',
} as const

export type MarcoPayCompletedEvent = {
  event_id: string
  event_type: 'payment.completed'
  event_version: '1'
  created_at: string
  application_ref: string
  payment_ref: string
  intent_ref: string
  product_ref: string | null
  merchant_order_ref: string | null
  reference_currency: string
  reference_amount_minor: string
  marco_amount_minor: string
  status: 'COMPLETED'
  test_mode: boolean
  receipt_ref: string | null
}

export type MarcoPayLifecycleEvent = {
  event_id: string
  event_type: Exclude<MarcoPayEventType, 'payment.completed'>
  event_version: '1'
  created_at: string
  application_ref: string
  payment_ref: string | null
  intent_ref: string | null
  product_ref: string | null
  merchant_order_ref: string | null
  reference_currency: string | null
  reference_amount_minor: string | null
  marco_amount_minor: string | null
  status: string
  test_mode: boolean
  receipt_ref: string | null
}

export type MarcoPaySignedEvent =
  | { kind: 'completed'; event: MarcoPayCompletedEvent }
  | { kind: 'lifecycle'; event: MarcoPayLifecycleEvent }

type HeaderValue = string | string[] | undefined

export type MarcoPayWebhookHeaders = {
  eventId: HeaderValue
  eventType: HeaderValue
  timestamp: HeaderValue
  signature: HeaderValue
  signatureVersion: HeaderValue
}

export class MarcoPayVerificationError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message)
    this.name = 'MarcoPayVerificationError'
  }
}

function singleHeader(value: HeaderValue): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new MarcoPayVerificationError('SCHEMA_INVALID', `${field} is required.`)
  }
  return value
}

function requireMinorUnits(value: unknown, field: string): string {
  const result = requireString(value, field)
  if (!/^\d+$/.test(result)) throw new MarcoPayVerificationError('SCHEMA_INVALID', `${field} must be minor units.`)
  return result
}

function nullableString(value: unknown, field: string): string | null {
  if (value === null) return null
  return requireString(value, field)
}

function parseJsonObject(rawBody: Buffer): Record<string, unknown> {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawBody.toString('utf8'))
  } catch {
    throw new MarcoPayVerificationError('SCHEMA_INVALID', 'The webhook body is not valid JSON.')
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new MarcoPayVerificationError('SCHEMA_INVALID', 'The webhook body must be an object.')
  }
  return parsed as Record<string, unknown>
}

function isMarcoPayEventType(value: string): value is MarcoPayEventType {
  return (MARCO_PAY_EVENT_TYPES as readonly string[]).includes(value)
}

export function parseMarcoPayCompletedEvent(rawBody: Buffer): MarcoPayCompletedEvent {
  const body = parseJsonObject(rawBody)
  const eventType = requireString(body.event_type, 'event_type')
  const eventVersion = requireString(body.event_version, 'event_version')
  const status = requireString(body.status, 'status')
  if (eventType !== 'payment.completed') {
    throw new MarcoPayVerificationError('EVENT_UNSUPPORTED', 'Only payment.completed can activate a service.')
  }
  if (eventVersion !== MARCO_PAY_EVENT_VERSION) {
    throw new MarcoPayVerificationError('VERSION_UNSUPPORTED', 'Unsupported MARCO Pay event version.')
  }
  if (status !== 'COMPLETED') {
    throw new MarcoPayVerificationError('STATUS_INVALID', 'payment.completed must carry COMPLETED status.')
  }
  if (typeof body.test_mode !== 'boolean') {
    throw new MarcoPayVerificationError('SCHEMA_INVALID', 'test_mode must be boolean.')
  }
  const createdAt = requireString(body.created_at, 'created_at')
  if (!Number.isFinite(Date.parse(createdAt))) {
    throw new MarcoPayVerificationError('SCHEMA_INVALID', 'created_at must be ISO 8601.')
  }
  return {
    event_id: requireString(body.event_id, 'event_id'),
    event_type: 'payment.completed',
    event_version: '1',
    created_at: createdAt,
    application_ref: requireString(body.application_ref, 'application_ref'),
    payment_ref: requireString(body.payment_ref, 'payment_ref'),
    intent_ref: requireString(body.intent_ref, 'intent_ref'),
    product_ref: nullableString(body.product_ref, 'product_ref'),
    merchant_order_ref: nullableString(body.merchant_order_ref, 'merchant_order_ref'),
    reference_currency: requireString(body.reference_currency, 'reference_currency').toUpperCase(),
    reference_amount_minor: requireMinorUnits(body.reference_amount_minor, 'reference_amount_minor'),
    marco_amount_minor: requireMinorUnits(body.marco_amount_minor, 'marco_amount_minor'),
    status: 'COMPLETED',
    test_mode: body.test_mode,
    receipt_ref: nullableString(body.receipt_ref, 'receipt_ref'),
  }
}

export function parseMarcoPayLifecycleEvent(rawBody: Buffer): MarcoPayLifecycleEvent {
  const body = parseJsonObject(rawBody)
  const eventType = requireString(body.event_type, 'event_type')
  const eventVersion = requireString(body.event_version, 'event_version')
  if (!isMarcoPayEventType(eventType) || eventType === 'payment.completed') {
    throw new MarcoPayVerificationError('EVENT_UNSUPPORTED', 'This event cannot be processed as a lifecycle acknowledgement.')
  }
  if (eventVersion !== MARCO_PAY_EVENT_VERSION) {
    throw new MarcoPayVerificationError('VERSION_UNSUPPORTED', 'Unsupported MARCO Pay event version.')
  }
  if (typeof body.test_mode !== 'boolean') {
    throw new MarcoPayVerificationError('SCHEMA_INVALID', 'test_mode must be boolean.')
  }
  const createdAt = requireString(body.created_at, 'created_at')
  if (!Number.isFinite(Date.parse(createdAt))) {
    throw new MarcoPayVerificationError('SCHEMA_INVALID', 'created_at must be ISO 8601.')
  }
  return {
    event_id: requireString(body.event_id, 'event_id'),
    event_type: eventType,
    event_version: '1',
    created_at: createdAt,
    application_ref: requireString(body.application_ref, 'application_ref'),
    payment_ref: body.payment_ref == null ? null : requireString(body.payment_ref, 'payment_ref'),
    intent_ref: body.intent_ref == null ? null : requireString(body.intent_ref, 'intent_ref'),
    product_ref: body.product_ref === undefined ? null : nullableString(body.product_ref, 'product_ref'),
    merchant_order_ref:
      body.merchant_order_ref === undefined ? null : nullableString(body.merchant_order_ref, 'merchant_order_ref'),
    reference_currency:
      body.reference_currency == null ? null : requireString(body.reference_currency, 'reference_currency').toUpperCase(),
    reference_amount_minor:
      body.reference_amount_minor == null ? null : requireMinorUnits(body.reference_amount_minor, 'reference_amount_minor'),
    marco_amount_minor:
      body.marco_amount_minor == null ? null : requireMinorUnits(body.marco_amount_minor, 'marco_amount_minor'),
    status: requireString(body.status, 'status'),
    test_mode: body.test_mode,
    receipt_ref: body.receipt_ref === undefined ? null : nullableString(body.receipt_ref, 'receipt_ref'),
  }
}

function verifyMarcoPayWebhookSignature(input: {
  rawBody: Buffer
  headers: MarcoPayWebhookHeaders
  secret: string
  nowSeconds?: number
}): { eventId: string; eventType: string } {
  const eventId = singleHeader(input.headers.eventId)
  const eventType = singleHeader(input.headers.eventType)
  const timestamp = singleHeader(input.headers.timestamp)
  const signature = singleHeader(input.headers.signature)
  const signatureVersion = singleHeader(input.headers.signatureVersion)
  if (!eventId || !eventType || !timestamp || !signature || !signatureVersion) {
    throw new MarcoPayVerificationError('HEADERS_MISSING', 'Required MARCO Pay headers are missing.')
  }
  if (signatureVersion !== MARCO_PAY_SIGNATURE_VERSION) {
    throw new MarcoPayVerificationError('SIGNATURE_VERSION_INVALID', 'Unsupported signature version.')
  }
  if (!/^\d{10,}$/.test(timestamp)) {
    throw new MarcoPayVerificationError('TIMESTAMP_INVALID', 'Invalid webhook timestamp.')
  }
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000)
  if (Math.abs(now - Number(timestamp)) > MARCO_PAY_FRESHNESS_SECONDS) {
    throw new MarcoPayVerificationError('TIMESTAMP_EXPIRED', 'Webhook timestamp is outside the freshness window.')
  }
  const providedHex = signature.startsWith('v1=') ? signature.slice(3) : ''
  if (!/^[a-fA-F0-9]{64}$/.test(providedHex)) {
    throw new MarcoPayVerificationError('SIGNATURE_INVALID', 'Invalid webhook signature.')
  }
  const signingInput = `${MARCO_PAY_SIGNATURE_VERSION}.${timestamp}.${input.rawBody.toString('utf8')}`
  const expected = Buffer.from(createHmac('sha256', input.secret).update(signingInput).digest('hex'), 'hex')
  const provided = Buffer.from(providedHex, 'hex')
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    throw new MarcoPayVerificationError('SIGNATURE_INVALID', 'Invalid webhook signature.')
  }
  return { eventId, eventType }
}

export function verifyMarcoPaySignedEvent(input: {
  rawBody: Buffer
  headers: MarcoPayWebhookHeaders
  secret: string
  expectedApplicationRef: string
  nowSeconds?: number
}): MarcoPaySignedEvent {
  const { eventId, eventType } = verifyMarcoPayWebhookSignature(input)
  const body = parseJsonObject(input.rawBody)
  const payloadEventId = requireString(body.event_id, 'event_id')
  const payloadEventType = requireString(body.event_type, 'event_type')
  const applicationRef = requireString(body.application_ref, 'application_ref')
  if (payloadEventId !== eventId || payloadEventType !== eventType) {
    throw new MarcoPayVerificationError('HEADER_BODY_MISMATCH', 'Webhook headers do not match the signed event.')
  }
  if (applicationRef !== input.expectedApplicationRef) {
    throw new MarcoPayVerificationError('APPLICATION_INVALID', 'Webhook application does not match Melega DEX.')
  }
  if (payloadEventType === MARCO_PAY_AUTHORITATIVE_ACTIVATION_EVENT) {
    return { kind: 'completed', event: parseMarcoPayCompletedEvent(input.rawBody) }
  }
  return { kind: 'lifecycle', event: parseMarcoPayLifecycleEvent(input.rawBody) }
}

export function verifyMarcoPayWebhook(input: {
  rawBody: Buffer
  headers: MarcoPayWebhookHeaders
  secret: string
  expectedApplicationRef: string
  nowSeconds?: number
}): MarcoPayCompletedEvent {
  const signed = verifyMarcoPaySignedEvent(input)
  if (signed.kind !== 'completed') {
    throw new MarcoPayVerificationError('EVENT_UNSUPPORTED', 'Only payment.completed can activate a service.')
  }
  return signed.event
}

export function getMarcoPayApplicationRef(): string | null {
  const value = process.env.NEXT_PUBLIC_MARCO_PAY_APPLICATION?.trim() || ''
  return /^app_[a-z0-9]{8,40}$/.test(value) ? value : null
}

export function getMarcoPayWebhookSecret(): string | null {
  return process.env.MARCO_PAY_WEBHOOK_SECRET?.trim() || null
}

/** Server-only merchant API credential. Never expose via NEXT_PUBLIC_*. */
export function getMarcoPayMerchantApiKey(): string | null {
  const value = (process.env.MARCO_PAY_MERCHANT_API_KEY || process.env.MARCO_PAY_API_KEY || '').trim()
  return value ? value : null
}
