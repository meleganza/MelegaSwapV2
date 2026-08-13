import React, { useMemo } from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { colors } from 'design-system/melega'
import type { MarcoBridgeAuthoritySnapshot } from 'lib/marco-bridge-route-authority'
import { useMarcoBridgeRouteState } from './useMarcoBridgeRouteState'

const MARCO_PORTAL_URL = 'https://marco.melega.ai'

const Root = styled.div`
  min-height: 70vh;
  background: transparent;
  color: ${colors.textPrimary};
  padding: 24px 0 72px;
`

const Inner = styled.div`
  width: 100%;
  max-width: 1376px;
  margin: 0 auto;
`

const Hero = styled.section`
  min-height: 260px;
  padding: 24px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: stretch;
  border: 1px solid rgba(244, 196, 48, 0.18);
  border-radius: 18px;
  overflow: hidden;
  background: radial-gradient(ellipse 50% 100% at 22% 50%, rgba(244, 196, 48, 0.12), transparent 68%),
    linear-gradient(145deg, rgba(18, 16, 10, 0.98), rgba(8, 8, 8, 0.98));

  @media (max-width: 767px) {
    padding: 20px 16px;
  }

  @media (min-width: 768px) {
    grid-template-columns: minmax(320px, 440px) minmax(0, 1fr);
  }
`

const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
`

const Brand = styled.p`
  margin: 0 0 8px;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${colors.gold};
  font-weight: 700;
`

const Title = styled.h1`
  margin: 0 0 10px;
  font-size: clamp(42px, 4.2vw, 52px);
  font-weight: 800;
  line-height: 1.15;
`

const Lead = styled.p`
  margin: 0;
  color: ${colors.textMuted};
  line-height: 1.55;
  font-size: 15px;
`

const Panel = styled.section`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 20px;
  background: rgba(5, 5, 5, 0.62);
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const PanelTitle = styled.h2`
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 700;
`

const PanelBody = styled.p`
  margin: 0;
  color: ${colors.textMuted};
  font-size: 14px;
  line-height: 1.5;
`

const StatusSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
`

const StatusMetric = styled.div`
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.025);
`

const StatusValue = styled.div`
  color: #fff;
  font-size: 24px;
  font-weight: 850;
  font-variant-numeric: tabular-nums;
`

const StatusLabel = styled.div`
  margin-top: 3px;
  color: ${colors.textMuted};
  font-size: 11px;
`

const PortalLink = styled.a`
  display: inline-block;
  margin-top: 16px;
  color: ${colors.textMuted};
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: ${colors.gold};
  }
`

const FootNote = styled.p`
  margin: 16px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  line-height: 1.45;
`

function PreActivationCopy({ snapshot }: { snapshot: MarcoBridgeAuthoritySnapshot }) {
  const showPrepared = !snapshot.globalExecutionEnabled
  return (
    <>
      <PanelTitle>Mainnet routes are prepared.</PanelTitle>
      <PanelBody>
        {showPrepared
          ? 'Public execution is not active yet.'
          : 'Route availability follows the shared MARCO authority. No local enable flags.'}
      </PanelBody>
      <StatusSummary aria-label="MARCO bridge status summary">
        <StatusMetric>
          <StatusValue>{snapshot.routes.length}</StatusValue>
          <StatusLabel>Tracked mainnet paths</StatusLabel>
        </StatusMetric>
        <StatusMetric>
          <StatusValue>{snapshot.executableRouteCount}</StatusValue>
          <StatusLabel>Executable now</StatusLabel>
        </StatusMetric>
      </StatusSummary>
    </>
  )
}

export default function MarcoBridgeScreen() {
  const { result, loading, ignoredOverrideKeys } = useMarcoBridgeRouteState()

  const content = useMemo(() => {
    if (loading && !result) {
      return (
        <Panel data-testid="marco-bridge-loading">
          <PanelTitle>MARCO Bridge</PanelTitle>
          <PanelBody>Checking route status…</PanelBody>
        </Panel>
      )
    }

    if (!result || !result.ok) {
      return (
        <Panel data-testid="marco-bridge-unavailable" data-fail-closed="true">
          <PanelTitle>Bridge temporarily unavailable.</PanelTitle>
          <PanelBody>Try again later.</PanelBody>
        </Panel>
      )
    }

    const executable = result.executableRouteCount > 0 && result.globalExecutionEnabled
    return (
      <Panel
        data-testid="marco-bridge-authority"
        data-global-execution={result.globalExecutionEnabled ? 'true' : 'false'}
        data-executable-count={String(result.executableRouteCount)}
      >
        <PreActivationCopy snapshot={result} />
        {/* Hard rule: no live Bridge/Confirm while public execution is disabled. */}
        {!executable ? null : null}
      </Panel>
    )
  }, [loading, result])

  return (
    <Root data-testid="marco-bridge-screen" data-marco-bridge-authority="canonical">
      <PageMeta />
      <Inner>
        <Hero data-canonical-studio-hero data-testid="marco-bridge-hero">
          <HeroCopy>
            <Brand>MARCO Multichain</Brand>
            <Title>MARCO Bridge</Title>
            <Lead>
              Move MARCO across supported networks through one shared route authority, with execution status verified
              before every bridge action.
            </Lead>
          </HeroCopy>
          {content}
        </Hero>
        <PortalLink href={MARCO_PORTAL_URL} target="_blank" rel="noreferrer">
          Open MARCO Portal
        </PortalLink>
        {ignoredOverrideKeys.length > 0 ? (
          <FootNote data-testid="marco-bridge-ignored-overrides">Client override parameters are ignored.</FootNote>
        ) : null}
        <FootNote>Route truth: {`https://marco.melega.ai/api/public/bridge/route-state`}</FootNote>
      </Inner>
    </Root>
  )
}
