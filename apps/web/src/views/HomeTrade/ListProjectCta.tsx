import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ht } from './homeTradeTokens'

const Card = styled.div`
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.14), ${ht.surface2} 50%, #080808);
  border: 1px solid rgba(212, 175, 55, 0.45);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 18px;
  align-items: center;
  box-sizing: border-box;
  transition: box-shadow 200ms ease, border-color 200ms ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.6);
    box-shadow: 0 8px 28px rgba(212, 175, 55, 0.08);
  }

  @media (min-width: 1024px) {
    min-height: 142px;
  }
`

const Cube = styled.div`
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 16px;
  position: relative;
  background:
    linear-gradient(145deg, rgba(20, 16, 6, 0.95) 0%, rgba(8, 8, 8, 1) 45%, rgba(24, 18, 4, 0.9) 100%);
  border: 1px solid rgba(212, 175, 55, 0.4);
  box-shadow:
    inset 0 0 30px rgba(244, 197, 66, 0.08),
    inset -4px -4px 12px rgba(0, 0, 0, 0.6),
    0 0 24px rgba(212, 175, 55, 0.12);
  transform: perspective(600px) rotateY(-16deg) rotateX(8deg);

  &::before {
    content: '';
    position: absolute;
    inset: 10px;
    border: 1px solid rgba(244, 197, 66, 0.3);
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(244, 197, 66, 0.12) 0%, transparent 55%);
  }

  &::after {
    content: '';
    position: absolute;
    top: 14px;
    left: 14px;
    right: 14px;
    bottom: 14px;
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: 8px;
    background: linear-gradient(225deg, rgba(255, 255, 255, 0.04) 0%, transparent 40%);
  }
`

const Wireframe = styled.div`
  position: absolute;
  inset: 22px;
  border: 1px dashed rgba(212, 175, 55, 0.22);
  border-radius: 6px;
  pointer-events: none;
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`

const Title = styled.h3`
  margin: 0 0 6px;
  font-family: ${ht.fontDisplay};
  font-size: 18px;
  font-weight: 700;
  color: ${ht.white};
  line-height: 1.2;
`

const Desc = styled.p`
  margin: 0 0 14px;
  font-family: ${ht.fontBody};
  font-size: 14px;
  color: #c8c8c8;
  line-height: 1.45;
`

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  max-width: 380px;
`

const BtnBase = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 46px;
  border-radius: 10px;
  font-family: ${ht.fontBody};
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: filter 150ms ease, box-shadow 150ms ease, transform 100ms ease;

  &:active {
    transform: scale(0.985);
  }
`

const Primary = styled(BtnBase)`
  background: linear-gradient(180deg, ${ht.goldBright}, ${ht.gold});
  color: #000000;

  &:hover {
    filter: brightness(1.06);
    box-shadow: 0 0 16px rgba(212, 175, 55, 0.25);
  }
`

const Secondary = styled(BtnBase)`
  border: 1px solid rgba(212, 175, 55, 0.55);
  background: transparent;
  color: ${ht.gold};

  &:hover {
    border-color: ${ht.gold};
    box-shadow: 0 0 12px rgba(212, 175, 55, 0.12);
  }
`

export const ListProjectCta: React.FC = () => (
  <Card data-list-project-cta="true">
    <Cube aria-hidden>
      <Wireframe />
    </Cube>
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
