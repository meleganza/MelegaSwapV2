import React, { useEffect, useState } from 'react'
import { PageMeta } from 'components/Layout/Page'
import { CHAIN_IDS } from 'utils/wagmi'
import {
  Code,
  DataRow,
  Eyebrow,
  ExternalCta,
  HeroCopy,
  HeroLead,
  HeroTitle,
  NavLink,
  NavTitle,
  Panel,
  PanelBody,
  PanelTitle,
  PortalFooter,
  PortalGrid,
  PortalHero,
  PortalInner,
  PortalPage,
  SideNav,
  Stack,
  StatusPill,
  StatusRow,
} from 'views/DeveloperPortal/PortalShell'

type Health = { status: 'checking' | 'ready' | 'degraded'; checkedAt?: string; detail?: string }

const ENDPOINTS = [
  ['GET', '/api/market-data/snapshot'],
  ['GET', '/api/market-data/top-movers'],
  ['GET', '/api/indexer/health'],
  ['GET', '/api/protocol/activity'],
  ['GET', '/api/public/projects/{slug}/machine'],
] as const

const ApiAgentsPage: React.FC = () => {
  const [health, setHealth] = useState<Health>({ status: 'checking' })

  useEffect(() => {
    let active = true
    const started = Date.now()
    fetch('/api/indexer/health', { headers: { accept: 'application/json' } })
      .then(async (response) => {
        if (!active) return
        setHealth({
          status: response.ok ? 'ready' : 'degraded',
          checkedAt: new Date().toISOString(),
          detail: response.ok ? `${Date.now() - started} ms` : `HTTP ${response.status}`,
        })
      })
      .catch(() => {
        if (active) setHealth({ status: 'degraded', checkedAt: new Date().toISOString(), detail: 'Unavailable' })
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <PageMeta title="API & Agents" />
      <PortalPage data-testid="api-agents-page">
        <PortalInner>
          <PortalHero>
            <HeroCopy>
              <Eyebrow>〉_ Melega DEX Machine Interface</Eyebrow>
              <HeroTitle>API &amp; Agents</HeroTitle>
              <HeroLead>Reliable data, explicit actions, verifiable outcomes.</HeroLead>
            </HeroCopy>
            <StatusRow>
              <StatusPill $ok={health.status === 'ready'}>
                API {health.status === 'checking' ? 'checking' : health.status === 'ready' ? 'operational' : 'degraded'}
              </StatusPill>
              <StatusPill>Schema v1</StatusPill>
            </StatusRow>
          </PortalHero>

          <PortalGrid>
            <SideNav aria-label="API documentation">
              <NavTitle>Documentation</NavTitle>
              <NavLink href="#overview">Overview</NavLink>
              <NavLink href="#quickstart">Quickstart</NavLink>
              <NavLink href="#schemas">Schema explorer</NavLink>
              <NavLink href="#agents">Agent guide</NavLink>
              <NavLink href="#receipts">Operational receipts</NavLink>
              <NavLink href="#provenance">Provenance</NavLink>
            </SideNav>

            <Stack>
              <Panel id="overview">
                <PanelTitle>Machine-readable by design</PanelTitle>
                <PanelBody>
                  Public read endpoints expose current indexed market and project facts. Write operations remain
                  server-authorized and require their documented confirmation boundary; browser state is never the
                  authority for settlement or fulfilment.
                </PanelBody>
              </Panel>

              <Panel id="quickstart">
                <PanelTitle>Quickstart for agents</PanelTitle>
                <PanelBody>Read the current public market snapshot. No fabricated freshness value is returned.</PanelBody>
                <Code>{[
                  'curl --fail --silent \\',
                  '  -H "Accept: application/json" \\',
                  '  https://www.melega.finance/api/market-data/snapshot/',
                ].join('\n')}</Code>
              </Panel>

              <Panel id="schemas">
                <PanelTitle>Schema explorer</PanelTitle>
                {ENDPOINTS.map(([method, endpoint]) => (
                  <DataRow key={endpoint}>
                    <span>{method}</span>
                    <strong>{endpoint}</strong>
                  </DataRow>
                ))}
                <ExternalCta href="/api/indexer/health" target="_blank" rel="noopener noreferrer">
                  Open health response ↗
                </ExternalCta>
              </Panel>

              <Panel id="agents">
                <PanelTitle>Agent execution contract</PanelTitle>
                <PanelBody>
                  An automation must preserve the server-owned amount and receiver, show the proposed operation,
                  receive explicit confirmation, retain an idempotency identity, and verify the final receipt before
                  reporting completion.
                </PanelBody>
              </Panel>

              <Panel id="receipts">
                <PanelTitle>Operational confirmation</PanelTitle>
                <DataRow><span>Requested</span><strong>Explicit input</strong></DataRow>
                <DataRow><span>Confirmed</span><strong>Human or authorized agent</strong></DataRow>
                <DataRow><span>Executed</span><strong>Canonical transaction / event</strong></DataRow>
                <DataRow><span>Reconciled</span><strong>Idempotent receipt</strong></DataRow>
              </Panel>
            </Stack>

            <Stack>
              <Panel id="provenance">
                <PanelTitle>Live data contract</PanelTitle>
                <DataRow><span>Status</span><strong>{health.status}</strong></DataRow>
                <DataRow><span>Health check</span><strong>{health.detail ?? 'Checking…'}</strong></DataRow>
                <DataRow><span>Checked</span><strong>{health.checkedAt ?? 'Pending'}</strong></DataRow>
                <DataRow><span>Source</span><strong>Melega indexer health</strong></DataRow>
              </Panel>
              <Panel>
                <PanelTitle>Freshness &amp; provenance</PanelTitle>
                <PanelBody>
                  Every consumer should prefer the timestamp, source and status carried by the response. A missing
                  measurement is unavailable, never zero by assumption.
                </PanelBody>
              </Panel>
            </Stack>
          </PortalGrid>
          <PortalFooter />
        </PortalInner>
      </PortalPage>
    </>
  )
}

ApiAgentsPage.chains = CHAIN_IDS

export default ApiAgentsPage
