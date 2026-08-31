import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import {
  SET_OFT_CONFIG_PAUSED_FALSE_DATA,
  SOLANA_OFT_ADMIN,
  SOLANA_OFT_PROGRAM_ID,
  SOLANA_UNPAUSE_ACTION,
  assertConnectedSolanaUnpauseWallet,
} from './solanaUnpause'

export function encodeSetOftConfigPausedFalseData(): Buffer {
  return Buffer.from(SET_OFT_CONFIG_PAUSED_FALSE_DATA, 'hex')
}

export function buildSolanaUnpauseInstruction(): TransactionInstruction {
  return new TransactionInstruction({
    programId: new PublicKey(SOLANA_OFT_PROGRAM_ID),
    keys: [
      { pubkey: new PublicKey(SOLANA_OFT_ADMIN), isSigner: true, isWritable: false },
      { pubkey: new PublicKey(SOLANA_UNPAUSE_ACTION.store), isSigner: false, isWritable: true },
    ],
    data: encodeSetOftConfigPausedFalseData(),
  })
}

export function buildSolanaUnpauseTransaction(input: {
  connectedPublicKey: string
  recentBlockhash: string
}): Transaction {
  assertConnectedSolanaUnpauseWallet(input.connectedPublicKey)
  const tx = new Transaction({
    feePayer: new PublicKey(SOLANA_OFT_ADMIN),
    recentBlockhash: input.recentBlockhash,
  })
  tx.add(buildSolanaUnpauseInstruction())
  if (tx.instructions.length !== 1) throw new Error('Unpause transaction must contain exactly one instruction.')
  const ix = tx.instructions[0]
  if (ix.programId.toBase58() !== SOLANA_OFT_PROGRAM_ID) throw new Error('Unpause transaction program mismatch.')
  if (ix.data.toString('hex') !== SET_OFT_CONFIG_PAUSED_FALSE_DATA) {
    throw new Error('Unpause transaction data is not Paused(false).')
  }
  return tx
}
