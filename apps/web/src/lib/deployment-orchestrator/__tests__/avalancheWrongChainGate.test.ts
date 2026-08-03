/**
 * MELEGASWAP_V2_AVALANCHE_DEPLOYMENT_WRONG_CHAIN_GATE_FIX
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  isFounderPackageChainMatch,
  resolveFounderDeploymentPackage,
} from '../founderDeploymentPackage'
import { assessAvalancheRouterDeployGates } from '../founderAvalancheRouterGates'
import { assessFounderDeployGates, AUTHORIZED_MELEGA_DEPLOYER, FOUNDER_DEPLOY_CHAIN_ID } from '../founderDeployer'
import { AVAX_ROUTER_CHAIN_ID } from '../founderAvalancheRouterArtifacts'

const SHELL = path.resolve(
  __dirname,
  '../../../views/DeploymentOrchestrator/FounderDeploymentShell.tsx',
)

describe('Founder deployment package chain resolution', () => {
  it('?chain=avalanche → Avalanche V2 Router requires 43114', () => {
    const pkg = resolveFounderDeploymentPackage('avalanche')
    expect(pkg.packageId).toBe('avalanche_v2_router')
    expect(pkg.requiredChainId).toBe(43114)
    expect(pkg.requiredNetworkLabel).toBe('Avalanche C-Chain')
    expect(pkg.switchNetworkCopy).toBe('Switch to Avalanche C-Chain')
    expect(pkg.isAvalancheRouterPackage).toBe(true)
  })

  it('default / bsc → BNB Founder packages require 56', () => {
    for (const q of [undefined, null, 'bsc', 'ethereum', 'base', 'polygon', 'arbitrum']) {
      const pkg = resolveFounderDeploymentPackage(q as any)
      expect(pkg.packageId).toBe('bnb_founder_packages')
      expect(pkg.requiredChainId).toBe(56)
      expect(pkg.switchNetworkCopy).toBe('Switch to BNB Smart Chain')
      expect(pkg.isAvalancheRouterPackage).toBe(false)
    }
  })

  it('Avalanche package + wallet 43114 matches; BNB package on 43114 does not', () => {
    const avax = resolveFounderDeploymentPackage('avalanche')
    const bnb = resolveFounderDeploymentPackage('bsc')
    expect(isFounderPackageChainMatch(avax, 43114)).toBe(true)
    expect(isFounderPackageChainMatch(avax, 56)).toBe(false)
    expect(isFounderPackageChainMatch(bnb, 56)).toBe(true)
    expect(isFounderPackageChainMatch(bnb, 43114)).toBe(false)
  })

  it('Avalanche gates: deployer on 43114 is ready (no WRONG_CHAIN)', () => {
    const gates = assessAvalancheRouterDeployGates({
      connectedWallet: AUTHORIZED_MELEGA_DEPLOYER,
      chainId: AVAX_ROUTER_CHAIN_ID,
      artifactValid: true,
      constructorValid: true,
    })
    expect(gates.codes).not.toContain('WRONG_CHAIN')
    expect(gates.codes).toContain('CHAIN_43114')
    expect(gates.deployEnabled).toBe(true)
    expect(gates.statusLabel).toBe('READY FOR FOUNDER SIGNATURE')
  })

  it('BNB gates still require 56 (unchanged) when Avalanche wallet connected', () => {
    const bnbGates = assessFounderDeployGates({
      connectedWallet: AUTHORIZED_MELEGA_DEPLOYER,
      chainId: 43114,
      balanceWei: 10n ** 18n,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    expect(bnbGates.codes).toContain('WRONG_CHAIN')
    expect(FOUNDER_DEPLOY_CHAIN_ID).toBe(56)

    const ok = assessFounderDeployGates({
      connectedWallet: AUTHORIZED_MELEGA_DEPLOYER,
      chainId: 56,
      balanceWei: 10n ** 18n,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    expect(ok.codes).not.toContain('WRONG_CHAIN')
    expect(ok.codes).toContain('CHAIN_56')
  })

  it('shell derives package from query and never shows BNB-paused copy', () => {
    const src = readFileSync(SHELL, 'utf8')
    expect(src).toContain('resolveFounderDeploymentPackage')
    expect(src).toContain('deploymentPackage.switchNetworkCopy')
    expect(src).toContain('data-required-chain')
    expect(src).not.toContain('BNB Smart Chain Founder steps are paused on this network')
    expect(src).toContain("return 'READY FOR FOUNDER SIGNATURE'")
  })
})
