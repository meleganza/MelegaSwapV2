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
import { LiquidityRemovePanel } from './LiquidityRemovePanel'
import { LIQ_V3_COPY, LIQ_V3_LIVE_CHAINS, liqV3, type LiquidityV3Tab } from './liquidityV3Tokens'

const Page = styled.div`
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
  background: ${liqV3.pageBg};
  box-sizing: border-box;
  padding: 24px 12px 48px;
  max-width: ${liqV3.contentMax};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 768px) {
    padding: 24px 0 56px;
  }
`

const Hero = styled.section`
  min-height: ${liqV3.heroMaxH};
  padding: 8px 0 4px;
  border: none;
  border-radius: 0;
  background:
    radial-gradient(ellipse 42% 80% at 52% 55%, rgba(244, 196, 48, 0.07) 0%, rgba(8, 8, 8, 0) 70%),
    radial-gradient(ellipse 36% 70% at 18% 40%, rgba(34, 197, 94, 0.05) 0%, rgba(8, 8, 8, 0) 68%),
    transparent;
  display: grid;
  gap: 14px;
  min-width: 0;
  align-content: center;
`

const HeroTitle = styled.h1`
  margin: 0;
  font-size: ${liqV3.titleSize};
  line-height: ${liqV3.titleLine};
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #f7f7f7;
`

const HeroSub = styled.p`
  margin: 14px 0 0;
  font-size: ${liqV3.descSize};
  line-height: 24px;
  color: rgba(255, 255, 255, 0.66);
  max-width: 38rem;
`

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-top: 24px;
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
    $primary ? 'linear-gradient(180deg, #F2C84C 0%, #D4A017 100%)' : $ghost ? 'transparent' : 'rgba(255,255,255,0.04)'};
  color: ${({ $primary }) => ($primary ? '#111' : liqV3.text)};
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
    $primary ? 'linear-gradient(180deg, #F2C84C 0%, #D4A017 100%)' : $ghost ? 'transparent' : 'rgba(255,255,255,0.04)'};
  color: ${({ $primary }) => ($primary ? '#111' : liqV3.text)};
`

const Snapshot = styled.section`
  margin-top: 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  min-width: 0;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const SnapCell = styled.div`
  min-width: 0;
  padding: 14px 14px;
  border-radius: 14px;
  border: 1px solid ${liqV3.line};
  background: rgba(18, 18, 18, 0.92);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
`

const SnapLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${liqV3.mute2};
  margin-bottom: 3px;
`

const SnapValue = styled.div`
  font-size: 16px;
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
  margin-top: 12px;
  min-width: 0;
`

const AiEntry = styled.div`
  padding: 16px;
  border-radius: ${liqV3.radius};
  border: 1px solid ${liqV3.goldLine};
  background:
    radial-gradient(ellipse 80% 60% at 8% 0%, rgba(242, 200, 76, 0.1), transparent 55%),
    linear-gradient(165deg, rgba(22, 20, 12, 0.98), rgba(12, 12, 12, 0.98));
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
`

const AiTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
`

const AiSub = styled.p`
  margin: 0;
  font-size: 13px;
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
  const [builderOpen, setBuilderOpen] = useState(false)
  const showFarmNudge = modeToTab(mode) === 'positions' && positions.length > 0

  const tab = modeToTab(mode)
  const removing = isRemoveMode(mode)

  // Keep builder panel open when landing on ?view=building
  useEffect(() => {
    if (!router.isReady) return
    if (typeof router.query.view === 'string' && router.query.view === 'building') {
      setBuilderOpen(true)
    }
  }, [router.isReady, router.query.view])

  const selectTab = useCallback(
    (next: LiquidityV3Tab) => {
      setMode(tabToMode(next))
      if (next === 'building') setBuilderOpen(true)
      if (next !== 'building') setBuilderOpen(false)
    },
    [setMode],
  )

  const goAdd = useCallback(() => {
    selectTab('add')
    if (typeof document !== 'undefined') {
      window.setTimeout(() => {
        document.getElementById('add-liquidity')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }, [selectTab])

  const goPositions = useCallback(() => selectTab('positions'), [selectTab])
  const goAi = useCallback(() => {
    selectTab('building')
    setBuilderOpen(true)
  }, [selectTab])

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
      <Hero data-testid="liquidity-v3-hero">
        <div>
          <HeroTitle>{LIQ_V3_COPY.title}</HeroTitle>
          <HeroSub>{LIQ_V3_COPY.subtitle}</HeroSub>
          <HeroActions>
            <Btn $primary type="button" onClick={goAdd} data-testid="liquidity-v3-hero-add">
              {LIQ_V3_COPY.addCta}
            </Btn>
            <Btn $ghost type="button" onClick={goPositions} data-testid="liquidity-v3-hero-positions">
              {LIQ_V3_COPY.positionsCta}
            </Btn>
            <Btn type="button" onClick={goAi} data-testid="liquidity-v3-hero-ai">
              {LIQ_V3_COPY.aiEntry} · BETA
            </Btn>
          </HeroActions>
        </div>
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

      <Workspace data-testid="liquidity-v3-workspace" data-liquidity-tab={tab}>
        {tab === 'positions' ? (
          <div data-testid="liquidity-v3-panel-positions">
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
          </div>
        ) : null}

        {tab === 'add' ? (
          <div data-testid="liquidity-v3-panel-add">
            {removing ? (
              <LiquidityRemovePanel />
            ) : (
              /* Non-embedded: form + live preview side-by-side (desktop). */
              <LiquidityAddModule />
            )}
          </div>
        ) : null}

        {tab === 'building' ? (
          <div data-testid="liquidity-v3-panel-ai">
            <AiEntry data-testid="liquidity-v3-ai-entry">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <AiTitle>{LIQ_V3_COPY.aiEntry}</AiTitle>
                <Badge data-testid="liquidity-v3-ai-beta">{LIQ_V3_COPY.aiBeta}</Badge>
              </div>
              <AiSub>{LIQ_V3_COPY.aiSub}</AiSub>
              {!builderOpen ? (
                <Btn $primary type="button" onClick={() => setBuilderOpen(true)} data-testid="liquidity-v3-ai-open">
                  {LIQ_V3_COPY.aiOpen}
                </Btn>
              ) : null}
            </AiEntry>
            {builderOpen && lbSupported ? (
              <div data-testid="liquidity-v3-ai-builder">
                <LiquidityBuildingCard forceExpanded />
              </div>
            ) : null}
            {builderOpen && !lbSupported ? (
              <AiSub data-testid="liquidity-v3-ai-wrong-chain">AI Liquidity Builder is available on BNB Chain only.</AiSub>
            ) : null}
          </div>
        ) : null}
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
