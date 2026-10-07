export type MarcoPayReadiness = {
  executable: boolean
  reason: string | null
  applicationRef: string | null
  paymentMethods?: { marco?: boolean; mCredits?: boolean }
  rewards?: { customerBps?: number | null; partnerBps?: number | null; customerLabel?: string }
}

const RETRY_DELAYS_MS = [0, 400, 800] as const

function wait(ms: number, signal: AbortSignal): Promise<void> {
  if (ms === 0) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

export async function fetchMarcoPayReadiness(signal: AbortSignal): Promise<MarcoPayReadiness> {
  let lastPayload: MarcoPayReadiness | null = null
  let lastError: unknown = null

  for (const delay of RETRY_DELAYS_MS) {
    await wait(delay, signal)
    try {
      const response = await fetch('/api/marco-pay/readiness', { signal, cache: 'no-store' })
      if (!response.ok) throw new Error(`MARCO_PAY_READINESS_${response.status}`)
      const payload = (await response.json()) as MarcoPayReadiness
      lastPayload = payload
      if (payload.executable) return payload
    } catch (cause) {
      if (cause instanceof Error && cause.name === 'AbortError') throw cause
      lastError = cause
    }
  }

  if (lastPayload) return lastPayload
  throw lastError instanceof Error ? lastError : new Error('MARCO_PAY_READINESS_UNAVAILABLE')
}
