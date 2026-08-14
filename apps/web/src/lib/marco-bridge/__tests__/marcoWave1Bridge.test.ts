import { describe, expect, it } from 'vitest'
import { MARCO_BRIDGE_PROGRESS, bridgeRecoveryMessage } from '../lifecycle'
import { planMarcoBridgeRoute } from '../routePolicy'
import { marcoBridgeService } from '../service'
import { isValidMarcoDestination, requiresExplicitDestination } from '../validation'
import { MARCO_WAVE1_NETWORKS, MARCO_WAVE1_PUBLIC_ACTIVATION, wave1ActivationBlockers } from '../wave1Registry'

const evm = '0x1111111111111111111111111111111111111111'
const solana = '2LxB111111111111111111111111111111111Rzb'

describe('MARCO Wave-1 bridge product', () => {
  it('supports the certified EVM direct route and labels indirect routes honestly', () => {
    expect(planMarcoBridgeRoute('bnb', 'base')).toMatchObject({ kind: 'direct', legs: ['bnb', 'base'] })
    expect(planMarcoBridgeRoute('base', 'solana')).toEqual({
      kind: 'via-bnb',
      legs: ['base', 'bnb', 'solana'],
      enabled: false,
    })
  })

  it('validates explicit cross-family destinations', () => {
    expect(requiresExplicitDestination('evm', 'solana')).toBe(true)
    expect(requiresExplicitDestination('solana', 'evm')).toBe(true)
    expect(isValidMarcoDestination(solana, 'solana')).toBe(true)
    expect(isValidMarcoDestination(evm, 'evm')).toBe(true)
    expect(isValidMarcoDestination(evm, 'solana')).toBe(false)
  })

  it('keeps source-confirmed delivery pending on the same transfer', () => {
    expect(bridgeRecoveryMessage({ status: 'verifying', sourceTx: '0xabc', guid: 'guid-1' })).toContain('do not resend')
    expect(MARCO_BRIDGE_PROGRESS.map((step) => step.status)).toEqual([
      'submitted',
      'source-confirmed',
      'verifying',
      'destination-executing',
      'delivered',
    ])
  })

  it('fails closed until canonical public activation', async () => {
    expect(MARCO_WAVE1_PUBLIC_ACTIVATION.enabled).toBe(false)
    expect(MARCO_WAVE1_NETWORKS.solana.protectivePaused).toBe(true)
    expect(wave1ActivationBlockers().length).toBeGreaterThan(1)
    await expect(
      marcoBridgeService.quote({ from: 'bnb', to: 'base', amount: '1', sourceWallet: evm, destinationWallet: evm }),
    ).rejects.toThrow('configuration')
  })
})
