/**
 * FARMS_MODULE_002 — Overview KPI strip (six factual cards).
 * Does not modify Module 001. Does not mount Modules 003–010.
 */
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import { farmsOverviewKpis } from './farmsOverviewKpisTokens'
import { useFarmsOverviewKpis } from './useFarmsOverviewKpis'
import type { FarmsOverviewKpiCardModel } from './farmsOverviewKpisTypes'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.85; }
  100% { opacity: 0.45; }
`

const Module = styled.section`
  width: 100%;
  max-width: ${farmsOverviewKpis.contentMax};
  height: ${farmsOverviewKpis.moduleH};
  /* Parent Content gap is 32px; negative margin yields 16px after Hero. */
  margin-top: -16px;
  box-sizing: border-box;
  font-family: ${typography.fontFamily.body};
  min-width: 0;

  @media (max-width: ${farmsOverviewKpis.tabletBreak}) {
    height: auto;
  }

  @media (max-width: ${farmsOverviewKpis.mobileBreak}) {
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
  grid-template-columns: repeat(6, ${farmsOverviewKpis.cardW});
  column-gap: ${farmsOverviewKpis.cardGap};
  align-items: stretch;
  min-width: 0;

  @media (max-width: ${farmsOverviewKpis.tabletBreak}) {
    height: auto;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${farmsOverviewKpis.cardGap};
  }

  @media (max-width: ${farmsOverviewKpis.mobileBreak}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${farmsOverviewKpis.cardGap};
  }
`

const Card = styled.article`
  width: ${farmsOverviewKpis.cardW};
  height: ${farmsOverviewKpis.cardH};
  box-sizing: border-box;
  padding: ${farmsOverviewKpis.cardPad};
  border-radius: ${farmsOverviewKpis.cardRadius};
  border: ${farmsOverviewKpis.cardBorder};
  background: ${farmsOverviewKpis.cardBg};
  box-shadow: ${farmsOverviewKpis.cardShadow};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;

  &:focus-visible {
    outline: ${farmsOverviewKpis.focusRing};
    outline-offset: 2px;
  }

  @media (max-width: ${farmsOverviewKpis.tabletBreak}) {
    width: 100%;
  }

  @media (max-width: ${farmsOverviewKpis.mobileBreak}) {
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
  width: ${farmsOverviewKpis.iconTile};
  height: ${farmsOverviewKpis.iconTile};
  border-radius: 7px;
  border: 1px solid rgba(244, 196, 48, 0.35);
  background: rgba(244, 196, 48, 0.08);
  color: ${farmsOverviewKpis.gold};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 ${farmsOverviewKpis.iconTile};

  svg {
    display: block;
  }
`

const Label = styled.div`
  font-size: ${farmsOverviewKpis.labelSize};
  line-height: ${farmsOverviewKpis.labelLine};
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${farmsOverviewKpis.labelColor};
  white-space: normal;
  overflow: visible;
  word-break: break-word;
  min-width: 0;
`

const Value = styled.div`
  margin-top: 8px;
  font-size: ${farmsOverviewKpis.valueSize};
  line-height: ${farmsOverviewKpis.valueLine};
  font-weight: 750;
  color: ${farmsOverviewKpis.valueColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Support = styled.div`
  margin-top: 4px;
  font-size: ${farmsOverviewKpis.supportSize};
  line-height: ${farmsOverviewKpis.supportLine};
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
    case 'activeFarms':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <circle cx="4.2" cy="6" r="2.4" stroke="currentColor" fill="none" strokeWidth="1.2" />
          <circle cx="7.8" cy="6" r="2.4" stroke="currentColor" fill="none" strokeWidth="1.2" />
        </svg>
      )
    case 'activeFarmers':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <circle cx="6" cy="4" r="2" stroke="currentColor" fill="none" strokeWidth="1.2" />
          <path d="M2.5 10c.6-2 2-3 3.5-3s2.9 1 3.5 3" stroke="currentColor" fill="none" strokeWidth="1.2" />
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

function KpiCardView({ model }: { model: FarmsOverviewKpiCardModel }) {
  // Founder amendment P0-4: Active Farmers has a factual "Indexing…" value while the
  // durable participant index catches up — show that text, not a skeleton pulse
  // forever. Other cards without a factual interim value keep the skeleton.
  const hasFactualLoadingValue = model.id === 'activeFarmers' && Boolean(model.value) && model.value !== '—'
  if (model.state === 'loading' && !hasFactualLoadingValue) {
    return (
      <Card
        data-testid={`farms-kpi-${model.id}`}
        data-kpi-state="loading"
        aria-busy="true"
        aria-label={`${model.label} loading`}
        tabIndex={0}
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
      data-testid={`farms-kpi-${model.id}`}
      data-kpi-state={model.state}
      data-kpi-freshness={model.freshness}
      tabIndex={0}
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

export const FarmsOverviewKpisModule: React.FC = () => {
  const vm = useFarmsOverviewKpis()
  const loadingAnnouncement =
    vm.phase === 'loading' ? 'Farms overview metrics are loading.' : `Farms overview metrics ${vm.phase}.`

  return (
    <Module
      data-testid="farms-overview-kpis-module"
      data-farms-module="002"
      data-pixel-farms-kpis="1376x112"
      aria-labelledby="farms-overview-kpis-heading"
    >
      <h2
        id="farms-overview-kpis-heading"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
      >
        Farms overview
      </h2>
      <LiveRegion aria-live="polite">{loadingAnnouncement}</LiveRegion>
      <Grid data-testid="farms-overview-kpis-grid">
        {vm.cards.map((c) => (
          <KpiCardView key={c.id} model={c} />
        ))}
      </Grid>
    </Module>
  )
}

export default FarmsOverviewKpisModule
