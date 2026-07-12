import React, { useCallback, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import Link from 'next/link'
import { colors, typography } from '../../tokens'

const melegaPlanetGlow = keyframes`
  0%, 100% { opacity: 0.98; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.03); }
`

const melegaStars = keyframes`
  0%, 100% { opacity: 0.12; }
  50% { opacity: 0.18; }
`

const particleFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`

const widgetFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
`

const metricFade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

export interface MelegaPulseRow {
  id: string
  label: string
  value?: string
}

export interface MelegaLiveEconomyMetric {
  id: string
  label: string
  value: string
  live?: boolean
  href?: string
}

export interface MelegaCinematicPanelProps {
  pulseRows?: MelegaPulseRow[]
  liveEconomy?: MelegaLiveEconomyMetric[]
}

const Panel = styled.div`
  display: block;
  position: relative;
  height: 260px;
  max-height: 260px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  background: #050505;
  box-shadow: none;

  @media (min-width: 768px) {
    height: 100%;
    max-height: 404px;
  }
`

const Sky = styled.div`
  position: absolute;
  inset: 0;
  background: ${colors.canvas};
`

const Stars = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 3% 8%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1px 1px at 8% 22%, rgba(255, 255, 255, 0.4), transparent),
    radial-gradient(1px 1px at 14% 12%, rgba(255, 255, 255, 0.38), transparent),
    radial-gradient(1px 1px at 20% 36%, rgba(255, 255, 255, 0.35), transparent),
    radial-gradient(1.5px 1.5px at 28% 16%, rgba(255, 255, 255, 0.45), transparent),
    radial-gradient(1px 1px at 36% 30%, rgba(255, 255, 255, 0.32), transparent),
    radial-gradient(1px 1px at 44% 10%, rgba(255, 255, 255, 0.4), transparent),
    radial-gradient(1px 1px at 50% 34%, rgba(255, 255, 255, 0.28), transparent),
    radial-gradient(1px 1px at 58% 18%, rgba(255, 255, 255, 0.36), transparent),
    radial-gradient(1px 1px at 64% 8%, rgba(255, 255, 255, 0.34), transparent),
    radial-gradient(1px 1px at 72% 28%, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(1px 1px at 78% 14%, rgba(255, 255, 255, 0.38), transparent),
    radial-gradient(1px 1px at 84% 32%, rgba(255, 255, 255, 0.26), transparent),
    radial-gradient(1px 1px at 90% 10%, rgba(255, 255, 255, 0.32), transparent),
    radial-gradient(1px 1px at 96% 24%, rgba(255, 255, 255, 0.28), transparent),
    radial-gradient(1px 1px at 6% 48%, rgba(255, 255, 255, 0.22), transparent),
    radial-gradient(1px 1px at 18% 58%, rgba(255, 255, 255, 0.2), transparent),
    radial-gradient(1px 1px at 32% 52%, rgba(255, 255, 255, 0.24), transparent),
    radial-gradient(1px 1px at 10% 40%, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(1px 1px at 24% 44%, rgba(255, 255, 255, 0.26), transparent),
    radial-gradient(1px 1px at 40% 46%, rgba(255, 255, 255, 0.22), transparent),
    radial-gradient(1px 1px at 55% 42%, rgba(255, 255, 255, 0.28), transparent),
    radial-gradient(1px 1px at 70% 46%, rgba(255, 255, 255, 0.24), transparent);
  animation: ${melegaStars} 7s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Particles = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 12% 58%, rgba(244, 197, 66, 0.1), transparent),
    radial-gradient(1px 1px at 28% 68%, rgba(244, 197, 66, 0.1), transparent),
    radial-gradient(1px 1px at 44% 52%, rgba(244, 197, 66, 0.1), transparent),
    radial-gradient(1px 1px at 62% 72%, rgba(244, 197, 66, 0.1), transparent),
    radial-gradient(1px 1px at 78% 48%, rgba(244, 197, 66, 0.1), transparent),
    radial-gradient(1px 1px at 88% 62%, rgba(244, 197, 66, 0.1), transparent),
    radial-gradient(1px 1px at 52% 78%, rgba(244, 197, 66, 0.1), transparent);
  animation: ${particleFloat} 9s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Scene = styled.div`
  position: absolute;
  inset: 0;
  transition: transform 120ms ease-out;
  will-change: transform;
`

const Planet = styled.div`
  position: absolute;
  right: -20px;
  bottom: -30px;
  width: 68%;
  height: 55%;
  background:
    radial-gradient(ellipse 82% 66% at 50% 50%, rgba(244, 197, 66, 1) 0%, rgba(212, 175, 55, 0.52) 28%, rgba(0, 0, 0, 0) 52%);
  filter: blur(80px);
  opacity: 0.57;
  animation: ${melegaPlanetGlow} 8s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const HorizonArc = styled.div`
  position: absolute;
  right: 6%;
  bottom: 6%;
  width: 48%;
  height: 48%;
  border-radius: 50%;
  border-bottom: 1px solid rgba(244, 197, 66, 0.55);
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
  border-top: 1px solid transparent;
  transform: rotate(-8deg);
  opacity: 0.75;
  pointer-events: none;
  z-index: 2;
`

const Copy = styled.div`
  position: absolute;
  left: 44px;
  top: 72px;
  z-index: 3;
  max-width: 380px;

  @media (max-width: 767px) {
    left: 20px;
    top: 28px;
    max-width: calc(100% - 40px);
  }
`

const LiveEconomyStrip = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 0;
  min-height: 34px;
  margin-bottom: 14px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 767px) {
    flex-wrap: wrap;
    height: auto;
  }
`

const LiveLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c6a33a;
  margin-right: 14px;
`

const MetricSep = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${colors.gold};
  margin: 0 12px;
  flex-shrink: 0;
  opacity: 0.7;
`

const MetricItem = styled.span`
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  animation: ${metricFade} 180ms ease;
`

const MetricName = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8a8a8a;
`

const MetricValue = styled.span<{ $live?: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: ${colors.textPrimary};
  font-variant-numeric: tabular-nums;
`

const MetricLink = styled(Link)`
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  text-decoration: none;
  animation: ${metricFade} 180ms ease;

  &:hover span:last-child {
    color: ${colors.gold};
  }
`

const HeadlineBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 18px;
`

const HeadlineLine = styled.div`
  font-family: ${typography.fontFamily.body};
  font-size: 50px;
  font-weight: 800;
  line-height: 1.02;
  color: ${colors.textPrimary};

  @media (max-width: 767px) {
    font-size: 42px;
  }
`

const PulseOverlay = styled.div`
  position: absolute;
  right: 28px;
  bottom: 28px;
  width: 150px;
  background: rgba(17, 17, 17, 0.82);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 14px;
  z-index: 3;
  animation: ${widgetFloat} 7s ease-in-out infinite;

  @media (max-width: 767px) {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const PulseRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`

const PulseLabel = styled.span`
  color: #8a8a8a;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const PulseValue = styled.span`
  color: ${colors.textPrimary};
  font-weight: 700;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const MelegaCinematicPanel: React.FC<MelegaCinematicPanelProps> = ({ pulseRows, liveEconomy }) => {
  const panelRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = panelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    const scene = el.querySelector('[data-cinematic-scene]') as HTMLElement | null
    if (scene) {
      scene.style.transform = `translate(${nx * 8}px, ${ny * 8}px)`
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    const el = panelRef.current
    if (!el) return
    const scene = el.querySelector('[data-cinematic-scene]') as HTMLElement | null
    if (scene) scene.style.transform = 'translate(0, 0)'
  }, [])

  const economyMetrics = liveEconomy ?? []
  const floatingRows = (pulseRows ?? []).slice(0, 3)

  return (
    <Panel
      ref={panelRef}
      data-melega-cinematic-panel
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Sky />
      <Scene data-cinematic-scene>
        <Stars />
        <Particles />
        <Planet />
        <HorizonArc />
      </Scene>
      <Copy>
        <LiveEconomyStrip>
          <LiveLabel>Live Economy</LiveLabel>
          {economyMetrics.map((metric, i) => (
            <React.Fragment key={metric.id}>
              {i > 0 && <MetricSep aria-hidden />}
              {metric.href ? (
                <MetricLink href={metric.href} data-live-economy-metric={metric.id}>
                  <MetricName>{metric.label}</MetricName>
                  <MetricValue $live={metric.live}>{metric.value}</MetricValue>
                </MetricLink>
              ) : (
                <MetricItem data-live-economy-metric={metric.id}>
                  <MetricName>{metric.label}</MetricName>
                  <MetricValue $live={metric.live}>{metric.value}</MetricValue>
                </MetricItem>
              )}
            </React.Fragment>
          ))}
        </LiveEconomyStrip>
        <HeadlineBlock>
          <HeadlineLine>Trade.</HeadlineLine>
          <HeadlineLine>Build.</HeadlineLine>
          <HeadlineLine>Grow.</HeadlineLine>
        </HeadlineBlock>
      </Copy>
      {floatingRows.length > 0 && (
        <PulseOverlay>
          {floatingRows.map((row) => (
            <PulseRow key={row.id}>
              <PulseLabel>{row.label}</PulseLabel>
              {row.value && <PulseValue>{row.value}</PulseValue>}
            </PulseRow>
          ))}
        </PulseOverlay>
      )}
    </Panel>
  )
}

export default MelegaCinematicPanel
