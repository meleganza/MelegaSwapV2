import { Connection, PublicKey } from '@solana/web3.js'
import { findAssociatedMarcoTokenAccount } from './solanaWalletAccounts'
import { SOLANA_STORE_RPC_PRIMARY } from './solanaStoreRead'
import { MARCO_WAVE1_NETWORKS } from './wave1Registry'

/** SPL token account rent-exempt minimum (165-byte Tokenkeg account). */
export const SPL_ATA_RENT_LAMPORTS = 2_039_280

/** LayerZero TYPE_3 + Executor lzReceive(gas=0, value=SPL_ATA_RENT_LAMPORTS). Combines with on-chain enforced CU. */
export const FIRST_RECEIVE_LZ_RECEIVE_EXTRA_OPTIONS =
  '0x00030100210100000000000000000000000000000000000000000000000000000000001f1df0'

export type SolanaFirstReceivePlan = {
  destinationWallet: string
  mint: string
  ata: string
  ataExists: boolean
  extraOptions: string
  ataRentLamports: number
}

export function encodeExecutorLzReceiveOption(gas: bigint | number, value: bigint | number): string {
  const gasHex = BigInt(gas).toString(16).padStart(32, '0')
  const valueBn = BigInt(value)
  if (valueBn === 0n) {
    return `0x000301001101${gasHex}`
  }
  const valueHex = valueBn.toString(16).padStart(32, '0')
  return `0x000301002101${gasHex}${valueHex}`
}

export function firstReceiveExtraOptions(ataExists: boolean): string {
  return ataExists ? '0x' : encodeExecutorLzReceiveOption(0, SPL_ATA_RENT_LAMPORTS)
}

export function planSolanaFirstReceive(input: {
  destinationWallet: string
  ataExists: boolean
  mint?: string
}): SolanaFirstReceivePlan {
  const mint = input.mint ?? MARCO_WAVE1_NETWORKS.solana.marcoIdentity
  const ata = findAssociatedMarcoTokenAccount(input.destinationWallet, mint)
  return {
    destinationWallet: input.destinationWallet,
    mint,
    ata,
    ataExists: input.ataExists,
    extraOptions: firstReceiveExtraOptions(input.ataExists),
    ataRentLamports: input.ataExists ? 0 : SPL_ATA_RENT_LAMPORTS,
  }
}

export async function readSolanaAtaExists(
  ata: string,
  connection: Pick<Connection, 'getAccountInfo'> = new Connection(SOLANA_STORE_RPC_PRIMARY, 'confirmed'),
): Promise<boolean> {
  try {
    const info = await connection.getAccountInfo(new PublicKey(ata))
    return Boolean(info)
  } catch {
    // Fail-closed: unknown ATA → fund rent so first-receive cannot InsufficientBalance.
    return false
  }
}

export async function resolveSolanaFirstReceive(input: {
  destinationWallet: string
  mint?: string
  readAta?: (ata: string) => Promise<boolean>
}): Promise<SolanaFirstReceivePlan> {
  const mint = input.mint ?? MARCO_WAVE1_NETWORKS.solana.marcoIdentity
  const ata = findAssociatedMarcoTokenAccount(input.destinationWallet, mint)
  let ataExists = false
  try {
    ataExists = await (input.readAta ?? readSolanaAtaExists)(ata)
  } catch {
    ataExists = false
  }
  return planSolanaFirstReceive({ destinationWallet: input.destinationWallet, ataExists, mint })
}

/** Existing 20M BNB→Solana message. Do not resend. Create this ATA, then Execute the same GUID. */
export const EXISTING_20M_RECOVERY = {
  sourceTx: '0xc7fe6e70ebe2554ec67c9145d73d5281e23c27f2ed03953c0c85d09db251b842',
  guid: '0x74157354ec7a936fadbb5fe2fd600ed79d32cd336d1a3a47c575ac8ff508625d',
  nonce: 3,
  srcEid: 30102,
  dstEid: 30168,
  destinationWallet: 'bBpaFvmGvGmYGwuvXRb6ZXNHYzra4ed6tt7qRp3WK7Y',
  mint: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
  amountMarco: '20000000',
  scanUrl:
    'https://layerzeroscan.com/tx/0xc7fe6e70ebe2554ec67c9145d73d5281e23c27f2ed03953c0c85d09db251b842',
  doNot: ['resend', 'skip', 'nilify', 'burn'] as const,
} as const

export function existing20mAtaCreatePlan() {
  const plan = planSolanaFirstReceive({
    destinationWallet: EXISTING_20M_RECOVERY.destinationWallet,
    ataExists: false,
    mint: EXISTING_20M_RECOVERY.mint,
  })
  return {
    ...EXISTING_20M_RECOVERY,
    ata: plan.ata,
    rentLamports: SPL_ATA_RENT_LAMPORTS,
    instruction: 'CreateAssociatedTokenAccount' as const,
    broadcast: false,
    afterAtaExists: 'Execute the SAME LayerZero message on Scan. Do not send a second BNB transfer.',
  }
}
