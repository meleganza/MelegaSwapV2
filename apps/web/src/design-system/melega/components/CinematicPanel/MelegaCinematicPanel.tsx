import React, { useCallback, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { colors, typography } from '../../tokens'
import { MelegaBadge } from '../Badge'

const melegaPlanetGlow = keyframes`
  0%, 100% { opacity: 0.94; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
`

const melegaStars = keyframes`
  0%, 100% { opacity: 0.12; }
  50% { opacity: 0.28; }
`

export interface MelegaPulseRow {
  id: string
  label: string
  value?: string
}

export interface MelegaCinematicPanelProps {
  pulseRows?: MelegaPulseRow[]
}

const Panel = styled.div`
  display: none;
  position: relative;
  height: 100%;
  max-height: 410px;
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
    radial-gradient(1px 1px at 4% 10%, rgba(255, 255, 255, 0.45), transparent),
    radial-gradient(1px 1px at 12% 28%, rgba(255, 255, 255, 0.35), transparent),
    radial-gradient(1px 1px at 18% 14%, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(1px 1px at 26% 42%, rgba(255, 255, 255, 0.28), transparent),
    radial-gradient(1.5px 1.5px at 34% 18%, rgba(255, 255, 255, 0.38), transparent),
    radial-gradient(1px 1px at 42% 32%, rgba(255, 255, 255, 0.25), transparent),
    radial-gradient(1px 1px at 52% 12%, rgba(255, 255, 255, 0.32), transparent),
    radial-gradient(1px 1px at 58% 38%, rgba(255, 255, 255, 0.22), transparent),
    radial-gradient(1px 1px at 66% 22%, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(1px 1px at 74% 8%, rgba(255, 255, 255, 0.28), transparent),
    radial-gradient(1px 1px at 82% 34%, rgba(255, 255, 255, 0.24), transparent),
    radial-gradient(1px 1px at 90% 16%, rgba(255, 255, 255, 0.2), transparent);
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
    radial-gradient(1px 1px at 15% 55%, rgba(244, 197, 66, 0.18), transparent),
    radial-gradient(1px 1px at 35% 72%, rgba(244, 197, 66, 0.18), transparent),
    radial-gradient(1px 1px at 55% 48%, rgba(244, 197, 66, 0.18), transparent),
    radial-gradient(1px 1px at 72% 65%, rgba(244, 197, 66, 0.18), transparent),
    radial-gradient(1px 1px at 88% 52%, rgba(244, 197, 66, 0.18), transparent);
  pointer-events: none;
  z-index: 1;
`

const Scene = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  inset: 0;
  transform: translate(${({ $x }) => $x}px, ${({ $y }) => $y}px);
  transition: transform 120ms ease-out;
  will-change: transform;
`

const Planet = styled.div`
  position: absolute;
  inset: 0;
  top: 40px;
  background:
    radial-gradient(ellipse 78% 62% at 82% 92%, rgba(244, 197, 66, 0.81) 0%, rgba(212, 175, 55, 0.35) 28%, rgba(0, 0, 0, 0) 52%);
  animation: ${melegaPlanetGlow} 8s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const HorizonArc = styled.div`
  position: absolute;
  right: 6%;
  bottom: 8%;
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

const Badges = styled.div`
  position: absolute;
  top: 24px;
  left: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  z-index: 3;
`

const Copy = styled.div`
  position: absolute;
  left: 40px;
  top: 136px;
  z-index: 3;
  max-width: 420px;
`

const Headline = styled.h2`
  margin: 0 0 12px;
  font-family: ${typography.fontFamily.body};
  font-size: 52px;
  font-weight: 800;
  line-height: 1.05;
  color: ${colors.textPrimary};
`

const Gold = styled.span`
  color: ${colors.gold};
`

const Line = styled.p`
  margin: 0 0 4px;
  font-family: ${typography.fontFamily.body};
  font-size: 18px;
  font-weight: 400;
  color: #d8d8d8;
  line-height: 1.45;
`

const PulseOverlay = styled.div`
  position: absolute;
  right: 26px;
  bottom: 24px;
  width: 168px;
  background: rgba(5, 5, 5, 0.62);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 10px;
  z-index: 3;
`

const PulseRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 26px;
  gap: 6px;
  font-size: 11px;
`

const PulseLabel = styled.span`
  color: ${colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const PulseValue = styled.span`
  color: ${colors.textPrimary};
  font-weight: ${typography.fontWeight.semibold};
  white-space: nowrap;
  font-size: 10px;
`

export const MelegaCinematicPanel: React.FC<MelegaCinematicPanelProps> = ({ pulseRows }) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const offset = useRef({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = panelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    offset.current = { x: nx * 6, y: ny * 6 }
    const scene = el.querySelector('[data-cinematic-scene]') as HTMLElement | null
    if (scene) {
      scene.style.transform = `translate(${offset.current.x}px, ${offset.current.y}px)`
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    const el = panelRef.current
    if (!el) return
    const scene = el.querySelector('[data-cinematic-scene]') as HTMLElement | null
    if (scene) scene.style.transform = 'translate(0, 0)'
  }, [])

  return (
    <Panel
      ref={panelRef}
      data-melega-cinematic-panel
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Sky />
      <Scene data-cinematic-scene $x={0} $y={0}>
        <Stars />
        <Particles />
        <Planet />
        <HorizonArc />
      </Scene>
      <Badges>
        <MelegaBadge variant="live" dot>
          Live on BNB Chain
        </MelegaBadge>
        <MelegaBadge variant="waiting">Canonical MARCO Economy</MelegaBadge>
      </Badges>
      <Copy>
        <Headline>
          Melega <Gold>DEX</Gold>
        </Headline>
        <Line>Built for humans.</Line>
        <Line>Verified by code.</Line>
        <Line>Secured by chain.</Line>
      </Copy>
      {pulseRows && pulseRows.length > 0 && (
        <PulseOverlay>
          {pulseRows.map((row) => (
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
