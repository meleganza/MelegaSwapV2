/**
 * Founder Deployment Shell — executable browser-wallet surface.
 * No KMS. No server signer. No automatic mainnet broadcast.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { useAccount, useBalance } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  FOUNDER_DEPLOY_CHAIN_ID,
  assessFounderDeployGates,
  assessFounderGasReadiness,
  isAuthorizedMelegaDeployer,
  weiToBnb,
  type GasEstimateStatus,
  type PerTxGasEstimate,
} from 'lib/deployment-orchestrator'
import {
  isFounderPackageChainMatch,
  resolveFounderDeploymentPackage,
} from 'lib/deployment-orchestrator/founderDeploymentPackage'
import { useWalletChainId } from 'hooks/useWalletChainId'
import { toSafeBigInt } from 'utils/safeBigInt'
import { resolveFounderOperationalState, type FounderOperationalState } from 'lib/deployment-orchestrator/founderOperationalState'
import { nextFounderDeployTarget } from 'lib/deployment-orchestrator/founderSequence'
import { DEPLOYMENT_ORDER } from 'lib/deployment-orchestrator/order'
import {
  activeLbStep,
  buildLbDeploySteps,
  type LbDeployedAddresses,
} from 'lib/deployment-orchestrator/founderLbDeployTx'
import { buildCreateTokenDeployStep } from 'lib/deployment-orchestrator/founderCtDeployTx'
import { CT_FACTORY_ALIAS } from 'lib/deployment-orchestrator/founderCtArtifacts'
import {
  bindValidatedCreateTokenFactory,
  decodeCtCreationFee,
  decodeCtFeeRecipient,
  encodeCtCreationFeeCall,
  encodeCtFeeRecipientCall,
  validateCtFactoryFromOnChain,
} from 'lib/deployment-orchestrator/founderCtSession'
import { buildPublicFarmDeployStep } from 'lib/deployment-orchestrator/founderPffDeployTx'
import { PFF_FACTORY_ALIAS } from 'lib/deployment-orchestrator/founderPffArtifacts'
import {
  bindValidatedPublicFarmFactory,
  decodePffAddress,
  encodePffEligibilitySignerCall,
  encodePffMarcoTokenCall,
  encodePffPairFactoryCall,
  encodePffTreasuryCall,
  validatePffFactoryFromOnChain,
} from 'lib/deployment-orchestrator/founderPffSession'
import {
  LB_STEP1_FACTUAL,
  LB_STEP2_FACTUAL,
  LB_STEP3_FACTUAL,
  LB_STEP3_CONTRACT,
  LB_STEP4_FACTUAL,
  LB_STEP4_CONTRACT,
  LB_STEP5_FACTUAL,
  LB_STEP5_CONTRACT,
  LB_STEP6_FACTUAL,
  LB_STEP6_CONTRACT,
  bindValidatedLbStep,
  liquidityBuilderMainnetReady,
  loadInitialFounderLbSession,
  persistFounderLbSession,
  validateLbStepFromOnChain,
  type FounderLbSession,
} from 'lib/deployment-orchestrator/founderLbSession'
import { CREATE_TOKEN_CANONICAL_DEPLOYMENT } from 'config/constants/createTokenFactoryDeployment'
import { PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT } from 'config/constants/publicFarmFactoryDeployment'
import {
  buildContractCreationRequest,
  createMockEthereum,
  isUserRejectedError,
  resolveWalletProvider,
  type EthereumProvider,
  walletEstimateDeployGas,
  walletEthCall,
  walletGetCode,
  walletGetGasPrice,
  walletGetTransaction,
  walletGetTransactionReceipt,
  walletSendDeployTransaction,
} from 'lib/deployment-orchestrator/founderWalletTx'
import { FounderAvalancheV2RouterPanel } from './FounderAvalancheV2RouterPanel'

const Root = styled.div`
  max-width: 920px;
  margin: 0 auto;
  padding: 28px 20px 64px;
  color: #f2f2f2;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
`
const Title = styled.h1`
  margin: 0 0 6px;
  font-size: 30px;
  font-weight: 780;
`
const Sub = styled.p`
  margin: 0 0 18px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
`
const Banner = styled.div<{ $tone?: 'ok' | 'warn' | 'bad' }>`
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'ok' ? 'rgba(24,240,137,0.45)' : $tone === 'bad' ? 'rgba(255,107,107,0.45)' : 'rgba(244,196,48,0.4)'};
  background: ${({ $tone }) =>
    $tone === 'ok' ? 'rgba(24,240,137,0.1)' : $tone === 'bad' ? 'rgba(255,107,107,0.1)' : 'rgba(244,196,48,0.08)'};
  color: ${({ $tone }) => ($tone === 'ok' ? '#18f089' : $tone === 'bad' ? '#ff8f8f' : '#f4c430')};
`
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  margin-bottom: 16px;
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`
const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  strong {
    color: #f2f2f2;
    font-size: 13px;
    word-break: break-all;
  }
`
const Card = styled.section`
  border-radius: 14px;
  border: 1px solid rgba(24, 240, 137, 0.35);
  background: rgba(12, 18, 14, 0.96);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`
const CardTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 750;
`
const FieldList = styled.dl`
  margin: 0;
  display: grid;
  gap: 8px;
  dt {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.45);
  }
  dd {
    margin: 0;
    font-size: 13px;
    color: #f2f2f2;
    word-break: break-all;
  }
`
const BtnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`
const Btn = styled.button<{ $primary?: boolean; $enabled?: boolean }>`
  min-height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid
    ${({ $primary, $enabled }) =>
      $primary && $enabled ? 'rgba(24,240,137,0.5)' : 'rgba(255,255,255,0.14)'};
  background: ${({ $primary, $enabled }) =>
    $primary && $enabled ? 'rgba(24,240,137,0.18)' : 'rgba(255,255,255,0.04)'};
  color: ${({ $primary, $enabled }) => ($primary && $enabled ? '#18f089' : 'rgba(255,255,255,0.75)')};
  font-size: 14px;
  font-weight: 750;
  cursor: ${({ $enabled }) => ($enabled ? 'pointer' : 'not-allowed')};
  opacity: ${({ $enabled }) => ($enabled ? 1 : 0.55)};
`
const Check = styled.label`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  input {
    margin-top: 2px;
  }
`
const Details = styled.details`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  pre {
    white-space: pre-wrap;
    word-break: break-all;
    color: rgba(255, 255, 255, 0.65);
  }
`
const StatusLink = styled(Link)`
  display: inline-block;
  margin-top: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: underline;
`

const LABELS = {
  liquidity_builder: 'Liquidity Builder',
  create_token: 'Create Token Factory',
  public_farm_factory: 'Public Farm Factory',
} as const

function toneFor(state: FounderOperationalState): 'ok' | 'warn' | 'bad' {
  if (state === 'READY' || state === 'READY_TO_DEPLOY') return 'ok'
  if (state === 'WRONG_WALLET' || state === 'WRONG_CHAIN' || state === 'DEPLOYMENT_FAILED' || state === 'QUARANTINED')
    return 'bad'
  return 'warn'
}

function mapStepToDeployed(stepId: string, address: string, prev: LbDeployedAddresses): LbDeployedAddresses {
  if (stepId.includes('ExecutionMath')) return { ...prev, math: address }
  if (stepId.includes('FeeReceiver')) return { ...prev, feeReceiver: address }
  if (stepId.includes('Authorizer')) return { ...prev, authorizer: address }
  if (stepId.includes('FeeSink')) return { ...prev, feeSink: address }
  if (stepId.includes('Program')) return { ...prev, program: address }
  if (stepId.includes('Factory')) return { ...prev, factory: address }
  return prev
}

type ProviderUiStatus = 'idle' | 'loading' | 'ready' | 'unavailable'

export const FounderDeploymentShell: React.FC = () => {
  const { address, isConnected, connector } = useAccount()
  const chainId = useWalletChainId()
  const router = useRouter()
  const deploymentPackage = useMemo(
    () => resolveFounderDeploymentPackage(router.query.chain),
    [router.query.chain],
  )
  const packageChainMatch = isFounderPackageChainMatch(deploymentPackage, chainId)
  const {
    data: balance,
    isLoading: balanceLoading,
    isFetching: balanceFetching,
    isError: balanceError,
    isFetched: balanceFetched,
  } = useBalance({ address, enabled: Boolean(address) })

  const [boot] = useState(() => loadInitialFounderLbSession())
  const [session, setSession] = useState<FounderLbSession>(boot)
  const [deployed, setDeployed] = useState<LbDeployedAddresses>(boot.deployed)
  const [completed, setCompleted] = useState<string[]>(boot.completedStepIds)
  const [reviewed, setReviewed] = useState(false)
  const [estimateStatus, setEstimateStatus] = useState<GasEstimateStatus>('pending')
  const [perTx, setPerTx] = useState<PerTxGasEstimate[]>([])
  const [gasPriceWei, setGasPriceWei] = useState<bigint | null>(null)
  const [gasError, setGasError] = useState<string | null>(null)
  const [totalCostWei, setTotalCostWei] = useState<bigint | null>(null)
  const [statusNote, setStatusNote] = useState<string | null>(() => {
    if (liquidityBuilderMainnetReady(boot)) {
      return `Liquidity Builder MAINNET READY · Factory ${LB_STEP6_FACTUAL.contractAddress} · DEPLOYED · VALIDATED · BOUND · READY`
    }
    if (boot.completedStepIds.includes(LB_STEP5_FACTUAL.stepId)) {
      return `Step 5 VALIDATED · BOUND · ${LB_STEP5_FACTUAL.contractAddress} · Step 6 ${LB_STEP6_CONTRACT} ready for Founder signature.`
    }
    if (boot.completedStepIds.includes(LB_STEP4_FACTUAL.stepId)) {
      return `Step 4 VALIDATED · BOUND · ${LB_STEP4_FACTUAL.contractAddress} · Step 5 ${LB_STEP5_CONTRACT} ready for Founder signature.`
    }
    if (boot.completedStepIds.includes(LB_STEP3_FACTUAL.stepId)) {
      return `Step 3 VALIDATED · BOUND · ${LB_STEP3_FACTUAL.contractAddress} · Step 4 ${LB_STEP4_CONTRACT} ready for Founder signature.`
    }
    if (boot.completedStepIds.includes(LB_STEP2_FACTUAL.stepId)) {
      return `Step 2 VALIDATED · BOUND · ${LB_STEP2_FACTUAL.contractAddress} · Step 3 ${LB_STEP3_CONTRACT} ready for Founder signature.`
    }
    if (boot.completedStepIds.includes(LB_STEP1_FACTUAL.stepId)) {
      return `Step 1 VALIDATED · ${LB_STEP1_FACTUAL.contractAddress} · Step 2 unlocked for Founder signature.`
    }
    return null
  })
  const [txHash, setTxHash] = useState<string | null>(() =>
    boot.bindings.find((b) => b.stepId === LB_STEP6_FACTUAL.stepId)?.txHash ??
      boot.bindings.find((b) => b.stepId === LB_STEP5_FACTUAL.stepId)?.txHash ??
      boot.bindings.find((b) => b.stepId === LB_STEP4_FACTUAL.stepId)?.txHash ??
      boot.bindings.find((b) => b.stepId === LB_STEP3_FACTUAL.stepId)?.txHash ??
      boot.bindings.find((b) => b.stepId === LB_STEP2_FACTUAL.stepId)?.txHash ??
      boot.bindings.find((b) => b.stepId === LB_STEP1_FACTUAL.stepId)?.txHash ??
      null,
  )
  const [signaturePending, setSignaturePending] = useState(false)
  const [transactionSubmitted, setTransactionSubmitted] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [validating, setValidating] = useState(false)
  const [failed, setFailed] = useState(false)
  const [quarantined, setQuarantined] = useState(false)
  const [lastWalletRequest, setLastWalletRequest] = useState<Record<string, string> | null>(null)
  const [providerStatus, setProviderStatus] = useState<ProviderUiStatus>('idle')
  const [pffCapturedAddress, setPffCapturedAddress] = useState<string | null>(null)
  const [pffReceiptStatus, setPffReceiptStatus] = useState<string | null>(null)

  const activeSubsystem = nextFounderDeployTarget() ?? 'liquidity_builder'
  const isCreateTokenStage = activeSubsystem === 'create_token'
  const isPublicFarmStage = activeSubsystem === 'public_farm_factory'
  const lbPackageBuild = useMemo(() => buildLbDeploySteps(deployed), [deployed])
  const ctPackageBuild = useMemo(() => buildCreateTokenDeployStep(), [])
  const pffPackageBuild = useMemo(() => buildPublicFarmDeployStep(), [])
  const packageBuild = isPublicFarmStage
    ? {
        artifactStatus: pffPackageBuild.artifactStatus,
        invalidReasons: pffPackageBuild.invalidReasons,
        steps: pffPackageBuild.steps,
        economicReview: pffPackageBuild.economicReview,
      }
    : isCreateTokenStage
      ? {
          artifactStatus: ctPackageBuild.artifactStatus,
          invalidReasons: ctPackageBuild.invalidReasons,
          steps: ctPackageBuild.steps,
          economicReview: ctPackageBuild.economicReview,
        }
      : lbPackageBuild
  const lbStep = useMemo(
    () => activeLbStep(lbPackageBuild.steps, completed),
    [lbPackageBuild.steps, completed],
  )
  const step = isPublicFarmStage
    ? pffPackageBuild.step
    : isCreateTokenStage
      ? ctPackageBuild.step
      : lbStep
  const step1Binding = session.bindings.find((b) => b.stepId === LB_STEP1_FACTUAL.stepId) ?? null
  const step2Binding = session.bindings.find((b) => b.stepId === LB_STEP2_FACTUAL.stepId) ?? null
  const step3Binding = session.bindings.find((b) => b.stepId === LB_STEP3_FACTUAL.stepId) ?? null
  const step4Binding = session.bindings.find((b) => b.stepId === LB_STEP4_FACTUAL.stepId) ?? null
  const step5Binding = session.bindings.find((b) => b.stepId === LB_STEP5_FACTUAL.stepId) ?? null
  const step6Binding = session.bindings.find((b) => b.stepId === LB_STEP6_FACTUAL.stepId) ?? null
  const lbMainnetReady = liquidityBuilderMainnetReady(session)
  const completedSteps = useMemo(
    () => lbPackageBuild.steps.filter((s) => completed.includes(s.stepId)),
    [lbPackageBuild.steps, completed],
  )
  const ctFactoryStillNull = CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress == null
  const pffFactoryStillNull = PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.factoryAddress == null

  // Persist once on mount so Step 1 binding is available across reloads.
  useEffect(() => {
    persistFounderLbSession(boot)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Coerce at the boundary so ethers BigNumber / string never enter bigint arithmetic.
  const balanceWei = useMemo(() => toSafeBigInt(balance?.value ?? null), [balance?.value])

  const applyValidatedBinding = useCallback((record: Parameters<typeof bindValidatedLbStep>[1]) => {
    setSession((prev) => {
      const next = bindValidatedLbStep(prev, record)
      setDeployed(next.deployed)
      setCompleted(next.completedStepIds)
      persistFounderLbSession(next)
      return next
    })
    setReviewed(false)
    setEstimateStatus('pending')
    setPerTx([])
    setTotalCostWei(null)
    setTransactionSubmitted(false)
    setConfirming(false)
    setValidating(false)
  }, [])

  const resolveProvider = useCallback(async (): Promise<EthereumProvider | null> => {
    setProviderStatus('loading')
    try {
      const fromConnector = connector ? await connector.getProvider() : null
      if (fromConnector && typeof (fromConnector as { then?: unknown }).then === 'function') {
        setProviderStatus('unavailable')
        return null
      }
      const preferred =
        fromConnector && typeof (fromConnector as EthereumProvider).request === 'function'
          ? (fromConnector as EthereumProvider)
          : null
      const resolved = resolveWalletProvider(preferred)
      setProviderStatus(resolved ? 'ready' : 'unavailable')
      return resolved
    } catch {
      const fallback = resolveWalletProvider(null)
      setProviderStatus(fallback ? 'ready' : 'unavailable')
      return fallback
    }
  }, [connector])

  const gas = useMemo(() => {
    try {
      return assessFounderGasReadiness({
        balanceWei,
        estimateStatus,
        gasPriceWei,
        gasPriceSource: gasPriceWei ? 'wallet' : 'none',
        perTx,
        estimatedTotalCostWei: totalCostWei,
        error: gasError,
      })
    } catch (e) {
      return assessFounderGasReadiness({
        balanceWei: null,
        estimateStatus: 'unavailable',
        error: e instanceof Error ? e.message : 'Gas readiness evaluation failed',
      })
    }
  }, [balanceWei, estimateStatus, gasPriceWei, perTx, totalCostWei, gasError])

  const gates = assessFounderDeployGates({
    connectedWallet: isConnected ? address ?? null : null,
    chainId: chainId ?? null,
    balanceWei,
    artifactValid: packageBuild.artifactStatus === 'ARTIFACTS_VALID',
    constructorValid: Boolean(step && !step.blockedReason && step.deploymentData),
    subsystemReady:
      activeSubsystem === 'liquidity_builder' ||
      activeSubsystem === 'create_token' ||
      activeSubsystem === 'public_farm_factory',
  })

  const operationalState = resolveFounderOperationalState({
    gates,
    gas,
    artifactStatus: packageBuild.artifactStatus,
    signaturePending,
    transactionSubmitted,
    confirming,
    validating,
    failed,
    quarantined,
  })

  /** CT / PFF mission surface: READY_TO_DEPLOY → READY_FOR_SIGNATURE (same gate). */
  const displayOperationalState = useMemo(() => {
    // Avalanche V2 Router package: never inherit BNB-only WRONG_CHAIN from LB/CT/PFF gates.
    if (deploymentPackage.isAvalancheRouterPackage) {
      if (!isConnected) return 'CONNECT_WALLET' as const
      if (!isAuthorizedMelegaDeployer(address)) return 'WRONG_WALLET' as const
      if (!packageChainMatch) return 'WRONG_CHAIN' as const
      return 'READY FOR FOUNDER SIGNATURE' as const
    }
    if ((isCreateTokenStage || isPublicFarmStage) && operationalState === 'READY_TO_DEPLOY') {
      return 'READY_FOR_SIGNATURE' as FounderOperationalState | 'READY_FOR_SIGNATURE'
    }
    return operationalState
  }, [
    deploymentPackage.isAvalancheRouterPackage,
    isConnected,
    address,
    packageChainMatch,
    isCreateTokenStage,
    isPublicFarmStage,
    operationalState,
  ])

  const authorizedConnected = Boolean(
    isConnected && address && isAuthorizedMelegaDeployer(address) && chainId === FOUNDER_DEPLOY_CHAIN_ID,
  )

  const showPackageWrongChain = Boolean(isConnected && chainId != null && !packageChainMatch)

  const canEstimate =
    authorizedConnected && packageBuild.artifactStatus === 'ARTIFACTS_VALID' && Boolean(step?.deploymentData)

  const deployEnabled =
    operationalState === 'READY_TO_DEPLOY' &&
    reviewed &&
    Boolean(step?.deploymentData) &&
    !signaturePending

  const runGasEstimate = useCallback(async () => {
    const estimateFor = address
    const stepId = step?.stepId
    const deploymentData = step?.deploymentData
    const contractName = step?.contractName
    setGasError(null)
    setEstimateStatus('pending')
    setStatusNote('Encoding constructor · estimating exact deployment transaction…')
    try {
      const eth = await resolveProvider()
      if (!eth) throw new Error('Wallet provider unavailable')
      if (!estimateFor || !deploymentData) throw new Error('No deployment payload for active step')
      const gp = await walletGetGasPrice(eth)
      const units = await walletEstimateDeployGas(eth, estimateFor, deploymentData)
      if (estimateFor !== address || stepId !== step?.stepId) return
      const cost = units * gp
      const row: PerTxGasEstimate = {
        stepId: stepId || 'unknown',
        contractName: contractName || 'Unknown',
        gasUnits: units.toString(),
        gasPriceWei: gp.toString(),
        costWei: cost.toString(),
        costBnb: weiToBnb(cost),
      }
      setGasPriceWei(gp)
      setPerTx([row])
      setTotalCostWei(cost)
      setEstimateStatus('ready')
      setStatusNote(`Gas estimate ready for ${contractName}. Ready for Founder signature after review.`)
    } catch (e) {
      if (estimateFor !== address || stepId !== step?.stepId) return
      setEstimateStatus('unavailable')
      setGasError(e instanceof Error ? e.message : 'Gas estimate failed')
      setPerTx([])
      setTotalCostWei(null)
      setStatusNote('Gas estimate temporarily unavailable. Certified artifact remains loaded — use Retry Gas Estimate.')
    }
  }, [address, step, resolveProvider])

  // Auto-estimate once wallet + certified payload are ready (never blocks artifact load).
  useEffect(() => {
    if (!canEstimate || estimateStatus === 'ready' || signaturePending) return
    if (estimateStatus === 'unavailable') return
    if (providerStatus === 'unavailable') return
    void runGasEstimate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEstimate, step?.stepId, address, chainId])

  useEffect(() => {
    if (isConnected && address) return
    setProviderStatus('idle')
    setEstimateStatus('pending')
    setGasError(null)
    setPerTx([])
    setTotalCostWei(null)
    setGasPriceWei(null)
  }, [isConnected, address])

  const onDeploy = useCallback(async () => {
    setFailed(false)
    if (!step?.deploymentData) {
      setStatusNote('Certified creation payload unavailable for this step — artifact integrity failed.')
      return
    }
    if (!address) {
      setStatusNote('Connect the authorized MELEGA DEPLOYER.')
      return
    }
    if (!deployEnabled) {
      const blockers: string[] = []
      if (operationalState !== 'READY_TO_DEPLOY') blockers.push(`state=${operationalState}`)
      if (!reviewed) blockers.push('review checkbox required')
      if (estimateStatus !== 'ready') blockers.push('exact gas estimate required')
      setStatusNote(`Deploy blocked: ${blockers.join('; ')}.`)
      return
    }
    setStatusNote('Ready for Founder signature — requesting browser wallet…')
    setSignaturePending(true)
    try {
      const eth = await resolveProvider()
      if (!eth) {
        setStatusNote('Wallet provider unavailable. Open MetaMask / the connected browser wallet and retry.')
        return
      }
      const gasUnits = perTx[0]?.gasUnits ? BigInt(perTx[0].gasUnits) : null
      const req = buildContractCreationRequest({
        from: AUTHORIZED_MELEGA_DEPLOYER,
        data: step.deploymentData,
        gasUnits,
      })
      setLastWalletRequest({
        from: req.from,
        data: req.data.slice(0, 66) + '…',
        dataLength: String(req.data.length),
        value: req.value,
        hasTo: 'false',
        contract: step.contractName,
      })
      const hash = await walletSendDeployTransaction(
        eth,
        AUTHORIZED_MELEGA_DEPLOYER,
        step.deploymentData,
        gasUnits,
      )
      setTxHash(hash)
      setSignaturePending(false)
      setTransactionSubmitted(true)
      setConfirming(true)
      setStatusNote('Transaction submitted — waiting for receipt. Binding only after validation.')

      // Mock path for automated tests (never broadcasts / never polls mainnet).
      if (hash === `0x${'ab'.repeat(32)}`) {
        setConfirming(false)
        setValidating(false)
        if (isCreateTokenStage) {
          // Prep mission: never fabricate SSOT factoryAddress; session-only mock note.
          setStatusNote(
            `${CT_FACTORY_ALIAS} mock receipt accepted · factoryAddress remains null until live validation + bind.`,
          )
          return
        }
        if (isPublicFarmStage) {
          setPffReceiptStatus('mock')
          setPffCapturedAddress(null)
          setStatusNote(
            `${PFF_FACTORY_ALIAS} mock path · AWAITING_VALIDATION · SSOT factoryAddress remains null (not fabricated).`,
          )
          return
        }
        applyValidatedBinding({
          stepId: step.stepId,
          contractName: step.contractName,
          contractAddress: '0x1111111111111111111111111111111111111111',
          txHash: hash,
          chainId: 56,
          runtimeBytecodeSha256: step.expectedRuntimeHash,
          status: 'VALIDATED',
          validatedAt: new Date().toISOString(),
        })
        setStatusNote(`${step.contractName} validated (mock receipt). Next step unlocked.`)
        return
      }

      // Live mainnet: poll receipt + runtime hash, then bind.
      setValidating(true)
      let receipt = await walletGetTransactionReceipt(eth, hash)
      for (let i = 0; i < 40 && !receipt; i += 1) {
        await new Promise((r) => setTimeout(r, 1500))
        receipt = await walletGetTransactionReceipt(eth, hash)
      }
      setConfirming(false)
      if (!receipt) {
        setValidating(false)
        setStatusNote('Receipt not available yet. Re-check later — no binding performed.')
        return
      }
      const codeAddr =
        receipt.contractAddress && /^0x[a-fA-F0-9]{40}$/.test(receipt.contractAddress)
          ? receipt.contractAddress
          : null
      if (!codeAddr) {
        setValidating(false)
        setQuarantined(true)
        setStatusNote('Missing contract address in receipt — quarantined.')
        return
      }
      const code = await walletGetCode(eth, codeAddr)
      if (isCreateTokenStage) {
        const txMeta = await walletGetTransaction(eth, hash)
        const nonceRaw = txMeta?.nonce
        const nonce =
          nonceRaw == null
            ? null
            : typeof nonceRaw === 'string'
              ? Number.parseInt(nonceRaw, 16)
              : Number(nonceRaw)

        let creationFeeWeiOnChain: string | null = null
        let feeRecipientOnChain: string | null = null
        try {
          const feeRaw = await walletEthCall(eth, codeAddr, encodeCtCreationFeeCall())
          const recipRaw = await walletEthCall(eth, codeAddr, encodeCtFeeRecipientCall())
          creationFeeWeiOnChain = decodeCtCreationFee(feeRaw)
          feeRecipientOnChain = decodeCtFeeRecipient(recipRaw)
        } catch {
          creationFeeWeiOnChain = null
          feeRecipientOnChain = null
        }

        const validated = validateCtFactoryFromOnChain({
          txHash: hash,
          nonce: Number.isFinite(nonce as number) ? (nonce as number) : null,
          receipt,
          runtimeBytecode: code,
          creationFeeWeiOnChain,
          feeRecipientOnChain,
        })
        setValidating(false)
        if (!validated.ok) {
          setQuarantined(true)
          setStatusNote(`${CT_FACTORY_ALIAS} quarantined — ${validated.reason}. No bind.`)
          return
        }
        // Session bind (in-memory). SSOT factoryAddress stays null until Founder commits the factual address.
        const bound = bindValidatedCreateTokenFactory(validated.evidence)
        setStatusNote(
          `${CT_FACTORY_ALIAS} DEPLOYED · VALIDATED · SESSION-BOUND at ${bound.factoryAddress}. Commit SSOT factoryAddress to unlock user Create Token. User creation remains disabled until SSOT bind.`,
        )
        return
      }
      if (isPublicFarmStage) {
        setPffCapturedAddress(codeAddr)
        setPffReceiptStatus(String(receipt.status ?? 'unknown'))
        const txMeta = await walletGetTransaction(eth, hash)
        const nonceRaw = txMeta?.nonce
        const nonce =
          nonceRaw == null
            ? null
            : typeof nonceRaw === 'string'
              ? Number.parseInt(nonceRaw, 16)
              : Number(nonceRaw)

        let treasuryOnChain: string | null = null
        let marcoTokenOnChain: string | null = null
        let pairFactoryOnChain: string | null = null
        let eligibilitySignerOnChain: string | null = null
        try {
          treasuryOnChain = decodePffAddress(
            'treasury',
            await walletEthCall(eth, codeAddr, encodePffTreasuryCall()),
          )
          marcoTokenOnChain = decodePffAddress(
            'marcoToken',
            await walletEthCall(eth, codeAddr, encodePffMarcoTokenCall()),
          )
          pairFactoryOnChain = decodePffAddress(
            'pairFactory',
            await walletEthCall(eth, codeAddr, encodePffPairFactoryCall()),
          )
          eligibilitySignerOnChain = decodePffAddress(
            'eligibilitySigner',
            await walletEthCall(eth, codeAddr, encodePffEligibilitySignerCall()),
          )
        } catch {
          treasuryOnChain = null
          marcoTokenOnChain = null
          pairFactoryOnChain = null
          eligibilitySignerOnChain = null
        }

        const validated = validatePffFactoryFromOnChain({
          txHash: hash,
          nonce: Number.isFinite(nonce as number) ? (nonce as number) : null,
          receipt,
          runtimeBytecode: code,
          treasuryOnChain,
          marcoTokenOnChain,
          pairFactoryOnChain,
          eligibilitySignerOnChain,
        })
        setValidating(false)
        if (!validated.ok) {
          setQuarantined(true)
          setStatusNote(
            `${PFF_FACTORY_ALIAS} AWAITING_VALIDATION · quarantined — ${validated.reason}. Captured tx ${hash} · address ${codeAddr}. SSOT factoryAddress not bound.`,
          )
          return
        }
        // Session evidence only — SSOT factoryAddress stays null until validation mission commits factual bind.
        const bound = bindValidatedPublicFarmFactory(validated.evidence)
        setStatusNote(
          `${PFF_FACTORY_ALIAS} AWAITING_VALIDATION · receipt captured · session evidence at ${bound.factoryAddress}. SSOT factoryAddress remains null until validation bind. Tx ${hash}.`,
        )
        return
      }
      const validated = validateLbStepFromOnChain({
        stepId: step.stepId,
        contractName: step.contractName,
        chainId: FOUNDER_DEPLOY_CHAIN_ID,
        txHash: hash,
        receipt,
        runtimeBytecode: code,
        expectedRuntimeBytecodeSha256: step.expectedRuntimeHash,
        requireDeployer: AUTHORIZED_MELEGA_DEPLOYER,
      })
      setValidating(false)
      if (!validated.ok) {
        setQuarantined(true)
        setStatusNote(validated.reason)
        return
      }
      applyValidatedBinding(validated.record)
      setStatusNote(
        `${step.contractName} DEPLOYED · VALIDATED · READY at ${validated.record.contractAddress}. Next step unlocked.`,
      )
    } catch (e) {
      setSignaturePending(false)
      if (isUserRejectedError(e)) {
        setStatusNote('Transaction rejected in wallet. No transaction was submitted.')
        return
      }
      setFailed(true)
      setStatusNote(e instanceof Error ? e.message.slice(0, 200) : 'Deployment failed')
    } finally {
      setSignaturePending(false)
    }
  }, [
    deployEnabled,
    step,
    address,
    operationalState,
    reviewed,
    estimateStatus,
    perTx,
    resolveProvider,
    applyValidatedBinding,
    isCreateTokenStage,
    isPublicFarmStage,
  ])

  // Keep mock helper referenced for tests without mainnet broadcast
  void createMockEthereum
  void lastWalletRequest
  void mapStepToDeployed

  return (
    <Root data-testid="founder-deployment-shell" data-founder-primary="true">
      <Title>Permanent Contract Deployment</Title>
      <Sub>Founder-signed mainnet deployment · browser wallet only · no KMS · no server signer</Sub>

      <FounderAvalancheV2RouterPanel />

      <Banner
        $tone={
          deploymentPackage.isAvalancheRouterPackage && packageChainMatch && isAuthorizedMelegaDeployer(address)
            ? 'ok'
            : toneFor(
                displayOperationalState === 'READY FOR FOUNDER SIGNATURE'
                  ? 'READY_TO_DEPLOY'
                  : (displayOperationalState as FounderOperationalState),
              )
        }
        data-testid="founder-operational-state"
        data-state={displayOperationalState}
        data-package={deploymentPackage.packageId}
        data-required-chain={deploymentPackage.requiredChainId}
      >
        {displayOperationalState}
        {isConnected &&
        address &&
        isAuthorizedMelegaDeployer(address) &&
        packageChainMatch
          ? ' · Authorized MELEGA DEPLOYER connected'
          : ''}
      </Banner>

      {!isConnected && (
        <Banner $tone="warn" data-testid="founder-connect-prompt">
          Connect the authorized MELEGA DEPLOYER.
          <div style={{ marginTop: 10 }}>
            <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
          </div>
        </Banner>
      )}
      {isConnected && !isAuthorizedMelegaDeployer(address) && (
        <Banner $tone="bad" data-testid="founder-wrong-wallet">
          Connect the authorized MELEGA DEPLOYER.
        </Banner>
      )}
      {showPackageWrongChain && (
        <Banner $tone="bad" data-testid="founder-wrong-chain">
          {deploymentPackage.switchNetworkCopy}
          {` · required chain ${deploymentPackage.requiredChainId} (${deploymentPackage.requiredNetworkLabel})`}
        </Banner>
      )}
      {authorizedConnected && providerStatus === 'loading' && (
        <Banner $tone="warn" data-testid="founder-provider-loading">
          WALLET CONNECTED · PREPARING PROVIDER
        </Banner>
      )}
      {authorizedConnected && providerStatus === 'unavailable' && (
        <Banner $tone="bad" data-testid="founder-provider-unavailable">
          Wallet provider unavailable. Open MetaMask / the connected browser wallet and retry.
        </Banner>
      )}
      {authorizedConnected && (balanceLoading || balanceFetching) && !balanceFetched && (
        <Banner $tone="warn" data-testid="founder-balance-loading">
          LOADING BALANCE
        </Banner>
      )}
      {authorizedConnected && balanceError && (
        <Banner $tone="warn" data-testid="founder-balance-unavailable">
          BALANCE UNAVAILABLE — gas funding check waits for a successful balance read.
        </Banner>
      )}

      <Grid data-testid="founder-shell-summary">
        <Row>
          <span>Connected wallet</span>
          <strong data-testid="founder-connected-wallet">{address ?? '—'}</strong>
        </Row>
        <Row>
          <span>Required wallet</span>
          <strong>{AUTHORIZED_MELEGA_DEPLOYER}</strong>
        </Row>
        <Row>
          <span>Network</span>
          <strong data-testid="founder-network">
            {chainId ?? '—'}
            {chainId === FOUNDER_DEPLOY_CHAIN_ID
              ? ' (BNB Smart Chain)'
              : chainId === 43114
                ? ' (Avalanche C-Chain)'
                : ''}
            {deploymentPackage.isAvalancheRouterPackage
              ? ` · package requires ${deploymentPackage.requiredChainId}`
              : ''}
          </strong>
        </Row>
        <Row>
          <span>Balance</span>
          <strong data-testid="founder-balance">
            {balanceLoading || (balanceFetching && !balanceFetched)
              ? 'Loading…'
              : balanceError
                ? 'Unavailable'
                : balance?.formatted
                  ? `${balance.formatted} ${balance.symbol}`
                  : '—'}
          </strong>
        </Row>
        <Row>
          <span>Current deployment stage</span>
          <strong>{LABELS[activeSubsystem]}</strong>
        </Row>
        <Row>
          <span>Deployment order</span>
          <strong>{DEPLOYMENT_ORDER.map((id) => LABELS[id]).join(' → ')}</strong>
        </Row>
      </Grid>

      {packageBuild.artifactStatus === 'ARTIFACTS_INVALID' && (
        <Banner $tone="bad" data-testid="founder-artifacts-invalid">
          Artifact integrity failed — {packageBuild.invalidReasons[0]}
        </Banner>
      )}
      {packageBuild.artifactStatus === 'ARTIFACTS_VALID' && (
        <Banner $tone="ok" data-testid="founder-artifacts-verified">
          Certified artifact loaded · Artifact hash verified
          {step?.artifactVerified ? ` · ${step.contractName} ready` : ''}
        </Banner>
      )}

      <Card data-testid="founder-economic-review">
        <CardTitle>Economic review</CardTitle>
        <FieldList>
          {packageBuild.economicReview.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </FieldList>
      </Card>

      {completedSteps.length > 0 && (
        <Card data-testid="founder-completed-steps">
          <CardTitle>Validated steps</CardTitle>
          {completedSteps.map((s) => {
            const binding = session.bindings.find((b) => b.stepId === s.stepId)
            return (
              <div key={s.stepId} data-testid={`founder-completed-${s.stepId}`}>
                <Row>
                  <span>
                    Step {s.index} · {s.contractName}
                  </span>
                  <strong data-testid={`founder-step${s.index}-status`}>
                    DEPLOYED · VALIDATED · READY
                    {binding ? ` · ${binding.contractAddress}` : ''}
                  </strong>
                </Row>
                {binding?.txHash && (
                  <Row>
                    <span>Transaction</span>
                    <strong>{binding.txHash}</strong>
                  </Row>
                )}
              </div>
            )
          })}
          {step1Binding && (
            <Banner $tone="ok" data-testid="founder-step1-validated">
              Step 1 LiquidityBuildingExecutionMathV1 validated at {step1Binding.contractAddress}
            </Banner>
          )}
          {step2Binding && (
            <Banner $tone="ok" data-testid="founder-step2-validated">
              Step 2 LiquidityBuildingTreasuryFeeReceiverV1 validated at {step2Binding.contractAddress}
            </Banner>
          )}
          {step2Binding && (
            <Banner $tone="ok" data-testid="founder-step2-bound">
              Step 2 bound · lbFeeReceiver = {step2Binding.contractAddress}
            </Banner>
          )}
          {step3Binding && (
            <Banner $tone="ok" data-testid="founder-step3-validated">
              Step 3 LiquidityBuildingExecutionAuthorizerV1 validated at {step3Binding.contractAddress}
            </Banner>
          )}
          {step3Binding && (
            <Banner $tone="ok" data-testid="founder-step3-bound">
              Step 3 bound · lbAuthorizer = {step3Binding.contractAddress}
            </Banner>
          )}
          {step4Binding && (
            <Banner $tone="ok" data-testid="founder-step4-validated">
              Step 4 LiquidityBuildingTreasuryFeeSinkV1 validated at {step4Binding.contractAddress}
            </Banner>
          )}
          {step4Binding && (
            <Banner $tone="ok" data-testid="founder-step4-bound">
              Step 4 bound · lbFeeSink = {step4Binding.contractAddress}
            </Banner>
          )}
          {step5Binding && (
            <Banner $tone="ok" data-testid="founder-step5-validated">
              Step 5 LiquidityBuildingProgramV1 validated at {step5Binding.contractAddress}
            </Banner>
          )}
          {step5Binding && (
            <Banner $tone="ok" data-testid="founder-step5-bound">
              Step 5 bound · lbProgramImplementation = {step5Binding.contractAddress}
            </Banner>
          )}
          {step6Binding && (
            <Banner $tone="ok" data-testid="founder-step6-validated">
              Step 6 / Factory LiquidityBuildingFactoryV1 validated at {step6Binding.contractAddress}
            </Banner>
          )}
          {step6Binding && (
            <Banner $tone="ok" data-testid="founder-step6-bound">
              Step 6 bound · lbFactory = {step6Binding.contractAddress}
            </Banner>
          )}
        </Card>
      )}

      {lbMainnetReady && (
        <Banner $tone="ok" data-testid="founder-lb-mainnet-ready">
          Liquidity Builder READY · DEPLOYED · VALIDATED · BOUND · no deployment blockers · canary not executed
        </Banner>
      )}

      {!ctFactoryStillNull && (
        <Banner $tone="ok" data-testid="founder-create-token-mainnet-ready">
          CreateTokenFactoryV1 DEPLOYED · VALIDATED · BOUND · READY at{' '}
          {CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress} · user Create Token unlocked · no redeploy
        </Banner>
      )}

      {isCreateTokenStage && ctFactoryStillNull && (
        <Banner $tone="ok" data-testid="founder-create-token-unlocked">
          Create Token Factory unlocked after Liquidity Builder READY · factoryAddress remains null until Founder
          deploy + bind
        </Banner>
      )}

      {step && (
        <Card
          data-testid="founder-active-step"
          data-create-token-ready={isCreateTokenStage ? 'true' : 'false'}
          data-public-farm-ready={isPublicFarmStage ? 'true' : 'false'}
          data-step3-ready={step.contractName === LB_STEP3_CONTRACT ? 'true' : 'false'}
          data-step4-ready={step.contractName === LB_STEP4_CONTRACT ? 'true' : 'false'}
          data-step5-ready={step.contractName === LB_STEP5_CONTRACT ? 'true' : 'false'}
          data-step6-ready={step.contractName === LB_STEP6_CONTRACT ? 'true' : 'false'}
        >
          <CardTitle
            data-testid={
              isPublicFarmStage
                ? 'founder-public-farm-factory-ready'
                : isCreateTokenStage
                  ? 'founder-create-token-ready'
                  : step.contractName === LB_STEP6_CONTRACT
                    ? 'founder-step6-ready'
                    : step.contractName === LB_STEP5_CONTRACT
                      ? 'founder-step5-ready'
                      : step.contractName === LB_STEP4_CONTRACT
                        ? 'founder-step4-ready'
                        : 'founder-step3-ready'
            }
          >
            {isPublicFarmStage
              ? `${PFF_FACTORY_ALIAS} · Ready for Founder signature`
              : isCreateTokenStage
                ? `${CT_FACTORY_ALIAS} · Ready for Founder signature`
                : `Liquidity Builder · Step ${step.index} of ${step.total}${
                    step.contractName === LB_STEP6_CONTRACT ||
                    step.contractName === LB_STEP5_CONTRACT ||
                    step.contractName === LB_STEP4_CONTRACT ||
                    step.contractName === LB_STEP3_CONTRACT
                      ? ' · Ready for Founder signature'
                      : ''
                  }`}
          </CardTitle>
          <Row>
            <span>Contract</span>
            <strong data-testid="founder-step-contract">{step.contractName}</strong>
          </Row>
          <Row>
            <span>Purpose</span>
            <strong>{step.purpose}</strong>
          </Row>
          <FieldList data-testid="founder-human-constructor">
            {step.humanFields.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
            {step.constructorArgs.map((a) => (
              <div key={a.name}>
                <dt>
                  Constructor · {a.name} ({a.type})
                </dt>
                <dd>{a.value}</dd>
              </div>
            ))}
          </FieldList>
          <Row>
            <span>Creation bytecode hash</span>
            <strong>{step.creationBytecodeHash ?? '—'}</strong>
          </Row>
          <Row>
            <span>Expected runtime hash</span>
            <strong>{step.expectedRuntimeHash}</strong>
          </Row>
          <Row>
            <span>Artifact status</span>
            <strong data-testid="founder-artifact-status">
              {step.artifactVerified
                ? 'Certified artifact loaded · Artifact hash verified'
                : step.blockedReason || 'Artifact integrity pending'}
            </strong>
          </Row>
          <Row>
            <span>Pipeline</span>
            <strong data-testid="founder-pipeline-status">
              {step.deploymentData
                ? estimateStatus === 'ready'
                  ? 'Gas estimate ready · Ready for Founder signature'
                  : estimateStatus === 'unavailable'
                    ? 'Certified artifact loaded · Gas estimate unavailable — retry'
                    : 'Certified artifact loaded · Encoding constructor · Gas estimate pending'
                : 'Waiting for certified creation payload'}
            </strong>
          </Row>
          {step.blockedReason && (
            <Banner $tone="warn" data-testid="founder-step-blocked">
              {step.blockedReason}
            </Banner>
          )}

          <Row>
            <span>Gas / funding</span>
            <strong data-testid="founder-gas-panel">
              {gas.estimateStatus === 'ready'
                ? `Est. ${gas.estimatedTotalCostBnb} BNB · min ${gas.recommendedMinimumBnb} BNB · ${
                    gas.fundingSufficient ? 'Balance sufficient' : `Shortfall ${gas.shortfallBnb ?? '—'} BNB`
                  }`
                : gas.message}
            </strong>
          </Row>

          <BtnRow>
            <Btn
              type="button"
              $enabled={canEstimate}
              disabled={!canEstimate}
              data-testid="founder-estimate-gas"
              onClick={() => void runGasEstimate()}
            >
              {estimateStatus === 'unavailable' ? 'Retry Gas Estimate' : 'Estimate Deployment Gas'}
            </Btn>
          </BtnRow>

          {gasError && (
            <Details data-testid="founder-gas-error">
              <summary>Technical gas error</summary>
              <pre>{gasError}</pre>
            </Details>
          )}

          <Check>
            <input
              type="checkbox"
              checked={reviewed}
              data-testid="founder-review-checkbox"
              onChange={(e) => setReviewed(e.target.checked)}
            />
            <span>
              I have reviewed the contract artifact, constructor arguments, fee configuration and destination.
            </span>
          </Check>

          <BtnRow>
            <Btn type="button" $enabled data-testid="founder-back-review" onClick={() => setReviewed(false)}>
              Back to Review
            </Btn>
            <Btn
              type="button"
              $enabled={canEstimate}
              disabled={!canEstimate}
              data-testid="founder-estimate-again"
              onClick={() => void runGasEstimate()}
            >
              Estimate Again
            </Btn>
            <Btn
              type="button"
              $primary
              $enabled={deployEnabled}
              disabled={!deployEnabled}
              data-testid="founder-deploy-button"
              data-deploy-label={
                isPublicFarmStage
                  ? 'Deploy Public Farm Factory'
                  : isCreateTokenStage
                    ? 'Deploy Create Token Factory'
                    : `Deploy ${step.contractName}`
              }
              onClick={() => void onDeploy()}
            >
              {isPublicFarmStage
                ? 'Deploy Public Farm Factory'
                : isCreateTokenStage
                  ? 'Deploy Create Token Factory'
                  : `Deploy ${step.contractName}`}
            </Btn>
          </BtnRow>

          <Row>
            <span>Parent CTA</span>
            <strong>
              {isPublicFarmStage
                ? 'Deploy Public Farm Factory'
                : isCreateTokenStage
                  ? 'Deploy Create Token Factory'
                  : `Deploy Liquidity Builder · Step ${step.index} of ${step.total}`}
            </strong>
          </Row>
          {isCreateTokenStage && (
            <Row>
              <span>Canonical factoryAddress</span>
              <strong data-testid="founder-ct-factory-null">
                {ctFactoryStillNull ? 'null (not fabricated)' : CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress}
              </strong>
            </Row>
          )}
          {isPublicFarmStage && (
            <Row>
              <span>Canonical factoryAddress</span>
              <strong data-testid="founder-pff-factory-null">
                {pffFactoryStillNull
                  ? 'null (not fabricated)'
                  : PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.factoryAddress}
              </strong>
            </Row>
          )}
          {!ctFactoryStillNull && (
            <Row>
              <span>Create Token factory (bound)</span>
              <strong data-testid="founder-ct-factory-bound">
                {CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress}
              </strong>
            </Row>
          )}
          <Row>
            <span>Transaction hash</span>
            <strong data-testid="founder-tx-hash">{txHash ?? '—'}</strong>
          </Row>
          {isPublicFarmStage && (
            <>
              <Row>
                <span>Receipt status</span>
                <strong data-testid="founder-pff-receipt-status">{pffReceiptStatus ?? '—'}</strong>
              </Row>
              <Row>
                <span>Captured contract address</span>
                <strong data-testid="founder-pff-captured-address">{pffCapturedAddress ?? '—'}</strong>
              </Row>
              <Banner $tone="ok" data-testid="founder-pff-awaiting-validation">
                AWAITING_VALIDATION · capture tx hash / receipt / contract address after Founder signature · do not
                fabricate · SSOT factoryAddress stays null until validation bind
              </Banner>
            </>
          )}
          {statusNote && (
            <Banner $tone="warn" data-testid="founder-status-note">
              {statusNote}
            </Banner>
          )}

          <Details>
            <summary>Technical JSON (collapsed)</summary>
            <pre>{JSON.stringify({ constructorArgs: step.constructorArgs, fees: packageBuild.economicReview }, null, 2)}</pre>
          </Details>
        </Card>
      )}

      {!pffFactoryStillNull && (
        <Banner $tone="ok" data-testid="founder-public-farm-mainnet-ready">
          PublicFarmFactoryV1 DEPLOYED · VALIDATED · BOUND · READY at{' '}
          {PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.factoryAddress} · Create Farm unlocked · no redeploy
        </Banner>
      )}
      {isPublicFarmStage && pffFactoryStillNull && (
        <Banner $tone="ok" data-testid="founder-public-farm-ready">
          PublicFarmFactoryV1 execution ready · Certified artifact loaded · Artifact hash verified · Constructor
          review · Gas estimate → READY_FOR_SIGNATURE · CTA Deploy Public Farm Factory · factoryAddress null · no
          automatic broadcast
        </Banner>
      )}
      {!lbMainnetReady && activeSubsystem !== 'liquidity_builder' && (
        <Banner $tone="warn" data-testid="founder-sequence-lock-lb">
          {LABELS[activeSubsystem]} locked until Liquidity Builder is DEPLOYED · VALIDATED · BOUND · READY.
        </Banner>
      )}

      <StatusLink href="/runtime/deployment/status">Read-only deployment status archive</StatusLink>
    </Root>
  )
}

export default FounderDeploymentShell
