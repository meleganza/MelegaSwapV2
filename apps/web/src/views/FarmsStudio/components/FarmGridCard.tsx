import React, { useState } from 'react'
import styled from 'styled-components'
import type { FarmPreviewCard } from '../farmsStudioData'
import { DEFAULT_ANALYZE_PREVIEW } from '../farmsStudioData'
import { farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'

const Card = styled.article<{ $expanded?: boolean }>`
  position: relative;
  height: ${({ $expanded }) =>
    $expanded ? farmsStudioLayout.farmCardHeightExpanded : farmsStudioLayout.farmCardHeight};
  min-height: ${farmsStudioLayout.farmCardHeight};
  padding: 16px;
  padding-bottom: 56px;
  border-radius: 18px;
  background: ${farmsStudioColors.panel};
  border: 1px solid ${farmsStudioColors.border};
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
  transition: height 150ms ease, border-color 150ms ease, transform 150ms ease;

  @media (max-width: 767px) {
    height: auto;
    min-height: ${farmsStudioLayout.farmCardHeight};
    padding-bottom: 16px;
  }
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 32px;
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
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid ${farmsStudioColors.border};
  background: ${farmsStudioColors.panelAlt};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  color: ${farmsStudioColors.goldBright};
  margin-left: ${({ $offset }) => ($offset ? '-6px' : '0')};
  position: relative;
  z-index: ${({ $offset }) => ($offset ? 1 : 2)};
`

const PairName = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const StatusPill = styled.span<{ $tone?: FarmPreviewCard['status'] }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 24px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  flex-shrink: 0;
  box-sizing: border-box;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'indexing'
        ? farmsStudioColors.gold
        : $tone === 'coming-soon'
          ? 'rgba(255,255,255,0.16)'
          : $tone === 'finished'
            ? farmsStudioColors.red
            : $tone === 'new'
              ? farmsStudioColors.purple
              : farmsStudioColors.green};
  color: ${({ $tone }) =>
    $tone === 'indexing'
      ? farmsStudioColors.gold
      : $tone === 'coming-soon'
        ? farmsStudioColors.muted
        : $tone === 'finished'
          ? farmsStudioColors.red
          : $tone === 'new'
            ? farmsStudioColors.purple
            : farmsStudioColors.green};
  background: ${({ $tone }) =>
    $tone === 'indexing'
      ? farmsStudioColors.previewBadgeBg
      : $tone === 'coming-soon'
        ? 'rgba(255,255,255,0.04)'
        : $tone === 'finished'
          ? 'rgba(255, 77, 77, 0.08)'
          : $tone === 'new'
            ? 'rgba(167, 139, 250, 0.1)'
            : 'rgba(0, 230, 118, 0.08)'};
`

const AprBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
  flex-shrink: 0;
`

const AprValue = styled.span<{ $variant?: 'live' | 'indexing' | 'coming-soon' }>`
  font-size: ${({ $variant }) =>
    $variant === 'indexing' ? '32px' : $variant === 'coming-soon' ? '30px' : '42px'};
  font-weight: 800;
  line-height: 1;
  color: ${({ $variant }) =>
    $variant === 'indexing'
      ? farmsStudioColors.gold
      : $variant === 'coming-soon'
        ? farmsStudioColors.muted
        : farmsStudioColors.green};
`

const AprLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${farmsStudioColors.muted};
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 18px;
  row-gap: 8px;
  margin-top: 10px;
  flex-shrink: 0;
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

const MetricLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${farmsStudioColors.muted};
  line-height: 1;
`

const MetricValue = styled.span<{ $tone?: 'green' | 'gold' | 'default' }>`
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  color: ${({ $tone }) =>
    $tone === 'green' ? farmsStudioColors.green : $tone === 'gold' ? farmsStudioColors.gold : '#ffffff'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const AnalyzePanel = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${farmsStudioColors.rowBorder};
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 18px;
`

const AnalyzeRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const AnalyzeLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${farmsStudioColors.muted};
`

const AnalyzeValue = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${farmsStudioColors.text};
`

const BtnRow = styled.div<{ $centered?: boolean }>`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  height: 40px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: ${({ $centered }) => ($centered ? 'center' : 'flex-start')};

  @media (max-width: 767px) {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    margin-top: 16px;
  }
`

const CardStakeBtn = styled.button`
  width: ${farmsStudioLayout.farmCardBtnWidth};
  min-width: ${farmsStudioLayout.farmCardBtnWidth};
  height: ${farmsStudioLayout.farmCardBtnHeight};
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

const CardAnalyzeBtn = styled.button`
  width: ${farmsStudioLayout.farmCardAnalyzeWidth};
  min-width: ${farmsStudioLayout.farmCardAnalyzeWidth};
  height: ${farmsStudioLayout.farmCardBtnHeight};
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
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
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

const aprVariant = (farm: FarmPreviewCard): 'live' | 'indexing' | 'coming-soon' => {
  if (farm.status === 'coming-soon') return 'coming-soon'
  if (farm.status === 'indexing') return 'indexing'
  return 'live'
}

const aprDisplay = (farm: FarmPreviewCard) => {
  if (farm.apr) return farm.apr
  if (farm.status === 'indexing') return 'Indexing...'
  return 'Coming soon'
}

export interface FarmGridCardProps {
  farm: FarmPreviewCard
}

export const FarmGridCard: React.FC<FarmGridCardProps> = ({ farm }) => {
  const [expanded, setExpanded] = useState(false)
  const preview = farm.analyzePreview ?? DEFAULT_ANALYZE_PREVIEW

  const renderFooter = () => {
    if (farm.status === 'coming-soon' || farm.cta === 'none') {
      return (
        <BtnRow $centered>
          <ComingSoonBadge>Coming Soon</ComingSoonBadge>
        </BtnRow>
      )
    }

    if (farm.status === 'indexing' || farm.cta === 'analyze') {
      return (
        <BtnRow $centered>
          <CardAnalyzeBtn type="button" onClick={() => setExpanded((v) => !v)}>
            Analyze
          </CardAnalyzeBtn>
        </BtnRow>
      )
    }

    return (
      <BtnRow>
        <CardStakeBtn type="button">Stake</CardStakeBtn>
        <CardAnalyzeBtn type="button" onClick={() => setExpanded((v) => !v)}>
          Analyze
        </CardAnalyzeBtn>
      </BtnRow>
    )
  }

  return (
    <Card data-fs-farm-card $expanded={expanded}>
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

      <AprBlock>
        <AprValue $variant={aprVariant(farm)}>{aprDisplay(farm)}</AprValue>
        <AprLabel>APR</AprLabel>
      </AprBlock>

      <Metrics>
        <Metric>
          <MetricLabel>TVL</MetricLabel>
          <MetricValue>{farm.tvl}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Liquidity</MetricLabel>
          <MetricValue>{farm.liquidity}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Daily Rewards</MetricLabel>
          <MetricValue $tone={farm.dailyRewards !== '—' ? 'green' : 'default'}>{farm.dailyRewards}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Multiplier</MetricLabel>
          <MetricValue $tone={farm.multiplier !== '—' ? 'gold' : 'default'}>{farm.multiplier}</MetricValue>
        </Metric>
      </Metrics>

      {expanded ? (
        <AnalyzePanel>
          <AnalyzeRow>
            <AnalyzeLabel>APR History</AnalyzeLabel>
            <AnalyzeValue>{preview.aprHistory}</AnalyzeValue>
          </AnalyzeRow>
          <AnalyzeRow>
            <AnalyzeLabel>Reward Token</AnalyzeLabel>
            <AnalyzeValue>{preview.rewardToken}</AnalyzeValue>
          </AnalyzeRow>
          <AnalyzeRow>
            <AnalyzeLabel>Emission</AnalyzeLabel>
            <AnalyzeValue>{preview.emission}</AnalyzeValue>
          </AnalyzeRow>
          <AnalyzeRow>
            <AnalyzeLabel>Contract</AnalyzeLabel>
            <AnalyzeValue>{preview.contract}</AnalyzeValue>
          </AnalyzeRow>
          <AnalyzeRow>
            <AnalyzeLabel>Risk</AnalyzeLabel>
            <AnalyzeValue>{preview.risk}</AnalyzeValue>
          </AnalyzeRow>
        </AnalyzePanel>
      ) : null}

      {renderFooter()}
    </Card>
  )
}

export default FarmGridCard
