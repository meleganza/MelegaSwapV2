/**
 * Primary /runtime/deployment surface — Founder-wallet-signed permanent contract deployment.
 * Browser wallet is the only signer. No KMS. No server authority gate.
 */
import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { useAccount, useBalance, useChainId } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  FOUNDER_DEPLOY_CHAIN_ID,
  buildFounderExecutionSession,
  getTransactionReview,
  isAuthorizedMelegaDeployer,
  type SubsystemId,
} from 'lib/deployment-orchestrator'
import {
  DEPLOY_BUTTON_LABEL,
  LB_DEPLOYMENT_TX_STEPS,
  resolveFounderOperationalState,
  type FounderOperationalState,
  type LbTxStepPhase,
} from 'lib/deployment-orchestrator/founderOperationalState'
import {
  isSubsystemReadyForFounderDeploy,
  nextFounderDeployTarget,
} from 'lib/deployment-orchestrator/founderSequence'
import { DEPLOYMENT_ORDER } from 'lib/deployment-orchestrator/order'

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
      $tone === 'ok'
        ? 'rgba(24,240,137,0.45)'
        : $tone === 'bad'
          ? 'rgba(255,107,107,0.45)'
          : 'rgba(244,196,48,0.4)'};
  background: ${({ $tone }) =>
    $tone === 'ok'
      ? 'rgba(24,240,137,0.1)'
      : $tone === 'bad'
        ? 'rgba(255,107,107,0.1)'
        : 'rgba(244,196,48,0.08)'};
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

const ArgList = styled.ul`
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
`

const StepList = styled.ol`
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const DeployBtn = styled.button<{ $enabled?: boolean }>`
  align-self: flex-start;
  min-height: 48px;
  padding: 0 20px;
  border-radius: 12px;
  border: 1px solid ${({ $enabled }) => ($enabled ? 'rgba(24,240,137,0.5)' : 'rgba(255,255,255,0.1)')};
  background: ${({ $enabled }) => ($enabled ? 'rgba(24,240,137,0.18)' : 'rgba(255,255,255,0.04)')};
  color: ${({ $enabled }) => ($enabled ? '#18f089' : 'rgba(255,255,255,0.4)')};
  font-size: 15px;
  font-weight: 780;
  cursor: ${({ $enabled }) => ($enabled ? 'pointer' : 'not-allowed')};
`

const Input = styled.input`
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  color: #f2f2f2;
  font-size: 12px;
  width: 100%;
  box-sizing: border-box;
`

const StatusLink = styled(Link)`
  display: inline-block;
  margin-top: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: underline;
`

const LABELS: Record<SubsystemId, string> = {
  liquidity_builder: 'Liquidity Builder',
  create_token: 'Create Token Factory',
  public_farm_factory: 'Public Farm Factory',
}

function toneFor(state: FounderOperationalState): 'ok' | 'warn' | 'bad' {
  if (state === 'READY' || state === 'READY_TO_DEPLOY') return 'ok'
  if (state === 'WRONG_WALLET' || state === 'WRONG_CHAIN' || state === 'DEPLOYMENT_FAILED') return 'bad'
  return 'warn'
}

export const FounderDeploymentShell: React.FC = () => {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address })
  const [eligibilitySigner, setEligibilitySigner] = useState('')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [gasPriceWei, setGasPriceWei] = useState<bigint | null>(null)
  const [statusNote, setStatusNote] = useState<string | null>(null)
  const [signaturePending, setSignaturePending] = useState(false)
  const [transactionPending, setTransactionPending] = useState(false)
  const lbStepIndex = 0
  const [lbStepPhase, setLbStepPhase] = useState<LbTxStepPhase>('Prepare Transaction')

  const active = nextFounderDeployTarget() ?? 'liquidity_builder'
  const allDone = nextFounderDeployTarget() == null

  const review = useMemo(
    () =>
      getTransactionReview(active, {
        eligibilitySigner: eligibilitySigner.trim() || null,
      }),
    [active, eligibilitySigner],
  )

  const subsystemReady = allDone ? false : isSubsystemReadyForFounderDeploy(active)

  const session = useMemo(
    () =>
      buildFounderExecutionSession({
        connectedWallet: isConnected ? address ?? null : null,
        chainId: chainId ?? null,
        balanceWei: balance?.value ?? null,
        gasPriceWei,
        artifactValid: review.artifactValid,
        constructorValid: review.constructorValid,
        subsystemReady: allDone ? true : subsystemReady,
        allSubsystemsLive: allDone,
      }),
    [
      isConnected,
      address,
      chainId,
      balance?.value,
      gasPriceWei,
      review.artifactValid,
      review.constructorValid,
      subsystemReady,
      allDone,
    ],
  )

  const operationalState = resolveFounderOperationalState({
    gates: session.gates,
    gas: session.gas,
    signaturePending,
    transactionPending,
    subsystemReadyComplete: allDone,
  })

  const authorizedConnected =
    Boolean(isConnected && address && isAuthorizedMelegaDeployer(address) && chainId === FOUNDER_DEPLOY_CHAIN_ID)

  const deployEnabled =
    session.gates.deployEnabled &&
    chainId === FOUNDER_DEPLOY_CHAIN_ID &&
    !allDone &&
    operationalState !== 'FUNDING_REQUIRED'

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!isConnected || !address || typeof window === 'undefined') return
      const ethereum = (window as unknown as { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } })
        .ethereum
      if (!ethereum?.request) return
      try {
        const gp = await ethereum.request({ method: 'eth_gasPrice', params: [] })
        if (!cancelled && typeof gp === 'string' && gp.startsWith('0x')) setGasPriceWei(BigInt(gp))
      } catch {
        /* wallet RPC optional */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isConnected, address, chainId])

  const selectedGas = session.gas.estimates.find((e) => e.subsystemId === active)

  const onDeploy = async () => {
    if (!deployEnabled) return
    setStatusNote(null)
    setSignaturePending(true)
    if (active === 'liquidity_builder') setLbStepPhase('Awaiting Signature')
    try {
      const ethereum =
        typeof window !== 'undefined'
          ? ((window as unknown as { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } })
              .ethereum)
          : undefined
      if (!ethereum?.request) {
        setStatusNote('Wallet provider unavailable. Connect MELEGA DEPLOYER and try again.')
        return
      }
      if (!review.creationBytecode) {
        setLbStepPhase('Review in Wallet')
        setStatusNote(
          'Constructor review ready. Load certified creation bytecode for this step, then confirm in MetaMask. Signing stays in the connected wallet only — no server signer.',
        )
        return
      }
      setLbStepPhase('Review in Wallet')
      const hash = (await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: AUTHORIZED_MELEGA_DEPLOYER,
            data: review.creationBytecode,
            value: '0x0',
          },
        ],
      })) as string
      setTxHash(hash)
      setTransactionPending(true)
      setLbStepPhase('Transaction Submitted')
      setStatusNote('Transaction submitted — confirming receipt, then validate → bind → READY.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Wallet rejected or failed.'
      setStatusNote(msg.slice(0, 180))
      setLbStepPhase('Prepare Transaction')
    } finally {
      setSignaturePending(false)
    }
  }

  return (
    <Root data-testid="founder-deployment-shell" data-founder-primary="true">
      <Title>Permanent Contract Deployment</Title>
      <Sub>Founder-signed mainnet deployment · browser wallet only · no KMS · no server signer</Sub>

      <Banner
        $tone={toneFor(operationalState)}
        data-testid="founder-operational-state"
        data-state={operationalState}
      >
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
      {operationalState === 'FUNDING_REQUIRED' && session.gas.message && (
        <Banner $tone="warn" data-testid="founder-funding-required">
          {session.gas.message}
        </Banner>
      )}

      <Grid data-testid="founder-shell-summary">
        <Row>
          <span>Connected wallet</span>
          <strong data-testid="founder-connected-wallet">{address ?? '—'}</strong>
        </Row>
        <Row>
          <span>Required wallet</span>
          <strong data-testid="founder-required-wallet">{AUTHORIZED_MELEGA_DEPLOYER}</strong>
        </Row>
        <Row>
          <span>Network</span>
          <strong data-testid="founder-network">
            {chainId ?? '—'}
            {chainId === FOUNDER_DEPLOY_CHAIN_ID ? ' (BNB Smart Chain)' : ''}
          </strong>
        </Row>
        <Row>
          <span>Balance</span>
          <strong data-testid="founder-balance">
            {balance ? `${balance.formatted} ${balance.symbol}` : '—'}
          </strong>
        </Row>
        <Row>
          <span>Current deployment stage</span>
          <strong data-testid="founder-stage">{allDone ? 'COMPLETE' : LABELS[active]}</strong>
        </Row>
        <Row>
          <span>Deployment order</span>
          <strong data-testid="founder-order">
            {DEPLOYMENT_ORDER.map((id) => LABELS[id]).join(' → ')}
          </strong>
        </Row>
      </Grid>

      {!allDone && (
        <Card data-testid={`founder-active-card-${active}`}>
          <CardTitle>{LABELS[active]}</CardTitle>
          <Row>
            <span>Contract package</span>
            <strong>
              {review.contractName} · {review.packagePath}
            </strong>
          </Row>
          <Row>
            <span>Treasury destination</span>
            <strong data-testid="founder-treasury">{review.treasuryDestination}</strong>
          </Row>
          <Row>
            <span>Protocol fee configuration</span>
            <strong data-testid="founder-fees">{JSON.stringify(review.feeConfiguration)}</strong>
          </Row>
          <Row>
            <span>Bytecode hash</span>
            <strong>
              {review.creationBytecodeHash ?? 'Attach certified creation bytecode before broadcast'}
            </strong>
          </Row>
          <Row>
            <span>Estimated gas / cost</span>
            <strong>
              {selectedGas
                ? `${selectedGas.gasUnits} units ≈ ${selectedGas.costBnb} BNB`
                : 'Wallet / RPC at signature time'}
            </strong>
          </Row>
          <Row>
            <span>Wallet balance</span>
            <strong>{balance ? `${balance.formatted} ${balance.symbol}` : '—'}</strong>
          </Row>
          <Row>
            <span>Review status</span>
            <strong data-testid="founder-review-status">
              {review.constructorValid && review.artifactValid ? 'READY_FOR_SIGNATURE' : 'NEEDS_REVIEW'}
            </strong>
          </Row>
          <Row>
            <span>Explorer verification</span>
            <strong>NOT_STARTED (optional — does not block deploy)</strong>
          </Row>

          <div>
            <Row>
              <span>Constructor arguments</span>
            </Row>
            <ArgList data-testid="founder-constructor-args">
              {review.constructorArgs.map((a) => (
                <li key={a.name}>
                  {a.name}: {a.value} {a.validated ? '✓' : '✗'}
                </li>
              ))}
            </ArgList>
          </div>

          {active === 'liquidity_builder' && (
            <div>
              <Row>
                <span>Liquidity Builder transactions (sequential)</span>
              </Row>
              <StepList data-testid="founder-lb-steps">
                {LB_DEPLOYMENT_TX_STEPS.map((step, idx) => (
                  <li key={step.id} data-active={idx === lbStepIndex ? 'true' : 'false'}>
                    {step.contractName} — {idx === lbStepIndex ? lbStepPhase : 'Prepare Transaction'}
                  </li>
                ))}
              </StepList>
            </div>
          )}

          {active === 'public_farm_factory' && (
            <Row>
              <span>Eligibility signer (EOA — TVL attestations only)</span>
              <Input
                data-testid="founder-eligibility-signer"
                placeholder="0x…"
                value={eligibilitySigner}
                onChange={(e) => setEligibilitySigner(e.target.value)}
              />
            </Row>
          )}

          <DeployBtn
            type="button"
            $enabled={deployEnabled}
            disabled={!deployEnabled}
            data-testid="founder-deploy-button"
            data-deploy-label={DEPLOY_BUTTON_LABEL[active]}
            onClick={onDeploy}
          >
            {DEPLOY_BUTTON_LABEL[active]}
          </DeployBtn>

          <Row>
            <span>Transaction hash</span>
            <strong data-testid="founder-tx-hash">{txHash ?? '—'}</strong>
          </Row>
          {statusNote && (
            <Banner $tone="warn" data-testid="founder-status-note">
              {statusNote}
            </Banner>
          )}
          {session.gates.blockers.length > 0 && (
            <ArgList data-testid="founder-deploy-blockers">
              {session.gates.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ArgList>
          )}
        </Card>
      )}

      {allDone && (
        <Banner $tone="ok" data-testid="founder-all-ready">
          All permanent platform contracts are bound. MELEGA DEPLOYER is not required for user Create Token, Public
          Farm, or Liquidity Builder operations.
        </Banner>
      )}

      <StatusLink href="/runtime/deployment/status" data-testid="founder-status-archive-link">
        Read-only deployment status archive
      </StatusLink>
    </Root>
  )
}

export default FounderDeploymentShell
