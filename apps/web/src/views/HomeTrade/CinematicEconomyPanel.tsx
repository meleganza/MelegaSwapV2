import React from 'react'
import styled, { keyframes } from 'styled-components'
import { ht } from './homeTradeTokens'

const glowAnim = keyframes`
  0%, 100% {
    opacity: 0.75;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.03);
  }
`

const particleFloat = keyframes`
  0% { transform: translate(0, 0); opacity: 0.12; }
  50% { opacity: 0.4; }
  100% { transform: translate(-8px, -12px); opacity: 0.08; }
`

const Panel = styled.div`
  display: none;
  position: relative;
  height: 100%;
  max-height: ${ht.heroMaxHeight};
  border-radius: 14px;
  border: 1px solid ${ht.borderSoft};
  overflow: hidden;
  background: #000000;
  transition: box-shadow 200ms ease;

  &:hover {
    box-shadow: 0 8px 36px rgba(0, 0, 0, 0.5);
  }

  @media (min-width: 1024px) {
    display: block;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 55% at 82% 92%, rgba(244, 197, 66, 0.68) 0%, rgba(212, 175, 55, 0.32) 22%, rgba(0, 0, 0, 0) 52%),
      radial-gradient(circle at 12% 8%, rgba(255, 255, 255, 0.05) 0%, transparent 40%),
      linear-gradient(180deg, #030303 0%, #000000 55%, #020202 100%);
    animation: ${glowAnim} 9s ease-in-out infinite;
  }
`

const Stars = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.65;
  background-image:
    radial-gradient(1px 1px at 8% 14%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1px 1px at 22% 38%, rgba(255, 255, 255, 0.35), transparent),
    radial-gradient(1.5px 1.5px at 48% 18%, rgba(255, 255, 255, 0.45), transparent),
    radial-gradient(1px 1px at 68% 28%, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(1px 1px at 85% 12%, rgba(255, 255, 255, 0.25), transparent),
    radial-gradient(1px 1px at 35% 62%, rgba(255, 255, 255, 0.2), transparent);
  pointer-events: none;
  z-index: 1;
`

const Particle = styled.span<{ $x: number; $y: number; $delay: number }>`
  position: absolute;
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: rgba(244, 197, 66, 0.55);
  animation: ${particleFloat} ${({ $delay }) => 8 + $delay}s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  z-index: 1;
  pointer-events: none;
`

const Badges = styled.div`
  position: absolute;
  top: 16px;
  left: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  z-index: 2;
`

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid ${ht.borderSoft};
  font-family: ${ht.fontBody};
  font-size: 12px;
  color: ${ht.textMain};
`

const LiveDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${ht.green};
`

const Copy = styled.div`
  position: absolute;
  left: 36px;
  top: 88px;
  z-index: 2;
  max-width: 340px;
`

const Headline = styled.h2`
  margin: 0 0 10px;
  font-family: ${ht.fontDisplay};
  font-size: 36px;
  font-weight: 700;
  line-height: 1.05;
  color: ${ht.white};
`

const Gold = styled.span`
  color: ${ht.gold};
`

const Line = styled.p`
  margin: 0 0 4px;
  font-family: ${ht.fontBody};
  font-size: 14px;
  color: #c8c8c8;
  line-height: 1.45;
`

const particles = [
  { x: 72, y: 45, delay: 0 },
  { x: 88, y: 55, delay: 1.5 },
  { x: 65, y: 70, delay: 3 },
  { x: 92, y: 35, delay: 2 },
  { x: 78, y: 60, delay: 4 },
]

export const CinematicEconomyPanel: React.FC = () => (
  <Panel>
    <Stars />
    {particles.map((p, i) => (
      <Particle key={i} $x={p.x} $y={p.y} $delay={p.delay} />
    ))}
    <Badges>
      <Badge>
        <LiveDot />
        Live on BNB Chain
      </Badge>
      <Badge>🛡 Canonical MARCO Economy</Badge>
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

export default CinematicEconomyPanel
