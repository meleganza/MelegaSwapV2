import React from 'react'
import styled from 'styled-components'
import { Droplets, BrainCircuit, Shield, Lock } from 'lucide-react'
import { liqOne } from './onePageTokens'

const Rail = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  margin-top: ${liqOne.sectionGap};
  padding: 14px 16px;
  box-sizing: border-box;
  background: ${liqOne.card};
  border: 1px solid ${liqOne.border};
  border-radius: 14px;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const Block = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  min-width: 0;
`

const IconTile = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(221, 185, 47, 0.1);
  border: 1px solid rgba(221, 185, 47, 0.28);
  display: grid;
  place-items: center;
  color: ${liqOne.gold};
  flex-shrink: 0;
`

const Text = styled.div`
  min-width: 0;
`

const Title = styled.h3`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: ${liqOne.text};
`

const Body = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 17px;
  color: ${liqOne.secondary};
`

const ITEMS = [
  {
    title: 'How Liquidity Works',
    body: 'Provide token pairs to a pool and earn fees from trades.',
    Icon: Droplets,
  },
  {
    title: 'Liquidity Building',
    body: 'Melega progressively converts eligible activity into LP liquidity.',
    Icon: BrainCircuit,
  },
  {
    title: 'Always Non-Custodial',
    body: 'You retain ownership of your tokens and LP positions.',
    Icon: Lock,
  },
  {
    title: 'Security First',
    body: 'Limits, protections and automatic safety controls remain enforced.',
    Icon: Shield,
  },
] as const

export const LiquidityEducationRail: React.FC = () => (
  <Rail data-testid="liq-one-education-rail">
    {ITEMS.map(({ title, body, Icon }) => (
      <Block key={title}>
        <IconTile>
          <Icon size={14} strokeWidth={2.2} />
        </IconTile>
        <Text>
          <Title>{title}</Title>
          <Body>{body}</Body>
        </Text>
      </Block>
    ))}
  </Rail>
)

export default LiquidityEducationRail
