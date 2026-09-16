import { describe, expect, it } from 'vitest'
import {
  getActiveMarcoConnectSdk,
  readMCreditsAvailable,
  registerActiveMarcoConnectSdk,
} from '../marcoConnectSession'

describe('MARCO Connect M-Credits session helper', () => {
  it('reads a known available balance and ignores unknown snapshots', () => {
    expect(readMCreditsAvailable({ mCredits: { available: 29, known: true } })).toBe(29)
    expect(readMCreditsAvailable({ mCredits: { available: '40.50', known: true } })).toBe(40.5)
    expect(readMCreditsAvailable({ mCredits: { available: 12, known: false } })).toBeNull()
    expect(readMCreditsAvailable({ mCredits: null })).toBeNull()
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
