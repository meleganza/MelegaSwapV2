/**
 * Deterministic SmartSwapExecutorV2 post-constructor runtime derivation.
 *
 * Solidity compiler `evm.deployedBytecode.object` is a runtime TEMPLATE with
 * zeroed immutable placeholders. After CREATE, the constructor patches those
 * placeholders using `immutableReferences`. Public `eth_getCode` must be
 * compared to the patched runtime for the target chain — never to the
 * compiler template hash.
 */
import { createHash } from 'crypto'
import { arrayify, hexlify } from '@ethersproject/bytes'
import { keccak256 } from '@ethersproject/keccak256'

export type ImmutableReference = {
  start: number
  length: number
}

export type ImmutableReferencesByAstId = Record<string, ImmutableReference[]>

export type ImmutableAstBinding = {
  astId: string
  name: 'treasury' | 'wrappedNative'
  mutability: 'immutable'
  typeString: 'address'
}

/** Certified compiler immutableReferences for SmartSwapExecutorV2 (solc 0.8.20 release profile). */
export const SMARTSWAP_EXECUTOR_V2_IMMUTABLE_REFERENCES: ImmutableReferencesByAstId = {
  '63': [
    { length: 32, start: 1088 },
    { length: 32, start: 1417 },
    { length: 32, start: 2284 },
    { length: 32, start: 2776 },
    { length: 32, start: 3309 },
  ],
  '65': [
    { length: 32, start: 473 },
    { length: 32, start: 2098 },
    { length: 32, start: 2149 },
    { length: 32, start: 2220 },
    { length: 32, start: 2317 },
    { length: 32, start: 4219 },
    { length: 32, start: 4384 },
  ],
}

/** AST id → source name from compiler AST (not positional guessing). */
export const SMARTSWAP_EXECUTOR_V2_IMMUTABLE_AST_BINDINGS: ImmutableAstBinding[] = [
  { astId: '63', name: 'treasury', mutability: 'immutable', typeString: 'address' },
  { astId: '65', name: 'wrappedNative', mutability: 'immutable', typeString: 'address' },
]

export const COMPILER_RUNTIME_TEMPLATE_SHA256 =
  '4ccb42b71a9a7826715f14a234a68c71dda90859a1e70c0981bb4a8695594722'

export const CREATION_BYTECODE_SHA256 =
  '36d2503e328425ab66b61e384fa02418ec18c29df3e7966f01ece0c1e4422217'

export type ConstructorImmutables = {
  treasury: string
  wrappedNative: string
}

function normalizeHex(hex: string): string {
  const raw = hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex
  if (raw.length % 2 !== 0) throw new Error(`ODD_HEX_LENGTH:${raw.length}`)
  if (!/^[0-9a-fA-F]*$/.test(raw)) throw new Error('INVALID_HEX')
  return raw.toLowerCase()
}

/** ABI-word (32-byte left-padded) encoding of an address for Solidity immutable insertion. */
export function addressImmutableWord(address: string): Uint8Array {
  const body = normalizeHex(address)
  if (body.length !== 40) throw new Error(`ADDRESS_HEX_LENGTH:${body.length}`)
  return arrayify(`0x${body.padStart(64, '0')}`)
}

/**
 * Patch compiler runtime template bytes with constructor immutable values at
 * compiler-specified offsets. Length must match each reference (ABI word = 32).
 */
export function patchImmutableRuntime(input: {
  compilerRuntimeTemplateHex: string
  immutableReferences?: ImmutableReferencesByAstId
  astBindings?: ImmutableAstBinding[]
  immutables: ConstructorImmutables
}): string {
  const refs = input.immutableReferences ?? SMARTSWAP_EXECUTOR_V2_IMMUTABLE_REFERENCES
  const bindings = input.astBindings ?? SMARTSWAP_EXECUTOR_V2_IMMUTABLE_AST_BINDINGS
  const byName = new Map(bindings.map((row) => [row.astId, row.name] as const))
  const template = arrayify(`0x${normalizeHex(input.compilerRuntimeTemplateHex)}`)
  const runtime = new Uint8Array(template)

  for (const [astId, sites] of Object.entries(refs)) {
    const name = byName.get(astId)
    if (!name) throw new Error(`UNKNOWN_IMMUTABLE_AST_ID:${astId}`)
    const word = addressImmutableWord(input.immutables[name])
    for (const site of sites) {
      if (site.length !== 32) throw new Error(`UNEXPECTED_IMMUTABLE_LENGTH:${astId}:${site.length}`)
      if (site.start + site.length > runtime.length) {
        throw new Error(`IMMUTABLE_OFFSET_OOB:${astId}:${site.start}`)
      }
      runtime.set(word, site.start)
    }
  }

  return hexlify(runtime)
}

export function sha256HexBytes(hex: string): string {
  return createHash('sha256').update(Buffer.from(normalizeHex(hex), 'hex')).digest('hex')
}

export function keccak256HexBytes(hex: string): string {
  return keccak256(`0x${normalizeHex(hex)}`)
}

export function derivePostConstructorRuntime(input: {
  compilerRuntimeTemplateHex: string
  immutables: ConstructorImmutables
  immutableReferences?: ImmutableReferencesByAstId
  astBindings?: ImmutableAstBinding[]
}): {
  runtimeHex: string
  sha256: string
  keccak256: string
} {
  const runtimeHex = patchImmutableRuntime(input)
  return {
    runtimeHex,
    sha256: sha256HexBytes(runtimeHex),
    keccak256: keccak256HexBytes(runtimeHex),
  }
}

/** Canonical chain immutables for the Founder deployment package. Owner is Ownable storage, not an immutable. */
export const PACKAGE_CHAIN_IMMUTABLES = {
  bsc: {
    chainId: 56 as const,
    treasury: '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
    wrappedNative: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  },
  ethereum: {
    chainId: 1 as const,
    treasury: '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
    wrappedNative: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
} as const
