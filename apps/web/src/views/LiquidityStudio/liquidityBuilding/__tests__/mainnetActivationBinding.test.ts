/**
 * Mainnet activation — binding, readiness, errors (no fabricated deployment).
 */
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  LB_CANONICAL_DEPLOYED_ADDRESSES,
  LB_MELEGA_AMM,
  lbCoreContractsBound,
  readCanonicalLbAddresses,
} from 'config/constants/liquidityBuildingDeployment'
import {
  LB_DEPLOYED_ADDRESSES,
  assessExecutionReadiness,
  isDeployedAddress,
  resolveProductionBinding,
} from '../addresses'
import {
  classifyWalletError,
  humanizeActivationFailure,
} from '../activationErrors'
import { canSubmitMutatingAction, BLOCKED_ACTIVATION_GATES } from '../programStatus'

const ROOT = path.resolve(__dirname, '../../../../../../../')
const CHAIN56 = path.join(ROOT, 'deployments/liquidity-building/chain-56')

describe('LB mainnet activation binding + readiness', () => {
  it('canonical config is the single frontend source and remains unbound', () => {
    expect(LB_MELEGA_AMM.factory).toBe('0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C')
    expect(LB_MELEGA_AMM.router).toBe('0xc25033218D181b27D4a2944Fbb04FC055da4EAB3')
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFactory).toBeNull()
    expect(lbCoreContractsBound()).toBe(false)
    expect(LB_DEPLOYED_ADDRESSES).toEqual(readCanonicalLbAddresses())
  })

  it('deployed-addresses artifact mirrors null frontend binding', () => {
    const artifact = JSON.parse(readFileSync(path.join(CHAIN56, 'deployed-addresses.v1.json'), 'utf8'))
    expect(artifact.chainId).toBe(56)
    expect(artifact.mainnetDeployExecuted).toBe(false)
    expect(artifact.addresses.lbFactory).toBeNull()
    expect(artifact.addresses.lbAuthorizer).toBeNull()
    expect(artifact.addresses.lbFeeSink).toBeNull()
    expect(artifact.addresses.melegaFactory).toBe(LB_MELEGA_AMM.factory)
  })

  it('execution readiness is BLOCKED while addresses are null', () => {
    const r = assessExecutionReadiness()
    expect(r.ready).toBe(false)
    expect(r.status).toBe('BLOCKED')
    expect(r.missing).toEqual(['LB Factory', 'LB Authorizer', 'LB FeeSink'])
  })

  it('execution readiness becomes READY only for a full verified candidate (unit path)', () => {
    const bound = resolveProductionBinding({
      chainId: 56,
      deploymentReadinessState: 'DEPLOYED',
      activationAuthorized: true,
      lbFactory: '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C',
      lbAuthorizer: '0x2222222222222222222222222222222222222222',
      lbFeeSink: '0x3333333333333333333333333333333333333333',
    })
    expect(bound.ok).toBe(true)
    if (bound.ok) {
      const r = assessExecutionReadiness(bound.addresses)
      expect(r.status).toBe('READY')
      expect(r.ready).toBe(true)
    }
  })

  it('mutating actions stay fail-closed without deployment', () => {
    expect(
      canSubmitMutatingAction({
        walletConnected: true,
        correctChain: true,
        gates: BLOCKED_ACTIVATION_GATES,
      }).ok,
    ).toBe(false)
  })

  it('wallet rejection and RPC failures map to honest messages', () => {
    expect(classifyWalletError({ message: 'User rejected the request' })).toBe('WALLET_REJECTED')
    expect(classifyWalletError({ message: 'RPC fetch failed' })).toBe('RPC_UNAVAILABLE')
    expect(humanizeActivationFailure('WALLET_REJECTED')).toMatch(/rejected/i)
    expect(humanizeActivationFailure('PAIR_MISSING')).toMatch(/pool/i)
    expect(humanizeActivationFailure('LB_PROGRAM_NOT_DEPLOYED')).toMatch(/not deployed/i)
  })

  it('rejects zero / invalid addresses', () => {
    expect(isDeployedAddress('0x0000000000000000000000000000000000000000')).toBe(false)
    expect(isDeployedAddress(null)).toBe(false)
    expect(isDeployedAddress('not-an-address')).toBe(false)
  })

  it('production mainnet deploy script exists and is fail-closed', () => {
    const script = readFileSync(
      path.join(ROOT, 'script/liquidity-building/DeployLiquidityBuildingV1Mainnet.s.sol'),
      'utf8',
    )
    expect(script).toContain('LB_MAINNET_DEPLOY_AUTHORIZED')
    expect(script).toContain('LB_PRODUCTION_AUTHORITY')
    expect(script).toContain('DeployNotAuthorized')
    expect(script).toContain('0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C')
    expect(existsSync(path.join(ROOT, 'deployments/liquidity-building/attempt-mainnet-activation.mjs'))).toBe(
      true,
    )
  })
})
