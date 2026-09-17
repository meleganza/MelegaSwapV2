/**
 * MARCO Passport snapshot for M-Credits checkout. Reads the already-mounted
 * Connect widget. Tests inject a snapshot — never a real Passport session.
 */
export type MCreditsPassportSnapshot = {
  connected: boolean
  known: boolean
  availableMinor: number | null
  identityToken: string | null
}

type ConnectState = {
  connected?: boolean
  passport?: { publicPassportId?: string | null } | null
  mCredits?: { available?: number | string | null; known?: boolean; currency?: string } | null
  sessionToken?: string | null
  handoff?: { token?: string | null } | null
}

type ConnectSdk = {
  getState?: () => ConnectState
  authorizeMCreditsSpend?: (input: { merchantOrderRef: string; maxAmountMinor: string }) => Promise<{
    ok?: boolean
    mcreditsAuthorization?: string
    error?: { code?: string; message?: string }
  }>
}

let testSnapshot: MCreditsPassportSnapshot | null = null
let sdkReader: (() => ConnectSdk | null) | null = null

export function setMCreditsPassportForTests(snapshot: MCreditsPassportSnapshot | null) {
  testSnapshot = snapshot
}

export function setMCreditsConnectSdkReaderForTests(reader: (() => ConnectSdk | null) | null) {
  sdkReader = reader
}

function parseAvailableMinor(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value * 100)
  if (typeof value === 'string' && value.trim() && /^\d+(\.\d{1,2})?$/.test(value.trim())) {
    return Math.round(Number(value) * 100)
  }
  return null
}

export function requiredMCreditsMinor(usdPrice: number): string {
  return String(Math.round(usdPrice * 100))
}

export function refreshMCreditsQuote(usdPrice: number): { amountMinor: string; display: string } {
  const amountMinor = requiredMCreditsMinor(usdPrice)
  const credits = (Number(amountMinor) / 100).toFixed(2).replace(/\.00$/, '')
  return { amountMinor, display: `≈ ${credits} M-Credits` }
}

function readMountedSdk(): ConnectSdk | null {
  if (sdkReader) return sdkReader()
  if (typeof window === 'undefined') return null
  const fromWindow = (window as Window & { __MELEGA_MARCO_CONNECT__?: ConnectSdk }).__MELEGA_MARCO_CONNECT__
  return fromWindow ?? null
}

export function readMCreditsPassport(): MCreditsPassportSnapshot {
  if (testSnapshot) return testSnapshot
  const state = readMountedSdk()?.getState?.() ?? {}
  const availableMinor = parseAvailableMinor(state.mCredits?.available)
  return {
    connected: Boolean(state.connected || state.passport),
    known: state.mCredits?.known === true || availableMinor != null,
    availableMinor,
    identityToken: state.sessionToken?.trim() || state.handoff?.token?.trim() || null,
  }
}

export function mCreditsCheckoutBlocker(input: {
  usdPrice: number
  passport?: MCreditsPassportSnapshot
}): string | null {
  const passport = input.passport ?? readMCreditsPassport()
  if (!passport.connected) return 'Connect MARCO Passport to pay with M-Credits.'
  const required = Number(requiredMCreditsMinor(input.usdPrice))
  if (passport.known && passport.availableMinor != null && passport.availableMinor < required) {
    return 'Insufficient M-Credits for this purchase.'
  }
  return null
}

export async function authorizeMCreditsSpendForOrder(input: {
  merchantOrderRef: string
  maxAmountMinor: string
}): Promise<string | null> {
  if (testSnapshot?.identityToken) return testSnapshot.identityToken
  const sdk = readMountedSdk()
  if (typeof sdk?.authorizeMCreditsSpend !== 'function') return readMCreditsPassport().identityToken
  const result = await sdk.authorizeMCreditsSpend({
    merchantOrderRef: input.merchantOrderRef,
    maxAmountMinor: input.maxAmountMinor,
  })
  if (!result?.ok || !result.mcreditsAuthorization) {
    throw new Error(result?.error?.message || 'M-Credits authorization was not granted.')
  }
  return result.mcreditsAuthorization
}
