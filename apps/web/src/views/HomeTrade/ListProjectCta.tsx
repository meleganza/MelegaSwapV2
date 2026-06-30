import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ht } from './homeTradeTokens'

const Card = styled.div`
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.18), ${ht.surface2} 45%, #080808);
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 16px;
  align-items: center;
  box-sizing: border-box;

  @media (min-width: 1024px) {
    padding: 20px;
    min-height: 142px;
    height: 142px;
  }
`

const Cube = styled.div`
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 16px;
  position: relative;
  background: linear-gradient(145deg, #1a1508 0%, #0d0d0d 50%, #1f1806 100%);
  border: 1px solid rgba(212, 175, 55, 0.45);
  box-shadow:
    inset 0 0 24px rgba(244, 197, 66, 0.12),
    0 0 32px rgba(212, 175, 55, 0.15);
  transform: perspective(500px) rotateY(-14deg) rotateX(6deg);

  &::before {
    content: '';
    position: absolute;
    inset: 12px;
    border: 1px solid rgba(244, 197, 66, 0.35);
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(244, 197, 66, 0.2) 0%, transparent 60%);
  }

  &::after {
    content: '';
    position: absolute;
    top: 18px;
    left: 18px;
    right: 18px;
    bottom: 18px;
    border: 1px dashed rgba(212, 175, 55, 0.25);
    border-radius: 8px;
  }

  @media (min-width: 1024px) {
    width: 86px;
    height: 86px;
  }
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`

const Title = styled.h3`
  margin: 0 0 6px;
  font-family: ${ht.fontBody};
  font-size: 20px;
  font-weight: 700;
  color: ${ht.white};
  line-height: 1.2;

  @media (min-width: 1024px) {
    font-size: 22px;
  }
`

const Desc = styled.p`
  margin: 0 0 12px;
  font-family: ${ht.fontBody};
  font-size: 14px;
  color: #c8c8c8;
  line-height: 1.45;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const Primary = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 16px;
  border-radius: 10px;
  background: linear-gradient(180deg, ${ht.goldBright}, ${ht.gold});
  color: #000000;
  font-family: ${ht.fontBody};
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;

  @media (min-width: 1024px) {
    width: 170px;
    height: 42px;
  }
`

const Secondary = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.6);
  background: transparent;
  color: ${ht.gold};
  font-family: ${ht.fontBody};
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;

  @media (min-width: 1024px) {
    width: 180px;
    height: 42px;
  }
`

export const ListProjectCta: React.FC = () => (
  <Card data-list-project-cta="true">
    <Cube aria-hidden />
    <Body>
      <Title>List your project on Melega DEX</Title>
      <Desc>Add token details, upload logo, add liquidity, create a farm, or reward MARCO holders.</Desc>
      <Actions>
        <Primary href="/launch">Start listing</Primary>
        <Secondary href="/pools">Reward MARCO holders</Secondary>
      </Actions>
    </Body>
  </Card>
)

export default ListProjectCta
