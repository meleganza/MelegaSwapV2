/**
 * Liquidity Studio V3 — consumer-first tabbed shell (presentation only).
 * Reuses mint runtime, Add/Remove execution, positions, and AI Liquidity Builder.
 * Does NOT modify Router / Factory / AMM / wallet execution.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { GLOBAL_DATA_TRUTH_PIPELINE, truthDash } from 'lib/data-truth'
import { CanonicalHeroEyebrow } from 'views/shared/CanonicalHeroEyebrow'
import { LiquidityRuntimeProvider, useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import type { LiquidityStudioMode } from '../liquidityRuntime/useLiquidityMintRuntime'
import { LiquidityMyPositionsModule } from '../modules/LiquidityMyPositionsModule'
import { useLiquidityMarketSnapshot } from '../modules/useLiquidityMarketSnapshot'
import { LiquidityRemovePanel } from './LiquidityRemovePanel'
import { LIQ_V3_COPY, LIQ_V3_LIVE_CHAINS, liqV3 } from './liquidityV3Tokens'
import LiquidityHeroArtwork from './LiquidityHeroArtwork'

const LiquidityBuildingCard = dynamic(() => import('../onePage/LiquidityBuildingCard'), {
  ssr: false,
  loading: () => <div role="status">Loading AI Liquidity Builder…</div>,
})

const LiquidityAddModule = dynamic(
  () => import('../modules/LiquidityAddModule').then((module) => module.LiquidityAddModule),
  {
    ssr: false,
    loading: () => <div role="status">Loading Add Liquidity…</div>,
  },
)

const LiquidityPoolDiscoveryModule = dynamic(
  () => import('../modules/LiquidityPoolDiscoveryModule').then((module) => module.LiquidityPoolDiscoveryModule),
  {
    ssr: false,
    loading: () => <div role="status">Loading pool explorer…</div>,
  },
)

const Page = styled.div`
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
  background: ${liqV3.pageBg};
  box-sizing: border-box;
  padding: ${liqV3.pagePadY} 0 40px;
  /* Home shell geometry; component surfaces retain their own locked padding. */
  max-width: 1380px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;

  @media (min-width: 768px) {
    padding: ${liqV3.pagePadY} 32px 48px;
    gap: 20px;
  }

  @media (max-width: ${liqV3.mobileBreak}) {
    [data-testid='liquidity-add-metrics'] > div {
      padding: 8px;
    }

    [data-testid='liquidity-add-metrics'] > div > div:last-child {
      font-size: 12px;
      line-height: 16px;
      white-space: normal;
      overflow: visible;
      overflow-wrap: anywhere;
      text-overflow: clip;
    }
  }
`

const Hero = styled.section<{ $builder?: boolean }>`
  position: relative;
  height: 216px;
  box-sizing: border-box;
  padding: 16px 20px;
  overflow: hidden;
  border: 1px solid rgba(221, 185, 47, 0.22);
  border-radius: 18px;
  background: radial-gradient(circle at 18% 30%, rgba(244, 196, 48, 0.12), transparent 34%),
    linear-gradient(105deg, #111006 0%, #090909 43%, #060606 100%);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.3);
  display: grid;
  grid-template-columns: minmax(300px, 0.48fr) minmax(0, 0.52fr);
  column-gap: 20px;
  align-items: center;
  min-width: 0;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, rgba(244, 196, 48, 0.2) 0 1px, transparent 1.4px);
    background-size: 52px 52px;
    opacity: 0.12;
  }

  @media (max-width: ${liqV3.tabletBreak}) {
    grid-template-columns: minmax(270px, 0.48fr) minmax(0, 0.52fr);
    column-gap: 14px;
    padding: 16px;
  }

  @media (max-width: ${liqV3.mobileBreak}) {
    height: 224px;
    grid-template-columns: minmax(150px, 0.54fr) minmax(0, 0.46fr);
    gap: 10px;
    padding: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const HeroCopy = styled.div`
  position: relative;
  z-index: 1;
  min-width: 0;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: ${liqV3.tabletBreak}) {
    grid-column: 1;
  }
`

const HeroTitle = styled.h1<{ $builder?: boolean }>`
  margin: 6px 0 0;
  font-size: ${({ $builder }) => ($builder ? '32px' : '46px')};
  line-height: ${({ $builder }) => ($builder ? '38px' : '52px')};
  font-weight: 750;
  letter-spacing: -0.025em;
  color: #f7f7f7;

  @media (max-width: ${liqV3.mobileBreak}) {
    font-size: 34px;
    line-height: 40px;
  }
`

const HeroSub = styled.p`
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 21px;
  color: rgba(255, 255, 255, 0.66);
  max-width: 380px;

  @media (max-width: ${liqV3.mobileBreak}) {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 12px;
    line-height: 18px;
  }
`

const HeroActions = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  align-items: center;
  margin-top: 14px;

  @media (max-width: ${liqV3.mobileBreak}) {
    flex-wrap: nowrap;
    gap: 7px;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
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
  background: ${({ $primary, $ghost }) => ($primary ? liqV3.gold : $ghost ? 'transparent' : 'rgba(255,255,255,0.04)')};
  color: ${({ $primary }) => ($primary ? '#111' : liqV3.text)};

  &:hover:not(:disabled) {
    background: ${({ $primary, $ghost }) =>
      $primary ? liqV3.goldHover : $ghost ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)'};
  }

  @media (max-width: ${liqV3.mobileBreak}) {
    min-height: 32px;
    padding: 0 10px;
    font-size: 11px;
    white-space: nowrap;
    flex: 0 0 auto;
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
  background: ${({ $primary, $ghost }) => ($primary ? liqV3.gold : $ghost ? 'transparent' : 'rgba(255,255,255,0.04)')};
  color: ${({ $primary }) => ($primary ? '#111' : liqV3.text)};
`

const Snapshot = styled.section<{ $hidden?: boolean }>`
  margin-top: 0;
  display: ${({ $hidden }) => ($hidden ? 'none' : 'grid')};
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

const Workspace = styled.section`
  margin-top: 4px;
  min-width: 0;
  position: relative;
`

/** One-page Liquidity: every journey is visible and addressable by an anchor. */
const Panel = styled.section`
  display: block;
  min-width: 0;
  scroll-margin-top: 132px;

  & + & {
    margin-top: 18px;
    padding-top: 18px;
    border-top: 1px solid ${liqV3.line};
  }
`

const SectionHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin: 0 0 14px;
  min-width: 0;

  @media (max-width: ${liqV3.mobileBreak}) {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
`

const SectionTitleRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
`

const SectionTitle = styled.h2`
  margin: 0;
  color: #fff;
  font-size: 24px;
  line-height: 30px;
  font-weight: 820;
  letter-spacing: -0.025em;

  [data-liquidity-builder-exclusive] {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    margin-left: 8px;
    padding: 0 8px;
    transform: translateY(-2px);
    border: 1px solid rgba(244, 196, 48, 0.44);
    border-radius: 999px;
    background: rgba(244, 196, 48, 0.1);
    color: ${liqV3.gold};
    font-size: 9px;
    line-height: 1;
    font-weight: 850;
    letter-spacing: 0.08em;
    white-space: nowrap;
  }
`

const ExclusiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 18px;
  padding: 0 7px;
  margin-left: 7px;
  border-radius: 999px;
  border: 1px solid rgba(244, 196, 48, 0.42);
  background: rgba(244, 196, 48, 0.1);
  color: ${liqV3.gold};
  font-size: 8px;
  font-weight: 850;
  letter-spacing: 0.08em;
`

const SectionMeta = styled.span`
  color: ${liqV3.mute};
  font-size: 12px;
  line-height: 18px;
  text-align: right;
`

const ModeSwitch = styled.div`
  display: inline-flex;
  width: min(560px, 100%);
  padding: 4px;
  margin: 0 0 14px;
  border-radius: 12px;
  border: 1px solid ${liqV3.line};
  background: rgba(5, 5, 5, 0.72);
`

const AddRemoveCard = styled.div`
  overflow: hidden;
  border: 1px solid ${liqV3.line};
  border-radius: 18px;
  background: linear-gradient(160deg, rgba(17, 18, 18, 0.98), rgba(8, 9, 9, 0.98));
`

const AddRemoveHeader = styled.div`
  min-height: 76px;
  padding: 12px 16px;
  border-bottom: 1px solid ${liqV3.line};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;

  ${ModeSwitch} {
    width: min(420px, 100%);
    margin: 0;
  }

  @media (max-width: ${liqV3.mobileBreak}) {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }
`

const WorkspacePair = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  min-width: 0;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  white-space: nowrap;

  span:last-child {
    color: #16d99a;
    font-size: 12px;
  }

  @media (max-width: ${liqV3.mobileBreak}) {
    justify-content: flex-start;
  }
`

const AddRemoveBody = styled.div`
  padding: 16px;
`

const ModeButton = styled.button<{ $active?: boolean }>`
  appearance: none;
  width: 50%;
  min-height: 40px;
  border: 0;
  border-radius: 9px;
  cursor: pointer;
  color: ${({ $active }) => ($active ? '#111' : liqV3.mute)};
  background: ${({ $active }) => ($active ? liqV3.gold : 'transparent')};
  font-size: 13px;
  font-weight: 800;
  transition: background 140ms ease, color 140ms ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }
`

/** Add ↔ Remove stay mounted inside the same workspace section (no form remount flash). */
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

const AiSub = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.35;
  color: ${liqV3.mute};
`

const AvailabilityPanel = styled.div`
  min-height: 108px;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid ${liqV3.line};
  background: ${liqV3.panel};
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
`

const AvailabilityTitle = styled.strong`
  color: #fff;
  font-size: 15px;
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

const DeferredSurface = styled.div`
  min-height: 116px;
`

const DeferredPlaceholder = styled.div`
  min-height: 116px;
  padding: 18px;
  border: 1px solid ${liqV3.line};
  border-radius: 12px;
  background: ${liqV3.panel};
  color: ${liqV3.mute};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`

const ProgressiveSurface: React.FC<React.PropsWithChildren<{ force?: boolean; label: string }>> = ({
  force = false,
  label,
  children,
}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(force)

  useEffect(() => {
    if (force) {
      setMounted(true)
      return undefined
    }
    if (mounted || !ref.current || typeof IntersectionObserver === 'undefined') {
      if (!mounted) setMounted(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setMounted(true)
        observer.disconnect()
      },
      { rootMargin: '600px 0px', threshold: 0.01 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [force, mounted])

  return (
    <DeferredSurface ref={ref} data-progressive-liquidity-surface={label}>
      {mounted ? children : <DeferredPlaceholder>Preparing {label}…</DeferredPlaceholder>}
    </DeferredSurface>
  )
}

function isRemoveMode(mode: LiquidityStudioMode): boolean {
  return mode === 'Remove Liquidity'
}

function cardValue(cards: ReturnType<typeof useLiquidityMarketSnapshot>['cards'], id: string): string {
  const c = cards.find((x) => x.id === id)
  return truthDash(c?.value)
}

const LiquidityV3Body: React.FC = () => {
  const router = useRouter()
  const { chainId } = useActiveChainId()
  const { account, mode, setMode, setSelectedPositionId, positions, positionsPhase, pairLabel, noLiquidity } =
    useLiquidityRuntime()
  const snapshot = useLiquidityMarketSnapshot()
  const hydratedRef = React.useRef(false)
  const deferredDeepLinkScrollRef = React.useRef<string | null>(null)
  const removing = isRemoveMode(mode)
  const showFarmNudge = positions.length > 0
  const showPositionsPanel = !(account && positionsPhase === 'empty')
  const hasSelectedPair = Boolean(pairLabel && !pairLabel.includes('?') && pairLabel !== 'Select pair')

  const scrollToSection = useCallback((id: string) => {
    window.requestAnimationFrame(() => {
      window.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  /**
   * One-shot compatibility for existing shared links. The approved workspace is
   * no longer driven by tabs or a continuously mirrored query string: every
   * product surface stays on this document and the URL cannot oscillate.
   */
  useEffect(() => {
    if (!router.isReady || hydratedRef.current) return
    const raw = router.query.view
    const view = Array.isArray(raw) ? raw[0] : typeof raw === 'string' ? raw : undefined
    if (router.asPath.includes('view=') && view === undefined) return
    hydratedRef.current = true

    let target: string | null = null
    if (view === 'building') {
      setMode('Liquidity Building', { syncUrl: false })
      target = 'liquidity-builder'
    } else if (view === 'add' || view === 'remove') {
      setMode(view === 'remove' ? 'Remove Liquidity' : 'Add Liquidity', { syncUrl: false })
      target = 'liquidity-add'
    } else if (view === 'explore') {
      setMode('My Positions', { syncUrl: false })
      target = 'liquidity-explore'
    } else {
      setMode('My Positions', { syncUrl: false })
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))
    }
    if ((view === 'add' || view === 'remove') && (positionsPhase === 'connecting' || positionsPhase === 'fetching')) {
      deferredDeepLinkScrollRef.current = target
    }
    if (target) scrollToSection(target)
  }, [router.isReady, router.query.view, router.asPath, setMode, positions.length, positionsPhase, scrollToSection])

  // Wallet positions arrive after the first paint and insert My Liquidity
  // above the editor. Re-anchor once that asynchronous layout shift settles.
  useEffect(() => {
    const target = deferredDeepLinkScrollRef.current
    if (!target || positionsPhase === 'connecting' || positionsPhase === 'fetching') return
    deferredDeepLinkScrollRef.current = null
    scrollToSection(target)
  }, [positionsPhase, positions.length, scrollToSection])

  const goAdd = useCallback(() => {
    setMode('Add Liquidity', { syncUrl: false })
    scrollToSection('liquidity-add')
  }, [setMode, scrollToSection])

  const goRemove = useCallback(() => {
    if (positions.length > 0) setSelectedPositionId(positions[0].id)
    setMode('Remove Liquidity', { syncUrl: false })
    scrollToSection('liquidity-add')
  }, [positions, setSelectedPositionId, setMode, scrollToSection])

  const goPositions = useCallback(() => {
    setMode('My Positions', { syncUrl: false })
    scrollToSection('liquidity-positions')
  }, [setMode, scrollToSection])

  const goAi = useCallback(() => {
    setMode('Liquidity Building', { syncUrl: false })
    scrollToSection('liquidity-builder')
  }, [setMode, scrollToSection])

  const snapCells = useMemo(
    () => [
      { label: LIQ_V3_COPY.snapshot.total, value: cardValue(snapshot.cards, 'tvl') },
      { label: LIQ_V3_COPY.snapshot.volume, value: cardValue(snapshot.cards, 'volume24h') },
      { label: LIQ_V3_COPY.snapshot.chains, value: String(LIQ_V3_LIVE_CHAINS.length) },
    ],
    [snapshot.cards],
  )

  const lbSupported = (chainId ?? 56) === 56
  return (
    <>
      <Hero $builder={false} data-testid="liquidity-v3-hero" data-liquidity-hero-geometry="one-page-compact">
        <HeroCopy>
          <CanonicalHeroEyebrow icon="liquidity">Melega DEX Liquidity</CanonicalHeroEyebrow>
          <HeroTitle $builder={false}>{LIQ_V3_COPY.title}</HeroTitle>
          <HeroSub>{LIQ_V3_COPY.subtitle}</HeroSub>
          <HeroActions aria-label="Liquidity Studio primary" data-testid="liquidity-v3-hero-nav">
            {showPositionsPanel ? (
              <Btn $ghost type="button" onClick={goPositions} data-testid="liquidity-v3-hero-positions">
                My Liquidity
              </Btn>
            ) : null}
            <Btn $primary type="button" onClick={goAdd} data-testid="liquidity-v3-hero-add">
              {LIQ_V3_COPY.addCta}
            </Btn>
            <Btn $ghost type="button" onClick={goAi} data-testid="liquidity-v3-hero-ai">
              {LIQ_V3_COPY.aiEntry}
              <ExclusiveBadge>BETA</ExclusiveBadge>
            </Btn>
          </HeroActions>
        </HeroCopy>
        <LiquidityHeroArtwork />
      </Hero>

      <Snapshot $hidden={false} data-testid="liquidity-v3-snapshot" data-truth-pipeline={GLOBAL_DATA_TRUTH_PIPELINE}>
        {snapCells.map((c) => (
          <SnapCell key={c.label}>
            <SnapLabel>{c.label}</SnapLabel>
            <SnapValue>{c.value}</SnapValue>
          </SnapCell>
        ))}
      </Snapshot>

      <Workspace
        data-testid="liquidity-v3-workspace"
        data-liquidity-panels="mounted"
        data-liquidity-navigation="anchors"
      >
        {showPositionsPanel ? (
          <Panel id="liquidity-positions" data-testid="liquidity-v3-panel-positions">
            <SectionHeader>
              <SectionTitleRow>
                <SectionTitle>My Liquidity</SectionTitle>
              </SectionTitleRow>
              <SectionMeta>Positions found in your connected wallet</SectionMeta>
            </SectionHeader>
            <ChainLegend data-testid="liquidity-v3-chain-legend" aria-label="LIVE chains">
              {LIQ_V3_LIVE_CHAINS.map((c) => (
                <ChainChip key={c.id} $on={chainId === c.id}>
                  {c.label}
                </ChainChip>
              ))}
            </ChainLegend>
            <LiquidityMyPositionsModule embedded />
            {showFarmNudge ? (
              <FarmNudge data-testid="liquidity-v3-farm-nudge">
                <span>{LIQ_V3_COPY.createFarmNudge}</span>
                <LinkBtn $ghost href={`/farms?create=1&chain=${chainId ?? 56}`} data-testid="liquidity-v3-create-farm">
                  {LIQ_V3_COPY.createFarmCta}
                </LinkBtn>
              </FarmNudge>
            ) : null}
          </Panel>
        ) : null}

        <Panel id="liquidity-add" data-testid="liquidity-v3-panel-add">
          <SectionHeader>
            <SectionTitleRow>
              <SectionTitle>Add / Remove Liquidity</SectionTitle>
            </SectionTitleRow>
            <SectionMeta>Choose a pair · Enter amounts · Confirm once</SectionMeta>
          </SectionHeader>
          <AddRemoveCard data-testid="liquidity-add-remove-card">
            <AddRemoveHeader>
              <ModeSwitch role="group" aria-label="Liquidity action">
                <ModeButton type="button" $active={!removing} onClick={goAdd} aria-pressed={!removing}>
                  Add
                </ModeButton>
                <ModeButton type="button" $active={removing} onClick={goRemove} aria-pressed={removing}>
                  Remove
                </ModeButton>
              </ModeSwitch>
              <WorkspacePair data-testid="liquidity-add-remove-pair-summary">
                <strong>{hasSelectedPair ? pairLabel : 'Select pair'}</strong>
                <span>{hasSelectedPair ? (noLiquidity ? '● New pair' : '● Active') : '● Awaiting pair'}</span>
              </WorkspacePair>
            </AddRemoveHeader>
            <AddRemoveBody>
              <ProgressiveSurface force label={removing ? 'Remove Liquidity' : 'Add Liquidity'}>
                <SubPanel $active={!removing} data-add-surface="mint" aria-hidden={removing}>
                  <LiquidityAddModule embedded />
                </SubPanel>
                <SubPanel $active={removing} data-add-surface="burn" aria-hidden={!removing}>
                  <LiquidityRemovePanel />
                </SubPanel>
              </ProgressiveSurface>
            </AddRemoveBody>
          </AddRemoveCard>
        </Panel>

        <Panel id="liquidity-builder" data-testid="liquidity-v3-panel-ai">
          <SectionHeader>
            <SectionTitleRow>
              <SectionTitle>
                AI Liquidity Builder <span data-liquidity-builder-exclusive>BETA</span>
              </SectionTitle>
            </SectionTitleRow>
            <SectionMeta>Pair · Reserve · Strategy · Frequency · Start</SectionMeta>
          </SectionHeader>
          <ProgressiveSurface force={mode === 'Liquidity Building'} label="AI Liquidity Builder">
            {lbSupported ? (
              <AiWide data-testid="liquidity-v3-ai-builder">
                <LiquidityBuildingCard forceExpanded studioOwnedUrl />
              </AiWide>
            ) : (
              <AvailabilityPanel data-testid="liquidity-v3-ai-wrong-chain">
                <AvailabilityTitle>Available on BNB Chain</AvailabilityTitle>
                <AiSub>Switch to BNB when you want to configure an automated liquidity program.</AiSub>
              </AvailabilityPanel>
            )}
          </ProgressiveSurface>
        </Panel>

        <Panel id="liquidity-explore" data-testid="liquidity-v3-panel-explore">
          <SectionHeader>
            <SectionTitleRow>
              <SectionTitle>Explore Pools</SectionTitle>
            </SectionTitleRow>
            <SectionMeta>Search · Compare · BNB Chain indexed pools</SectionMeta>
          </SectionHeader>
          <ProgressiveSurface label="Pool Explorer">
            <LiquidityPoolDiscoveryModule embedded />
          </ProgressiveSurface>
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
    data-liquidity-ia="one-page-workspace"
  >
    <LiquidityRuntimeProvider terminalEnabled={false}>
      <LiquidityV3Body />
    </LiquidityRuntimeProvider>
  </Page>
)

export default LiquidityStudioV3Shell
