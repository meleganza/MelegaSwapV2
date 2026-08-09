/**
 * POOLS_MODULE_002 — Overview KPI strip (six factual cards).
 * Does not modify Module 001. Does not mount Modules 003–010.
 */
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import { poolsOverviewKpis } from './poolsOverviewKpisTokens'
import { usePoolsOverviewKpis } from './usePoolsOverviewKpis'
import type { PoolsOverviewKpiCardModel } from './poolsOverviewKpisTypes'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.85; }
  100% { opacity: 0.45; }
`

const Module = styled.section`
  width: 100%;
  max-width: ${poolsOverviewKpis.contentMax};
  height: ${poolsOverviewKpis.moduleH};
  /* Parent Content gap is 32px; negative margin yields 16px after Hero. */
  margin-top: 0;
  box-sizing: border-box;
  font-family: ${typography.fontFamily.body};
  min-width: 0;

  @media (max-width: ${poolsOverviewKpis.tabletBreak}) {
    height: auto;
  }

  @media (max-width: ${poolsOverviewKpis.mobileBreak}) {
    height: auto;
    max-width: none;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Grid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(6, ${poolsOverviewKpis.cardW});
  column-gap: ${poolsOverviewKpis.cardGap};
  align-items: stretch;
  min-width: 0;

  @media (max-width: ${poolsOverviewKpis.tabletBreak}) {
    height: auto;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${poolsOverviewKpis.cardGap};
  }

  @media (max-width: ${poolsOverviewKpis.mobileBreak}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${poolsOverviewKpis.cardGap};
  }
`

const Card = styled.article`
  width: ${poolsOverviewKpis.cardW};
  height: ${poolsOverviewKpis.cardH};
  box-sizing: border-box;
  padding: ${poolsOverviewKpis.cardPad};
  border-radius: ${poolsOverviewKpis.cardRadius};
  border: ${poolsOverviewKpis.cardBorder};
  background: ${poolsOverviewKpis.cardBg};
  box-shadow: ${poolsOverviewKpis.cardShadow};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;

  @media (max-width: ${poolsOverviewKpis.tabletBreak}) {
    width: 100%;
  }

  @media (max-width: ${poolsOverviewKpis.mobileBreak}) {
    width: 100%;
    min-width: 0;
  }
`

const Top = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const Icon = styled.span`
  width: ${poolsOverviewKpis.iconTile};
  height: ${poolsOverviewKpis.iconTile};
  border-radius: 7px;
  border: 1px solid rgba(244, 196, 48, 0.35);
  background: rgba(244, 196, 48, 0.08);
  color: ${poolsOverviewKpis.gold};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 ${poolsOverviewKpis.iconTile};

  svg {
    display: block;
  }
`

const Label = styled.div`
  font-size: ${poolsOverviewKpis.labelSize};
  line-height: ${poolsOverviewKpis.labelLine};
  font-weight: 650;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: ${poolsOverviewKpis.labelColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`

const Value = styled.div`
  margin-top: 8px;
  font-size: ${poolsOverviewKpis.valueSize};
  line-height: ${poolsOverviewKpis.valueLine};
  font-weight: 750;
  color: ${poolsOverviewKpis.valueColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Support = styled.div`
  margin-top: 4px;
  font-size: ${poolsOverviewKpis.supportSize};
  line-height: ${poolsOverviewKpis.supportLine};
  font-weight: 500;
  color: rgba(255, 255, 255, 0.48);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SkeletonBlock = styled.div`
  height: 14px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  animation: ${pulse} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.55;
  }
`

const LiveRegion = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

function KpiIcon({ id }: { id: string }) {
  switch (id) {
    case 'tvl':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <rect x="2" y="5" width="8" height="5" rx="1" stroke="currentColor" fill="none" strokeWidth="1.2" />
          <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" fill="none" strokeWidth="1.2" />
        </svg>
      )
    case 'discovered':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <circle cx="5.5" cy="5.5" r="3.2" stroke="currentColor" fill="none" strokeWidth="1.2" />
          <path d="M8 8l2.2 2.2" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
    case 'rewarding':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M6 1.5l1.2 2.6 2.8.3-2.1 1.9.6 2.8L6 7.6 3.5 9.1l.6-2.8L2 4.4l2.8-.3L6 1.5z" fill="currentColor" />
        </svg>
      )
    case 'rewards24h':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <circle cx="6" cy="6" r="4.2" stroke="currentColor" fill="none" strokeWidth="1.2" />
          <path d="M6 3.5V6l1.8 1.2" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
    case 'sustainableApr':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M2.5 8.5l2.2-3 1.6 1.8 3.2-4.3" stroke="currentColor" fill="none" strokeWidth="1.3" />
        </svg>
      )
    default:
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <rect x="2" y="3" width="8" height="6" rx="1.5" stroke="currentColor" fill="none" strokeWidth="1.2" />
        </svg>
      )
  }
}

function KpiCardView({ model, loading }: { model: PoolsOverviewKpiCardModel; loading: boolean }) {
  if (loading && model.state === 'loading') {
    return (
      <Card
        data-testid={`pools-kpi-${model.id}`}
        data-kpi-state="loading"
        aria-busy="true"
        aria-label={`${model.label} loading`}
      >
        <Top>
          <Icon aria-hidden="true">
            <KpiIcon id={model.id} />
          </Icon>
          <Label>{model.label}</Label>
        </Top>
        <div aria-hidden="true">
          <SkeletonBlock style={{ width: '62%', height: 22, marginTop: 10 }} />
          <SkeletonBlock style={{ width: '48%', height: 10, marginTop: 10 }} />
        </div>
      </Card>
    )
  }

  return (
    <Card
      data-testid={`pools-kpi-${model.id}`}
      data-kpi-state={model.state}
      data-kpi-freshness={model.freshness}
      aria-label={`${model.label}: ${model.value}. ${model.supporting}${
        model.a11yDetail ? `. ${model.a11yDetail}` : ''
      }`}
    >
      <Top>
        <Icon aria-hidden="true">
          <KpiIcon id={model.id} />
        </Icon>
        <Label>{model.label}</Label>
      </Top>
      <div>
        <Value>{model.value}</Value>
        <Support>{model.supporting}</Support>
      </div>
    </Card>
  )
}

export const PoolsOverviewKpisModule: React.FC = () => {
  const vm = usePoolsOverviewKpis()
  const loadingAnnouncement =
    vm.phase === 'loading' ? 'Pools overview metrics are loading.' : `Pools overview metrics ${vm.phase}.`

  return (
    <Module
      data-testid="pools-overview-kpis-module"
      data-pools-module="002"
      data-pixel-pools-kpis="1376x112"
      aria-labelledby="pools-overview-kpis-heading"
    >
      <h2 id="pools-overview-kpis-heading" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        Pools overview
      </h2>
      <LiveRegion aria-live="polite">{loadingAnnouncement}</LiveRegion>
      <Grid data-testid="pools-overview-kpis-grid">
        {vm.cards.map((c) => (
          <KpiCardView key={c.id} model={c} loading={c.state === 'loading'} />
        ))}
      </Grid>
    </Module>
  )
}

export default PoolsOverviewKpisModule
