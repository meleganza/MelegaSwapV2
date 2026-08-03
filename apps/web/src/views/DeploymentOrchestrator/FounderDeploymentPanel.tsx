/**
 * Founder Deployment Mode — prepare txs; Founder signs in wallet.
 * Wallet-only signatures. No cloud signer. No server-side signing.
 */
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAccount, useBalance } from 'wagmi'
import { useWalletChainId } from 'hooks/useWalletChainId'
import ConnectWalletButton from 'components/ConnectWalletButton'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  FOUNDER_DEPLOY_CHAIN_ID,
  activeLbStep,
  buildFounderExecutionSession,
  buildLbDeploySteps,
  getTransactionReview,
  type SubsystemId,
} from 'lib/deployment-orchestrator'
import {
  isSubsystemReadyForFounderDeploy,
  nextFounderDeployTarget,
} from 'lib/deployment-orchestrator/founderSequence'
import { DEPLOYMENT_ORDER } from 'lib/deployment-orchestrator/order'

const Panel = styled.section`
  margin-top: 24px;
  border-radius: 14px;
  border: 1px solid rgba(24, 240, 137, 0.35);
  background: rgba(12, 18, 14, 0.95);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const H = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 750;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;

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

const Warn = styled.p`
  margin: 0;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(244, 196, 48, 0.4);
  background: rgba(244, 196, 48, 0.08);
  color: #f4c430;
  font-size: 13px;
  font-weight: 650;
`

const Pause = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(24, 240, 137, 0.35);
  background: rgba(24, 240, 137, 0.08);
  color: #18f089;
  font-size: 13px;
  font-weight: 750;
  letter-spacing: 0.03em;
`

const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Tab = styled.button<{ $active?: boolean; $locked?: boolean }>`
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid
    ${({ $active, $locked }) =>
      $locked ? 'rgba(255,255,255,0.08)' : $active ? 'rgba(24,240,137,0.45)' : 'rgba(255,255,255,0.12)'};
  background: ${({ $active, $locked }) =>
    $locked ? 'rgba(255,255,255,0.02)' : $active ? 'rgba(24,240,137,0.12)' : 'rgba(255,255,255,0.03)'};
  color: ${({ $locked }) => ($locked ? 'rgba(255,255,255,0.35)' : '#f2f2f2')};
  font-size: 12px;
  font-weight: 700;
  cursor: ${({ $locked }) => ($locked ? 'not-allowed' : 'pointer')};
`

const DeployBtn = styled.button<{ $enabled?: boolean }>`
  align-self: flex-start;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid ${({ $enabled }) => ($enabled ? 'rgba(24,240,137,0.45)' : 'rgba(255,255,255,0.1)')};
  background: ${({ $enabled }) => ($enabled ? 'rgba(24,240,137,0.16)' : 'rgba(255,255,255,0.04)')};
  color: ${({ $enabled }) => ($enabled ? '#18f089' : 'rgba(255,255,255,0.4)')};
  font-size: 14px;
  font-weight: 750;
  cursor: ${({ $enabled }) => ($enabled ? 'pointer' : 'not-allowed')};
`

const ArgList = styled.ul`
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
`

const Input = styled.input`
  margin-top: 4px;
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

const LABELS: Record<SubsystemId, string> = {
  liquidity_builder: 'Liquidity Builder',
  create_token: 'Create Token Factory',
  public_farm_factory: 'Public Farm Factory',
}

export const FounderDeploymentPanel: React.FC = () => {
  const { address, isConnected } = useAccount()
  const chainId = useWalletChainId()
  const { data: balance } = useBalance({ address })
  const [selected, setSelected] = useState<SubsystemId>('liquidity_builder')
  const [eligibilitySigner, setEligibilitySigner] = useState('')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [nonce, setNonce] = useState<string | null>(null)
  const [gasPriceWei, setGasPriceWei] = useState<bigint | null>(null)
  const [statusNote, setStatusNote] = useState<string | null>(null)
  const [signaturePending, setSignaturePending] = useState(false)

  const nextTarget = nextFounderDeployTarget()

  useEffect(() => {
    if (nextTarget) setSelected(nextTarget)
  }, [nextTarget])

  const review = useMemo(
    () =>
      getTransactionReview(selected, {
        eligibilitySigner: eligibilitySigner.trim() || null,
      }),
    [selected, eligibilitySigner],
  )

  const subsystemReady = isSubsystemReadyForFounderDeploy(selected)

  const session = useMemo(
    () =>
      buildFounderExecutionSession({
        connectedWallet: isConnected ? address ?? null : null,
        chainId: chainId ?? null,
        balanceWei: balance?.value ?? null,
        gasPriceWei,
        artifactValid: review.artifactValid,
        constructorValid: review.constructorValid,
        subsystemReady,
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
    ],
  )

  const gates = session.gates
  const wrongWallet = Boolean(isConnected && address && gates.codes.includes('WRONG_WALLET'))
  const wrongChain = Boolean(isConnected && chainId && chainId !== FOUNDER_DEPLOY_CHAIN_ID)
  const broadcastReady = Boolean(
    gates.deployEnabled && review.creationBytecode && chainId === FOUNDER_DEPLOY_CHAIN_ID,
  )

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!isConnected || !address || typeof window === 'undefined') {
        setNonce(null)
        return
      }
      const ethereum = (window as unknown as { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } })
        .ethereum
      if (!ethereum?.request) return
      try {
        const [n, gp] = await Promise.all([
          ethereum.request({ method: 'eth_getTransactionCount', params: [address, 'latest'] }),
          ethereum.request({ method: 'eth_gasPrice', params: [] }),
        ])
        if (cancelled) return
        setNonce(typeof n === 'string' ? String(parseInt(n, 16)) : null)
        if (typeof gp === 'string' && gp.startsWith('0x')) {
          setGasPriceWei(BigInt(gp))
        }
      } catch {
        if (!cancelled) setNonce(null)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [isConnected, address, chainId])

  const onDeploy = async () => {
    if (!gates.deployEnabled || wrongChain) return
    setStatusNote(null)
    setSignaturePending(true)
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
      // Autoload certified LB creation payload — Founder never pastes bytecode.
      const lb = buildLbDeploySteps({})
      const lbStep = activeLbStep(lb.steps, [])
      const creationPayload =
        selected === 'liquidity_builder' ? lbStep?.deploymentData || '' : review.creationBytecode
      if (!creationPayload?.startsWith('0x')) {
        setStatusNote(
          'Certified creation payload unavailable for this subsystem. Liquidity Builder artifacts autoload from the certified package; Create Token / Public Farm remain sequence-locked.',
        )
        return
      }
      const hash = (await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: AUTHORIZED_MELEGA_DEPLOYER,
            data: creationPayload,
            value: '0x0',
          },
        ],
      })) as string
      setTxHash(hash)
      setStatusNote('Transaction submitted — waiting for receipt. Binding only after bytecode validation.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Wallet rejected or failed.'
      setStatusNote(msg.slice(0, 180))
    } finally {
      setSignaturePending(false)
    }
  }

  const pauseDisplay = signaturePending ? 'AWAITING_FOUNDER_SIGNATURE' : session.pauseState
  // gas.estimates was removed; never throw on missing legacy field during connect.
  const selectedGas =
    Array.isArray((session.gas as { estimates?: { subsystemId: string }[] }).estimates)
      ? (session.gas as { estimates: { subsystemId: string }[] }).estimates.find((e) => e.subsystemId === selected)
      : undefined

  return (
    <Panel data-testid="founder-deployment-panel" data-founder-deploy="true">
      <H>Founder Deployment Mode — Mainnet Execution</H>
      <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
        Permanent platform contracts are signed once by MELEGA DEPLOYER on BNB Smart Chain. Users later sign their own
        Create Token, Public Farm, and Liquidity Builder transactions. No KMS. No server-side signing.
      </p>

      <Pause data-testid="founder-pause-state">PAUSE: {pauseDisplay}</Pause>
      <Row>
        <span>Deployment order</span>
        <strong data-testid="founder-deployment-order">
          {DEPLOYMENT_ORDER.map((id) => LABELS[id]).join(' → ')}
        </strong>
      </Row>
      <Row>
        <span>Current subsystem / next target</span>
        <strong data-testid="founder-next-target">{nextTarget ? LABELS[nextTarget] : 'All bound'}</strong>
      </Row>
      <Row>
        <span>Deployment state</span>
        <strong data-testid="founder-deployment-state">{session.message}</strong>
      </Row>

      {wrongWallet && (
        <Warn data-testid="founder-wrong-wallet">Connect the authorized MELEGA DEPLOYER.</Warn>
      )}
      {!isConnected && (
        <Warn data-testid="founder-wallet-disconnected">Connect the authorized MELEGA DEPLOYER.</Warn>
      )}
      {wrongChain && <Warn data-testid="founder-wrong-chain">Switch to BNB Smart Chain.</Warn>}
      {session.pauseState === 'FOUNDER_DEPLOYER_FUNDING_REQUIRED' && session.gas.message && (
        <Warn data-testid="founder-funding-required">{session.gas.message}</Warn>
      )}

      {!isConnected && (
        <div data-testid="founder-connect-cta">
          <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
        </div>
      )}

      <Tabs data-testid="founder-deploy-tabs">
        {(Object.keys(LABELS) as SubsystemId[]).map((id) => {
          const locked = !isSubsystemReadyForFounderDeploy(id) && id !== nextTarget
          const deployable = isSubsystemReadyForFounderDeploy(id)
          return (
            <Tab
              key={id}
              type="button"
              $active={selected === id}
              $locked={locked && !deployable}
              data-testid={`founder-tab-${id}`}
              disabled={locked && !deployable}
              onClick={() => {
                if (deployable || id === nextTarget) setSelected(id)
              }}
            >
              {LABELS[id]}
              {deployable ? ' · deployable' : ' · locked'}
            </Tab>
          )
        })}
      </Tabs>

      <Grid data-testid="founder-deploy-review">
        <Row>
          <span>Connected wallet</span>
          <strong data-testid="founder-connected-wallet">{address ?? '—'}</strong>
        </Row>
        <Row>
          <span>Expected deployer</span>
          <strong data-testid="founder-expected-deployer">{AUTHORIZED_MELEGA_DEPLOYER}</strong>
        </Row>
        <Row>
          <span>Chain</span>
          <strong data-testid="founder-chain">
            {chainId ?? '—'} {chainId === FOUNDER_DEPLOY_CHAIN_ID ? '(BNB Smart Chain)' : ''}
          </strong>
        </Row>
        <Row>
          <span>BNB balance</span>
          <strong data-testid="founder-bnb-balance">
            {balance ? `${balance.formatted} ${balance.symbol}` : '—'}
          </strong>
        </Row>
        <Row>
          <span>Current nonce</span>
          <strong data-testid="founder-nonce">{nonce ?? 'Provided by wallet at signature time'}</strong>
        </Row>
        <Row>
          <span>Estimated gas (this package)</span>
          <strong data-testid="founder-estimated-gas">
            {selectedGas
              ? `${selectedGas.gasUnits} units ≈ ${selectedGas.costBnb} BNB @ ${session.gas.gasPriceSource} gas price`
              : 'Estimated by wallet / RPC at signature time'}
          </strong>
        </Row>
        <Row>
          <span>Estimated total remaining cost</span>
          <strong data-testid="founder-estimated-total">{session.gas.estimatedTotalCostBnb} BNB</strong>
        </Row>
        <Row>
          <span>Recommended minimum balance</span>
          <strong data-testid="founder-recommended-min">{session.gas.recommendedMinimumBnb} BNB</strong>
        </Row>
        <Row>
          <span>Contract package</span>
          <strong>
            {review.contractName} ({review.packagePath})
          </strong>
        </Row>
        <Row>
          <span>Treasury destination</span>
          <strong data-testid="founder-treasury">{review.treasuryDestination}</strong>
        </Row>
        <Row>
          <span>Artifact checksum</span>
          <strong data-testid="founder-artifact-checksum">
            {review.creationBytecodeHash ??
              (selected === 'liquidity_builder'
                ? 'Certified LB package autoloaded — see primary /runtime/deployment shell'
                : 'Certified package review — bytecode bound after subsystem unlock')}
          </strong>
        </Row>
        <Row>
          <span>Expected runtime bytecode hash</span>
          <strong>{review.expectedRuntimeBytecodeHash ?? 'Validated after receipt'}</strong>
        </Row>
        <Row>
          <span>Fee configuration</span>
          <strong data-testid="founder-fee-config">{JSON.stringify(review.feeConfiguration)}</strong>
        </Row>
        <Row>
          <span>Review status</span>
          <strong data-testid="founder-review-status">
            {review.constructorValid && review.artifactValid ? 'READY_FOR_SIGNATURE' : 'NEEDS_REVIEW'}
          </strong>
        </Row>
        <Row>
          <span>Transaction hash</span>
          <strong data-testid="founder-tx-hash">{txHash ?? '—'}</strong>
        </Row>
        <Row>
          <span>Receipt / verification / binding</span>
          <strong>Pending Founder signature — bind only after validation · VERIFICATION_PENDING allowed</strong>
        </Row>
      </Grid>

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

      {selected === 'public_farm_factory' && (
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
        $enabled={broadcastReady || (gates.deployEnabled && !wrongChain)}
        disabled={!gates.deployEnabled || wrongChain}
        data-testid="founder-deploy-button"
        onClick={onDeploy}
      >
        Deploy — request wallet signature
      </DeployBtn>

      {gates.blockers.length > 0 && (
        <ArgList data-testid="founder-deploy-blockers">
          {gates.blockers.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ArgList>
      )}
      {statusNote && <Warn data-testid="founder-status-note">{statusNote}</Warn>}
    </Panel>
  )
}

export default FounderDeploymentPanel
