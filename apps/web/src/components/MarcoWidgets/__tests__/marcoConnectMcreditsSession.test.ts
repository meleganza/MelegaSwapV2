import { describe, expect, it } from 'vitest'
import {
  getActiveMarcoConnectSdk,
  readMCreditsAvailable,
  readPassportWalletAddress,
  registerActiveMarcoConnectSdk,
} from '../marcoConnectSession'

describe('MARCO Connect M-Credits session helper', () => {
  it('reads a known available balance and ignores unknown snapshots', () => {
    expect(readMCreditsAvailable({ mCredits: { available: 29, known: true } })).toBe(29)
    expect(readMCreditsAvailable({ mCredits: { available: '40.50', known: true } })).toBe(40.5)
    expect(readMCreditsAvailable({ mCredits: { available: 12, known: false } })).toBeNull()
    expect(readMCreditsAvailable({ mCredits: null })).toBeNull()
    expect(readPassportWalletAddress({ wallet: { address: '0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e' } })).toBe(
      '0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e',
    )
    expect(readPassportWalletAddress({ wallet: { address: 'not-a-wallet' } })).toBeNull()
  })

  it('registers the mounted header SDK for checkout without a second widget', () => {
    const sdk = {
      getState: () => ({ connected: true, mCredits: { available: 10, known: true } }),
    }
    registerActiveMarcoConnectSdk(sdk)
    expect(getActiveMarcoConnectSdk()).toBe(sdk)
    registerActiveMarcoConnectSdk(null)
    expect(getActiveMarcoConnectSdk()).toBeNull()
  })
})
