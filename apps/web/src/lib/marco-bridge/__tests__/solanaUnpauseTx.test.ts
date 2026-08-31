import { describe, expect, it } from 'vitest'
import {
  SET_OFT_CONFIG_PAUSED_FALSE_DATA,
  SOLANA_OFT_ADMIN,
  SOLANA_OFT_PROGRAM_ID,
  SOLANA_OFT_UNPAUSER,
  assertConnectedSolanaUnpauseWallet,
} from '../solanaUnpause'
import { buildSolanaUnpauseInstruction, buildSolanaUnpauseTransaction } from '../solanaUnpauseTx'

describe('Solana unpause operator transaction', () => {
  it('encodes only set_oft_config Paused(false) for the certified admin and store', () => {
    const ix = buildSolanaUnpauseInstruction()
    expect(ix.programId.toBase58()).toBe(SOLANA_OFT_PROGRAM_ID)
    expect(ix.data.toString('hex')).toBe(SET_OFT_CONFIG_PAUSED_FALSE_DATA)
    expect(ix.keys).toHaveLength(2)
    expect(ix.keys[0]).toMatchObject({ isSigner: true, isWritable: false })
    expect(ix.keys[0].pubkey.toBase58()).toBe(SOLANA_OFT_ADMIN)
    expect(ix.keys[1]).toMatchObject({ isSigner: false, isWritable: true })
    expect(ix.keys[1].pubkey.toBase58()).toBe('7L8x99W1yVVgtsu3wWy9DgD9ysnnfF4XXhdKhUrQxEuW')
  })

  it('fail-closes unless the connected wallet is the certified admin', () => {
    expect(() => assertConnectedSolanaUnpauseWallet(SOLANA_OFT_UNPAUSER)).toThrow(/certified OFT admin/)
    expect(() =>
      buildSolanaUnpauseTransaction({
        connectedPublicKey: SOLANA_OFT_UNPAUSER,
        recentBlockhash: '11111111111111111111111111111111',
      }),
    ).toThrow(/certified OFT admin/)
    expect(assertConnectedSolanaUnpauseWallet(SOLANA_OFT_ADMIN)).toBe(SOLANA_OFT_ADMIN)
  })

  it('builds a single-instruction fee-payer transaction', () => {
    const tx = buildSolanaUnpauseTransaction({
      connectedPublicKey: SOLANA_OFT_ADMIN,
      recentBlockhash: '11111111111111111111111111111111',
    })
    expect(tx.feePayer?.toBase58()).toBe(SOLANA_OFT_ADMIN)
    expect(tx.instructions).toHaveLength(1)
    expect(tx.instructions[0].data.toString('hex')).toBe('377e57d99f4218c20300')
  })
})
