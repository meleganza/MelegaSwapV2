import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ht } from './homeTradeTokens'

const Card = styled.div`
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.16), ${ht.surface2} 45%, ${ht.surface1});
  border: 1px solid rgba(212, 175, 55, 0.55);
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
  display: flex;
  gap: 16px;
  align-items: center;

  @media (min-width: 1024px) {
    padding: 18px;
    min-height: 136px;
  }
`

const Cube = styled.div`
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, ${ht.goldBright} 0%, ${ht.goldDark} 100%);
  box-shadow: 0 0 40px rgba(212, 175, 55, 0.35);
  transform: perspective(400px) rotateY(-18deg) rotateX(8deg);

  @media (min-width: 1024px) {
    width: 96px;
    height: 96px;
  }
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`

const Title = styled.h3`
  margin: 0 0 8px;
  font-family: ${ht.fontBody};
  font-size: 22px;
  font-weight: 700;
  color: ${ht.white};
  line-height: 1.2;

  @media (min-width: 1024px) {
    font-size: 20px;
  }
`

const Desc = styled.p`
  margin: 0 0 14px;
  font-family: ${ht.fontBody};
  font-size: 14px;
  color: #c4c4c4;
  line-height: 1.45;
  max-width: 460px;
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
  min-width: 140px;
  padding: 0 18px;
  border-radius: 8px;
  background: ${ht.gold};
  color: #000000;
  font-family: ${ht.fontBody};
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;

  @media (min-width: 1024px) {
    height: 40px;
    width: 170px;
  }
`

const Secondary = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  min-width: 140px;
  padding: 0 18px;
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 55, 0.6);
  background: transparent;
  color: ${ht.gold};
  font-family: ${ht.fontBody};
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;

  @media (min-width: 1024px) {
    height: 40px;
    width: 170px;
    color: ${ht.white};
  }
`

export const ListProjectCta: React.FC = () => (
  <Card>
    <Cube aria-hidden />
    <Body>
      <Title>List your project on Melega DEX</Title>
      <Desc>
        Add token details, upload logo, add liquidity, create a farm, or reward MARCO holders.
      </Desc>
      <Actions>
        <Primary href="/launch">Start listing</Primary>
        <Secondary href="/pools">Reward MARCO holders</Secondary>
      </Actions>
    </Body>
  </Card>
)

export default ListProjectCta
