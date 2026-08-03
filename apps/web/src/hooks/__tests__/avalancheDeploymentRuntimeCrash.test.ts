/**
 * Avalanche PREPARING must not crash /runtime/deployment.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Pair, WNATIVE, ERC20Token, ChainId, FACTORY_ADDRESS_MAP, INIT_CODE_HASH_MAP } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'
import { CHAIN_IDS, isChainSupported } from 'utils/wagmi'
import { getMelegaChain, getMelegaRouterAddress } from 'config/melegaChainRegistry'
import { assessAvalancheRouterDeployGates, AUTHORIZED_MELEGA_DEPLOYER } from 'lib/deployment-orchestrator'

const WEB = path.resolve(__dirname, '../..')
const DEPLOY_PAGE = path.resolve(WEB, 'pages/runtime/deployment/index.tsx')
const APP_FULL = path.resolve(WEB, 'pages/_app-full.tsx')
const NETWORK_MODAL = path.resolve(WEB, 'components/NetworkModal/NetworkModal.tsx')
const SWITCH_MODAL = path.resolve(WEB, 'components/Menu/UserMenu/NetworkSwitchModal.tsx')
const PANEL = path.resolve(WEB, 'views/DeploymentOrchestrator/FounderAvalancheV2RouterPanel.tsx')

describe('Avalanche deployment runtime crash guards', () => {
  it('Avalanche remains PREPARING with null router and does not imply LIVE', () => {
    const avax = getMelegaChain(43114)!
    expect(avax.status).toBe('PREPARING')
    expect(getMelegaRouterAddress(43114)).toBeNull()
    expect(avax.contracts.factory).toBeTruthy()
  })

  it('deployment page explicitly allows Avalanche via CHAIN_IDS', () => {
    const src = readFileSync(DEPLOY_PAGE, 'utf8')
    expect(src).toContain('DeploymentPage.chains = CHAIN_IDS')
    expect(CHAIN_IDS).toContain(43114)
    expect(isChainSupported(43114)).toBe(true)
  })

  it('_app-full falls back to CHAIN_IDS when page.chains is undefined', () => {
    const src = readFileSync(APP_FULL, 'utf8')
    expect(src).toContain('Component.chains ?? CHAIN_IDS')
    expect(src).not.toMatch(/pageSupportedChains=\{Component\.chains\}(?!\s*\?\?)/)
  })

  it('NetworkModal never blocks Avalanche PREPARING on /runtime/deployment', () => {
    const src = readFileSync(NETWORK_MODAL, 'utf8')
    expect(src).toContain('isDeploymentRuntimePath')
    expect(src).toContain('PREPARING')
    expect(src).toContain('/runtime/deployment')
  })

  it('Pair.getAddress works for Avalanche (no factory/init crash)', () => {
    expect(FACTORY_ADDRESS_MAP[ChainId.AVAX]).toBe('0xFF8EBf8edf1C533A02d066f852788773BdCD631C')
    expect(INIT_CODE_HASH_MAP[ChainId.AVAX]).toMatch(/^0x[a-f0-9]{64}$/i)
    const a = WNATIVE[ChainId.AVAX]
    const b = new ERC20Token(ChainId.AVAX, '0x8C880e839f3CAcf60F11612087BAbd3307A33720', 18, 'MARCO')
    const addr = Pair.getAddress(a, b)
    expect(addr).toMatch(/^0x[a-fA-F0-9]{40}$/)
  })

  it('CAKE/MARCO token map includes Avalanche so shell hooks do not throw', () => {
    expect(CAKE[ChainId.AVAX]?.address.toLowerCase()).toBe('0x8c880e839f3cacf60f11612087babd3307a33720')
  })

  it('Founder Avalanche panel renders pending Router CTA copy without requiring live router', () => {
    const src = readFileSync(PANEL, 'utf8')
    expect(src).toContain('Router deployment pending')
    expect(src).toContain('Deploy Avalanche V2 Router')
    expect(src).toContain('READY FOR FOUNDER SIGNATURE')
    const gates = assessAvalancheRouterDeployGates({
      connectedWallet: AUTHORIZED_MELEGA_DEPLOYER,
      chainId: 43114,
      artifactValid: true,
      constructorValid: true,
    })
    expect(gates.deployEnabled).toBe(true)
  })
})

describe('Switch Network modal 700px redesign', () => {
  it('is compact with LIVE + COMING SOON and maxWidth 700px', () => {
    const src = readFileSync(SWITCH_MODAL, 'utf8')
    expect(src).toContain("maxWidth: '700px'")
    expect(src).toContain('network-switch-live')
    expect(src).toContain('network-switch-coming-soon')
    expect(src).toContain('COMING SOON')
    expect(src).toContain('LIVE')
    expect(src).not.toMatch(/grid-template-columns:\s*auto auto auto auto auto/)
    expect(src).not.toContain('Coming soon')
  })
})
