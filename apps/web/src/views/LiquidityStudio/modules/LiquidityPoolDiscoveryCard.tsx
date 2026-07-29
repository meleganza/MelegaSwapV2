/**
 * LIQUIDITY_MODULE_003 — dense pool discovery card (IA redesign).
 * Logos, pair, status, TVL/Volume/Fees, compact Add — no oversized CTA.
 */
import React from 'react'
import NextLink from 'next/link'
import styled from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import type { DiscoveryPoolCardModel } from './liquidityPoolDiscoveryModel'
import { LIQUIDITY_POOL_DISCOVERY_COPY, liquidityPoolDiscovery } from './liquidityPoolDiscoveryTokens'

const Card = styled.article`
  width: 100%;
  max-width: ${liquidityPoolDiscovery.cardW};
  min-height: ${liquidityPoolDiscovery.cardMinH};
  height: 100%;
  box-sizing: border-box;
  margin: 0;
  border-radius: ${liquidityPoolDiscovery.cardRadius};
  border: ${liquidityPoolDiscovery.cardBorder};
  background: ${liquidityPoolDiscovery.cardBg};
  padding: ${liquidityPoolDiscovery.cardPad};
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

const PairRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const Logos = styled.div`
  display: flex;
  align-items: center;
  flex: 0 0 auto;

  > *:last-child {
    margin-left: -6px;
  }
`

const PairMeta = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1 1 auto;
`

const PairName = styled.h3`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  font-weight: 750;
  color: ${liquidityPoolDiscovery.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Status = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  font-size: 10px;
  line-height: 12px;
  font-weight: 650;
  color: ${(p) => (p.$active ? liquidityPoolDiscovery.gold : liquidityPoolDiscovery.dim)};
`

const Metrics = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px 4px;
`

const Metric = styled.div`
  min-width: 0;
`

const MetricLabel = styled.dt`
  margin: 0;
  font-size: 9px;
  line-height: 12px;
  color: ${liquidityPoolDiscovery.dim};
  text-transform: uppercase;
  letter-spacing: 0.02em;
`

const MetricValue = styled.dd`
  margin: 1px 0 0;
  font-size: 12px;
  line-height: 16px;
  font-weight: 650;
  color: ${liquidityPoolDiscovery.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Cta = styled(NextLink)`
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: ${liquidityPoolDiscovery.ctaH};
  min-height: 38px;
  max-height: 42px;
  border-radius: ${liquidityPoolDiscovery.ctaRadius};
  background: ${liquidityPoolDiscovery.gold};
  color: #111;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    background: ${liquidityPoolDiscovery.goldHover};
  }

  &:focus-visible {
    outline: ${liquidityPoolDiscovery.focusRing};
    outline-offset: ${liquidityPoolDiscovery.focusOffset};
  }
`

export const LiquidityPoolDiscoveryCard: React.FC<{ card: DiscoveryPoolCardModel }> = ({ card }) => (
  <Card data-testid="liquidity-pool-discovery-card" data-pair={card.pairAddress} data-discovery-density="compact">
    <PairRow>
      <Logos aria-hidden="true">
        <MelegaTokenAvatar
          symbol={card.symbol0}
          name={card.symbol0}
          address={card.token0}
          chainId={liquidityPoolDiscovery.chainId}
          size={22}
          radius="circle"
        />
        <MelegaTokenAvatar
          symbol={card.symbol1}
          name={card.symbol1}
          address={card.token1}
          chainId={liquidityPoolDiscovery.chainId}
          size={22}
          radius="circle"
        />
      </Logos>
      <PairMeta>
        <PairName>{card.pairName}</PairName>
        <Status $active={card.active} data-testid="liquidity-pool-discovery-status" title={card.statusReason}>
          {card.status}
        </Status>
      </PairMeta>
    </PairRow>

    <Metrics title={card.metricSourceNote}>
      <Metric>
        <MetricLabel>{LIQUIDITY_POOL_DISCOVERY_COPY.metricTvl}</MetricLabel>
        <MetricValue>{card.tvlLabel}</MetricValue>
      </Metric>
      <Metric>
        <MetricLabel>{LIQUIDITY_POOL_DISCOVERY_COPY.metricVolume}</MetricLabel>
        <MetricValue>{card.volumeLabel}</MetricValue>
      </Metric>
      <Metric>
        <MetricLabel>{LIQUIDITY_POOL_DISCOVERY_COPY.metricFees}</MetricLabel>
        <MetricValue>{card.feesLabel}</MetricValue>
      </Metric>
      <Metric>
        <MetricLabel>{LIQUIDITY_POOL_DISCOVERY_COPY.metricApr}</MetricLabel>
        <MetricValue>{card.aprLabel}</MetricValue>
      </Metric>
      <Metric>
        <MetricLabel>{LIQUIDITY_POOL_DISCOVERY_COPY.metricLiquidity}</MetricLabel>
        <MetricValue>{card.liquidityLabel}</MetricValue>
      </Metric>
    </Metrics>

    <Cta href={card.addHref} data-testid="liquidity-pool-discovery-cta">
      {LIQUIDITY_POOL_DISCOVERY_COPY.cta}
    </Cta>
  </Card>
)

export default LiquidityPoolDiscoveryCard
