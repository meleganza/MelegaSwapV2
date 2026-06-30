import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ht } from './homeTradeTokens'

const Card = styled.div`
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.16), #111111 42%, #080808);
  border: 1px solid rgba(212, 175, 55, 0.48);
  border-radius: 14px;
  padding: 22px;
  display: flex;
  gap: 22px;
  align-items: center;
  box-sizing: border-box;
  min-height: 138px;
  transition: box-shadow 180ms ease, border-color 180ms ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.6);
    box-shadow: 0 8px 28px rgba(212, 175, 55, 0.08);
  }

  @media (max-width: 1023px) {
    margin-top: 12px;
    padding: 16px;
    border-radius: 16px;
    display: grid;
    grid-template-columns: 82px 1fr;
    gap: 14px;
    min-height: auto;
  }
`

const Cube = styled.div`
  width: 92px;
  height: 92px;
  flex-shrink: 0;
  position: relative;
  transform: perspective(500px) rotateY(-18deg) rotateX(10deg);

  @media (max-width: 1023px) {
    width: 82px;
    height: 82px;
  }
`

const CubeFace = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(12, 10, 4, 0.95) 0%, rgba(4, 4, 4, 1) 50%, rgba(18, 14, 4, 0.9) 100%);
  border: 1px solid rgba(212, 175, 55, 0.5);
  box-shadow:
    inset 0 0 40px rgba(244, 197, 66, 0.12),
    0 0 30px rgba(212, 175, 55, 0.15);
`

const Wire = styled.svg`
  position: absolute;
  inset: 12px;
  width: calc(100% - 24px);
  height: calc(100% - 24px);
`

const Core = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  height: 22px;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  background: radial-gradient(circle, rgba(244, 197, 66, 0.85) 0%, rgba(212, 175, 55, 0.4) 60%, transparent 100%);
  box-shadow: 0 0 16px rgba(244, 197, 66, 0.5);
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`

const Title = styled.h3`
  margin: 0 0 6px;
  font-family: ${ht.fontBody};
  font-size: 22px;
  font-weight: 800;
  color: ${ht.white};
  line-height: 1.2;

  @media (max-width: 1023px) {
    font-size: 18px;
  }
`

const Desc = styled.p`
  margin: 0;
  font-family: ${ht.fontBody};
  font-size: 14px;
  color: #c8c8c8;
  line-height: 1.45;
  max-width: 470px;

  @media (max-width: 1023px) {
    font-size: 13px;
  }
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;

  @media (max-width: 420px) {
    flex-direction: column;
  }
`

const BtnBase = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  border-radius: 10px;
  font-family: ${ht.fontBody};
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: filter 180ms ease, transform 120ms ease, border-color 180ms ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.985);
  }
`

const Primary = styled(BtnBase)`
  width: 170px;
  background: linear-gradient(180deg, ${ht.goldBright}, ${ht.gold});
  color: #000000;

  &:hover {
    filter: brightness(1.06);
    box-shadow: 0 0 16px rgba(212, 175, 55, 0.25);
  }

  @media (max-width: 1023px) {
    flex: 1;
    min-width: 0;
    width: auto;
  }
`

const Secondary = styled(BtnBase)`
  width: 190px;
  border: 1px solid rgba(212, 175, 55, 0.6);
  background: transparent;
  color: ${ht.gold};

  &:hover {
    border-color: ${ht.gold};
    box-shadow: 0 0 12px rgba(212, 175, 55, 0.12);
  }

  @media (max-width: 1023px) {
    flex: 1;
    min-width: 0;
    width: auto;
  }
`

export const ListProjectCta: React.FC = () => (
  <Card data-list-project-cta="true">
    <Cube aria-hidden>
      <CubeFace />
      <Wire viewBox="0 0 68 68" fill="none">
        <rect x="8" y="8" width="52" height="52" stroke="rgba(212,175,55,0.45)" strokeWidth="1" />
        <path d="M8 8 L34 34 M60 8 L34 34 M8 60 L34 34 M60 60 L34 34" stroke="rgba(244,197,66,0.35)" strokeWidth="0.75" />
        <rect x="20" y="20" width="28" height="28" stroke="rgba(212,175,55,0.25)" strokeWidth="0.75" strokeDasharray="3 2" />
      </Wire>
      <Core />
    </Cube>
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
