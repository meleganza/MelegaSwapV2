import { describe, expect, it, vi } from 'vitest'
import { readSolanaSourceStatus } from '../solanaSourceStatus'

const signature = '5bbJiLYf5eGq5yoMMVTw8zGwifm5csdRLQsMyomrKSMa5GbWqkGBCPFdvBfohXFp3SkBepiUofRHbD9B6rfXJnMW'

describe('Solana source broadcast truth', () => {
  it('falls back across RPCs and returns the observed confirmation state', async () => {
    const getSignatureStatuses = vi
      .fn()
      .mockResolvedValueOnce({ value: [null] })
      .mockResolvedValueOnce({ value: [{ err: null, confirmationStatus: 'confirmed' }] })
    const status = await readSolanaSourceStatus(signature, () => ({ getSignatureStatuses } as never))
    expect(status).toBe('confirmed')
    expect(getSignatureStatuses).toHaveBeenCalledTimes(2)
  })

  it('distinguishes an on-chain failure from a missing broadcast', async () => {
    await expect(
      readSolanaSourceStatus(
        signature,
        () =>
          ({
            getSignatureStatuses: async () => ({ value: [{ err: { InstructionError: [2, 'failed'] } }] }),
          } as never),
      ),
    ).resolves.toBe('failed')

    await expect(
      readSolanaSourceStatus(signature, () => ({ getSignatureStatuses: async () => ({ value: [null] }) } as never)),
    ).resolves.toBe('not-found')
  })

  it('accepts a successful fallback response when the primary RPC is unavailable', async () => {
    const getSignatureStatuses = vi
      .fn()
      .mockRejectedValueOnce(new Error('primary unavailable'))
      .mockResolvedValueOnce({ value: [null] })
    await expect(readSolanaSourceStatus(signature, () => ({ getSignatureStatuses } as never))).resolves.toBe(
      'not-found',
    )
  })
})
