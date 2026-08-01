/**
 * Founder Deployment Mode — prepare txs; Founder signs in wallet.
 * Wallet-only signatures. No cloud signer. No server-side signing.
 */
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAccount, useBalance, useChainId } from 'wagmi'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  FOUNDER_DEPLOY_CHAIN_ID,
  assessFounderDeployGates,
  getTransactionReview,
  type SubsystemId,
} from 'lib/deployment-orchestrator'
import {
  isSubsystemReadyForFounderDeploy,
  nextFounderDeployTarget,
} from 'lib/deployment-orchestrator/founderSequence'

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

const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Tab = styled.button<{ $active?: boolean }>`
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(24,240,137,0.45)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $active }) => ($active ? 'rgba(24,240,137,0.12)' : 'rgba(255,255,255,0.03)')};
  color: #f2f2f2;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
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
  const chainId = useChainId()
  const { data: balance } = useBalance({ address })
  const [selected, setSelected] = useState<SubsystemId>('liquidity_builder')
  const [eligibilitySigner, setEligibilitySigner] = useState('')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [statusNote, setStatusNote] = useState<string | null>(null)

  const nextTarget = nextFounderDeployTarget()
  const review = useMemo(
    () =>
      getTransactionReview(selected, {
        eligibilitySigner: eligibilitySigner.trim() || null,
      }),
    [selected, eligibilitySigner],
  )

  const subsystemReady = isSubsystemReadyForFounderDeploy(selected)

  const gates = assessFounderDeployGates({
    connectedWallet: isConnected ? address ?? null : null,
    chainId: chainId ?? null,
    balanceWei: balance?.value ?? null,
    artifactValid: review.artifactValid,
    constructorValid: review.constructorValid,
    subsystemReady,
  })

  const wrongWallet = Boolean(isConnected && address && !gates.codes.includes('AUTHORIZED_DEPLOYER_MATCH'))

  const onDeploy = async () => {
    if (!gates.deployEnabled) return
    setStatusNote(null)
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
        setStatusNote(
          'Review complete. Attach certified creation bytecode to enable in-wallet broadcast, or sign the matching forge broadcast from MELEGA DEPLOYER. Signing stays in the connected wallet only.',
        )
        return
      }
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
      setStatusNote('Transaction submitted — waiting for receipt. Binding only after bytecode validation.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Wallet rejected or failed.'
      setStatusNote(msg.slice(0, 180))
    }
  }

  return (
    <Panel data-testid="founder-deployment-panel" data-founder-deploy="true">
      <H>Founder Deployment Mode</H>
      <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
        Permanent platform contracts are signed once by MELEGA DEPLOYER. Users later sign their own Create Token,
        Public Farm, and Liquidity Builder transactions.
      </p>
      <Row>
        <span>Next deploy target (sequential)</span>
        <strong data-testid="founder-next-target">{nextTarget ? LABELS[nextTarget] : 'All bound'}</strong>
      </Row>

      {wrongWallet && (
        <Warn data-testid="founder-wrong-wallet">Connect the authorized MELEGA DEPLOYER.</Warn>
      )}
      {!isConnected && (
        <Warn data-testid="founder-wallet-disconnected">Connect the authorized MELEGA DEPLOYER.</Warn>
      )}

      <Tabs data-testid="founder-deploy-tabs">
        {(Object.keys(LABELS) as SubsystemId[]).map((id) => (
          <Tab
            key={id}
            type="button"
            $active={selected === id}
            data-testid={`founder-tab-${id}`}
            onClick={() => setSelected(id)}
          >
            {LABELS[id]}
            {isSubsystemReadyForFounderDeploy(id) ? ' · deployable' : ''}
          </Tab>
        ))}
      </Tabs>

      <Grid data-testid="founder-deploy-review">
        <Row>
          <span>Connected wallet</span>
          <strong>{address ?? '—'}</strong>
        </Row>
        <Row>
          <span>Expected deployer</span>
          <strong data-testid="founder-expected-deployer">{AUTHORIZED_MELEGA_DEPLOYER}</strong>
        </Row>
        <Row>
          <span>Chain</span>
          <strong>
            {chainId ?? '—'} {chainId === FOUNDER_DEPLOY_CHAIN_ID ? '(BNB Chain)' : ''}
          </strong>
        </Row>
        <Row>
          <span>BNB balance</span>
          <strong>{balance ? `${balance.formatted} ${balance.symbol}` : '—'}</strong>
        </Row>
        <Row>
          <span>Current nonce</span>
          <strong>Provided by wallet at signature time</strong>
        </Row>
        <Row>
          <span>Estimated gas</span>
          <strong>Estimated by wallet / RPC at signature time</strong>
        </Row>
        <Row>
          <span>Contract to deploy</span>
          <strong>{review.contractName}</strong>
        </Row>
        <Row>
          <span>Treasury destination</span>
          <strong>{review.treasuryDestination}</strong>
        </Row>
        <Row>
          <span>Creation bytecode hash</span>
          <strong>{review.creationBytecodeHash ?? 'Attach certified artifact before broadcast'}</strong>
        </Row>
        <Row>
          <span>Expected runtime bytecode hash</span>
          <strong>{review.expectedRuntimeBytecodeHash ?? 'Validated after receipt'}</strong>
        </Row>
        <Row>
          <span>Fee configuration</span>
          <strong>{JSON.stringify(review.feeConfiguration)}</strong>
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
          <strong>Pending Founder signature — bind only after validation</strong>
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
        $enabled={gates.deployEnabled}
        disabled={!gates.deployEnabled}
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
      {statusNote && (
        <Warn data-testid="founder-status-note">{statusNote}</Warn>
      )}
    </Panel>
  )
}

export default FounderDeploymentPanel
