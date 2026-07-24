import React from 'react'
import styled from 'styled-components'
import { useAccount, useNetwork } from 'wagmi'
import { ChainId } from '@pancakeswap/sdk'
import { liqOne } from './onePageTokens'

const HERO_BG = "/images/liquidity/liquidity-hero-background.png"

const Hero = styled.section`
  position: relative;
  width: 100%;
  max-width: ${liqOne.contentMax};
  height: 216px;
  margin: 0;
  margin-top: 24px;
  box-sizing: border-box;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(221, 185, 47, 0.22);
  background-color: #080808;
  background-image: url('${HERO_BG}');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 72% 68%;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.3);
  font-family: ${liqOne.font};

  @media (max-width: 1199px) and (min-width: 768px) {
    height: 216px;
    background-position: 72% 68%;
  }

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    height: 224px;
    margin-top: 16px;
    border-radius: 16px;
    background-position: 74% 64%;
  }
`

const TextBlock = styled.div`
  position: absolute;
  left: 32px;
  top: 30px;
  width: 560px;
  max-width: calc(100% - 64px);
  text-align: left;
  z-index: 1;

  @media (max-width: 1199px) and (min-width: 768px) {
    width: 500px;
    max-width: calc(100% - 48px);
    left: 24px;
  }

  @media (max-width: 767px) {
    left: 20px;
    top: 20px;
    width: auto;
    max-width: calc(100% - 40px);
  }
`

const Title = styled.h1`
  margin: 0;
  font-family: ${liqOne.font};
  font-size: 46px;
  line-height: 52px;
  font-weight: 750;
  letter-spacing: -0.025em;
  color: #f5f5f5;

  @media (max-width: 767px) {
    font-size: 34px;
    line-height: 40px;
    max-width: 260px;
  }
`

const Subtitle = styled.p`
  margin: 10px 0 0;
  max-width: 540px;
  min-width: 0;
  font-family: ${liqOne.font};
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  color: #b7b7b7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (min-width: 768px) {
    min-width: min(480px, 100%);
  }

  @media (max-width: 767px) {
    margin-top: 8px;
    max-width: 270px;
    font-size: 14px;
    line-height: 21px;
    -webkit-line-clamp: 3;
  }
`

const NetworkCard = styled.div`
  position: absolute;
  top: 28px;
  right: 28px;
  width: 174px;
  height: 66px;
  box-sizing: border-box;
  padding: 11px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 10, 10, 0.76);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  z-index: 1;

  @media (max-width: 1199px) and (min-width: 768px) {
    right: 24px;
  }

  @media (max-width: 767px) {
    top: auto;
    right: 16px;
    bottom: 16px;
    width: 148px;
    height: 56px;
    padding: 9px 12px;
  }
`

const NetLabel = styled.span`
  font-size: 11px;
  line-height: 14px;
  color: #888888;
  font-weight: 600;
`

const NetValue = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 18px;
  font-weight: 650;
  color: #f5f5f5;
`

const Dot = styled.span<{ $tone: 'connected' | 'unavailable' | 'disconnected' }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $tone }) =>
    $tone === 'connected' ? '#16D977' : $tone === 'unavailable' ? '#F4B942' : '#747474'};
`

type NetTone = 'connected' | 'unavailable' | 'disconnected'

function resolveNetwork(isConnected: boolean, chainId: number | undefined): { label: string; tone: NetTone } {
  if (!isConnected) {
    return { label: 'Network unavailable', tone: 'disconnected' }
  }
  if (chainId === ChainId.BSC) {
    return { label: 'BNB Smart Chain', tone: 'connected' }
  }
  return { label: 'Network unavailable', tone: 'unavailable' }
}

/**
 * Liquidity Hero — approved background image + title/subtitle + network card only.
 */
export const LiquidityPageHeader: React.FC = () => {
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const net = resolveNetwork(Boolean(isConnected), chain?.id)

  return (
    <Hero
      data-testid="liq-one-page-header"
      data-liquidity-hero="true"
      data-hero-bg={HERO_BG}
      aria-label="Liquidity"
    >
      <TextBlock data-testid="liq-hero-text">
        <Title>Liquidity</Title>
        <Subtitle>Add liquidity manually or let Melega build it progressively for your project.</Subtitle>
      </TextBlock>
      <NetworkCard
        data-testid="liq-one-network-card"
        data-network-tone={net.tone}
        role="status"
        aria-label={`Network: ${net.label}`}
      >
        <NetLabel>Network</NetLabel>
        <NetValue>
          <Dot $tone={net.tone} aria-hidden />
          {net.label}
        </NetValue>
      </NetworkCard>
    </Hero>
  )
}

export default LiquidityPageHeader
