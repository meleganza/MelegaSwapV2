import { describe, expect, it } from 'vitest'
import {
  MARCO_PAY_EVM_TREASURY,
  MARCO_PAY_NETWORKS,
  MARCO_PAY_NETWORK_LIST,
  MARCO_PAY_SOLANA_TREASURY,
  resolveMarcoPayNetwork,
} from '../networks'

describe('MARCO Pay multichain registry', () => {
  it('contains only the five Founder-authorised networks', () => {
    expect(MARCO_PAY_NETWORK_LIST.map((network) => network.id)).toEqual([
      'bnb',
      'polygon',
      'robinhood',
      'arc',
      'solana',
    ])
  })

  it('binds every EVM network to the canonical EVM treasury', () => {
    for (const id of ['bnb', 'polygon', 'robinhood', 'arc'] as const) {
      expect(MARCO_PAY_NETWORKS[id].treasuryWallet).toBe(MARCO_PAY_EVM_TREASURY)
    }
    expect(MARCO_PAY_NETWORKS.solana.treasuryWallet).toBe(MARCO_PAY_SOLANA_TREASURY)
  })

  it('resolves known chain ids and fails closed for unauthorised networks', () => {
    expect(resolveMarcoPayNetwork({ chainId: 56 })?.id).toBe('bnb')
    expect(resolveMarcoPayNetwork({ chainId: 137 })?.id).toBe('polygon')
    expect(resolveMarcoPayNetwork({ chainId: 4663 })?.id).toBe('robinhood')
    expect(resolveMarcoPayNetwork({ chainId: 5042 })?.id).toBe('arc')
    expect(resolveMarcoPayNetwork({ networkId: 'solana' })?.id).toBe('solana')
    expect(resolveMarcoPayNetwork({ chainId: 1 })).toBeNull()
    expect(resolveMarcoPayNetwork({ networkId: 'base' })).toBeNull()
  })
})
