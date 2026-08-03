/**
 * Multichain wallet chain detection — wagmi useChainId mis-read fix.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { chains, isChainSupported } from 'utils/wagmi'
import { parseWalletChainIdHex } from 'hooks/useWalletChainId'
import { assessAvalancheRouterDeployGates, AUTHORIZED_MELEGA_DEPLOYER } from 'lib/deployment-orchestrator'

const WEB = path.resolve(__dirname, '../..')
const HOOK = path.resolve(WEB, 'hooks/useWalletChainId.ts')
const ACTIVE = path.resolve(WEB, 'hooks/useActiveChainId.ts')
const WAGMI = path.resolve(WEB, 'utils/wagmi.ts')
const SHELL = path.resolve(WEB, 'views/DeploymentOrchestrator/FounderDeploymentShell.tsx')
const PANEL = path.resolve(WEB, 'views/DeploymentOrchestrator/FounderAvalancheV2RouterPanel.tsx')
const LEGACY = path.resolve(WEB, 'views/DeploymentOrchestrator/FounderDeploymentPanel.tsx')
const MODAL = path.resolve(WEB, 'components/Menu/UserMenu/NetworkSwitchModal.tsx')

describe('wallet chain detection', () => {
  it('parses EIP-1193 chain id hex', () => {
    expect(parseWalletChainIdHex('0xa86a')).toBe(43114)
    expect(parseWalletChainIdHex('0x38')).toBe(56)
    expect(parseWalletChainIdHex('43114')).toBe(43114)
    expect(parseWalletChainIdHex(null)).toBeNull()
  })

  it('includes Avalanche 43114 in wagmi CHAINS / isChainSupported', () => {
    expect(chains.some((c) => c.id === 43114)).toBe(true)
    expect(isChainSupported(43114)).toBe(true)
    expect(isChainSupported(56)).toBe(true)
  })

  it('documents that wagmi useChainId is unsafe for wallet truth', () => {
    const hook = readFileSync(HOOK, 'utf8')
    expect(hook).toContain('useChainId()')
    expect(hook).toContain('eth_chainId')
    expect(hook).toContain('chainChanged')
    expect(hook).toContain('useWalletChainId')
  })

  it('Founder deployment surfaces use useWalletChainId, not wagmi useChainId', () => {
    for (const file of [SHELL, PANEL, LEGACY]) {
      const src = readFileSync(file, 'utf8')
      expect(src).toContain('useWalletChainId')
      expect(src).not.toMatch(/useChainId\s*\(/)
      expect(src).not.toMatch(/from 'wagmi'.*useChainId|useChainId.*from 'wagmi'/)
    }
  })

  it('useActiveChainId prefers connected wallet chain over stale session', () => {
    const src = readFileSync(ACTIVE, 'utf8')
    expect(src).toContain('useWalletChainId')
    expect(src).toContain('walletTruth')
    expect(src).toContain('setSessionChainId')
  })

  it('Avalanche gates enable when factual wallet chain is 43114', () => {
    const ok = assessAvalancheRouterDeployGates({
      connectedWallet: AUTHORIZED_MELEGA_DEPLOYER,
      chainId: 43114,
      artifactValid: true,
      constructorValid: true,
    })
    expect(ok.deployEnabled).toBe(true)
    expect(ok.codes).toContain('CHAIN_43114')
    expect(ok.statusLabel).toBe('READY FOR FOUNDER SIGNATURE')

    const stale = assessAvalancheRouterDeployGates({
      connectedWallet: AUTHORIZED_MELEGA_DEPLOYER,
      chainId: 56,
      artifactValid: true,
      constructorValid: true,
    })
    expect(stale.deployEnabled).toBe(false)
  })
})

describe('Switch Network modal redesign', () => {
  it('has LIVE and COMING SOON sections with active highlight and Avalanche switchable', () => {
    const src = readFileSync(MODAL, 'utf8')
    expect(src).toContain('network-switch-live')
    expect(src).toContain('network-switch-coming-soon')
    expect(src).toContain('LIVE')
    expect(src).toContain('COMING SOON')
    expect(src).toContain("maxWidth: '700px'")
    expect(src).toContain('data-active')
    expect(src).toContain('ChainCard')
    expect(src).toContain('switchNetwork(row.chainId)')
    expect(src).not.toMatch(/grid-template-columns:\s*auto auto auto auto auto/)
  })

  it('wagmi source registers avalanche1', () => {
    const src = readFileSync(WAGMI, 'utf8')
    expect(src).toContain('avalanche1')
    expect(src).toContain('43114')
    expect(src).toMatch(/CHAINS\s*=\s*\[[^\]]*avalanche1/)
  })
})
