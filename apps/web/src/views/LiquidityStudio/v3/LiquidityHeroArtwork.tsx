import React from 'react'
import styled, { keyframes } from 'styled-components'
import { MELEGA_LOGO_URI } from 'design-system/melega/constants/brand'
import { liqV3 } from './liquidityV3Tokens'

const BNB_LOGO = '/images/56/tokens/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png'
const USDT_LOGO = '/images/56/tokens/0x55d398326f99059fF775485246999027B3197955.png'
const USDC_LOGO = '/images/56/tokens/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png'

const floatCore = keyframes`
  0%, 100% { transform: translateY(2px) rotateX(7deg) rotateY(-11deg); }
  50% { transform: translateY(-5px) rotateX(7deg) rotateY(11deg); }
`

const orbitOne = keyframes`
  from { transform: rotate(0deg) translateX(68px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(68px) rotate(-360deg); }
`

const orbitTwo = keyframes`
  from { transform: rotate(120deg) translateX(72px) rotate(-120deg); }
  to { transform: rotate(480deg) translateX(72px) rotate(-480deg); }
`

const orbitThree = keyframes`
  from { transform: rotate(240deg) translateX(58px) rotate(-240deg); }
  to { transform: rotate(600deg) translateX(58px) rotate(-600deg); }
`

const Frame = styled.div`
  position: relative;
  width: min(100%, 390px);
  height: 176px;
  justify-self: end;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 720px;
  pointer-events: none;
  contain: layout paint;

  @media (max-width: ${liqV3.mobileBreak}) {
    width: min(100%, 330px);
    height: 144px;
    align-self: center;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
    }
  }
`

const Depth = styled.div`
  position: absolute;
  width: 230px;
  height: 130px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(244, 196, 48, 0.18) 0%, rgba(244, 196, 48, 0.04) 48%, transparent 72%);
`

const Ring = styled.div<{ $small?: boolean }>`
  position: absolute;
  width: ${({ $small }) => ($small ? '184px' : '260px')};
  height: ${({ $small }) => ($small ? '86px' : '124px')};
  border: 1px solid ${({ $small }) => ($small ? 'rgba(34, 197, 94, 0.16)' : 'rgba(244, 196, 48, 0.22)')};
  border-radius: 50%;
  transform: rotate(-9deg);

  @media (max-width: ${liqV3.mobileBreak}) {
    width: ${({ $small }) => ($small ? '154px' : '220px')};
    height: ${({ $small }) => ($small ? '72px' : '104px')};
  }
`

const Core = styled.div`
  position: relative;
  z-index: 3;
  width: 82px;
  height: 82px;
  border-radius: 50%;
  transform-style: preserve-3d;
  animation: ${floatCore} 5.6s ease-in-out infinite;
  box-shadow:
    0 0 0 1px rgba(244, 196, 48, 0.36),
    9px 12px 0 -5px rgba(98, 73, 4, 0.42),
    0 20px 34px rgba(0, 0, 0, 0.48),
    0 0 34px rgba(244, 196, 48, 0.2);

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    border-radius: 50%;
  }

  @media (max-width: ${liqV3.mobileBreak}) {
    width: 72px;
    height: 72px;
  }
`

const Orbiter = styled.div<{ $asset: 'bnb' | 'usdt' | 'usdc' }>`
  position: absolute;
  z-index: 4;
  top: 50%;
  left: 50%;
  width: ${({ $asset }) => ($asset === 'bnb' ? '38px' : '34px')};
  height: ${({ $asset }) => ($asset === 'bnb' ? '38px' : '34px')};
  margin: ${({ $asset }) => ($asset === 'bnb' ? '-19px 0 0 -19px' : '-17px 0 0 -17px')};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #101010;
  border: 1px solid
    ${({ $asset }) => ($asset === 'bnb' ? 'rgba(243, 186, 47, 0.55)' : 'rgba(38, 161, 123, 0.48)')};
  box-shadow: 0 7px 18px rgba(0, 0, 0, 0.42);
  animation: ${({ $asset }) => ($asset === 'bnb' ? orbitOne : $asset === 'usdt' ? orbitTwo : orbitThree)}
    ${({ $asset }) => ($asset === 'bnb' ? '12s' : $asset === 'usdt' ? '16s' : '10s')} linear infinite;
  will-change: transform;

  img {
    width: ${({ $asset }) => ($asset === 'bnb' ? '32px' : '28px')};
    height: ${({ $asset }) => ($asset === 'bnb' ? '32px' : '28px')};
    display: block;
    object-fit: cover;
    border-radius: 50%;
  }
`

const Caption = styled.span`
  position: absolute;
  right: 10px;
  bottom: 2px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.34);

  @media (max-width: ${liqV3.mobileBreak}) {
    display: none;
  }
`

export const LiquidityHeroArtwork: React.FC = () => (
  <Frame data-testid="liquidity-hero-artwork" data-animation-cost="transform-only" aria-hidden="true">
    <Depth />
    <Ring />
    <Ring $small />
    <Core>
      <img src={MELEGA_LOGO_URI} alt="" draggable={false} width={82} height={82} />
    </Core>
    <Orbiter $asset="bnb">
      <img src={BNB_LOGO} alt="" draggable={false} width={32} height={32} />
    </Orbiter>
    <Orbiter $asset="usdt">
      <img src={USDT_LOGO} alt="" draggable={false} width={28} height={28} />
    </Orbiter>
    <Orbiter $asset="usdc">
      <img src={USDC_LOGO} alt="" draggable={false} width={28} height={28} />
    </Orbiter>
    <Caption>Liquidity in motion</Caption>
  </Frame>
)

export default LiquidityHeroArtwork
