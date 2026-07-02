import React from 'react'
import styled from 'styled-components'
import type { FarmPreviewCard } from '../farmsStudioData'
import { farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'
import { FsCardMetricLabel, FsCardMetricValue } from './farmsStudioPrimitives'

const Card = styled.article`
  height: ${farmsStudioLayout.farmCardHeight};
  min-height: ${farmsStudioLayout.farmCardHeight};
  padding: 16px;
  border-radius: 18px;
  background: ${farmsStudioColors.panel};
  border: 1px solid ${farmsStudioColors.border};
  box-sizing: border-box;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  row-gap: 18px;
  min-width: 0;
  overflow: hidden;
`

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
  overflow: hidden;
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  flex-shrink: 0;
`

const PairBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const Icons = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

const TokenIcon = styled.span<{ $offset?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid ${farmsStudioColors.border};
  background: ${farmsStudioColors.panelAlt};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: ${farmsStudioColors.goldBright};
  margin-left: ${({ $offset }) => ($offset ? '-8px' : '0')};
  position: relative;
  z-index: ${({ $offset }) => ($offset ? 1 : 2)};
`

const PairName = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: ${farmsStudioColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const StatusPill = styled.span<{ $tone?: 'live' | 'new' | 'finished' | 'indexing' | 'coming-soon' }>`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  flex-shrink: 0;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'new'
        ? farmsStudioColors.purple
        : $tone === 'indexing'
          ? farmsStudioColors.gold
          : $tone === 'coming-soon'
            ? farmsStudioColors.border
            : $tone === 'finished'
              ? farmsStudioColors.red
              : farmsStudioColors.green};
  color: ${({ $tone }) =>
    $tone === 'new'
      ? farmsStudioColors.purple
      : $tone === 'indexing'
        ? farmsStudioColors.goldBright
        : $tone === 'coming-soon'
          ? farmsStudioColors.muted
          : $tone === 'finished'
            ? farmsStudioColors.red
            : farmsStudioColors.green};
  background: ${({ $tone }) =>
    $tone === 'new'
      ? 'rgba(167, 139, 250, 0.1)'
      : $tone === 'indexing'
        ? farmsStudioColors.previewBadgeBg
        : $tone === 'coming-soon'
          ? 'rgba(255,255,255,0.04)'
          : $tone === 'finished'
            ? 'rgba(255, 77, 77, 0.08)'
            : 'rgba(0, 230, 118, 0.08)'};
`

const AprBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
`

const AprValue = styled.span`
  font-size: 38px;
  font-weight: 800;
  line-height: 1;
  color: ${farmsStudioColors.green};
`

const AprLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${farmsStudioColors.muted};
`

const Metrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`

const BtnRow = styled.div<{ $centered?: boolean }>`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: ${({ $centered }) => ($centered ? 'center' : 'flex-start')};
  flex-shrink: 0;
  height: ${farmsStudioLayout.farmCardBtnHeight};
`

const CardStakeBtn = styled.button`
  width: ${farmsStudioLayout.farmCardBtnWidth};
  min-width: ${farmsStudioLayout.farmCardBtnWidth};
  height: ${farmsStudioLayout.farmCardBtnHeight};
  min-height: ${farmsStudioLayout.farmCardBtnHeight};
  padding: 0;
  border: none;
  border-radius: 12px;
  background: #d4af37;
  color: #050505;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 150ms ease, transform 150ms ease;

  &:hover {
    filter: brightness(1.06);
    transform: translateY(-1px);
  }
`

const CardDetailsBtn = styled.button`
  width: ${farmsStudioLayout.farmCardBtnWidth};
  min-width: ${farmsStudioLayout.farmCardBtnWidth};
  height: ${farmsStudioLayout.farmCardBtnHeight};
  min-height: ${farmsStudioLayout.farmCardBtnHeight};
  padding: 0;
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.55);
  background: transparent;
  color: #d4af37;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 150ms ease, transform 150ms ease;

  &:hover {
    background: rgba(212, 175, 55, 0.08);
    transform: translateY(-1px);
  }
`

const ComingSoonBadge = styled.div`
  width: 120px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid ${farmsStudioColors.border};
  background: rgba(255, 255, 255, 0.04);
  font-size: 14px;
  font-weight: 700;
  color: ${farmsStudioColors.muted};
`

const statusLabel = (status: FarmPreviewCard['status']) => {
  if (status === 'live') return 'Live'
  if (status === 'new') return 'New'
  if (status === 'finished') return 'Finished'
  if (status === 'indexing') return 'Indexing'
  return 'Coming soon'
}

const renderFooter = (farm: FarmPreviewCard) => {
  if (farm.status === 'coming-soon' || farm.cta === 'none') {
    return (
      <BtnRow $centered>
        <ComingSoonBadge>Coming Soon</ComingSoonBadge>
      </BtnRow>
    )
  }

  if (farm.status === 'indexing' || farm.cta === 'details') {
    return (
      <BtnRow $centered>
        <CardDetailsBtn type="button">Details</CardDetailsBtn>
      </BtnRow>
    )
  }

  return (
    <BtnRow>
      <CardStakeBtn type="button">Stake</CardStakeBtn>
      <CardDetailsBtn type="button">Details</CardDetailsBtn>
    </BtnRow>
  )
}

export interface FarmGridCardProps {
  farm: FarmPreviewCard
}

export const FarmGridCard: React.FC<FarmGridCardProps> = ({ farm }) => (
  <Card data-fs-farm-card>
    <CardContent>
      <TopRow>
        <PairBlock>
          <Icons>
            <TokenIcon>{farm.tokens[0].slice(0, 1)}</TokenIcon>
            <TokenIcon $offset>{farm.tokens[1].slice(0, 1)}</TokenIcon>
          </Icons>
          <PairName>{farm.pair}</PairName>
        </PairBlock>
        <StatusPill $tone={farm.status}>{statusLabel(farm.status)}</StatusPill>
      </TopRow>

      {farm.apr ? (
        <AprBlock>
          <AprValue>{farm.apr}</AprValue>
          <AprLabel>APR</AprLabel>
        </AprBlock>
      ) : farm.status === 'indexing' ? (
        <AprBlock>
          <AprValue style={{ fontSize: 28, color: farmsStudioColors.goldBright }}>Indexing...</AprValue>
          <AprLabel>APR</AprLabel>
        </AprBlock>
      ) : (
        <AprBlock>
          <AprValue style={{ fontSize: 28, color: farmsStudioColors.muted }}>Coming soon</AprValue>
          <AprLabel>APR</AprLabel>
        </AprBlock>
      )}

      {farm.tvl ? (
        <Metrics>
          <Metric>
            <FsCardMetricLabel>TVL</FsCardMetricLabel>
            <FsCardMetricValue>{farm.tvl}</FsCardMetricValue>
          </Metric>
          <Metric>
            <FsCardMetricLabel>Liquidity</FsCardMetricLabel>
            <FsCardMetricValue>{farm.liquidity}</FsCardMetricValue>
          </Metric>
          <Metric>
            <FsCardMetricLabel>Rewards / Day</FsCardMetricLabel>
            <FsCardMetricValue>{farm.dailyRewards}</FsCardMetricValue>
          </Metric>
          <Metric>
            <FsCardMetricLabel>Multiplier</FsCardMetricLabel>
            <FsCardMetricValue>{farm.multiplier}</FsCardMetricValue>
          </Metric>
        </Metrics>
      ) : null}
    </CardContent>

    {renderFooter(farm)}
  </Card>
)

export default FarmGridCard
