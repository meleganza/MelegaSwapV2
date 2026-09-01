import { PublicKey } from '@solana/web3.js'

/** Certified Solana OFT program that owns the Wave-1 store. */
export const SOLANA_OFT_PROGRAM_ID = 'Gti4f873FUw5jpMa4wnRVcZDjr5YwonZ1FcY8vXu2Wnm'
export const SOLANA_LZ_ENDPOINT_PROGRAM_ID = '76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6'
/** Store admin. System-owned funded wallet. May administer the OFT; not the dedicated unpause role. */
export const SOLANA_OFT_ADMIN = 'BRhBJ8iX2wcMPKe4SqiPK2K3ZbegmVDEiWtiSFLJ1aRd'
/**
 * Dedicated pauser and unpauser on the live store (Option<Pubkey> = Some).
 * System-owned funded account (0.001 SOL, datalen 0) — a keypair can exist.
 * Not a program-owned PDA.
 */
export const SOLANA_OFT_UNPAUSER = '2v7LMbWU2E9gB4So24jpWsjU9hR2CHHL9ggegRiWHZ8F'
export const SOLANA_OFT_PAUSER = SOLANA_OFT_UNPAUSER
export const SOLANA_OFT_ESCROW = 'Cd1H2o5kcb2ZcpxcEJfiypPQvDKc2jA164bhmm51iS5'

/** Misaligned 32-byte windows from a packed Option<Pubkey> parse. Do not ask anyone to sign as these. */
export const SOLANA_OFT_FALSE_AUTHORITIES = [
  '5Lah4wSAUUcfupdXR54RdVtt4ttxioJKGaDugjB2mXD',
  'AxkKgEKrDPJoyfKHeBxp7MghM8jrL5efajYtWX8uxqep',
] as const

export type ParsedOftStore = {
  programId: string
  mint: string
  escrow: string
  endpointProgram: string
  admin: string
  paused: boolean
  pauser: string | null
  unpauser: string | null
  ld2sdRate: number
}

function encodeBase58(bytes: Uint8Array): string {
  return new PublicKey(bytes).toBase58()
}

function readOptionPubkey(raw: Uint8Array, offset: number): { value: string | null; next: number } {
  const tag = raw[offset]
  if (tag === 0) return { value: null, next: offset + 1 }
  if (tag !== 1) throw new Error('OFT store Option<Pubkey> tag is invalid.')
  return { value: encodeBase58(raw.slice(offset + 1, offset + 33)), next: offset + 33 }
}

/** Decode the live LayerZero OFT store layout (8-byte disc + packed Option pauser/unpauser). */
export function parseOftStoreAccount(raw: Uint8Array, ownerProgram: string): ParsedOftStore {
  if (raw.length < 221) throw new Error('OFT store account is truncated.')
  let offset = 8
  offset += 1 // oft_type
  const ld2sdRate = Number(new DataView(raw.buffer, raw.byteOffset + offset, 8).getBigUint64(0, true))
  offset += 8
  const mint = encodeBase58(raw.slice(offset, offset + 32))
  offset += 32
  const escrow = encodeBase58(raw.slice(offset, offset + 32))
  offset += 32
  const endpointProgram = encodeBase58(raw.slice(offset, offset + 32))
  offset += 32
  offset += 1 // bump
  offset += 8 // tvl_ld
  const admin = encodeBase58(raw.slice(offset, offset + 32))
  offset += 32
  offset += 2 // default_fee_bps
  const paused = raw[offset] === 1
  offset += 1
  const pauser = readOptionPubkey(raw, offset)
  const unpauser = readOptionPubkey(raw, pauser.next)
  return {
    programId: ownerProgram,
    mint,
    escrow,
    endpointProgram,
    admin,
    paused,
    pauser: pauser.value,
    unpauser: unpauser.value,
    ld2sdRate,
  }
}

export function assertSolanaUnpauseSigner(store: ParsedOftStore): string {
  if (!store.paused) throw new Error('Solana OFT store is already unpaused.')
  if (!store.unpauser) throw new Error('Solana OFT store has no unpauser.')
  if (SOLANA_OFT_FALSE_AUTHORITIES.includes(store.unpauser as (typeof SOLANA_OFT_FALSE_AUTHORITIES)[number])) {
    throw new Error('Refusing a misaligned OFT authority window that cannot sign.')
  }
  return store.unpauser
}
