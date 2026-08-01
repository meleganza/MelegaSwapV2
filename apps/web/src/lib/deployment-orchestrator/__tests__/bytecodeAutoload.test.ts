import { describe, expect, it } from 'vitest'
import { Interface } from '@ethersproject/abi'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  FOUNDER_TREASURY_DESTINATION,
  assessLbArtifactIntegrity,
  buildContractCreationRequest,
  buildLbDeploySteps,
  createMockEthereum,
  encodeLbConstructor,
  isSubsystemReadyForFounderDeploy,
  isUserRejectedError,
  loadCertifiedLbArtifacts,
  walletSendDeployTransaction,
} from 'lib/deployment-orchestrator'

const WEB = path.resolve(__dirname, '../../../..')
const SRC = path.resolve(__dirname, '../../..')
const SHELL = path.resolve(SRC, 'views/DeploymentOrchestrator/FounderDeploymentShell.tsx')
const PANEL = path.resolve(SRC, 'views/DeploymentOrchestrator/FounderDeploymentPanel.tsx')

describe('certified bytecode autoload', () => {
  it('autoloads certified LB artifacts without file upload', () => {
    const loaded = loadCertifiedLbArtifacts()
    expect(loaded.status).toBe('ARTIFACTS_VALID')
    expect(loaded.statusLabels).toContain('Certified artifact loaded')
    expect(loaded.statusLabels).toContain('Artifact hash verified')
    expect(loaded.deployOrder).toHaveLength(6)
    for (const name of loaded.deployOrder) {
      const gate = assessLbArtifactIntegrity(loaded.artifacts[name], name)
      expect(gate.ok).toBe(true)
      expect(gate.creationBytecodePresent).toBe(true)
      expect(gate.statusLabel).toBe('Artifact hash verified')
    }
  })

  it('manifest --check-committed passes without requiring Forge out/', () => {
    const script = path.join(WEB, 'scripts/generate-lb-certified-manifest.mjs')
    expect(existsSync(script)).toBe(true)
    execSync(`node ${script} --check-committed`, { cwd: WEB, stdio: 'pipe' })
  })

  it('empty bytecode / wrong hash fails integrity gate', () => {
    const bad = assessLbArtifactIntegrity(
      {
        contractName: 'X',
        creationBytecode: '0x',
        expectedRuntimeBytecodeSha256: '0x1',
        observedRuntimeBytecodeSha256: '0x2',
        runtimeHashMatchesCertified: false,
        constructorInputs: [],
        linkReferences: {},
      },
      'X',
    )
    expect(bad.ok).toBe(false)
    expect(bad.mismatches.join(' ')).toMatch(/empty creation|runtime hash/i)
  })

  it('FeeReceiver constructor encoding matches ethers Interface.encodeDeploy', () => {
    const loaded = loadCertifiedLbArtifacts()
    const art = loaded.artifacts.LiquidityBuildingTreasuryFeeReceiverV1
    const args = [AUTHORIZED_MELEGA_DEPLOYER, FOUNDER_TREASURY_DESTINATION]
    const encoded = encodeLbConstructor(art.constructorInputs, args)
    const iface = new Interface([{ type: 'constructor', inputs: art.constructorInputs as any }])
    expect(encoded).toBe(iface.encodeDeploy(args))
    const built = buildLbDeploySteps({})
    const fee = built.steps.find((s) => s.contractName === 'LiquidityBuildingTreasuryFeeReceiverV1')
    expect(fee?.deploymentData).toBe(art.creationBytecode + encoded.slice(2))
  })

  it('step-1 Math deployment data is pure creation bytecode (no constructor args)', () => {
    const built = buildLbDeploySteps({})
    const first = built.steps[0]
    expect(first.contractName).toBe('LiquidityBuildingExecutionMathV1')
    expect(first.deploymentData).toBe(
      loadCertifiedLbArtifacts().artifacts.LiquidityBuildingExecutionMathV1.creationBytecode,
    )
    expect(first.artifactVerified).toBe(true)
  })

  it('later FeeSink depends on factual FeeReceiver address — not placeholder', () => {
    const pending = buildLbDeploySteps({})
    const sinkPending = pending.steps.find((s) => s.contractName === 'LiquidityBuildingTreasuryFeeSinkV1')
    expect(sinkPending?.deploymentData).toBeNull()
    expect(sinkPending?.blockedReason).toMatch(/FeeReceiver/i)

    const ready = buildLbDeploySteps({
      feeReceiver: '0x1111111111111111111111111111111111111111',
    })
    const sink = ready.steps.find((s) => s.contractName === 'LiquidityBuildingTreasuryFeeSinkV1')
    expect(sink?.deploymentData?.startsWith('0x')).toBe(true)
    expect(sink?.constructorArgs[0].value.toLowerCase()).toBe(
      '0x1111111111111111111111111111111111111111',
    )
  })

  it('wallet request is contract creation with no to; rejection recovers', async () => {
    const built = buildLbDeploySteps({})
    const data = built.steps[0].deploymentData!
    const req = buildContractCreationRequest({ from: AUTHORIZED_MELEGA_DEPLOYER, data })
    expect(req.to).toBeUndefined()
    expect(req.value).toBe('0x0')
    expect(req.data).toBe(data)

    let captured: Record<string, string> | null = null
    const eth = createMockEthereum({
      onSend: (p) => {
        captured = p
      },
    })
    const hash = await walletSendDeployTransaction(eth, AUTHORIZED_MELEGA_DEPLOYER, data)
    expect(hash).toMatch(/^0x[a-f0-9]{64}$/i)
    expect(captured?.to).toBeUndefined()
    expect(captured?.data).toBe(data)

    const rejectEth = createMockEthereum({ rejectSend: true })
    try {
      await walletSendDeployTransaction(rejectEth, AUTHORIZED_MELEGA_DEPLOYER, data)
      expect.fail('should reject')
    } catch (e) {
      expect(isUserRejectedError(e)).toBe(true)
    }
  })

  it('UI has no manual bytecode load instruction; first CTA is contract-specific', () => {
    const ui = readFileSync(SHELL, 'utf8')
    const panel = readFileSync(PANEL, 'utf8')
    expect(ui).not.toMatch(/Load certified creation bytecode/i)
    expect(ui).not.toMatch(/Attach certified creation bytecode/i)
    expect(panel).not.toMatch(/Attach certified creation bytecode to enable/i)
    expect(ui).toContain('Certified artifact loaded')
    expect(ui).toContain('Artifact hash verified')
    expect(ui).toContain('Deploy {step.contractName}')
    expect(ui).toContain('walletSendDeployTransaction')
    expect(ui).toContain('buildContractCreationRequest')
    expect(ui).toContain('connector.getProvider')
  })

  it('Create Token unlocks after LB bind; Public Farm stays locked', () => {
    expect(isSubsystemReadyForFounderDeploy('create_token')).toBe(true)
    expect(isSubsystemReadyForFounderDeploy('public_farm_factory')).toBe(false)
  })
})
