import React, { useCallback, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { colors, typography } from '../../tokens'

const melegaPlanetGlow = keyframes`
  0%, 100% { opacity: 0.97; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.025); }
`

const melegaStars = keyframes`
  0%, 100% { opacity: 0.18; }
  50% { opacity: 0.42; }
`

const particleFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
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
}

export interface MelegaCinematicPanelProps {
  pulseRows?: MelegaPulseRow[]
  liveEconomy?: MelegaLiveEconomyMetric[]
}

const Panel = styled.div`
  display: none;
  position: relative;
  height: 100%;
  max-height: 380px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  background: ${colors.canvas};
  box-shadow: none;

  @media (min-width: 768px) {
    display: block;
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
    radial-gradient(1px 1px at 32% 52%, rgba(255, 255, 255, 0.24), transparent);
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
    radial-gradient(1px 1px at 12% 58%, rgba(244, 197, 66, 0.12), transparent),
    radial-gradient(1px 1px at 28% 68%, rgba(244, 197, 66, 0.12), transparent),
    radial-gradient(1px 1px at 44% 52%, rgba(244, 197, 66, 0.12), transparent),
    radial-gradient(1px 1px at 62% 72%, rgba(244, 197, 66, 0.12), transparent),
    radial-gradient(1px 1px at 78% 48%, rgba(244, 197, 66, 0.12), transparent),
    radial-gradient(1px 1px at 88% 62%, rgba(244, 197, 66, 0.12), transparent),
    radial-gradient(1px 1px at 52% 78%, rgba(244, 197, 66, 0.12), transparent);
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
  inset: 0;
  top: 70px;
  background:
    radial-gradient(ellipse 82% 66% at 82% 92%, rgba(244, 197, 66, 0.97) 0%, rgba(212, 175, 55, 0.42) 28%, rgba(0, 0, 0, 0) 52%);
  animation: ${melegaPlanetGlow} 9s ease-in-out infinite;

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
  left: 36px;
  top: 72px;
  z-index: 3;
  max-width: 380px;
`

const LiveEconomyStrip = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  height: 34px;
  margin-bottom: 14px;
`

const LiveLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${colors.gold};
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
  color: ${({ $live }) => ($live ? colors.green : colors.textPrimary)};
`

const HeadlineBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const HeadlineLine = styled.div`
  font-family: ${typography.fontFamily.body};
  font-size: 54px;
  font-weight: 800;
  line-height: 1.02;
  color: ${colors.textPrimary};
`

const PulseOverlay = styled.div`
  position: absolute;
  right: 22px;
  bottom: 20px;
  width: 126px;
  background: rgba(5, 5, 5, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 10px 12px;
  z-index: 3;
`

const PulseRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 24px;
  gap: 6px;
  font-size: 10px;
`

const PulseLabel = styled.span`
  color: ${colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const PulseValue = styled.span`
  color: ${colors.textPrimary};
  font-weight: 600;
  white-space: nowrap;
  font-size: 10px;
  max-width: 58px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
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
        {economyMetrics.length > 0 && (
          <LiveEconomyStrip>
            <LiveLabel>Live Economy</LiveLabel>
            {economyMetrics.map((metric, i) => (
              <React.Fragment key={metric.id}>
                {i > 0 && <MetricSep aria-hidden />}
                <MetricItem>
                  <MetricName>{metric.label}</MetricName>
                  <MetricValue $live={metric.live}>{metric.value}</MetricValue>
                </MetricItem>
              </React.Fragment>
            ))}
          </LiveEconomyStrip>
        )}
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
