import { get, put } from '@vercel/blob'
import {
  getMarcoPayApplicationRef,
  getMarcoPayWebhookSecret,
  MARCO_MACHINE_ORIGIN,
  MARCO_PAY_WIDGET_URL,
} from './contract'

const HEALTH_KEY = 'monetization/v1/marco-pay/health/signed-test-webhook.json'

export type MarcoPayTestWebhookHealth = {
  schema: 'melega.marco-pay-test-health.v1'
  eventId: string
  paymentRef: string
  applicationRef: string
  verifiedAt: string
  activated: false
}

type MachinePay = {
  data?: {
    version?: string
    webhooks?: {
      contract_version?: string
      signature_input_format?: string
      timestamp_tolerance_seconds?: number
      authoritative_activation_event?: string
    }
    public_widget?: { widget_version?: string; script?: string; element?: string }
    rewards?: { customer_reward_bps?: number; partner_reward_bps?: number }
  }
}

type MachineCapabilities = {
  data?: { capabilities?: Array<{ id?: string; status?: string; version?: string }> }
}

type MachineEconomy = {
  data?: {
    customer_reward_bps?: number
    partner_reward_bps?: number
    customer_reward_percent?: string
    partner_reward_percent?: string
  }
}

type MarcoToken = {
  name?: string
  symbol?: string
  network?: string
  chain_id?: string
  contract_address?: string
  decimals?: string
}

function blobToken(): string | null {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || null
}

export async function recordSignedTestWebhook(health: MarcoPayTestWebhookHealth): Promise<void> {
  const token = blobToken()
  if (!token) {
    if (process.env.NODE_ENV === 'production') throw new Error('DURABLE_WEBHOOK_HEALTH_STORAGE_UNAVAILABLE')
    return
  }
  await put(HEALTH_KEY, JSON.stringify(health), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    token,
  })
}

export async function loadSignedTestWebhook(): Promise<MarcoPayTestWebhookHealth | null> {
  const token = blobToken()
  if (!token) return null
  try {
    const result = await get(HEALTH_KEY, { access: 'private', token, useCache: false })
    if (!result || result.statusCode !== 200) return null
    const payload = (await new Response(result.stream).json()) as MarcoPayTestWebhookHealth
    return payload.schema === 'melega.marco-pay-test-health.v1' ? payload : null
  } catch {
    return null
  }
}

async function fetchJson<T>(pathname: string): Promise<T> {
  const response = await fetch(`${MARCO_MACHINE_ORIGIN}${pathname}`, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(8_000),
  })
  if (!response.ok) throw new Error(`MARCO_MACHINE_${response.status}`)
  return response.json() as Promise<T>
}

async function applicationResolves(applicationRef: string): Promise<boolean> {
  try {
    const response = await fetch(`${MARCO_MACHINE_ORIGIN}/api/public/pay/quote`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        application_key: applicationRef,
        amount_minor: '900',
        currency: 'USD',
        item: 'Melega DEX · runtime readiness',
      }),
      signal: AbortSignal.timeout(8_000),
    })
    if (!response.ok) return false
    const payload = (await response.json()) as { ok?: boolean; quote?: { merchantName?: string } }
    return payload.ok === true && payload.quote?.merchantName === 'Melega DEX'
  } catch {
    return false
  }
}

export async function resolveMarcoPayReadiness() {
  const applicationRef = getMarcoPayApplicationRef()
  const secretConfigured = Boolean(getMarcoPayWebhookSecret())
  const [pay, capabilities, economy, token, signedTest, appResolved] = await Promise.all([
    fetchJson<MachinePay>('/api/public/machine/pay').catch(() => null),
    fetchJson<MachineCapabilities>('/api/public/machine/capabilities').catch(() => null),
    fetchJson<MachineEconomy>('/api/public/machine/economy').catch(() => null),
    fetchJson<MarcoToken>('/api/public/token').catch(() => null),
    loadSignedTestWebhook(),
    applicationRef ? applicationResolves(applicationRef) : Promise.resolve(false),
  ])
  const marcoCapability = capabilities?.data?.capabilities?.find((item) => item.id === 'pay.marco')
  const webhookCapability = capabilities?.data?.capabilities?.find((item) => item.id === 'pay.signed_webhooks')
  const contractValid =
    pay?.data?.webhooks?.contract_version === '1' &&
    pay.data.webhooks.signature_input_format === '<signature_version>.<timestamp>.<raw_body>' &&
    pay.data.webhooks.timestamp_tolerance_seconds === 300 &&
    pay.data.webhooks.authoritative_activation_event === 'payment.completed'
  const machineLive =
    marcoCapability?.status === 'LIVE' && webhookCapability?.status === 'LIVE' && contractValid
  const signedTestVerified = Boolean(
    signedTest && applicationRef && signedTest.applicationRef === applicationRef && signedTest.activated === false,
  )
  const productRefsConfigured = Boolean(process.env.MARCO_PAY_PRODUCT_REFS_JSON?.trim())
  const executable = Boolean(
    applicationRef &&
      appResolved &&
      secretConfigured &&
      machineLive &&
      signedTestVerified,
  )
  const reason = !applicationRef
    ? 'MARCO Pay is temporarily unavailable.'
    : !appResolved
    ? 'MARCO Pay is temporarily unavailable.'
    : !secretConfigured || !signedTestVerified
    ? 'MARCO Pay is completing secure activation.'
    : !machineLive
    ? 'MARCO Pay is temporarily unavailable.'
    : null
  const customerRewardBps = economy?.data?.customer_reward_bps ?? null
  const partnerRewardBps = economy?.data?.partner_reward_bps ?? null
  return {
    executable,
    reason,
    applicationRef,
    applicationResolved: appResolved,
    secretConfigured,
    signedTestVerified,
    signedTestVerifiedAt: signedTest?.verifiedAt ?? null,
    productRefsConfigured,
    machineLive,
    contractVersion: pay?.data?.webhooks?.contract_version ?? null,
    widget: {
      version: pay?.data?.public_widget?.widget_version ?? null,
      script: MARCO_PAY_WIDGET_URL,
      element: pay?.data?.public_widget?.element ?? null,
    },
    rewards: {
      customerBps: customerRewardBps,
      partnerBps: partnerRewardBps,
      customerLabel:
        typeof customerRewardBps === 'number'
          ? `Get ${customerRewardBps / 100}% back in M-Credits`
          : 'M-Credits reward available when qualified',
    },
    token: token ?? null,
    callbackUrl: 'https://www.melega.finance/api/marco-pay/webhook',
  }
}
