import { PublicKey } from '@solana/web3.js'
import { MARCO_WAVE1_NETWORKS } from './wave1Registry'

/** Certified Solana OFT program that owns the Wave-1 store. */
export const SOLANA_OFT_PROGRAM_ID = 'Gti4f873FUw5jpMa4wnRVcZDjr5YwonZ1FcY8vXu2Wnm'
export const SOLANA_LZ_ENDPOINT_PROGRAM_ID = '76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6'
/** Store admin. On-curve system wallet. Proven signer for set_oft_config Paused(false). */
export const SOLANA_OFT_ADMIN = 'BRhBJ8iX2wcMPKe4SqiPK2K3ZbegmVDEiWtiSFLJ1aRd'
/**
 * Dedicated pauser/unpauser field on the live store (Option<Pubkey> = Some).
 * Off-curve PDA — not a human signer. Do not ask anyone to sign as this address.
 */
export const SOLANA_OFT_UNPAUSER = '2v7LMbWU2E9gB4So24jpWsjU9hR2CHHL9ggegRiWHZ8F'
export const SOLANA_OFT_PAUSER = SOLANA_OFT_UNPAUSER
export const SOLANA_OFT_ESCROW = 'Cd1H2o5kcb2ZcpxcEJfiypPQvDKc2jA164bhmm51iS5'

/** Anchor `global:set_oft_config` + enum variant 3 Paused + false. */
export const SET_OFT_CONFIG_PAUSED_FALSE_DATA = '377e57d99f4218c20300'

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
  if (store.admin !== SOLANA_OFT_ADMIN) throw new Error('Live OFT admin does not match the certified signer.')
  if (store.unpauser && SOLANA_OFT_FALSE_AUTHORITIES.includes(store.unpauser as (typeof SOLANA_OFT_FALSE_AUTHORITIES)[number])) {
    throw new Error('Refusing a misaligned OFT authority window that cannot sign.')
  }
  return SOLANA_OFT_ADMIN
}

export function assertConnectedSolanaUnpauseWallet(connectedPublicKey: string): string {
  if (connectedPublicKey !== SOLANA_OFT_ADMIN) {
    throw new Error(`Connected wallet is not the certified OFT admin ${SOLANA_OFT_ADMIN}.`)
  }
  return SOLANA_OFT_ADMIN
}

export const SOLANA_UNPAUSE_ACTION = {
  network: 'solana-mainnet',
  purpose: 'Unpause the certified MARCO OFT store so BNB↔Solana delivery can execute.',
  programId: SOLANA_OFT_PROGRAM_ID,
  store: MARCO_WAVE1_NETWORKS.solana.endpointContract,
  mint: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
  signer: SOLANA_OFT_ADMIN,
  signerRole: 'admin',
  admin: SOLANA_OFT_ADMIN,
  instruction: 'set_oft_config',
  anchorLog: 'SetOftConfig',
  config: 'Paused(false)',
  dataHex: SET_OFT_CONFIG_PAUSED_FALSE_DATA,
  paused: false,
  doNot: [
    'Do not redeploy the Solana OFT.',
    'Do not change peers.',
    'Do not change ULN/DVN/enforced options.',
    'Do not alter mint or freeze authority.',
    'Do not ask the off-curve unpauser PDA to sign.',
  ],
} as const

export function solanaUnpauseOperatorMessage(): string {
  return [
    `Sign set_oft_config Paused(false) on Solana OFT program ${SOLANA_OFT_PROGRAM_ID}`,
    `store ${SOLANA_UNPAUSE_ACTION.store}`,
    `using the store admin wallet ${SOLANA_OFT_ADMIN}.`,
    `Do not sign as ${SOLANA_OFT_UNPAUSER} — that unpauser field is an off-curve PDA.`,
    'Peers, ULN, DVN, enforced options, mint, and freeze authority are untouched.',
  ].join(' ')
}
