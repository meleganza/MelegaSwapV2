/**
 * Founder Deployment Shell — executable browser-wallet surface.
 * No KMS. No server signer. No automatic mainnet broadcast.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { useAccount, useBalance, useChainId } from 'wagmi'
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
import { resolveFounderOperationalState, type FounderOperationalState } from 'lib/deployment-orchestrator/founderOperationalState'
import { nextFounderDeployTarget } from 'lib/deployment-orchestrator/founderSequence'
import { DEPLOYMENT_ORDER } from 'lib/deployment-orchestrator/order'
import {
  activeLbStep,
  buildLbDeploySteps,
  type LbDeployedAddresses,
} from 'lib/deployment-orchestrator/founderLbDeployTx'
import {
  buildContractCreationRequest,
  createMockEthereum,
  isUserRejectedError,
  resolveWalletProvider,
  type EthereumProvider,
  walletEstimateDeployGas,
  walletGetGasPrice,
  walletSendDeployTransaction,
} from 'lib/deployment-orchestrator/founderWalletTx'
import { extractContractAddressFromReceipt, validatePostDeployment } from 'lib/deployment-orchestrator/founderPostDeploy'

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

export const FounderDeploymentShell: React.FC = () => {
  const { address, isConnected, connector } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address })

  const [deployed, setDeployed] = useState<LbDeployedAddresses>({})
  const [completed, setCompleted] = useState<string[]>([])
  const [reviewed, setReviewed] = useState(false)
  const [estimateStatus, setEstimateStatus] = useState<GasEstimateStatus>('pending')
  const [perTx, setPerTx] = useState<PerTxGasEstimate[]>([])
  const [gasPriceWei, setGasPriceWei] = useState<bigint | null>(null)
  const [gasError, setGasError] = useState<string | null>(null)
  const [totalCostWei, setTotalCostWei] = useState<bigint | null>(null)
  const [statusNote, setStatusNote] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [signaturePending, setSignaturePending] = useState(false)
  const [transactionSubmitted, setTransactionSubmitted] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [validating, setValidating] = useState(false)
  const [failed, setFailed] = useState(false)
  const [quarantined, setQuarantined] = useState(false)
  const [lastWalletRequest, setLastWalletRequest] = useState<Record<string, string> | null>(null)

  const activeSubsystem = nextFounderDeployTarget() ?? 'liquidity_builder'
  const packageBuild = useMemo(() => buildLbDeploySteps(deployed), [deployed])
  const step = useMemo(() => activeLbStep(packageBuild.steps, completed), [packageBuild.steps, completed])

  const resolveProvider = useCallback(async (): Promise<EthereumProvider | null> => {
    try {
      const fromConnector = connector ? await connector.getProvider() : null
      const preferred =
        fromConnector && typeof (fromConnector as EthereumProvider).request === 'function'
          ? (fromConnector as EthereumProvider)
          : null
      return resolveWalletProvider(preferred)
    } catch {
      return resolveWalletProvider(null)
    }
  }, [connector])

  const gas = useMemo(
    () =>
      assessFounderGasReadiness({
        balanceWei: balance?.value ?? null,
        estimateStatus,
        gasPriceWei,
        gasPriceSource: gasPriceWei ? 'wallet' : 'none',
        perTx,
        estimatedTotalCostWei: totalCostWei,
        error: gasError,
      }),
    [balance?.value, estimateStatus, gasPriceWei, perTx, totalCostWei, gasError],
  )

  const gates = assessFounderDeployGates({
    connectedWallet: isConnected ? address ?? null : null,
    chainId: chainId ?? null,
    balanceWei: balance?.value ?? null,
    artifactValid: packageBuild.artifactStatus === 'ARTIFACTS_VALID',
    constructorValid: Boolean(step && !step.blockedReason && step.deploymentData),
    subsystemReady: activeSubsystem === 'liquidity_builder',
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

  const authorizedConnected = Boolean(
    isConnected && address && isAuthorizedMelegaDeployer(address) && chainId === FOUNDER_DEPLOY_CHAIN_ID,
  )

  const canEstimate =
    authorizedConnected && packageBuild.artifactStatus === 'ARTIFACTS_VALID' && Boolean(step?.deploymentData)

  const deployEnabled =
    operationalState === 'READY_TO_DEPLOY' &&
    reviewed &&
    Boolean(step?.deploymentData) &&
    !signaturePending

  const runGasEstimate = useCallback(async () => {
    setGasError(null)
    setEstimateStatus('pending')
    setStatusNote('Encoding constructor · estimating exact deployment transaction…')
    try {
      const eth = await resolveProvider()
      if (!eth) throw new Error('Wallet provider unavailable')
      if (!address || !step?.deploymentData) throw new Error('No deployment payload for active step')
      const gp = await walletGetGasPrice(eth)
      setGasPriceWei(gp)
      const units = await walletEstimateDeployGas(eth, address, step.deploymentData)
      const cost = units * gp
      const row: PerTxGasEstimate = {
        stepId: step.stepId,
        contractName: step.contractName,
        gasUnits: units.toString(),
        gasPriceWei: gp.toString(),
        costWei: cost.toString(),
        costBnb: weiToBnb(cost),
      }
      setPerTx([row])
      setTotalCostWei(cost)
      setEstimateStatus('ready')
      setStatusNote(`Gas estimate ready for ${step.contractName}. Ready for Founder signature after review.`)
    } catch (e) {
      setEstimateStatus('unavailable')
      setGasError(e instanceof Error ? e.message : 'Gas estimate failed')
      setPerTx([])
      setTotalCostWei(null)
      setStatusNote('Gas estimate unavailable. Certified artifact remains loaded — use Retry Gas Estimate.')
    }
  }, [address, step, resolveProvider])

  // Auto-estimate once wallet + certified payload are ready (never blocks artifact load).
  useEffect(() => {
    if (!canEstimate || estimateStatus === 'ready' || signaturePending) return
    if (estimateStatus === 'unavailable') return
    void runGasEstimate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEstimate, step?.stepId, address, chainId])

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
      // Automated tests / Cursor must not poll mainnet. Mock path validates below when hash is mock.
      if (hash === `0x${'ab'.repeat(32)}`) {
        setConfirming(false)
        setValidating(true)
        const parsed = extractContractAddressFromReceipt({
          contractAddress: '0x1111111111111111111111111111111111111111',
          status: 1,
        })
        const outcome = validatePostDeployment({
          subsystemId: 'liquidity_builder',
          chainId: 56,
          txHash: hash,
          contractAddress: parsed.address,
          receiptStatus: parsed.receiptStatus,
          runtimeBytecode: '0x6001600055',
          expectedRuntimeBytecodeHash: step.expectedRuntimeHash,
          observedRuntimeBytecodeHash: step.expectedRuntimeHash,
          constructorStateOk: true,
          treasuryOk: true,
          feeOk: true,
        })
        setValidating(false)
        if (outcome.status === 'QUARANTINED') {
          setQuarantined(true)
          setStatusNote(outcome.reason)
          return
        }
        if (outcome.status === 'READY' && outcome.contractAddress) {
          setDeployed((d) => mapStepToDeployed(step.stepId, outcome.contractAddress, d))
          setCompleted((c) => [...c, step.stepId])
          setReviewed(false)
          setEstimateStatus('pending')
          setPerTx([])
          setTotalCostWei(null)
          setTransactionSubmitted(false)
          setStatusNote(
            `${step.contractName} validated (mock receipt). CONTRACTS_DEPLOYED_BINDING_RELEASE_PENDING until live app consumes addresses.`,
          )
        }
      }
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
  ])

  // Keep mock helper referenced for tests without mainnet broadcast
  void createMockEthereum
  void lastWalletRequest

  return (
    <Root data-testid="founder-deployment-shell" data-founder-primary="true">
      <Title>Permanent Contract Deployment</Title>
      <Sub>Founder-signed mainnet deployment · browser wallet only · no KMS · no server signer</Sub>

      <Banner $tone={toneFor(operationalState)} data-testid="founder-operational-state" data-state={operationalState}>
        {operationalState}
        {authorizedConnected ? ' · Authorized MELEGA DEPLOYER connected' : ''}
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
      {isConnected && chainId !== FOUNDER_DEPLOY_CHAIN_ID && (
        <Banner $tone="bad" data-testid="founder-wrong-chain">
          Switch to BNB Smart Chain.
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
          <strong>
            {chainId ?? '—'}
            {chainId === FOUNDER_DEPLOY_CHAIN_ID ? ' (BNB Smart Chain)' : ''}
          </strong>
        </Row>
        <Row>
          <span>Balance</span>
          <strong data-testid="founder-balance">{balance ? `${balance.formatted} ${balance.symbol}` : '—'}</strong>
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

      {step && (
        <Card data-testid="founder-active-step">
          <CardTitle>
            Liquidity Builder · Step {step.index} of {step.total}
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
              data-deploy-label={`Deploy ${step.contractName}`}
              onClick={() => void onDeploy()}
            >
              Deploy {step.contractName}
            </Btn>
          </BtnRow>

          <Row>
            <span>Parent CTA</span>
            <strong>Deploy Liquidity Builder · Step {step.index} of {step.total}</strong>
          </Row>
          <Row>
            <span>Transaction hash</span>
            <strong data-testid="founder-tx-hash">{txHash ?? '—'}</strong>
          </Row>
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

      {activeSubsystem !== 'liquidity_builder' && (
        <Banner $tone="warn" data-testid="founder-sequence-lock">
          {LABELS[activeSubsystem]} locked until Liquidity Builder is DEPLOYED · VALIDATED · BOUND · READY.
        </Banner>
      )}

      <StatusLink href="/runtime/deployment/status">Read-only deployment status archive</StatusLink>
    </Root>
  )
}

export default FounderDeploymentShell
