import React from 'react'
import styled, { keyframes } from 'styled-components'
import { colors, typography, animation } from '../../tokens'
import { MelegaBadge } from '../Badge'

const glowAnim = keyframes`
  0%, 100% { opacity: 0.82; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
`

const twinkle = keyframes`
  0%, 100% { opacity: 0.14; }
  50% { opacity: 0.22; }
`

const Panel = styled.div`
  display: none;
  position: relative;
  height: 100%;
  border-radius: 14px;
  border: 1px solid ${colors.borderStrong};
  overflow: hidden;
  background: ${colors.canvas};
  box-shadow: none;

  @media (min-width: 768px) {
    display: block;
  }
`

const Horizon = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 78% 90%, rgba(244, 197, 66, 0.65) 0%, rgba(212, 175, 55, 0.3) 22%, rgba(0, 0, 0, 0) 48%),
    linear-gradient(180deg, ${colors.canvas} 0%, #020202 100%);
  animation: ${glowAnim} ${animation.glow} infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const HorizonLine = styled.div`
  position: absolute;
  right: 8%;
  bottom: 18%;
  width: 42%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(244, 197, 66, 0.55), transparent);
  opacity: 0.7;
`

const Stars = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 8% 14%, rgba(255, 255, 255, 0.45), transparent),
    radial-gradient(1px 1px at 22% 38%, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(1.5px 1.5px at 48% 18%, rgba(255, 255, 255, 0.35), transparent),
    radial-gradient(1px 1px at 68% 28%, rgba(255, 255, 255, 0.25), transparent);
  animation: ${twinkle} 7s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Badges = styled.div`
  position: absolute;
  top: 24px;
  left: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  z-index: 2;
`

const Copy = styled.div`
  position: absolute;
  left: 40px;
  top: 118px;
  z-index: 2;
  max-width: 420px;
`

const Headline = styled.h2`
  margin: 0 0 12px;
  font-family: ${typography.fontFamily.body};
  font-size: 38px;
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
  font-size: 17px;
  color: #d8d8d8;
  line-height: 1.45;
`

export const MelegaCinematicPanel: React.FC = () => (
  <Panel data-melega-cinematic-panel>
    <Horizon />
    <HorizonLine />
    <Stars />
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
  </Panel>
)

export default MelegaCinematicPanel
