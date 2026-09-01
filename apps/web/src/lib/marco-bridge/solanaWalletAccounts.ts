import { Connection, PublicKey } from '@solana/web3.js'
import { SOLANA_STORE_RPC_PRIMARY } from './solanaStoreRead'
import type { SolanaOftOwnerSnapshot } from './solanaOftProtocol'
import { MarcoBridgeError } from './types'

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')

export function findAssociatedMarcoTokenAccount(owner: string, mint: string): string {
  const [ata] = PublicKey.findProgramAddressSync(
    [new PublicKey(owner).toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), new PublicKey(mint).toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )
  return ata.toBase58()
}

export async function readSolanaOwnerAccounts(input: {
  owner: string
  mint: string
  rpcUrl?: string
  connection?: Pick<Connection, 'getBalance' | 'getTokenAccountBalance'>
}): Promise<SolanaOftOwnerSnapshot> {
  const connection = input.connection ?? new Connection(input.rpcUrl ?? SOLANA_STORE_RPC_PRIMARY, 'confirmed')
  const tokenAccount = findAssociatedMarcoTokenAccount(input.owner, input.mint)
  let tokenBalanceLd = '0'
  try {
    const token = await connection.getTokenAccountBalance(new PublicKey(tokenAccount))
    tokenBalanceLd = token.value.amount
  } catch {
    throw new MarcoBridgeError('INSUFFICIENT_MARCO', 'No MARCO token account was found for the connected Solana wallet.')
  }
  const solLamports = String(await connection.getBalance(new PublicKey(input.owner)))
  return {
    owner: input.owner,
    tokenAccount,
    tokenBalanceLd,
    solLamports,
  }
}
