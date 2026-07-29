/**
 * Founder-facing deployment readiness — no developer diagnostics.
 */
import React from 'react'
import styled from 'styled-components'
import { MELEGA_FACTORY, MELEGA_ROUTER } from 'lib/liquidity-building-runtime/types'
import { LB_DEPLOYED_ADDRESSES, isDeployedAddress } from '../liquidityBuilding/addresses'
import { liqOne } from './onePageTokens'

const Panel = styled.aside`
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(244, 196, 48, 0.22);
  background: rgba(12, 12, 12, 0.92);
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 13px;
  font-weight: 750;
  color: ${liqOne.text};
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 8px;
  font-size: 12px;
  line-height: 16px;
`

const Key = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-weight: 650;
`

const Val = styled.span<{ $ok?: boolean; $warn?: boolean }>`
  color: ${({ $ok, $warn }) => ($ok ? '#6ddc8c' : $warn ? '#f2c84c' : 'rgba(255,255,255,0.78)')};
  font-weight: 650;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Note = styled.p`
  margin: 4px 0 0;
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.5);
`

export type LbDeployReadinessPanelProps = {
  pairLabel: string | null
  pairAddress: string | null
  pairReady: boolean
  executionReady: boolean
  executionReason: string | null
}

function shortAddr(addr: string | null | undefined): string {
  if (!addr) return 'Not bound'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export const LbDeployReadinessPanel: React.FC<LbDeployReadinessPanelProps> = ({
  pairLabel,
  pairAddress,
  pairReady,
  executionReady,
  executionReason,
}) => {
  const lbFactoryOk = isDeployedAddress(LB_DEPLOYED_ADDRESSES.lbFactory)
  const lbAuthorizerOk = isDeployedAddress(LB_DEPLOYED_ADDRESSES.lbAuthorizer)
  const lbFeeSinkOk = isDeployedAddress(LB_DEPLOYED_ADDRESSES.lbFeeSink)
  const deploymentReady = lbFactoryOk && lbAuthorizerOk && lbFeeSinkOk

  const missing: string[] = []
  if (!lbFactoryOk) missing.push('LB Factory')
  if (!lbAuthorizerOk) missing.push('LB Authorizer')
  if (!lbFeeSinkOk) missing.push('LB FeeSink')

  return (
    <Panel data-testid="lb-deploy-readiness-panel" data-deployment-ready={deploymentReady ? '1' : '0'}>
      <Title>Deploy readiness</Title>
      <Row>
        <Key>Detected pair</Key>
        <Val $ok={pairReady}>{pairReady ? pairLabel || 'Detected' : 'Not detected'}</Val>
      </Row>
      <Row>
        <Key>Pool</Key>
        <Val $ok={Boolean(pairAddress)}>{pairAddress ? shortAddr(pairAddress) : '—'}</Val>
      </Row>
      <Row>
        <Key>Factory</Key>
        <Val $ok>{shortAddr(MELEGA_FACTORY)} (Melega AMM)</Val>
      </Row>
      <Row>
        <Key>Router</Key>
        <Val $ok>{shortAddr(MELEGA_ROUTER)} (Melega AMM)</Val>
      </Row>
      <Row>
        <Key>Execution readiness</Key>
        <Val $ok={executionReady} $warn={!executionReady}>
          {executionReady ? 'Ready' : executionReason || 'Blocked'}
        </Val>
      </Row>
      <Row>
        <Key>Deployment readiness</Key>
        <Val $ok={deploymentReady} $warn={!deploymentReady}>
          {deploymentReady ? 'Bound' : 'BLOCKED — LB programs not deployed'}
        </Val>
      </Row>
      <Row>
        <Key>Required contracts</Key>
        <Val $warn={missing.length > 0}>
          {missing.length ? missing.join(', ') : 'LB Factory · Authorizer · FeeSink bound'}
        </Val>
      </Row>
      {!deploymentReady ? (
        <Note data-testid="lb-deploy-blocker-note">
          Configuration can be completed now. Wallet activation stays unavailable until Liquidity Building
          contracts are deployed and bound on BNB Smart Chain (chainId 56). Melega AMM Factory/Router already
          exist for pair detection and manual Add Liquidity.
        </Note>
      ) : null}
    </Panel>
  )
}

export default LbDeployReadinessPanel
