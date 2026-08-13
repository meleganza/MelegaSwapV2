import { describe, expect, it } from 'vitest'
import { resolveReceiptOutcome } from '../resolveReceiptOutcome'

describe('resolveReceiptOutcome', () => {
  it('confirms only a successful receipt', async () => {
    await expect(resolveReceiptOutcome({ wait: async () => ({ status: 1 }) })).resolves.toEqual({
      status: 'confirmed',
      reason: null,
    })
  })

  it('marks an explicit reverted receipt as failed', async () => {
    await expect(resolveReceiptOutcome({ wait: async () => ({ status: 0 }) })).resolves.toEqual({
      status: 'failed',
      reason: 'Transaction reverted on-chain.',
    })
  })

  it('keeps provider uncertainty in submitted state', async () => {
    await expect(
      resolveReceiptOutcome({
        wait: async () => {
          throw new Error('provider timeout')
        },
      }),
    ).resolves.toEqual({
      status: 'submitted',
      reason: 'Transaction submitted; receipt verification is still pending.',
    })
  })

  it('extracts a reverted receipt from a provider error', async () => {
    await expect(
      resolveReceiptOutcome({
        wait: async () => {
          throw Object.assign(new Error('call exception'), { receipt: { status: 0 } })
        },
      }),
    ).resolves.toEqual({
      status: 'failed',
      reason: 'Transaction reverted on-chain.',
    })
  })
})
