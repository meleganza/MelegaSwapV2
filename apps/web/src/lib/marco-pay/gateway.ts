import { createHmac } from 'crypto'
import { MARCO_PAY_BASE_URL, MARCO_PAY_SIGNATURE_VERSION } from './contract'
import {
  assertLiveMarcoConversion,
  assertMarcoPaySettlementWallet,
  isCanonicalMarcoPaySettlementWallet,
  MARCO_PAY_SETTLEMENT_WALLET,
} from './settlement'

export const MARCO_PAY_SESSION_PATH = '/api/public/pay/session'
export const MARCO_PAY_MERCHANT_ORDER_REF_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{5,119}$/

export class MarcoPayGatewayError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message)
    this.name = 'MarcoPayGatewayError'
  }
}

export type MarcoPayPaymentSession = {
  paymentId: string
  intentId: string | null
  approvalUrl: string
  marcoAmountMinor: string | null
  destinationWallet: string | null
  chainId: number | null
}

type GatewayResponse = {
  ok?: boolean
  error?: string
  message?: string
  payment_id?: string
  paymentId?: string
  intent_id?: string
  intentId?: string
  approval_url?: string
  approvalUrl?: string
  intent?: { intent_id?: string; payment_id?: string }
  payment?: { id?: string; payment_id?: string }
  test_mode?: boolean
  testMode?: boolean
  marco_amount_minor?: string
  marcoAmountMinor?: string
  receiving_wallet?: string
  receivingWallet?: string
  settlement_wallet?: string
  amount_minor?: string
  chain_id?: number | string
  chainId?: number | string
  chain?: number | string | { id?: number | string; chain_id?: number | string }
  quote?: {
    marco_amount_minor?: string
    marcoAmountMinor?: string
    marcoAmountLabel?: string
    amountLabel?: string
  }
}

function compactJson(value: Record<string, unknown>): string {
  return JSON.stringify(value)
}

export function buildMarcoPayCreateBody(input: {
  applicationRef: string
  merchantOrderRef: string
  amountMinor: string
  currency: string
  item?: string | null
}): string {
  if (!MARCO_PAY_MERCHANT_ORDER_REF_PATTERN.test(input.merchantOrderRef)) {
    throw new MarcoPayGatewayError('INVALID_ORDER_REF', 'This checkout did not provide a valid order reference.')
  }
  if (!/^\d+$/.test(input.amountMinor) || input.amountMinor === '0') {
    throw new MarcoPayGatewayError('INVALID_AMOUNT', 'The server-owned amount is invalid.')
  }
  const currency = input.currency.trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new MarcoPayGatewayError('INVALID_CURRENCY', 'The server-owned currency is invalid.')
  }
  return compactJson({
    application_ref: input.applicationRef,
    merchant_order_ref: input.merchantOrderRef,
    amount_minor: input.amountMinor,
    currency,
    item: input.item ?? null,
  })
}

export function signMarcoPayMerchantRequest(input: {
  rawBody: string
  secret: string
  timestampSeconds: number
}): { timestamp: string; signature: string } {
  const timestamp = String(input.timestampSeconds)
  const signature = `${MARCO_PAY_SIGNATURE_VERSION}=${createHmac('sha256', input.secret)
    .update(`${MARCO_PAY_SIGNATURE_VERSION}.${timestamp}.${input.rawBody}`)
    .digest('hex')}`
  return { timestamp, signature }
}

function readPaymentId(payload: GatewayResponse): string | null {
  const value =
    payload.payment_id ||
    payload.paymentId ||
    payload.payment?.payment_id ||
    payload.payment?.id ||
    payload.intent?.payment_id ||
    ''
  const trimmed = value.trim()
  return trimmed || null
}

function readIntentId(payload: GatewayResponse, paymentId: string): string | null {
  const value = payload.intent_id || payload.intentId || payload.intent?.intent_id || ''
  const trimmed = value.trim()
  return trimmed && trimmed !== paymentId ? trimmed : trimmed || null
}

function readApprovalUrl(_payload: GatewayResponse, paymentId: string): string {
  return `${MARCO_PAY_BASE_URL}/pay/${paymentId}`
}

function parseGatewayPayload(raw: string): GatewayResponse {
  try {
    const parsed = JSON.parse(raw) as GatewayResponse
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new MarcoPayGatewayError('GATEWAY_INVALID_RESPONSE', 'MARCO Pay returned an invalid response.')
    }
    return parsed
  } catch (cause) {
    if (cause instanceof MarcoPayGatewayError) throw cause
    throw new MarcoPayGatewayError('GATEWAY_INVALID_RESPONSE', 'MARCO Pay returned an invalid response.')
  }
}

async function postSignedMarcoPay(
  path: string,
  input: {
    applicationRef: string
    rawBody: string
    secret: string
    merchantApiKey?: string | null
    timestampSeconds: number
    fetchImpl: typeof fetch
  },
): Promise<{ status: number; payload: GatewayResponse }> {
  const { timestamp, signature } = signMarcoPayMerchantRequest({
    rawBody: input.rawBody,
    secret: input.secret,
    timestampSeconds: input.timestampSeconds,
  })
  const merchantApiKey = input.merchantApiKey?.trim() || ''
  const response = await input.fetchImpl(`${MARCO_PAY_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'marco-application': input.applicationRef,
      'marco-timestamp': timestamp,
      'marco-signature': signature,
      ...(merchantApiKey ? { authorization: `Bearer ${merchantApiKey}` } : {}),
    },
    body: input.rawBody,
    signal: typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(8_000) : undefined,
  })
  const raw = await response.text()
  return { status: response.status, payload: parseGatewayPayload(raw) }
}

function readChainId(payload: GatewayResponse): number | null {
  const nested = typeof payload.chain === 'object' && payload.chain ? payload.chain.id ?? payload.chain.chain_id : payload.chain
  const raw = payload.chain_id ?? payload.chainId ?? nested
  const value = typeof raw === 'number' ? raw : typeof raw === 'string' && /^\d+$/.test(raw) ? Number(raw) : NaN
  return Number.isInteger(value) ? value : null
}

function readDestination(payload: GatewayResponse): string | null {
  const destination = (
    payload.receiving_wallet ||
    payload.receivingWallet ||
    payload.settlement_wallet ||
    ''
  ).trim()
  return destination || null
}

function readMarcoAmountMinor(payload: GatewayResponse): string | null {
  const value = (
    payload.marco_amount_minor ||
    payload.marcoAmountMinor ||
    payload.quote?.marco_amount_minor ||
    payload.quote?.marcoAmountMinor ||
    ''
  ).trim()
  return value || null
}

function sessionFromPayload(payload: GatewayResponse, usdMinor: string): MarcoPayPaymentSession {
  const paymentId = readPaymentId(payload)
  if (!payload.ok || !paymentId) {
    throw new MarcoPayGatewayError(
      payload.error || 'NOT_EXECUTABLE',
      payload.message || 'MARCO Pay did not return a payment session.',
    )
  }
  if (payload.test_mode === true || payload.testMode === true) {
    throw new MarcoPayGatewayError(
      'LIVE_SETTLEMENT_REQUIRED',
      'MARCO Pay is temporarily unavailable.',
    )
  }
  const marcoMinor = readMarcoAmountMinor(payload)
  try {
    assertLiveMarcoConversion({ usdMinor, marcoMinor })
  } catch {
    throw new MarcoPayGatewayError('MARCO_CONVERSION_INVALID', 'MARCO Pay is temporarily unavailable.')
  }
  const destination = readDestination(payload)
  if (destination && !isCanonicalMarcoPaySettlementWallet(destination)) {
    throw new MarcoPayGatewayError('SETTLEMENT_WALLET_NOT_TREASURY', 'MARCO Pay is temporarily unavailable.')
  }
  return {
    paymentId,
    intentId: readIntentId(payload, paymentId),
    approvalUrl: readApprovalUrl(payload, paymentId),
    marcoAmountMinor: marcoMinor,
    destinationWallet: destination,
    chainId: readChainId(payload),
  }
}

export async function quoteMarcoPayConversion(input: {
  applicationRef: string
  amountMinor: string
  currency: string
  item?: string | null
  fetchImpl?: typeof fetch
}): Promise<void> {
  const fetchImpl = input.fetchImpl ?? fetch
  const response = await fetchImpl(`${MARCO_PAY_BASE_URL}/api/public/pay/quote`, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({
      application_key: input.applicationRef,
      amount_minor: input.amountMinor,
      currency: input.currency.trim().toUpperCase(),
      item: input.item ?? null,
    }),
    signal: typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(8_000) : undefined,
  })
  const payload = (await response.json()) as {
    ok?: boolean
    quote?: {
      amountLabel?: string
      marcoAmountLabel?: string
      marco_amount_minor?: string
      marcoAmountMinor?: string
    }
  }
  if (!response.ok || !payload.ok || !payload.quote) {
    throw new MarcoPayGatewayError('QUOTE_UNAVAILABLE', 'MARCO Pay is temporarily unavailable.')
  }
  try {
    assertLiveMarcoConversion({
      usdMinor: input.amountMinor,
      marcoMinor: payload.quote.marco_amount_minor || payload.quote.marcoAmountMinor || null,
    })
  } catch {
    throw new MarcoPayGatewayError('MARCO_CONVERSION_INVALID', 'MARCO Pay is temporarily unavailable.')
  }
}

export async function createMarcoPayPaymentSession(input: {
  applicationRef: string
  merchantOrderRef: string
  amountMinor: string
  currency: string
  item?: string | null
  secret: string
  merchantApiKey?: string | null
  nowSeconds?: number
  fetchImpl?: typeof fetch
}): Promise<MarcoPayPaymentSession> {
  if (!input.secret.trim()) {
    throw new MarcoPayGatewayError('SECRET_UNAVAILABLE', 'MARCO Pay signing secret is not configured.')
  }
  if (!input.merchantApiKey?.trim()) {
    throw new MarcoPayGatewayError('MERCHANT_KEY_UNAVAILABLE', 'MARCO Pay is temporarily unavailable.')
  }
  try {
    assertMarcoPaySettlementWallet()
  } catch (cause) {
    throw new MarcoPayGatewayError(
      cause instanceof Error ? cause.message : 'SETTLEMENT_WALLET_INVALID',
      'MARCO Pay is temporarily unavailable.',
    )
  }
  const rawBody = buildMarcoPayCreateBody(input)
  if (rawBody.includes('marco_amount_minor') || rawBody.includes('marcoAmountMinor')) {
    throw new MarcoPayGatewayError('MARCO_CONVERSION_INVALID', 'MARCO Pay is temporarily unavailable.')
  }
  const timestampSeconds = input.nowSeconds ?? Math.floor(Date.now() / 1000)
  const fetchImpl = input.fetchImpl ?? fetch
  const session = await postSignedMarcoPay(MARCO_PAY_SESSION_PATH, {
    applicationRef: input.applicationRef,
    rawBody,
    secret: input.secret,
    merchantApiKey: input.merchantApiKey,
    timestampSeconds,
    fetchImpl,
  })
  if (!session.payload.ok) {
    throw new MarcoPayGatewayError(
      session.payload.error || 'NOT_EXECUTABLE',
      session.payload.message || 'MARCO Pay could not create this payment.',
    )
  }
  const created = sessionFromPayload(session.payload, input.amountMinor)
  const state = await readMarcoPayPublicState({
    applicationRef: input.applicationRef,
    paymentId: created.paymentId,
    fetchImpl,
  })
  const marcoAmountMinor = created.marcoAmountMinor || state.marcoAmountMinor
  try {
    assertLiveMarcoConversion({ usdMinor: input.amountMinor, marcoMinor: marcoAmountMinor })
  } catch {
    throw new MarcoPayGatewayError('MARCO_CONVERSION_INVALID', 'MARCO Pay is temporarily unavailable.')
  }
  const destinationWallet = created.destinationWallet || state.destinationWallet || MARCO_PAY_SETTLEMENT_WALLET
  if (!isCanonicalMarcoPaySettlementWallet(destinationWallet)) {
    throw new MarcoPayGatewayError('SETTLEMENT_WALLET_NOT_TREASURY', 'MARCO Pay is temporarily unavailable.')
  }
  return {
    ...created,
    marcoAmountMinor,
    destinationWallet,
    chainId: created.chainId ?? state.chainId ?? 56,
  }
}

export async function readMarcoPayPublicState(input: {
  applicationRef: string
  paymentId: string
  fetchImpl?: typeof fetch
}): Promise<{ marcoAmountMinor: string | null; destinationWallet: string | null; chainId: number | null }> {
  const fetchImpl = input.fetchImpl ?? fetch
  try {
    const response = await fetchImpl(`${MARCO_PAY_BASE_URL}/api/public/pay/state`, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({
        application_ref: input.applicationRef,
        payment_id: input.paymentId,
      }),
      signal: typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(8_000) : undefined,
    })
    if (!response.ok) {
      return { marcoAmountMinor: null, destinationWallet: null, chainId: null }
    }
    const payload = parseGatewayPayload(await response.text())
    return {
      marcoAmountMinor: readMarcoAmountMinor(payload),
      destinationWallet: readDestination(payload),
      chainId: readChainId(payload),
    }
  } catch {
    return { marcoAmountMinor: null, destinationWallet: null, chainId: null }
  }
}
