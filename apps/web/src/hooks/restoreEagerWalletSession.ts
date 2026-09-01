export const EAGER_CONNECT_MAX_ATTEMPTS = 3
export const EAGER_CONNECT_RETRY_DELAYS_MS = [250, 750] as const

export type EagerConnectAccount = {
  account?: string | null
}

export type EagerConnectResult =
  | { status: 'restored'; address: string; attempts: number }
  | { status: 'unavailable'; attempts: number }

export async function restoreEagerWalletSession(input: {
  autoConnect: () => Promise<EagerConnectAccount | null | undefined>
  sleep?: (ms: number) => Promise<void>
  maxAttempts?: number
}): Promise<EagerConnectResult> {
  const sleep = input.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)))
  const maxAttempts = input.maxAttempts ?? EAGER_CONNECT_MAX_ATTEMPTS
  let attempts = 0

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    attempts += 1
    try {
      const result = await input.autoConnect()
      const address = result?.account
      if (typeof address === 'string' && address.length > 0) {
        return { status: 'restored', address, attempts }
      }
    } catch {
      // Provider wake-up can fail on the first paint. Retry without prompting.
    }
    if (attempt < maxAttempts - 1) {
      await sleep(EAGER_CONNECT_RETRY_DELAYS_MS[attempt] ?? EAGER_CONNECT_RETRY_DELAYS_MS[EAGER_CONNECT_RETRY_DELAYS_MS.length - 1])
    }
  }

  return { status: 'unavailable', attempts }
}
