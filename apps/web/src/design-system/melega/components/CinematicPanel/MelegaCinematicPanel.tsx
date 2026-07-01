import React from 'react'
import styled, { keyframes } from 'styled-components'
import { colors, typography, animation } from '../../tokens'
import { MelegaBadge } from '../Badge'

const melegaPlanetGlow = keyframes`
  0%, 100% { opacity: 0.75; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.015); }
`

const melegaStars = keyframes`
  0%, 100% { opacity: 0.10; }
  50% { opacity: 0.22; }
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
    radial-gradient(1px 1px at 8% 14%, rgba(255, 255, 255, 0.45), transparent),
    radial-gradient(1px 1px at 22% 38%, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(1.5px 1.5px at 48% 18%, rgba(255, 255, 255, 0.35), transparent),
    radial-gradient(1px 1px at 68% 28%, rgba(255, 255, 255, 0.25), transparent),
    radial-gradient(1px 1px at 85% 12%, rgba(255, 255, 255, 0.2), transparent);
  animation: ${melegaStars} ${animation.stars} infinite;
  pointer-events: none;
  z-index: 1;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Planet = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 72% 58% at 82% 88%, rgba(244, 197, 66, 0.65) 0%, rgba(212, 175, 55, 0.28) 28%, rgba(0, 0, 0, 0) 52%);
  animation: ${melegaPlanetGlow} ${animation.glow} infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const HorizonArc = styled.div`
  position: absolute;
  right: 6%;
  bottom: 14%;
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
  top: 112px;
  z-index: 3;
  max-width: 420px;
`

const Headline = styled.h2`
  margin: 0 0 12px;
  font-family: ${typography.fontFamily.body};
  font-size: 42px;
  font-weight: ${typography.fontWeight.heavy};
  line-height: 1.05;
  color: ${colors.textPrimary};
`

const Gold = styled.span`
  color: ${colors.gold};
`

const Line = styled.p`
  margin: 0 0 4px;
  font-family: ${typography.fontFamily.body};
  font-size: 17px;
  color: #d8d8d8;
  line-height: 1.45;
`

const PulseOverlay = styled.div`
  position: absolute;
  right: 26px;
  bottom: 24px;
  width: 210px;
  background: rgba(5, 5, 5, 0.62);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 12px;
  z-index: 3;
`

const PulseRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  gap: 8px;
  font-size: 12px;
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
`

export const MelegaCinematicPanel: React.FC<MelegaCinematicPanelProps> = ({ pulseRows }) => (
  <Panel data-melega-cinematic-panel>
    <Sky />
    <Stars />
    <Planet />
    <HorizonArc />
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

export default MelegaCinematicPanel
