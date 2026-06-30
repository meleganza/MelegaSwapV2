import React from 'react'
import styled from 'styled-components'
import { ht } from './homeTradeTokens'

const Panel = styled.div`
  display: none;
  position: relative;
  min-height: 360px;
  border-radius: 14px;
  border: 1px solid ${ht.borderSoft};
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
      radial-gradient(circle at 78% 88%, rgba(244, 197, 66, 0.52) 0%, rgba(212, 175, 55, 0.22) 20%, rgba(0, 0, 0, 0) 46%),
      radial-gradient(circle at 15% 12%, rgba(255, 255, 255, 0.04) 0%, transparent 35%),
      linear-gradient(180deg, #050505 0%, #000000 100%);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.55;
    background-image:
      radial-gradient(1px 1px at 12% 18%, rgba(255, 255, 255, 0.45), transparent),
      radial-gradient(1px 1px at 28% 42%, rgba(255, 255, 255, 0.3), transparent),
      radial-gradient(1px 1px at 55% 22%, rgba(255, 255, 255, 0.35), transparent),
      radial-gradient(1px 1px at 72% 35%, rgba(255, 255, 255, 0.25), transparent),
      radial-gradient(1px 1px at 88% 15%, rgba(255, 255, 255, 0.2), transparent),
      radial-gradient(1px 1px at 40% 68%, rgba(255, 255, 255, 0.18), transparent);
    pointer-events: none;
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

const Badge = styled.span`
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
  left: 44px;
  top: 120px;
  z-index: 2;
  max-width: 380px;
`

const Headline = styled.h2`
  margin: 0 0 14px;
  font-family: ${ht.fontBody};
  font-size: 42px;
  font-weight: 700;
  line-height: 1.05;
  color: ${ht.white};
`

const Gold = styled.span`
  color: ${ht.gold};
`

const Line = styled.p`
  margin: 0 0 8px;
  font-family: ${ht.fontBody};
  font-size: 18px;
  color: #cfcfcf;
  line-height: 1.45;
`

export const CinematicEconomyPanel: React.FC = () => (
  <Panel>
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
