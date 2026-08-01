/**
 * Read-only Deployment Status archive — not the primary Founder deploy surface.
 * Primary interactive deploy: /runtime/deployment (FounderDeploymentShell).
 */
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import type { OrchestratorStatus, SubsystemSnapshot } from 'lib/deployment-orchestrator'
import { AUTHORIZED_MELEGA_DEPLOYER } from 'lib/deployment-orchestrator'
import { containsForbiddenServerAuthorityWording } from 'lib/deployment-orchestrator/founderOperationalState'

const Root = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 20px 48px;
  color: #f2f2f2;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
`

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 750;
`

const Sub = styled.p`
  margin: 0 0 20px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
`

const Global = styled.div`
  border-radius: 14px;
  border: 1px solid rgba(244, 196, 48, 0.35);
  background: rgba(20, 20, 20, 0.95);
  padding: 16px 18px;
  margin-bottom: 20px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.section`
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(14, 14, 14, 0.95);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

const CardTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 750;
`

const State = styled.span<{ $state: string }>`
  display: inline-flex;
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: ${({ $state }) => ($state === 'LIVE' ? '#0a0a0a' : '#f5f5f5')};
  background: ${({ $state }) =>
    $state === 'LIVE' ? '#18f089' : $state === 'BLOCKED' ? 'rgba(255,107,107,0.25)' : 'rgba(244,196,48,0.2)'};
  border: 1px solid
    ${({ $state }) =>
      $state === 'LIVE' ? '#18f089' : $state === 'BLOCKED' ? 'rgba(255,107,107,0.45)' : 'rgba(244,196,48,0.4)'};
`

const Lane = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);

  strong {
    color: #f2f2f2;
  }
`

const Blockers = styled.ul`
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: rgba(255, 200, 200, 0.85);
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const PrimaryLink = styled(Link)`
  display: inline-flex;
  margin-bottom: 16px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(24, 240, 137, 0.4);
  background: rgba(24, 240, 137, 0.1);
  color: #18f089;
  font-size: 13px;
  font-weight: 750;
  text-decoration: none;
`

function laneValue(ok: boolean | string): string {
  if (typeof ok === 'string') return ok
  return ok ? 'Yes' : 'No'
}

function sanitizeArchiveText(text: string): string {
  if (containsForbiddenServerAuthorityWording(text)) {
    return 'Awaiting Founder-signed deploy via MELEGA DEPLOYER (browser wallet).'
  }
  return text
}

function SubsystemCard({ snap }: { snap: SubsystemSnapshot }) {
  const blockers = snap.blockers.map(sanitizeArchiveText).filter(Boolean)
  return (
    <Card data-testid={`deployment-card-${snap.id}`} data-state={snap.state}>
      <CardTitle>{snap.label}</CardTitle>
      <State $state={snap.state} data-testid={`deployment-state-${snap.id}`}>
        {snap.state}
      </State>
      <Lane>
        <span>Contracts</span>
        <strong>{laneValue(snap.lanes.contracts)}</strong>
      </Lane>
      <Lane>
        <span>Deploy</span>
        <strong>{laneValue(snap.lanes.deploy)}</strong>
      </Lane>
      <Lane>
        <span>Verify</span>
        <strong>{laneValue(snap.lanes.verify)}</strong>
      </Lane>
      <Lane>
        <span>Bind</span>
        <strong>{laneValue(snap.lanes.bind)}</strong>
      </Lane>
      <Lane>
        <span>Frontend</span>
        <strong>{laneValue(snap.lanes.frontend)}</strong>
      </Lane>
      <Lane>
        <span>Runtime</span>
        <strong>{laneValue(snap.lanes.runtime)}</strong>
      </Lane>
      <Lane>
        <span>Canary</span>
        <strong>{snap.lanes.canary}</strong>
      </Lane>
      <div>
        <Lane>
          <span>Remaining blockers</span>
          <strong>{blockers.length}</strong>
        </Lane>
        <Blockers data-testid={`deployment-blockers-${snap.id}`}>
          {blockers.slice(0, 6).map((b) => (
            <li key={b}>{b}</li>
          ))}
        </Blockers>
      </div>
    </Card>
  )
}

export const DeploymentDashboard: React.FC = () => {
  const [status, setStatus] = useState<OrchestratorStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/deployment/status')
        if (!res.ok) throw new Error(`status ${res.status}`)
        const json = (await res.json()) as OrchestratorStatus
        if (!cancelled) setStatus(json)
      } catch {
        if (!cancelled) setError('Deployment status unavailable.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const nextAction = status?.nextAction ? sanitizeArchiveText(status.nextAction) : null

  return (
    <Root data-testid="deployment-dashboard" data-archive="true">
      <PrimaryLink href="/runtime/deployment" data-testid="go-founder-deploy">
        ← Permanent Contract Deployment (Founder-signed)
      </PrimaryLink>
      <Title>Deployment Status (read-only)</Title>
      <Sub>
        Archive view of Liquidity Builder → Create Token → Public Farm Factory. Deploy actions are on the Founder
        wallet surface. Authorized deployer: {AUTHORIZED_MELEGA_DEPLOYER}.
      </Sub>

      {error && <Global role="status">{error}</Global>}

      {status && (
        <>
          <Global data-testid="deployment-global">
            <Lane>
              <span>Global state</span>
              <State $state={status.globalState}>{status.globalState}</State>
            </Lane>
            <Lane>
              <span>Next action</span>
              <strong>{nextAction}</strong>
            </Lane>
            <Lane>
              <span>Updated</span>
              <strong>{status.updatedAt}</strong>
            </Lane>
            <Lane>
              <span>Authority model</span>
              <strong data-testid="deployment-authority-model">
                {status.authority.authorityModel ?? 'FOUNDER_WALLET_SIGNED'}
              </strong>
            </Lane>
            <Lane>
              <span>Authorized deployer</span>
              <strong>{status.authority.authorizedDeployer ?? AUTHORIZED_MELEGA_DEPLOYER}</strong>
            </Lane>
            <Lane>
              <span>Founder pause</span>
              <strong>{status.founderExecution?.pauseState ?? '—'}</strong>
            </Lane>
          </Global>
          <Grid>
            {status.subsystems.map((snap) => (
              <SubsystemCard key={snap.id} snap={snap} />
            ))}
          </Grid>
        </>
      )}
    </Root>
  )
}

export default DeploymentDashboard
