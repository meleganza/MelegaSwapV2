/**
 * Mainnet activation — binding, readiness after verified permanent deploy.
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
  resolveProductionBinding,
} from '../addresses'
import { canSubmitMutatingAction, BLOCKED_ACTIVATION_GATES } from '../programStatus'

const ROOT = path.resolve(__dirname, '../../../../../../../')
const CHAIN56 = path.join(ROOT, 'deployments/liquidity-building/chain-56')

describe('LB mainnet activation binding + readiness', () => {
  it('canonical config is the single frontend source and is bound', () => {
    expect(LB_MELEGA_AMM.factory).toBe('0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C')
    expect(LB_MELEGA_AMM.router).toBe('0xc25033218D181b27D4a2944Fbb04FC055da4EAB3')
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFactory).toBe('0xB9f3e3020141157C215902acC1fDF65e49bE4e82')
    expect(lbCoreContractsBound()).toBe(true)
    expect(LB_DEPLOYED_ADDRESSES).toEqual(readCanonicalLbAddresses())
  })

  it('deployed-addresses artifact mirrors bound frontend registry', () => {
    const artifact = JSON.parse(readFileSync(path.join(CHAIN56, 'deployed-addresses.v1.json'), 'utf8'))
    expect(artifact.chainId).toBe(56)
    expect(artifact.mainnetDeployExecuted).toBe(true)
    expect(artifact.addresses.lbFactory).toBe(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFactory)
    expect(artifact.addresses.lbAuthorizer).toBe(LB_CANONICAL_DEPLOYED_ADDRESSES.lbAuthorizer)
    expect(artifact.addresses.lbFeeSink).toBe(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeSink)
    expect(artifact.addresses.melegaFactory).toBe(LB_MELEGA_AMM.factory)
  })

  it('execution readiness is READY when core addresses are bound', () => {
    const r = assessExecutionReadiness()
    expect(r.ready).toBe(true)
    expect(r.status).toBe('READY')
    expect(r.missing).toEqual([])
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

  it('mutating actions stay fail-closed without activation gates even when addresses bound', () => {
    expect(
      canSubmitMutatingAction({
        walletConnected: true,
        correctChain: true,
        gates: BLOCKED_ACTIVATION_GATES,
      }).ok,
    ).toBe(false)
  })

  it('LB018 historical blocker artifact remains documented', () => {
    const artifactPath = path.join(CHAIN56, 'lb018-deployment-binding.v1.json')
    expect(existsSync(artifactPath)).toBe(true)
  })
})
