export type MarcoBridgeErrorCode =
  | 'INVALID_AMOUNT'
  | 'INVALID_DESTINATION'
  | 'UNSUPPORTED_ROUTE'
  | 'ROUTE_NOT_ACTIVE'
  | 'WRONG_SOURCE_NETWORK'
  | 'WRONG_WALLET_FAMILY'
  | 'INSUFFICIENT_MARCO'
  | 'INSUFFICIENT_GAS'
  | 'QUOTE_FAILED'
  | 'QUOTE_STALE'
  | 'SOURCE_FAILED'
  | 'SIGNATURE_REJECTED'
  | 'TRANSPORT_NOT_BOUND'

export class MarcoBridgeError extends Error {
  readonly code: MarcoBridgeErrorCode

  constructor(code: MarcoBridgeErrorCode, message: string) {
    super(message)
    this.name = 'MarcoBridgeError'
    this.code = code
  }
}

export function toMarcoBridgeError(error: unknown, fallback: MarcoBridgeErrorCode): MarcoBridgeError {
  if (error instanceof MarcoBridgeError) return error
  const message = error instanceof Error ? error.message : 'Bridge action could not be completed.'
  return new MarcoBridgeError(fallback, message)
}
