/**
 * Mission: Avalanche V2 Router Founder deployment preparation.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { Interface } from '@ethersproject/abi'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  assessAvalancheRouterDeployGates,
  assessFounderDeployGates,
  buildAvalancheRouterPostDeployPlan,
  buildAvalancheV2RouterDeployStep,
  loadCertifiedAvaxRouterArtifacts,
  AVAX_ROUTER_CHAIN_ID,
  AVAX_ROUTER_FACTORY,
  AVAX_ROUTER_WAVAX,
  AVALANCHE_ACTIVATION_GATES,
  AVALANCHE_STATUS_UNTIL_ACTIVATION,
} from 'lib/deployment-orchestrator'
import {
  AVAX_ROUTER_INIT_CODE_PAIR_HASH,
  assessAvaxRouterArtifactIntegrity,
  AVAX_ROUTER_CONTRACT,
} from '../founderAvalancheRouterArtifacts'
import { createMockEthereum, buildContractCreationRequest, walletSendDeployTransaction } from '../founderWalletTx'
import { MELEGA_CHAIN_REGISTRY } from 'config/melegaChainRegistry'

const WEB = path.resolve(__dirname, '../../../..')
const ARTIFACT = path.resolve(__dirname, '../artifacts/avalanche-v2-router-certified.json')
const SHELL = path.resolve(WEB, 'src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx')
const PANEL = path.resolve(WEB, 'src/views/DeploymentOrchestrator/FounderAvalancheV2RouterPanel.tsx')
const EXCHANGE = path.resolve(WEB, 'src/config/constants/exchange.ts')

const DEPLOYER = AUTHORIZED_MELEGA_DEPLOYER
const OTHER = '0x1111111111111111111111111111111111111111'

describe('Avalanche V2 Router Founder preparation', () => {
  it('loads committed certified artifact without Forge paths', () => {
    expect(existsSync(ARTIFACT)).toBe(true)
    const raw = JSON.parse(readFileSync(ARTIFACT, 'utf8'))
    expect(raw.chainId).toBe(43114)
    expect(raw.noProxy).toBe(true)
    expect(raw.noMutableAuthority).toBe(true)
    expect(raw.noProtocolFeeInRouter).toBe(true)
    expect(raw.noKerl).toBe(true)
    expect(raw.noTreasuryRuntime).toBe(true)
    expect(raw.factory).toBe(AVAX_ROUTER_FACTORY)
    expect(raw.wavax).toBe(AVAX_ROUTER_WAVAX)
    expect(raw.initCodePairHash.toLowerCase()).toBe(AVAX_ROUTER_INIT_CODE_PAIR_HASH.toLowerCase())
    const art = raw.artifacts.MelegaV2Router
    expect(art.creationBytecode.startsWith('0x')).toBe(true)
    const sha = createHash('sha256')
      .update(Buffer.from(art.creationBytecode.slice(2), 'hex'))
      .digest('hex')
    expect(sha).toBe(art.creationBytecodeSha256)
    const loaded = loadCertifiedAvaxRouterArtifacts()
    expect(loaded.status).toBe('ARTIFACTS_VALID')
    expect(loaded.invalidReasons).toEqual([])
  })

  it('constructor encoding uses Factory + WAVAX only', () => {
    const built = buildAvalancheV2RouterDeployStep()
    expect(built.artifactStatus).toBe('ARTIFACTS_VALID')
    expect(built.step?.status).toBe('READY_FOR_FOUNDER_SIGNATURE')
    expect(built.step?.deploymentData?.startsWith('0x')).toBe(true)
    expect(built.step?.constructorArgs).toEqual([
      { name: '_factory', type: 'address', value: AVAX_ROUTER_FACTORY },
      { name: '_WETH', type: 'address', value: AVAX_ROUTER_WAVAX },
    ])
    const encoded = built.step!.deploymentData!
    expect(encoded.toLowerCase().endsWith(
      `${AVAX_ROUTER_FACTORY.slice(2).toLowerCase().padStart(64, '0')}${AVAX_ROUTER_WAVAX.slice(2)
        .toLowerCase()
        .padStart(64, '0')}`,
    )).toBe(true)
  })

  it('INIT_CODE_PAIR_HASH is patched into creation bytecode', () => {
    const art = loadCertifiedAvaxRouterArtifacts().artifacts[AVAX_ROUTER_CONTRACT]
    const gate = assessAvaxRouterArtifactIntegrity(art)
    expect(gate.ok).toBe(true)
    expect(art.creationBytecode.toLowerCase()).toContain(AVAX_ROUTER_INIT_CODE_PAIR_HASH.slice(2).toLowerCase())
    // Ethereum source hash must not remain
    expect(art.creationBytecode.toLowerCase()).not.toContain(
      '70bab120b879463f253c7412d8c12623f1aa971a04d97ba3ffd0e5f5c42e1405',
    )
  })

  it('Founder gates require deployer + chain 43114 + artifact', () => {
    const built = buildAvalancheV2RouterDeployStep()
    const ok = assessAvalancheRouterDeployGates({
      connectedWallet: DEPLOYER,
      chainId: AVAX_ROUTER_CHAIN_ID,
      artifactValid: true,
      constructorValid: true,
    })
    expect(ok.deployEnabled).toBe(true)
    expect(ok.statusLabel).toBe('READY FOR FOUNDER SIGNATURE')
    expect(ok.codes).toContain('FOUNDER_SIGNATURE_REQUIRED')

    const wrongChain = assessAvalancheRouterDeployGates({
      connectedWallet: DEPLOYER,
      chainId: 56,
      artifactValid: true,
      constructorValid: true,
    })
    expect(wrongChain.deployEnabled).toBe(false)
    expect(wrongChain.blockers[0]).toMatch(/Avalanche/)

    const wrongWallet = assessAvalancheRouterDeployGates({
      connectedWallet: OTHER,
      chainId: 43114,
      artifactValid: true,
      constructorValid: true,
    })
    expect(wrongWallet.deployEnabled).toBe(false)
    expect(built.step?.deploymentData).toBeTruthy()
  })

  it('contract creation request has no to field and mock send does not auto-broadcast outside click', async () => {
    const built = buildAvalancheV2RouterDeployStep()
    const data = built.step!.deploymentData!
    const req = buildContractCreationRequest({ from: DEPLOYER, data })
    expect(req.to).toBeUndefined()
    expect(req.value).toBe('0x0')
    let sent = 0
    const eth = createMockEthereum({
      onSend: (tx) => {
        sent += 1
        expect(tx.to).toBeUndefined()
        expect(tx.data).toBe(data)
      },
    })
    // Explicit call simulates Founder CTA — not automatic
    const hash = await walletSendDeployTransaction(eth, DEPLOYER, data, 1_000_000n)
    expect(hash.startsWith('0x')).toBe(true)
    expect(sent).toBe(1)
  })

  it('post-deploy plan encodes quote/liquidity/swap and forbids bind/LIVE', () => {
    const plan = buildAvalancheRouterPostDeployPlan()
    expect(plan.bindSsotAfterPass).toBe(false)
    expect(plan.markAvalancheLiveAfterPass).toBe(false)
    expect(plan.expectedFactory).toBe(AVAX_ROUTER_FACTORY)
    expect(plan.expectedWeth).toBe(AVAX_ROUTER_WAVAX)
    expect(plan.encodeSmoke.factory.startsWith('0xc45a0155')).toBe(true) // factory()
    expect(plan.encodeSmoke.WETH.startsWith('0xad5c4648')).toBe(true) // WETH()
    expect(plan.encodeSmoke.getAmountsOut.length).toBeGreaterThan(10)
    expect(plan.encodeSmoke.addLiquidity.length).toBeGreaterThan(10)
    expect(plan.encodeSmoke.swapExactTokensForTokens.length).toBeGreaterThan(10)
    expect(AVALANCHE_STATUS_UNTIL_ACTIVATION).toBe('LIVE')
    expect(AVALANCHE_ACTIVATION_GATES.length).toBeGreaterThanOrEqual(7)
  })

  it('UI panel + shell expose Avalanche Router CTA without manual bytecode fields', () => {
    const panel = readFileSync(PANEL, 'utf8')
    const shell = readFileSync(SHELL, 'utf8')
    expect(shell).toContain('FounderAvalancheV2RouterPanel')
    expect(panel).toContain('Avalanche V2 Router')
    expect(panel).toContain('READY FOR FOUNDER SIGNATURE')
    expect(panel).toContain('Deploy Avalanche V2 Router')
    expect(panel).toContain('AVAX_ROUTER_FACTORY')
    expect(panel).toContain('AVAX_ROUTER_WAVAX')
    expect(panel).toContain('data-testid="founder-avalanche-factory"')
    expect(panel).toContain('data-testid="founder-avalanche-wavax"')
    expect(panel).not.toMatch(/manual bytecode|paste.*bytecode/i)
    expect(panel).toContain('walletSendDeployTransaction')
    expect(panel).toContain('walletSwitchChain')
    expect(panel).not.toContain('KERL')
    expect(panel).not.toContain('Treasury Runtime')
  })

  it('does not embed protocol fee / KERL / Treasury Runtime in Router artifact', () => {
    const raw = JSON.parse(readFileSync(ARTIFACT, 'utf8'))
    expect(raw.noProtocolFeeInRouter).toBe(true)
    expect(raw.noKerl).toBe(true)
    expect(raw.noTreasuryRuntime).toBe(true)
    const creation = String(raw.artifacts.MelegaV2Router.creationBytecode).toLowerCase()
    // ASCII "KERL" / "Treasury Runtime" must not appear in creation bytecode
    const asAscii = Buffer.from(creation.replace(/^0x/, ''), 'hex').toString('latin1')
    expect(asAscii).not.toMatch(/KERL/i)
    expect(asAscii).not.toMatch(/Treasury Runtime/i)
  })

  it('BSC Founder gates still require chain 56 (LIVE chain regression)', () => {
    const gates = assessFounderDeployGates({
      connectedWallet: DEPLOYER,
      chainId: 56,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    expect(gates.deployEnabled).toBe(true)
    const avaxAsBsc = assessFounderDeployGates({
      connectedWallet: DEPLOYER,
      chainId: 43114,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    expect(avaxAsBsc.deployEnabled).toBe(false)
    expect(avaxAsBsc.codes).toContain('WRONG_CHAIN')
  })

  it('activation mission binds Avalanche router; Avalanche is LIVE', () => {
    const exchange = readFileSync(EXCHANGE, 'utf8')
    expect(exchange).toMatch(/\[ChainId\.AVAX\]:\s*'0x5A38b0B75C2E199fD8098710594115A35ABb6c7F'/)
    const avax = MELEGA_CHAIN_REGISTRY.find((c) => c.chainId === 43114)
    expect(avax?.status).toBe('LIVE')
    expect(avax?.contracts.router?.toLowerCase()).toBe('0x5a38b0b75c2e199fd8098710594115a35abb6c7f')
    for (const id of [56, 8453, 137, 1, 42161, 43114]) {
      const row = MELEGA_CHAIN_REGISTRY.find((c) => c.chainId === id)
      expect(row?.status).toBe('LIVE')
    }
  })

  it('addLiquidity / swap / getAmountsOut ABI encode without Router fee fields', () => {
    const iface = new Interface([
      'function getAmountsOut(uint256,address[]) view returns (uint256[])',
      'function addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)',
      'function swapExactTokensForTokens(uint256,uint256,address[],address,uint256)',
    ])
    const path = [AVAX_ROUTER_WAVAX, AVAX_ROUTER_FACTORY]
    const out = iface.encodeFunctionData('getAmountsOut', [1n, path])
    const liq = iface.encodeFunctionData('addLiquidity', [
      AVAX_ROUTER_WAVAX,
      AVAX_ROUTER_FACTORY,
      1n,
      1n,
      0n,
      0n,
      DEPLOYER,
      2_000_000_000,
    ])
    const swap = iface.encodeFunctionData('swapExactTokensForTokens', [1n, 0n, path, DEPLOYER, 2_000_000_000])
    expect(out.startsWith('0x')).toBe(true)
    expect(liq.startsWith('0x')).toBe(true)
    expect(swap.startsWith('0x')).toBe(true)
  })
})
