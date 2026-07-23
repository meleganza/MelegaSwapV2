import React from 'react'
import styled from 'styled-components'
import { useNetwork } from 'wagmi'
import { ChainId } from '@pancakeswap/sdk'
import { liqOne } from './onePageTokens'

const Row = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: ${liqOne.introMinH};
  margin-bottom: ${liqOne.introBottom};
  box-sizing: border-box;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
    min-height: 0;
    margin-bottom: 14px;
  }
`

const Copy = styled.div`
  min-width: 0;
  flex: 1;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${liqOne.font};
  font-size: ${liqOne.titleSize};
  line-height: ${liqOne.titleLh};
  font-weight: 750;
  color: ${liqOne.text};
  letter-spacing: -0.02em;

  @media (max-width: 767px) {
    font-size: 34px;
    line-height: 40px;
  }
`

const Subtitle = styled.p`
  margin: 6px 0 0;
  max-width: 520px;
  font-family: ${liqOne.font};
  font-size: 15px;
  line-height: 22px;
  color: ${liqOne.secondary};

  @media (max-width: 767px) {
    font-size: 14px;
    line-height: 21px;
  }
`

const NetworkCard = styled.div`
  width: 168px;
  height: 64px;
  flex-shrink: 0;
  box-sizing: border-box;
  background: ${liqOne.card};
  border: 1px solid ${liqOne.border};
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;

  @media (max-width: 767px) {
    width: 100%;
    height: auto;
    min-height: 56px;
  }
`

const NetLabel = styled.span`
  font-size: 11px;
  line-height: 14px;
  color: ${liqOne.muted};
  font-weight: 600;
`

const NetValue = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 18px;
  font-weight: 650;
  color: ${liqOne.text};
`

const Dot = styled.span<{ $ok: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $ok }) => ($ok ? liqOne.positive : liqOne.warning)};
  box-shadow: 0 0 0 3px ${({ $ok }) => ($ok ? 'rgba(22,217,119,0.15)' : 'rgba(244,185,66,0.15)')};
`

function networkLabel(chainId: number | undefined): string {
  if (chainId === ChainId.BSC) return 'BNB Smart Chain'
  if (chainId === ChainId.BSC_TESTNET) return 'BSC Testnet'
  return 'Network unavailable'
}

/**
 * Page introduction — title/subtitle left, compact network card right.
 * No action buttons in this row.
 */
export const LiquidityPageHeader: React.FC = () => {
  const { chain, isSuccess } = useNetwork()
  const onBsc = chain?.id === ChainId.BSC
  const live = Boolean(isSuccess && chain?.id)

  return (
    <Row data-testid="liq-one-page-header">
      <Copy>
        <Title>Liquidity</Title>
        <Subtitle>Add liquidity manually or let Melega build it progressively for your project.</Subtitle>
      </Copy>
      <NetworkCard data-testid="liq-one-network-card" data-network-live={live ? 'true' : 'false'}>
        <NetLabel>Network</NetLabel>
        <NetValue>
          <Dot $ok={onBsc} aria-hidden />
          {networkLabel(chain?.id)}
        </NetValue>
      </NetworkCard>
    </Row>
  )
}

export default LiquidityPageHeader
