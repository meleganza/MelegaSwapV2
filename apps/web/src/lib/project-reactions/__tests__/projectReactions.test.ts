import { ethers, Wallet } from 'ethers'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@vercel/blob', () => ({
  del: vi.fn(),
  list: vi.fn(),
  put: vi.fn(),
}))
import {
  PROJECT_REACTION_IDS,
  buildProjectReactionMessage,
} from '../contract'
import {
  clearProjectReactionsForTests,
  loadProjectReactionSnapshot,
  setProjectReaction,
} from '../store'

describe('project reactions', () => {
  beforeEach(() => {
    clearProjectReactionsForTests()
    delete process.env.BLOB_READ_WRITE_TOKEN
  })

  it('supports five independent reactions per wallet with idempotent counters', async () => {
    const walletA = Wallet.createRandom().address
    const walletB = Wallet.createRandom().address
    await setProjectReaction({ slug: 'mm72', account: walletA, reaction: 'like', active: true })
    await setProjectReaction({ slug: 'mm72', account: walletA, reaction: 'bullish', active: true })
    await setProjectReaction({ slug: 'mm72', account: walletA, reaction: 'like', active: true })
    await setProjectReaction({ slug: 'mm72', account: walletB, reaction: 'like', active: true })

    const snapshot = await loadProjectReactionSnapshot('mm72', walletA)
    expect(snapshot.counts.like).toBe(2)
    expect(snapshot.counts.bullish).toBe(1)
    expect(snapshot.selected).toEqual(['like', 'bullish'])
    expect(PROJECT_REACTION_IDS).toContain('bearish')
  })

  it('uses a wallet-verifiable, state-specific message', async () => {
    const wallet = Wallet.createRandom()
    const message = buildProjectReactionMessage({
      slug: 'mm72',
      account: wallet.address,
      reaction: 'moon',
      active: true,
      signedAt: '2026-08-15T09:00:00.000Z',
    })
    const signature = await wallet.signMessage(message)
    expect(ethers.utils.verifyMessage(message, signature).toLowerCase()).toBe(wallet.address.toLowerCase())
    expect(message).toContain('does not authorize a transaction or transfer funds')
  })
})
