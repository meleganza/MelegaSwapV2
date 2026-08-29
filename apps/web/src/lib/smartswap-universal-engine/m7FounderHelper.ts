/**
 * M7 Founder helper metadata and certified execute-calldata assembler.
 * The helper itself is a standalone static HTML file. Agent cannot sign.
 */

export const M7_FOUNDER_HELPER_PATH = 'deployments/mainnet/m7-founder-helper.html' as const

export const M7_EXECUTE_SELECTOR = '0x66c9e651' as const

export const M7_HELPER_STOPS = [
  'WRONG_CHAIN',
  'WRONG_ACCOUNT',
  'WBNB_BELOW_001',
  'PENDING_NONCE_DRIFT',
  'ALLOWANCE_STATE_INCONSISTENT',
  'USED_NONCE_2',
  'DEADLINE_ELAPSED',
  'QUOTE_BELOW_MIN_USER_OUT',
  'EXECUTOR_CONFIG_MISMATCH',
  'MELEGA_VENUE_ALLOWLISTED',
  'PACKAGE_MISMATCH',
] as const

function strip0x(hex: string): string {
  return hex.toLowerCase().startsWith('0x') ? hex.slice(2) : hex
}

function pad32(hex: string): string {
  return strip0x(hex).padStart(64, '0')
}

function encUint(value: string | number | boolean): string {
  if (typeof value === 'boolean') return pad32(value ? '1' : '0')
  if (typeof value === 'number') return pad32(value.toString(16))
  const n = BigInt(value)
  return pad32(n.toString(16))
}

function encAddr(addr: string): string {
  return pad32(strip0x(addr).toLowerCase())
}

function encBytes32(value: string): string {
  return pad32(value)
}

export function assembleM7ExecuteCalldata(input: {
  version: number
  policyId: string
  policyVersion: string
  chainId: number
  user: string
  inputAsset: string
  outputAsset: string
  inputAmount: string
  minUserOut: string
  venueId: string
  router: string
  routeHash: string
  feeBps: number
  feeAmount: string
  feeAsset: string
  beneficiary: string
  structuralRouteCostBps: number
  deadline: number
  nonce: number
  nativeIn: boolean
  nativeOut: boolean
  path: string[]
  signature: string
}): string {
  const sig = strip0x(input.signature)
  if (sig.length !== 130) throw new Error('SIGNATURE_MUST_BE_65_BYTES')
  if (input.path.length !== 2) throw new Error('PATH_MUST_BE_TWO_TOKENS')

  const intentWords = [
    encUint(input.version),
    encBytes32(input.policyId),
    encBytes32(input.policyVersion),
    encUint(input.chainId),
    encAddr(input.user),
    encAddr(input.inputAsset),
    encAddr(input.outputAsset),
    encUint(input.inputAmount),
    encUint(input.minUserOut),
    encBytes32(input.venueId),
    encAddr(input.router),
    encBytes32(input.routeHash),
    encUint(input.feeBps),
    encUint(input.feeAmount),
    encAddr(input.feeAsset),
    encAddr(input.beneficiary),
    encUint(input.structuralRouteCostBps),
    encUint(input.deadline),
    encUint(input.nonce),
    encUint(input.nativeIn),
    encUint(input.nativeOut),
  ].join('')

  const headStaticWords = 21
  const dynamicSlots = 2
  const pathOffset = (headStaticWords + dynamicSlots) * 32
  const pathWords = 1 + input.path.length
  const sigOffset = pathOffset + pathWords * 32

  const pathData = [encUint(input.path.length), ...input.path.map(encAddr)].join('')
  const sigLen = encUint(65)
  const sigPadded = sig.padEnd(Math.ceil(sig.length / 64) * 64, '0')

  return (
    M7_EXECUTE_SELECTOR +
    intentWords +
    encUint(pathOffset) +
    encUint(sigOffset) +
    pathData +
    sigLen +
    sigPadded
  )
}
