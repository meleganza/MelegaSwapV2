import { describe, expect, it } from 'vitest'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  assessFounderDeployGates,
  assessFounderGasReadiness,
  buildCreateTokenTransactionReview,
  buildFounderExecutionSession,
  buildLiquidityBuilderTransactionReview,
  buildPublicFarmFactoryTransactionReview,
  extractContractAddressFromReceipt,
  isAuthorizedMelegaDeployer,
  userOperationRequiresMelegaDeployer,
  validatePostDeployment,
} from 'lib/deployment-orchestrator'
import { isSubsystemReadyForFounderDeploy } from '../founderSequence'
import { SUPERSEDED_KMS_AUTHORITY_KEYS, probeProductionAuthority } from '../authority'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const DEPLOYER = AUTHORIZED_MELEGA_DEPLOYER
const OTHER = '0x1111111111111111111111111111111111111111'

describe('founder deployer guards', () => {
  it('matches authorized deployer exactly', () => {
    expect(isAuthorizedMelegaDeployer(DEPLOYER)).toBe(true)
    expect(isAuthorizedMelegaDeployer(DEPLOYER.toLowerCase())).toBe(true)
    expect(isAuthorizedMelegaDeployer(OTHER)).toBe(false)
  })

  it('rejects wrong wallet and wrong chain', () => {
    const wrongWallet = assessFounderDeployGates({
      connectedWallet: OTHER,
      chainId: 56,
      balanceWei: 10n ** 18n,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    expect(wrongWallet.deployEnabled).toBe(false)
    expect(wrongWallet.blockers[0]).toMatch(/MELEGA DEPLOYER/)

    const wrongChain = assessFounderDeployGates({
      connectedWallet: DEPLOYER,
      chainId: 1,
      balanceWei: 10n ** 18n,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    expect(wrongChain.deployEnabled).toBe(false)
    expect(wrongChain.codes).toContain('WRONG_CHAIN')
    expect(wrongChain.blockers[0]).toBe('Switch to BNB Smart Chain.')
  })

  it('rejects insufficient BNB', () => {
    const gates = assessFounderDeployGates({
      connectedWallet: DEPLOYER,
      chainId: 56,
      balanceWei: 1n,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    expect(gates.deployEnabled).toBe(false)
    expect(gates.codes).toContain('INSUFFICIENT_BNB')
  })

  it('enables deploy only when all Founder gates pass', () => {
    const gates = assessFounderDeployGates({
      connectedWallet: DEPLOYER,
      chainId: 56,
      balanceWei: 10n ** 18n,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    expect(gates.deployEnabled).toBe(true)
    expect(gates.codes).toContain('FOUNDER_SIGNATURE_REQUIRED')
    expect(gates.codes).not.toContain('AWS_KMS_KEY_ID' as any)
  })
})

describe('constructor reviews + post-deploy', () => {
  it('Create Token constructor uses 0.10 BNB and Treasury', () => {
    const review = buildCreateTokenTransactionReview()
    expect(review.constructorValid).toBe(true)
    expect(review.feeConfiguration.creationFeeWei).toBe('100000000000000000')
    expect(review.treasuryDestination.toLowerCase()).toBe(
      '0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b',
    )
  })

  it('Liquidity Builder fee is 1000 bps to Treasury', () => {
    const review = buildLiquidityBuilderTransactionReview()
    expect(review.feeConfiguration.successFeeBps).toBe('1000')
    expect(review.constructorValid).toBe(true)
  })

  it('Public Farm Factory requires eligibility signer and encodes fee rules', () => {
    const incomplete = buildPublicFarmFactoryTransactionReview()
    expect(incomplete.constructorValid).toBe(false)
    const complete = buildPublicFarmFactoryTransactionReview({
      eligibilitySigner: DEPLOYER,
    })
    expect(complete.constructorValid).toBe(true)
    expect(complete.feeConfiguration.marcoReward).toBe('UNSUPPORTED')
    expect(complete.feeConfiguration.otherwiseFeeBnb).toBe('0.25')
  })

  it('quarantines bytecode mismatch and only binds on full validation', () => {
    const bad = validatePostDeployment({
      subsystemId: 'create_token',
      chainId: 56,
      txHash: `0x${'ab'.repeat(32)}`,
      contractAddress: OTHER,
      receiptStatus: 'success',
      runtimeBytecode: '0x6001600055',
      expectedRuntimeBytecodeHash: '0xaaa',
      observedRuntimeBytecodeHash: '0xbbb',
      constructorStateOk: true,
      treasuryOk: true,
      feeOk: true,
    })
    expect(bad.status).toBe('QUARANTINED')
    if (bad.status === 'QUARANTINED') expect(bad.bind).toBe(false)

    const good = validatePostDeployment({
      subsystemId: 'create_token',
      chainId: 56,
      txHash: `0x${'cd'.repeat(32)}`,
      contractAddress: OTHER,
      receiptStatus: 'success',
      runtimeBytecode: '0x6001600055',
      expectedRuntimeBytecodeHash: '0xabc',
      observedRuntimeBytecodeHash: '0xabc',
      constructorStateOk: true,
      treasuryOk: true,
      feeOk: true,
    })
    expect(good.status).toBe('READY')
    if (good.status === 'READY') {
      expect(good.bind).toBe(true)
      expect(good.verification).toBe('VERIFICATION_PENDING')
    }
  })

  it('parses receipt contract address', () => {
    const parsed = extractContractAddressFromReceipt({
      contractAddress: OTHER,
      status: 1,
    })
    expect(parsed.address).toBe(OTHER)
    expect(parsed.receiptStatus).toBe('success')
  })
})

describe('user operation independence + no KMS', () => {
  it('user ops never require MELEGA DEPLOYER', () => {
    expect(userOperationRequiresMelegaDeployer('create_token')).toBe(false)
    expect(userOperationRequiresMelegaDeployer('create_farm')).toBe(false)
    expect(userOperationRequiresMelegaDeployer('liquidity_builder')).toBe(false)
  })

  it('authority model is Founder wallet — KMS keys superseded', () => {
    const auth = probeProductionAuthority()
    expect(auth.authorityModel).toBe('FOUNDER_WALLET_SIGNED')
    expect(auth.productionAuthorityPresent).toBe(true)
    expect(auth.authorizedDeployer).toBe(DEPLOYER)
    expect(auth.blockers).toEqual([])
    expect(SUPERSEDED_KMS_AUTHORITY_KEYS).toContain('AWS_KMS_KEY_ID')
    expect(SUPERSEDED_KMS_AUTHORITY_KEYS).toContain('MAINNET_DEPLOYER')
  })

  it('sequential order: only LB deployable when all unbound', () => {
    expect(isSubsystemReadyForFounderDeploy('liquidity_builder')).toBe(true)
    expect(isSubsystemReadyForFounderDeploy('create_token')).toBe(false)
    expect(isSubsystemReadyForFounderDeploy('public_farm_factory')).toBe(false)
  })

  it('Founder UI has no private-key or KMS handling', () => {
    const ui = readFileSync(
      path.resolve(__dirname, '../../../views/DeploymentOrchestrator/FounderDeploymentPanel.tsx'),
      'utf8',
    )
    expect(ui).not.toContain('AWS_KMS')
    expect(ui).not.toContain('AWS_KMS_KEY_ID')
    expect(ui).not.toMatch(/\bAWS_KMS\b/)
    expect(ui).not.toMatch(/\bmnemonic\b/i)
    expect(ui).toContain('eth_sendTransaction')
    expect(ui).toContain('AUTHORIZED_MELEGA_DEPLOYER')
    expect(ui).toContain('Signing stays in the connected wallet only')
    expect(ui).toContain('ConnectWalletButton')
    expect(ui).toContain('Switch to BNB Smart Chain.')
    expect(ui).toContain('FOUNDER_DEPLOYER_FUNDING_REQUIRED')
  })
})

describe('founder execution session + gas readiness', () => {
  it('awaits Founder wallet when disconnected', () => {
    const session = buildFounderExecutionSession({
      connectedWallet: null,
      chainId: null,
      balanceWei: null,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    expect(session.pauseState).toBe('AWAITING_FOUNDER_WALLET')
    expect(session.records.every((r) => r.status === 'NULL')).toBe(true)
    expect(session.kmsRequired).toBe(false)
    expect(session.privateKeyHandling).toBe(false)
  })

  it('pauses on funding without classifying as code defect', () => {
    const gas = assessFounderGasReadiness({ balanceWei: 1n })
    expect(gas.pauseCode).toBe('FOUNDER_DEPLOYER_FUNDING_REQUIRED')
    expect(gas.fundingSufficient).toBe(false)
    expect(gas.message).toContain(DEPLOYER)

    const session = buildFounderExecutionSession({
      connectedWallet: DEPLOYER,
      chainId: 56,
      balanceWei: 1n,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    expect(session.pauseState).toBe('FOUNDER_DEPLOYER_FUNDING_REQUIRED')
    expect(session.gates.deployEnabled).toBe(false)
  })

  it('awaits Founder signature when all gates pass', () => {
    const session = buildFounderExecutionSession({
      connectedWallet: DEPLOYER,
      chainId: 56,
      balanceWei: 10n ** 18n,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    expect(session.pauseState).toBe('AWAITING_FOUNDER_SIGNATURE')
    expect(session.gates.deployEnabled).toBe(true)
  })

  it('wrong chain resolves to WRONG_CHAIN pause', () => {
    const session = buildFounderExecutionSession({
      connectedWallet: DEPLOYER,
      chainId: 1,
      balanceWei: 10n ** 18n,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    expect(session.pauseState).toBe('WRONG_CHAIN')
    expect(session.message).toBe('Switch to BNB Smart Chain.')
  })
})
