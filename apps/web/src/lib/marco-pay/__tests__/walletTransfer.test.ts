import { describe, expect, it } from 'vitest';
import { buildMarcoPayWalletTransfer, marcoMinorToTokenRaw } from '../walletTransfer'
import { MARCO_PAY_EVM_TREASURY, MARCO_PAY_NETWORKS, MARCO_PAY_SOLANA_TREASURY } from '../networks'

describe('MARCO Pay wallet transfer', () => {
  it('builds a complete ERC-20 transfer to the Melega treasury before wallet request', () => {
    const transfer = buildMarcoPayWalletTransfer({
      marcoAmountMinor: '26018510',
      destinationWallet: MARCO_PAY_EVM_TREASURY,
      chainId: 56,
    })
    expect(transfer.family).toBe('evm')
    if (transfer.family !== 'evm') throw new Error('expected EVM transfer')
    expect(transfer.chainId).toBe(56)
    expect(transfer.destination).toBe(MARCO_PAY_EVM_TREASURY)
    expect(transfer.tokenAddress).toBe(MARCO_PAY_NETWORKS.bnb.tokenAddress)
    expect(transfer.to).toBe(MARCO_PAY_NETWORKS.bnb.tokenAddress)
    expect(transfer.value).toBe('0x0')
    expect(transfer.tokenAmountRaw).toBe(marcoMinorToTokenRaw('26018510', 18))
    expect(transfer.data.startsWith('0xa9059cbb')).toBe(true)
    expect(transfer.data).toContain(MARCO_PAY_EVM_TREASURY.slice(2).toLowerCase())
  })

  it.each(['bnb', 'polygon', 'robinhood', 'arc'] as const)('builds the canonical %s EVM transfer', (networkId) => {
    const network = MARCO_PAY_NETWORKS[networkId]
    const transfer = buildMarcoPayWalletTransfer({
      marcoAmountMinor: '1234',
      networkId,
      chainId: network.chainId,
      destinationWallet: MARCO_PAY_EVM_TREASURY,
      tokenAddress: network.tokenAddress,
    })
    expect(transfer.family).toBe('evm')
    expect(transfer.networkId).toBe(networkId)
    expect(transfer.tokenAddress).toBe(network.tokenAddress)
    expect(transfer.destination).toBe(MARCO_PAY_EVM_TREASURY)
  })

  it('returns a fail-closed Solana approval target without inventing a client transaction', () => {
    const target = buildMarcoPayWalletTransfer({
      marcoAmountMinor: '1234',
      networkId: 'solana',
      destinationWallet: MARCO_PAY_SOLANA_TREASURY,
      tokenAddress: MARCO_PAY_NETWORKS.solana.tokenAddress,
    })
    expect(target).toEqual({
      family: 'solana',
      networkId: 'solana',
      chainId: null,
      tokenAddress: MARCO_PAY_NETWORKS.solana.tokenAddress,
      destination: MARCO_PAY_SOLANA_TREASURY,
      marcoAmountMinor: '1234',
      tokenAmountRaw: marcoMinorToTokenRaw('1234', 9),
      approvalRequired: true,
    })
  })

  it('fails closed on a non-treasury destination or wrong chain', () => {
    expect(() =>
      buildMarcoPayWalletTransfer({
        marcoAmountMinor: '26018510',
        destinationWallet: '0x000000000000000000000000000000000000dead',
      }),
    ).toThrow('SETTLEMENT_WALLET_NOT_TREASURY')
    expect(() =>
      buildMarcoPayWalletTransfer({
        marcoAmountMinor: '26018510',
        destinationWallet: MARCO_PAY_EVM_TREASURY,
        chainId: 1,
      }),
    ).toThrow('NETWORK_UNSUPPORTED')
  })
})
