import { describe, expect, it } from 'vitest'
import { MARCO_BRIDGE_PROGRESS, bridgeRecoveryMessage } from '../lifecycle'
import { assertMarcoBridgePreflight } from '../preflight'
import { planMarcoBridgeRoute } from '../routePolicy'
import { marcoBridgeService } from '../service'
import { isValidMarcoDestination, requiresExplicitDestination } from '../validation'
import { MARCO_WAVE1_NETWORKS, MARCO_WAVE1_PUBLIC_ACTIVATION, wave1ActivationBlockers } from '../wave1Registry'

const evm = '0x1111111111111111111111111111111111111111'
const solana = '6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF'

describe('MARCO Wave-1 bridge product', () => {
  it('supports the certified EVM to EVM direct route', () => {
    expect(planMarcoBridgeRoute('bnb', 'base')).toMatchObject({ kind: 'direct', legs: ['bnb', 'base'] })
  })

  it('requires an explicit Solana destination for EVM to Solana', () => {
    expect(requiresExplicitDestination('evm', 'solana')).toBe(true)
    expect(isValidMarcoDestination(solana, 'solana')).toBe(true)
    expect(isValidMarcoDestination(evm, 'solana')).toBe(false)
  })

  it('requires an explicit EVM destination for Solana to EVM', () => {
    expect(requiresExplicitDestination('solana', 'evm')).toBe(true)
    expect(isValidMarcoDestination(evm, 'evm')).toBe(true)
    expect(isValidMarcoDestination(solana, 'evm')).toBe(false)
  })

  it('guides non-direct pairs through BNB without pretending atomicity', () => {
    expect(planMarcoBridgeRoute('base', 'solana')).toEqual({
      kind: 'via-bnb',
      legs: ['base', 'bnb', 'solana'],
      enabled: false,
    })
  })

  it('fails preflight on the wrong source network', () => {
    expect(() =>
      assertMarcoBridgePreflight({
        from: 'bnb',
        to: 'base',
        amount: '1',
        marcoBalance: '10',
        nativeGasBalance: '1',
        minimumNativeGas: '.001',
        connectedEvmChainId: 8453,
        destinationWallet: evm,
      }),
    ).toThrow('Switch your wallet')
  })

  it('fails preflight on an invalid cross-family destination', () => {
    expect(() =>
      assertMarcoBridgePreflight({
        from: 'bnb',
        to: 'solana',
        amount: '1',
        marcoBalance: '10',
        nativeGasBalance: '1',
        minimumNativeGas: '.001',
        connectedEvmChainId: 56,
        destinationWallet: evm,
      }),
    ).toThrow('valid Solana wallet')
  })

  it('fails preflight for insufficient MARCO and insufficient gas', () => {
    expect(() =>
      assertMarcoBridgePreflight({
        from: 'bnb',
        to: 'base',
        amount: '11',
        marcoBalance: '10',
        nativeGasBalance: '1',
        minimumNativeGas: '.001',
        connectedEvmChainId: 56,
        destinationWallet: evm,
      }),
    ).toThrow('Insufficient MARCO')
    expect(() =>
      assertMarcoBridgePreflight({
        from: 'bnb',
        to: 'base',
        amount: '1',
        marcoBalance: '10',
        nativeGasBalance: '0',
        minimumNativeGas: '.001',
        connectedEvmChainId: 56,
        destinationWallet: evm,
      }),
    ).toThrow('Insufficient native gas')
  })

  it('keeps source-confirmed delivery pending on the same GUID', () => {
    const message = bridgeRecoveryMessage({ status: 'verifying', sourceTx: '0xabc', guid: 'guid-1' })
    expect(message).toContain('do not resend')
    expect(MARCO_BRIDGE_PROGRESS.map((step) => step.status)).toEqual([
      'submitted',
      'source-confirmed',
      'verifying',
      'destination-executing',
      'delivered',
    ])
  })

  it('distinguishes source failure from delivered state', () => {
    expect(bridgeRecoveryMessage({ status: 'source-failed' })).toContain('no cross-chain delivery started')
    expect(bridgeRecoveryMessage({ status: 'delivered', destinationTx: '0xdef' })).toContain('delivered')
  })

  it('keeps Base locked and requires a wallet for activated routes', async () => {
    expect(MARCO_WAVE1_PUBLIC_ACTIVATION.enabled).toBe(true)
    expect(MARCO_WAVE1_NETWORKS.solana.protectivePaused).toBe(true)
    expect(wave1ActivationBlockers().some((blocker) => /Solana/i.test(blocker))).toBe(true)
    await expect(
      marcoBridgeService.submit(
        { from: 'bnb', to: 'base', amount: '1', sourceWallet: evm, destinationWallet: evm },
        {
          amount: '1',
          expectedReceive: '1',
          nativeFee: '0.001',
          nativeFeeWei: '1000000000000000',
          nativeFeeSymbol: 'BNB',
          routeLabel: 'BNB → Base',
          quotedAt: '2026-08-26T00:00:00.000Z',
          live: true,
          routePaused: false,
          publiclyActive: false,
          executionEnabled: false,
        },
      ),
    ).rejects.toThrow('Base routes are not activated')
    await expect(
      marcoBridgeService.submit(
        { from: 'bnb', to: 'robinhood', amount: '1', sourceWallet: evm, destinationWallet: evm },
        {
          amount: '1',
          expectedReceive: '1',
          nativeFee: '0.001',
          nativeFeeWei: '1000000000000000',
          nativeFeeSymbol: 'BNB',
          routeLabel: 'BNB → Robinhood',
          quotedAt: '2026-08-26T00:00:00.000Z',
          live: true,
          routePaused: false,
          publiclyActive: true,
          executionEnabled: true,
        },
      ),
    ).rejects.toThrow('connected wallet')
  })
})
