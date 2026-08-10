/**
 * Liquidity Studio V3 — consumer-first tabbed shell (presentation only).
 * Reuses mint runtime, Add/Remove execution, positions, and AI Liquidity Builder.
 * Does NOT modify Router / Factory / AMM / wallet execution.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { GLOBAL_DATA_TRUTH_PIPELINE, truthDash } from 'lib/data-truth'
import { LiquidityRuntimeProvider, useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import type { LiquidityStudioMode } from '../liquidityRuntime/useLiquidityMintRuntime'
import { LiquidityAddModule } from '../modules/LiquidityAddModule'
import { LiquidityMyPositionsModule } from '../modules/LiquidityMyPositionsModule'
import { LiquidityBuildingCard } from '../onePage/LiquidityBuildingCard'
import { useLiquidityMarketSnapshot } from '../modules/useLiquidityMarketSnapshot'
import { LiquidityHeroArtwork } from '../modules/LiquidityHeroArtwork'
import { LiquidityHeroTrustPanel } from '../modules/LiquidityHeroTrustPanel'
import { LiquidityRemovePanel } from './LiquidityRemovePanel'
import { LIQ_V3_COPY, LIQ_V3_LIVE_CHAINS, liqV3, type LiquidityV3Tab } from './liquidityV3Tokens'

const Page = styled.div`
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
  background: ${liqV3.pageBg};
  box-sizing: border-box;
  padding: ${liqV3.pagePadY} 12px 40px;
  max-width: ${liqV3.contentMax};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${liqV3.pageGap};

  @media (min-width: 768px) {
    padding: ${liqV3.pagePadY} 0 48px;
  }
`

const Hero = styled.section`
  min-height: ${liqV3.heroMaxH};
  padding: 0;
  border: none;
  border-radius: 0;
  background:
    radial-gradient(ellipse 42% 80% at 52% 55%, rgba(244, 196, 48, 0.07) 0%, rgba(8, 8, 8, 0) 70%),
    radial-gradient(ellipse 36% 70% at 18% 40%, rgba(34, 197, 94, 0.05) 0%, rgba(8, 8, 8, 0) 68%),
    transparent;
  display: grid;
  grid-template-columns: ${liqV3.leftW} ${liqV3.artworkW} ${liqV3.trustW};
  column-gap: ${liqV3.columnGap};
  align-items: center;
  min-width: 0;

  @media (max-width: ${liqV3.tabletBreak}) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    column-gap: 20px;
    row-gap: 14px;
  }

  @media (max-width: ${liqV3.mobileBreak}) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const HeroCopy = styled.div`
  min-width: 0;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: ${liqV3.tabletBreak}) {
    grid-column: 1;
  }
`

const HeroTitle = styled.h1`
  margin: 0;
  font-size: ${liqV3.titleSize};
  line-height: ${liqV3.titleLine};
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #f7f7f7;

  @media (max-width: ${liqV3.mobileBreak}) {
    font-size: 42px;
    line-height: 46px;
  }
`

const HeroSub = styled.p`
  margin: 8px 0 0;
  font-size: ${liqV3.descSize};
  line-height: ${liqV3.descLine};
  color: rgba(255, 255, 255, 0.66);
  max-width: 380px;
`

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 14px;
`

const HeroVisual = styled.div`
  min-width: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: ${liqV3.tabletBreak}) {
    grid-column: 2;
    grid-row: 1;
  }
`

const HeroTrust = styled.div`
  min-width: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: ${liqV3.tabletBreak}) {
    grid-column: 1 / -1;
    justify-content: center;
  }
`

const Btn = styled.button<{ $primary?: boolean; $ghost?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: ${liqV3.ctaH};
  padding: 0 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 750;
  border: 1px solid
    ${({ $primary, $ghost }) => ($primary ? 'transparent' : $ghost ? liqV3.line : 'rgba(255,255,255,0.14)')};
  background: ${({ $primary, $ghost }) =>
    $primary ? liqV3.gold : $ghost ? 'transparent' : 'rgba(255,255,255,0.04)'};
  color: ${({ $primary }) => ($primary ? '#111' : liqV3.text)};

  &:hover:not(:disabled) {
    background: ${({ $primary, $ghost }) =>
      $primary ? liqV3.goldHover : $ghost ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)'};
  }
`

const LinkBtn = styled(Link)<{ $primary?: boolean; $ghost?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 750;
  text-decoration: none;
  border: 1px solid
    ${({ $primary, $ghost }) => ($primary ? liqV3.goldLine : $ghost ? liqV3.line : 'rgba(255,255,255,0.14)')};
  background: ${({ $primary, $ghost }) =>
    $primary ? liqV3.gold : $ghost ? 'transparent' : 'rgba(255,255,255,0.04)'};
  color: ${({ $primary }) => ($primary ? '#111' : liqV3.text)};
`

const Snapshot = styled.section`
  margin-top: 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  min-width: 0;

  @media (max-width: ${liqV3.tabletBreak}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: ${liqV3.mobileBreak}) {
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 4px;
    scroll-snap-type: x mandatory;

    & > * {
      flex: 0 0 min(72%, 220px);
      scroll-snap-align: start;
    }
  }
`

const SnapCell = styled.div`
  min-width: 0;
  min-height: 60px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${liqV3.line};
  background: ${liqV3.panel};
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
`

const SnapLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${liqV3.mute2};
  margin-bottom: 6px;
  line-height: 1.2;
`

const SnapValue = styled.div`
  font-size: 16px;
  line-height: 1.25;
  font-weight: 800;
  color: #fff;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`

const Tabs = styled.div`
  margin-top: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid ${liqV3.line};
  background: rgba(0, 0, 0, 0.28);
`

const TabBtn = styled.button<{ $on?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 9px;
  border: 1px solid ${({ $on }) => ($on ? liqV3.goldLine : 'transparent')};
  background: ${({ $on }) => ($on ? 'rgba(221, 185, 47, 0.12)' : 'transparent')};
  color: ${({ $on }) => ($on ? '#fff' : liqV3.mute)};
  font-size: 12px;
  font-weight: 750;
`

const Workspace = styled.section`
  margin-top: 4px;
  min-width: 0;
  position: relative;
`

/** Keep all tab panels mounted — hide inactive to prevent black flash / remount races. */
const Panel = styled.div<{ $active: boolean }>`
  display: ${({ $active }) => ($active ? 'block' : 'none')};
  min-width: 0;
`

/** Add ↔ Remove stay mounted inside the Add tab (no form remount flash). */
const SubPanel = styled.div<{ $active: boolean }>`
  display: ${({ $active }) => ($active ? 'block' : 'none')};
  min-width: 0;
`

const AiWide = styled.div`
  width: 100%;
  min-width: 0;

  & [data-lb-force-expanded='1'] {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: none !important;
  }
`

const AiEntry = styled.div`
  padding: 12px 14px;
  border-radius: ${liqV3.radius};
  border: 1px solid ${liqV3.goldLine};
  background:
    radial-gradient(ellipse 80% 60% at 8% 0%, rgba(242, 200, 76, 0.1), transparent 55%),
    linear-gradient(165deg, rgba(22, 20, 12, 0.98), rgba(12, 12, 12, 0.98));
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) auto;
  gap: 10px 14px;
  align-items: center;
  margin-bottom: 8px;
  min-width: 0;

  @media (max-width: ${liqV3.mobileBreak}) {
    grid-template-columns: 1fr;
  }
`

const AiSteps = styled.ol`
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;

  @media (max-width: ${liqV3.mobileBreak}) {
    grid-template-columns: 1fr;
  }
`

const AiStep = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  padding: 4px 8px;
  border-radius: 9px;
  border: 1px solid ${liqV3.line};
  background: rgba(255, 255, 255, 0.02);
  font-size: 12px;
  font-weight: 700;
  color: ${liqV3.mute};
`

const AiStepNum = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: rgba(244, 196, 48, 0.16);
  color: ${liqV3.gold};
  font-size: 11px;
  font-weight: 800;
`

const AiTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
`

const AiSub = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.35;
  color: ${liqV3.mute};
`

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 750;
  background: rgba(124, 58, 237, 0.25);
  color: #c4b5fd;
`

const ChainLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0 0;
`

const ChainChip = styled.span<{ $on?: boolean }>`
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid ${({ $on }) => ($on ? liqV3.goldLine : liqV3.line)};
  background: ${({ $on }) => ($on ? 'rgba(221,185,47,0.12)' : 'rgba(255,255,255,0.02)')};
  color: ${({ $on }) => ($on ? liqV3.gold : liqV3.mute)};
`

const FarmNudge = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${liqV3.line};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: ${liqV3.mute};
`

function modeToTab(mode: LiquidityStudioMode): LiquidityV3Tab {
  if (mode === 'Liquidity Building') return 'building'
  if (mode === 'Add Liquidity' || mode === 'Remove Liquidity' || mode === 'Simulation') return 'add'
  return 'positions'
}

function isRemoveMode(mode: LiquidityStudioMode): boolean {
  return mode === 'Remove Liquidity'
}

function tabToMode(tab: LiquidityV3Tab): LiquidityStudioMode {
  if (tab === 'building') return 'Liquidity Building'
  if (tab === 'add') return 'Add Liquidity'
  return 'My Positions'
}

function cardValue(
  cards: ReturnType<typeof useLiquidityMarketSnapshot>['cards'],
  id: string,
): string {
  const c = cards.find((x) => x.id === id)
  return truthDash(c?.value)
}

const LiquidityV3Body: React.FC = () => {
  const router = useRouter()
  const { chainId } = useActiveChainId()
  const { mode, setMode, positions } = useLiquidityRuntime()
  const snapshot = useLiquidityMarketSnapshot()
  /**
   * Tab chrome is local and authoritative for UI.
   * Do NOT mirror mode→tab on every mode change — that races shallow URL updates and snaps the wrong tab.
   */
  const [tab, setTab] = useState<LiquidityV3Tab>('positions')
  const [aiMounted, setAiMounted] = useState(false)
  const [tabsReady, setTabsReady] = useState(false)
  const hydratedRef = React.useRef(false)
  const prevModeRef = React.useRef(mode)
  const tabRef = React.useRef<LiquidityV3Tab>(tab)
  tabRef.current = tab
  const showFarmNudge = tab === 'positions' && positions.length > 0
  const removing = isRemoveMode(mode)

  // One-shot deep-link hydrate from ?view= (wait for query parse when asPath has view=)
  useEffect(() => {
    if (!router.isReady || hydratedRef.current) return
    const raw = router.query.view
    const view = Array.isArray(raw) ? raw[0] : typeof raw === 'string' ? raw : undefined
    if (router.asPath.includes('view=') && view === undefined) return
    hydratedRef.current = true
    if (view === 'building') {
      setTab('building')
      setAiMounted(true)
      setMode('Liquidity Building', { syncUrl: false })
    } else if (view === 'add' || view === 'remove') {
      setTab('add')
      setMode(view === 'remove' ? 'Remove Liquidity' : 'Add Liquidity', { syncUrl: false })
    } else {
      setTab('positions')
      setMode('My Positions', { syncUrl: false })
    }
    setTabsReady(true)
  }, [router.isReady, router.query.view, router.asPath, setMode])

  // External execution paths only: Remove Liquidity, or Manage → Add from My Liquidity.
  useEffect(() => {
    const prev = prevModeRef.current
    prevModeRef.current = mode
    if (mode === 'Remove Liquidity') {
      setTab('add')
      return
    }
    if (mode === 'Add Liquidity' && prev === 'My Positions') {
      setTab('add')
    }
  }, [mode])

  useEffect(() => {
    if (tab === 'building') setAiMounted(true)
  }, [tab])

  // Prefetch AI module after first paint so first AI tab visit does not remount a blank shell.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const t = window.setTimeout(() => setAiMounted(true), 500)
    return () => window.clearTimeout(t)
  }, [])

  // Debounced shareable ?view= mirror (never drives tab chrome).
  // Depend on primitive query fields — not the whole `router` object — so shallow
  // replaces cannot cancel the debounce timer before it commits.
  const queryView = typeof router.query.view === 'string' ? router.query.view : undefined
  const queryStep = Array.isArray(router.query.step) ? router.query.step[0] : router.query.step
  const queryProgram = Array.isArray(router.query.program)
    ? router.query.program[0]
    : router.query.program

  const flushViewMirror = useCallback(
    (next: LiquidityV3Tab) => {
      if (!router.isReady || !hydratedRef.current) return
      const liveView = next === 'building' ? 'building' : next === 'add' ? (removing ? 'remove' : 'add') : 'positions'
      const nextQuery: Record<string, string | string[] | undefined> = { ...router.query, view: liveView }
      if (next !== 'building') {
        delete nextQuery.step
        delete nextQuery.program
      }
      void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, {
        shallow: true,
        scroll: false,
      })
    },
    [removing, router],
  )

  const selectTab = useCallback(
    (next: LiquidityV3Tab) => {
      setTab(next)
      if (next === 'building') setAiMounted(true)
      // Mode for execution only — URL is mirrored below (debounced). Avoids replace races.
      setMode(tabToMode(next), { syncUrl: false })
      // Leaving AI must clear view=building immediately — stale building URLs cause hard remounts.
      if (next !== 'building' && queryView === 'building') {
        flushViewMirror(next)
      }
    },
    [setMode, queryView, flushViewMirror],
  )

  useEffect(() => {
    if (!router.isReady || !hydratedRef.current) return
    const desired = (t: LiquidityV3Tab) =>
      t === 'building' ? 'building' : t === 'add' ? (removing ? 'remove' : 'add') : 'positions'
    const view = desired(tab)
    const stray = tab !== 'building' && (Boolean(queryStep) || Boolean(queryProgram))
    if (view === queryView && !stray) return undefined
    const pathname = router.pathname
    const timer = window.setTimeout(() => {
      // Always mirror the live tab — never flush a stale scheduled view after a later click.
      const liveTab = tabRef.current
      const liveView = desired(liveTab)
      const nextQuery: Record<string, string | string[] | undefined> = { ...router.query, view: liveView }
      if (liveTab !== 'building') {
        delete nextQuery.step
        delete nextQuery.program
      }
      void router.replace({ pathname, query: nextQuery }, undefined, { shallow: true, scroll: false })
    }, 120)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- primitives only; avoid router identity churn
  }, [tab, removing, router.isReady, router.pathname, queryView, queryStep, queryProgram])

  const goAdd = useCallback(() => {
    selectTab('add')
  }, [selectTab])

  const goPositions = useCallback(() => selectTab('positions'), [selectTab])
  const goAi = useCallback(() => selectTab('building'), [selectTab])

  const snapCells = useMemo(
    () => [
      { label: LIQ_V3_COPY.snapshot.total, value: cardValue(snapshot.cards, 'tvl') },
      { label: LIQ_V3_COPY.snapshot.volume, value: cardValue(snapshot.cards, 'volume24h') },
      { label: LIQ_V3_COPY.snapshot.fees, value: '—' },
      {
        label: LIQ_V3_COPY.snapshot.positions,
        value: positions.length > 0 ? String(positions.length) : '—',
      },
      { label: LIQ_V3_COPY.snapshot.chains, value: String(LIQ_V3_LIVE_CHAINS.length) },
    ],
    [snapshot.cards, positions.length],
  )

  const lbSupported = (chainId ?? 56) === 56

  return (
    <>
      <Hero data-testid="liquidity-v3-hero" data-liquidity-hero-geometry="farms-pools-parity">
        <HeroCopy>
          <HeroTitle>{LIQ_V3_COPY.title}</HeroTitle>
          <HeroSub>{LIQ_V3_COPY.subtitle}</HeroSub>
          <HeroActions role="tablist" aria-label="Liquidity Studio primary" data-testid="liquidity-v3-hero-nav">
            <Btn
              $primary={tab === 'positions'}
              type="button"
              onClick={goPositions}
              data-testid="liquidity-v3-hero-positions"
              aria-selected={tab === 'positions'}
            >
              {LIQ_V3_COPY.positionsCta}
            </Btn>
            <Btn
              $primary={tab === 'add'}
              type="button"
              onClick={goAdd}
              data-testid="liquidity-v3-hero-add"
              aria-selected={tab === 'add'}
            >
              {LIQ_V3_COPY.addCta}
            </Btn>
            <Btn
              $primary={tab === 'building'}
              $ghost={tab !== 'building'}
              type="button"
              onClick={goAi}
              data-testid="liquidity-v3-hero-ai"
              aria-selected={tab === 'building'}
            >
              {LIQ_V3_COPY.aiEntry}
            </Btn>
          </HeroActions>
        </HeroCopy>
        <HeroVisual data-testid="liquidity-v3-hero-visual">
          <LiquidityHeroArtwork />
        </HeroVisual>
        <HeroTrust data-testid="liquidity-v3-hero-trust">
          <LiquidityHeroTrustPanel />
        </HeroTrust>
      </Hero>

      <Snapshot
        data-testid="liquidity-v3-snapshot"
        data-truth-pipeline={GLOBAL_DATA_TRUTH_PIPELINE}
      >
        {snapCells.map((c) => (
          <SnapCell key={c.label}>
            <SnapLabel>{c.label}</SnapLabel>
            <SnapValue>{c.value}</SnapValue>
          </SnapCell>
        ))}
      </Snapshot>

      <Tabs role="tablist" aria-label="Liquidity Studio" data-testid="liquidity-v3-tabs">
        <TabBtn
          type="button"
          role="tab"
          aria-selected={tab === 'positions'}
          $on={tab === 'positions'}
          onClick={() => selectTab('positions')}
          data-testid="liquidity-v3-tab-positions"
        >
          {LIQ_V3_COPY.tabPositions}
        </TabBtn>
        <TabBtn
          type="button"
          role="tab"
          aria-selected={tab === 'add'}
          $on={tab === 'add'}
          onClick={() => selectTab('add')}
          data-testid="liquidity-v3-tab-add"
        >
          {LIQ_V3_COPY.tabAdd}
        </TabBtn>
        <TabBtn
          type="button"
          role="tab"
          aria-selected={tab === 'building'}
          $on={tab === 'building'}
          onClick={() => selectTab('building')}
          data-testid="liquidity-v3-tab-ai"
        >
          {LIQ_V3_COPY.tabAi}
        </TabBtn>
      </Tabs>

      <Workspace
        data-testid="liquidity-v3-workspace"
        data-liquidity-tab={tab}
        data-liquidity-panels="mounted"
        data-liquidity-tabs-ready={tabsReady ? '1' : '0'}
      >
        <Panel
          $active={tab === 'positions'}
          data-testid="liquidity-v3-panel-positions"
          aria-hidden={tab !== 'positions'}
        >
          <ChainLegend data-testid="liquidity-v3-chain-legend" aria-label="LIVE chains">
            {LIQ_V3_LIVE_CHAINS.map((c) => (
              <ChainChip key={c.id} $on={chainId === c.id}>
                {c.label}
              </ChainChip>
            ))}
          </ChainLegend>
          <LiquidityMyPositionsModule />
          {showFarmNudge ? (
            <FarmNudge data-testid="liquidity-v3-farm-nudge">
              <span>{LIQ_V3_COPY.createFarmNudge}</span>
              <LinkBtn
                $ghost
                href={`/farms?create=1&chain=${chainId ?? 56}`}
                data-testid="liquidity-v3-create-farm"
              >
                {LIQ_V3_COPY.createFarmCta}
              </LinkBtn>
            </FarmNudge>
          ) : null}
        </Panel>

        <Panel $active={tab === 'add'} data-testid="liquidity-v3-panel-add" aria-hidden={tab !== 'add'}>
          <SubPanel $active={!removing} data-add-surface="mint" aria-hidden={removing}>
            <LiquidityAddModule />
          </SubPanel>
          <SubPanel $active={removing} data-add-surface="burn" aria-hidden={!removing}>
            <LiquidityRemovePanel />
          </SubPanel>
        </Panel>

        <Panel
          $active={tab === 'building'}
          data-testid="liquidity-v3-panel-ai"
          aria-hidden={tab !== 'building'}
        >
          <AiEntry data-testid="liquidity-v3-ai-entry" data-ai-layout="horizontal">
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <AiTitle>{LIQ_V3_COPY.aiEntry}</AiTitle>
                <Badge data-testid="liquidity-v3-ai-beta">{LIQ_V3_COPY.aiBeta}</Badge>
              </div>
              <AiSub>{LIQ_V3_COPY.aiSub}</AiSub>
              <AiSteps aria-label="Builder steps" data-testid="liquidity-v3-ai-steps">
                <AiStep>
                  <AiStepNum>1</AiStepNum>
                  {LIQ_V3_COPY.aiStep1}
                </AiStep>
                <AiStep>
                  <AiStepNum>2</AiStepNum>
                  {LIQ_V3_COPY.aiStep2}
                </AiStep>
                <AiStep>
                  <AiStepNum>3</AiStepNum>
                  {LIQ_V3_COPY.aiStep3}
                </AiStep>
              </AiSteps>
            </div>
            <Btn
              $primary
              type="button"
              data-testid="liquidity-v3-ai-start"
              onClick={() => {
                selectTab('building')
                setAiMounted(true)
              }}
            >
              {LIQ_V3_COPY.aiOpen}
            </Btn>
          </AiEntry>
          {lbSupported ? (
            <AiWide data-testid="liquidity-v3-ai-builder">
              {aiMounted ? (
                <LiquidityBuildingCard forceExpanded={tab === 'building'} studioOwnedUrl />
              ) : null}
            </AiWide>
          ) : (
            <AiSub data-testid="liquidity-v3-ai-wrong-chain">
              AI Liquidity Builder is available on BNB Chain only.
            </AiSub>
          )}
        </Panel>
      </Workspace>
    </>
  )
}

export const LiquidityStudioV3Shell: React.FC = () => (
  <Page
    data-testid="liquidity-studio-v3"
    data-liquidity-studio="v3"
    data-liquidity-studio-screen="true"
    data-truth-pipeline={GLOBAL_DATA_TRUTH_PIPELINE}
    data-liquidity-module-001="mounted"
    data-liquidity-module-002="mounted"
    data-liquidity-module-003="mounted"
    data-liquidity-module-004="mounted"
    data-liquidity-module-005="mounted"
    data-liquidity-module-006="mounted"
    data-liquidity-module-007="mounted"
    data-liquidity-module-008="mounted"
    data-liquidity-architecture="000"
    data-liquidity-ia="v3-tabs"
  >
    <LiquidityRuntimeProvider>
      <LiquidityV3Body />
    </LiquidityRuntimeProvider>
  </Page>
)

export default LiquidityStudioV3Shell
