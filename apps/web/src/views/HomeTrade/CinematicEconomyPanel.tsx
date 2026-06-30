import React from 'react'
import styled from 'styled-components'
import { ht } from './homeTradeTokens'

const Panel = styled.div`
  display: none;
  position: relative;
  height: 350px;
  border-radius: 14px;
  border: 1px solid ${ht.borderMedium};
  overflow: hidden;
  background: #000000;

  @media (min-width: 1024px) {
    display: block;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 85% 95%, rgba(244, 197, 66, 0.55) 0%, rgba(212, 175, 55, 0.2) 35%, transparent 70%),
      radial-gradient(circle at 20% 15%, rgba(255, 255, 255, 0.06) 0%, transparent 40%),
      linear-gradient(180deg, #000000 0%, #050505 100%);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(1px 1px at 20% 30%, rgba(255, 255, 255, 0.35), transparent),
      radial-gradient(1px 1px at 60% 20%, rgba(255, 255, 255, 0.25), transparent),
      radial-gradient(1px 1px at 80% 40%, rgba(255, 255, 255, 0.2), transparent);
    opacity: 0.6;
  }
`

const Badges = styled.div`
  position: absolute;
  top: 20px;
  left: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  z-index: 2;
`

const Badge = styled.span<{ $live?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid ${ht.borderSoft};
  font-family: ${ht.fontBody};
  font-size: 12px;
  color: ${ht.textMain};
`

const LiveDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${ht.green};
`

const Copy = styled.div`
  position: absolute;
  left: 36px;
  top: 50%;
  transform: translateY(-40%);
  z-index: 2;
  max-width: 320px;
`

const Headline = styled.h2`
  margin: 0 0 12px;
  font-family: ${ht.fontBody};
  font-size: 34px;
  font-weight: 700;
  line-height: 1.1;
  color: ${ht.white};
`

const Gold = styled.span`
  color: ${ht.gold};
`

const Line = styled.p`
  margin: 0 0 6px;
  font-family: ${ht.fontBody};
  font-size: 16px;
  color: #cfcfcf;
  line-height: 1.35;
`

export const CinematicEconomyPanel: React.FC = () => (
  <Panel>
    <Badges>
      <Badge $live>
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
