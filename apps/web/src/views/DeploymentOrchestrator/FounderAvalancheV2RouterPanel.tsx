/**
 * Avalanche V2 Router Founder deployment card — browser-wallet CREATE only.
 * Avalanche remains PREPARING; no SSOT bind; no automatic broadcast.
 */
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import { AUTHORIZED_MELEGA_DEPLOYER } from 'lib/deployment-orchestrator'
import { buildAvalancheV2RouterDeployStep } from 'lib/deployment-orchestrator/founderAvalancheRouterDeployTx'
import { assessAvalancheRouterDeployGates } from 'lib/deployment-orchestrator/founderAvalancheRouterGates'
import {
  AVAX_ROUTER_CHAIN_ID,
  AVAX_ROUTER_FACTORY,
  AVAX_ROUTER_WAVAX,
} from 'lib/deployment-orchestrator/founderAvalancheRouterArtifacts'
import { AVALANCHE_STATUS_UNTIL_ACTIVATION } from 'lib/deployment-orchestrator/founderAvalancheRouterValidation'
import { useWalletChainId } from 'hooks/useWalletChainId'
import {
  isUserRejectedError,
  resolveWalletProvider,
  walletEstimateDeployGas,
  walletGetGasPrice,
  walletSendDeployTransaction,
  walletSwitchChain,
} from 'lib/deployment-orchestrator/founderWalletTx'
import { weiToBnb } from 'lib/deployment-orchestrator/founderGasReadiness'

const Card = styled.section`
  margin: 0 0 22px;
  padding: 18px 18px 16px;
  border-radius: 14px;
  border: 1px solid rgba(120, 200, 255, 0.28);
  background: linear-gradient(165deg, rgba(20, 48, 72, 0.55), rgba(12, 18, 28, 0.72));
`
const CardTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 720;
`
const Status = styled.div<{ $ok?: boolean }>`
  display: inline-block;
  margin: 0 0 14px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${(p) => (p.$ok ? '#b8f5c8' : '#ffd9a8')};
  background: ${(p) => (p.$ok ? 'rgba(40, 140, 80, 0.28)' : 'rgba(160, 100, 30, 0.28)')};
  border: 1px solid ${(p) => (p.$ok ? 'rgba(80, 200, 120, 0.35)' : 'rgba(220, 160, 60, 0.35)')};
`
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 13px;
  span {
    color: rgba(255, 255, 255, 0.55);
  }
  strong {
    text-align: right;
    word-break: break-all;
    font-weight: 650;
  }
`
const Note = styled.p`
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  line-height: 1.45;
`
const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
`
const Btn = styled.button<{ $primary?: boolean }>`
  appearance: none;
  border: 1px solid ${(p) => (p.$primary ? 'rgba(120, 200, 255, 0.55)' : 'rgba(255, 255, 255, 0.18)')};
  background: ${(p) => (p.$primary ? 'rgba(40, 120, 200, 0.35)' : 'rgba(255, 255, 255, 0.06)')};
  color: #f5f8ff;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`
const Banner = styled.div<{ $tone: 'ok' | 'warn' | 'bad' }>`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.4;
  background: ${(p) =>
    p.$tone === 'ok'
      ? 'rgba(30, 120, 70, 0.25)'
      : p.$tone === 'bad'
        ? 'rgba(140, 40, 40, 0.3)'
        : 'rgba(140, 100, 20, 0.28)'};
  border: 1px solid
    ${(p) =>
      p.$tone === 'ok'
        ? 'rgba(80, 200, 120, 0.35)'
        : p.$tone === 'bad'
          ? 'rgba(220, 90, 90, 0.4)'
          : 'rgba(220, 170, 60, 0.35)'};
`

export const FounderAvalancheV2RouterPanel: React.FC = () => {
  const { address, isConnected, connector } = useAccount()
  const chainId = useWalletChainId()
  const packageBuild = useMemo(() => buildAvalancheV2RouterDeployStep(), [])
  const step = packageBuild.step

  const constructorValid =
    step?.constructorArgs?.[0]?.value?.toLowerCase() === AVAX_ROUTER_FACTORY.toLowerCase() &&
    step?.constructorArgs?.[1]?.value?.toLowerCase() === AVAX_ROUTER_WAVAX.toLowerCase()

  const gates = assessAvalancheRouterDeployGates({
    connectedWallet: address,
    chainId,
    artifactValid: packageBuild.artifactStatus === 'ARTIFACTS_VALID' && !!step?.artifactVerified,
    constructorValid: !!constructorValid && !!step?.deploymentData,
  })

  const [gasUnits, setGasUnits] = useState<bigint | null>(null)
  const [gasAvax, setGasAvax] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const onSwitchAvalanche = useCallback(async () => {
    setNote(null)
    try {
      const preferred = (await connector?.getProvider?.()) as { request?: Function } | undefined
      const eth = resolveWalletProvider(preferred as any)
      if (!eth) {
        setNote('Wallet provider unavailable.')
        return
      }
      await walletSwitchChain(eth, AVAX_ROUTER_CHAIN_ID)
      setNote('Requested Avalanche C-Chain (43114).')
    } catch (e) {
      setNote(e instanceof Error ? e.message.slice(0, 180) : 'Chain switch failed')
    }
  }, [connector])

  const onEstimate = useCallback(async () => {
    setNote(null)
    setGasUnits(null)
    setGasAvax(null)
    if (!step?.deploymentData || !address) {
      setNote('Connect MELEGA DEPLOYER and load artifact first.')
      return
    }
    if (chainId !== AVAX_ROUTER_CHAIN_ID) {
      setNote('Switch to Avalanche C-Chain (43114) before estimating gas.')
      return
    }
    try {
      setBusy(true)
      const preferred = (await connector?.getProvider?.()) as { request?: Function } | undefined
      const eth = resolveWalletProvider(preferred as any)
      if (!eth) throw new Error('Wallet provider unavailable')
      const units = await walletEstimateDeployGas(eth, address, step.deploymentData)
      const price = await walletGetGasPrice(eth)
      const cost = units * price
      setGasUnits(units)
      setGasAvax(weiToBnb(cost))
      setNote(`Estimated deployment gas · ${units.toString()} units · ~${weiToBnb(cost)} AVAX`)
    } catch (e) {
      setNote(e instanceof Error ? e.message.slice(0, 200) : 'Gas estimate failed')
    } finally {
      setBusy(false)
    }
  }, [address, chainId, connector, step?.deploymentData])

  const onDeploy = useCallback(async () => {
    setNote(null)
    if (!gates.deployEnabled || !step?.deploymentData || !address) {
      setNote(gates.message || 'Deploy blocked.')
      return
    }
    try {
      setBusy(true)
      const preferred = (await connector?.getProvider?.()) as { request?: Function } | undefined
      const eth = resolveWalletProvider(preferred as any)
      if (!eth) throw new Error('Wallet provider unavailable')
      if (chainId !== AVAX_ROUTER_CHAIN_ID) {
        await walletSwitchChain(eth, AVAX_ROUTER_CHAIN_ID)
      }
      // Re-estimate if needed
      let units = gasUnits
      if (units == null) {
        units = await walletEstimateDeployGas(eth, address, step.deploymentData)
        setGasUnits(units)
      }
      const hash = await walletSendDeployTransaction(eth, address, step.deploymentData, units)
      setTxHash(hash)
      setNote(
        `Founder signature submitted · tx ${hash} · Avalanche remains ${AVALANCHE_STATUS_UNTIL_ACTIVATION} · do not bind SSOT until post-deploy validation passes.`,
      )
    } catch (e) {
      if (isUserRejectedError(e)) {
        setNote('Wallet confirmation rejected — no broadcast.')
      } else {
        setNote(e instanceof Error ? e.message.slice(0, 200) : 'Deployment failed')
      }
    } finally {
      setBusy(false)
    }
  }, [address, chainId, connector, gasUnits, gates, step?.deploymentData])

  const presentationReady = packageBuild.artifactStatus === 'ARTIFACTS_VALID' && !!step?.deploymentData

  return (
    <Card data-testid="founder-avalanche-v2-router" data-status={presentationReady ? 'ready' : 'blocked'}>
      <CardTitle>Avalanche V2 Router</CardTitle>
      <Status $ok={presentationReady} data-testid="founder-avalanche-router-status">
        {presentationReady ? 'READY FOR FOUNDER SIGNATURE' : 'NOT READY'}
      </Status>

      <Row>
        <span>Network</span>
        <strong>Avalanche C-Chain</strong>
      </Row>
      <Row>
        <span>Chain ID</span>
        <strong>{AVAX_ROUTER_CHAIN_ID}</strong>
      </Row>
      <Row>
        <span>Factory</span>
        <strong data-testid="founder-avalanche-factory">{AVAX_ROUTER_FACTORY}</strong>
      </Row>
      <Row>
        <span>WAVAX</span>
        <strong data-testid="founder-avalanche-wavax">{AVAX_ROUTER_WAVAX}</strong>
      </Row>
      <Row>
        <span>Deployer</span>
        <strong>{AUTHORIZED_MELEGA_DEPLOYER}</strong>
      </Row>
      <Row>
        <span>Artifact</span>
        <strong data-testid="founder-avalanche-artifact">
          {presentationReady ? 'Loaded' : packageBuild.invalidReasons[0] || 'Invalid'}
        </strong>
      </Row>
      <Row>
        <span>Artifact hash</span>
        <strong data-testid="founder-avalanche-artifact-hash">
          {presentationReady ? 'Verified' : 'Failed'}
        </strong>
      </Row>
      <Row>
        <span>Connected chain</span>
        <strong>{chainId ?? '—'}</strong>
      </Row>
      <Row>
        <span>Gas estimate</span>
        <strong data-testid="founder-avalanche-gas">
          {gasUnits != null ? `${gasUnits.toString()} units${gasAvax ? ` · ~${gasAvax} AVAX` : ''}` : '—'}
        </strong>
      </Row>
      <Row>
        <span>Transaction</span>
        <strong data-testid="founder-avalanche-tx">{txHash ?? '—'}</strong>
      </Row>

      <Actions>
        {isConnected && chainId !== AVAX_ROUTER_CHAIN_ID && (
          <Btn type="button" onClick={() => void onSwitchAvalanche()} disabled={busy}>
            Switch to Avalanche C-Chain
          </Btn>
        )}
        <Btn type="button" onClick={() => void onEstimate()} disabled={busy || !presentationReady}>
          Estimate Deployment Gas
        </Btn>
        <Btn
          type="button"
          $primary
          data-testid="founder-avalanche-deploy-cta"
          disabled={busy || !gates.deployEnabled}
          onClick={() => void onDeploy()}
          title={gates.message || 'Deploy Avalanche V2 Router'}
        >
          Deploy Avalanche V2 Router
        </Btn>
      </Actions>

      {!gates.deployEnabled && (
        <Banner $tone="warn" data-testid="founder-avalanche-blockers">
          {gates.blockers.join(' · ') || 'Waiting for Founder gates'}
        </Banner>
      )}
      {gates.deployEnabled && (
        <Banner $tone="ok" data-testid="founder-avalanche-ready-banner">
          READY FOR FOUNDER SIGNATURE · wallet CREATE only · no automatic broadcast · Avalanche stays PREPARING
        </Banner>
      )}
      {note && (
        <Banner $tone="warn" data-testid="founder-avalanche-note">
          {note}
        </Banner>
      )}
      <Note>
        Router deployment alone does not make Avalanche LIVE. No fake pairs, farms, pools, volume, TVL, or swap
        readiness. Activation requires a separate mission after validation, SSOT bind, and live-liquidity proof.
      </Note>
    </Card>
  )
}

export default FounderAvalancheV2RouterPanel
