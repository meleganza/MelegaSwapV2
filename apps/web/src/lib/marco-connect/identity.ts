export const MARCO_CONNECT_WIDGET_URL = 'https://marco.melega.ai/widgets/marco-connect.v2.1.js'

export type MarcoConnectIdentityStatus = {
  enabled: true
  authority: 'MARCO Connect official widget'
  payment_requires_passport: false
  client_supplied_passport_id_accepted: false
  duplicate_identities: 'rejected'
  widget: typeof MARCO_CONNECT_WIDGET_URL
  linked: false
  marco_passport_id: null
  marco_handle: null
  wallet_binding_status: 'unchanged_dex_wallet'
  verification_timestamp: null
  reason: string
}

export type MarcoConnectIdentityClaim = {
  marco_passport_id?: unknown
  passport_id?: unknown
  marco_handle?: unknown
  wallet?: unknown
}

export type MarcoConnectIdentityDecision =
  | { ok: false; error: 'CLIENT_PASSPORT_ID_REJECTED' }
  | { ok: false; error: 'SIGNED_MARCO_IDENTITY_REQUIRED' }

export function publicMarcoConnectStatus(): MarcoConnectIdentityStatus {
  return {
    enabled: true,
    authority: 'MARCO Connect official widget',
    payment_requires_passport: false,
    client_supplied_passport_id_accepted: false,
    duplicate_identities: 'rejected',
    widget: MARCO_CONNECT_WIDGET_URL,
    linked: false,
    marco_passport_id: null,
    marco_handle: null,
    wallet_binding_status: 'unchanged_dex_wallet',
    verification_timestamp: null,
    reason:
      'Passport identity stays inside the official MARCO Connect widget. Melega DEX does not accept client-supplied passport ids and does not require Passport authentication to pay.',
  }
}

function hasClientPassportId(claim: MarcoConnectIdentityClaim): boolean {
  const values = [claim.marco_passport_id, claim.passport_id, claim.marco_handle]
  return values.some((value) => typeof value === 'string' && value.trim().length > 0)
}

export function evaluateMarcoConnectIdentityClaim(claim: MarcoConnectIdentityClaim | Record<string, unknown>): MarcoConnectIdentityDecision {
  if (hasClientPassportId(claim)) return { ok: false, error: 'CLIENT_PASSPORT_ID_REJECTED' }
  return { ok: false, error: 'SIGNED_MARCO_IDENTITY_REQUIRED' }
}
