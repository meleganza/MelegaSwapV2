import { Connection } from '@solana/web3.js'
import { SOLANA_STORE_RPC_FALLBACK, SOLANA_STORE_RPC_PRIMARY } from './solanaStoreRead'
import { MarcoBridgeError } from './types'

export type SolanaSourceStatus = 'not-found' | 'processed' | 'confirmed' | 'finalized' | 'failed'

export function isSolanaSourceSignature(value: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{80,90}$/.test(value)
}

export async function readSolanaSourceStatus(
  signature: string,
  connectionFactory: (rpcUrl: string) => Pick<Connection, 'getSignatureStatuses'> = (rpcUrl) =>
    new Connection(rpcUrl, 'confirmed'),
): Promise<SolanaSourceStatus> {
  if (!isSolanaSourceSignature(signature)) {
    throw new MarcoBridgeError('SOURCE_FAILED', 'The Solana source signature is invalid.')
  }

  let lastError: unknown
  let receivedRpcResponse = false
  for (const rpcUrl of [SOLANA_STORE_RPC_PRIMARY, SOLANA_STORE_RPC_FALLBACK]) {
    try {
      const response = await connectionFactory(rpcUrl).getSignatureStatuses([signature], {
        searchTransactionHistory: true,
      })
      receivedRpcResponse = true
      const status = response.value[0]
      if (!status) continue
      if (status.err) return 'failed'
      return status.confirmationStatus ?? 'processed'
    } catch (cause) {
      lastError = cause
    }
  }

  if (!receivedRpcResponse && lastError) {
    throw new MarcoBridgeError(
      'QUOTE_FAILED',
      lastError instanceof Error ? lastError.message : 'Solana source status RPC is unavailable.',
    )
  }
  return 'not-found'
}
