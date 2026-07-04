import React, { useState } from 'react'
import styled from 'styled-components'
import { formatCompactDisplay } from 'design-system/melega'
import { MARCO_LOGO_URI } from 'design-system/melega/constants/brand'
import type { FarmPreviewCard } from '../farmsStudioData'
import { DEFAULT_ANALYZE_PREVIEW } from '../farmsStudioData'
import { farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'

const Card = styled.article<{ $expanded?: boolean; $archived?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: ${farmsStudioLayout.farmCardHeight};
  height: ${({ $expanded }) => ($expanded ? 'auto' : farmsStudioLayout.farmCardHeight)};
  padding: ${farmsStudioLayout.farmCardPadding};
  border-radius: 20px;
  background: ${({ $archived }) => ($archived ? 'rgba(19, 19, 19, 0.72)' : farmsStudioColors.panel)};
  border: 1px solid ${({ $archived }) => ($archived ? 'rgba(255,255,255,0.05)' : farmsStudioColors.border)};
  opacity: ${({ $archived }) => ($archived ? 0.82 : 1)};
  box-sizing: border-box;
  min-width: 0;
  overflow: visible;
  filter: ${({ $archived }) => ($archived ? 'saturate(0.65)' : 'none')};

  @media (max-width: 767px) {
    height: auto;
    min-height: 280px;
    padding: 14px;
  }
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 32px;
  flex-shrink: 0;
  margin-bottom: 8px;
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

const TokenIconWrap = styled.span<{ $offset?: boolean }>`
  width: 24px;
  height: 24px;
  margin-left: ${({ $offset }) => ($offset ? '-6px' : '0')};
  position: relative;
  z-index: ${({ $offset }) => ($offset ? 1 : 2)};
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const TokenFallback = styled.span`
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
          : farmsStudioColors.green};
  color: ${({ $tone }) =>
    $tone === 'indexing'
      ? farmsStudioColors.gold
      : $tone === 'coming-soon'
        ? farmsStudioColors.muted
        : farmsStudioColors.green};
  background: ${({ $tone }) =>
    $tone === 'indexing'
      ? farmsStudioColors.previewBadgeBg
      : $tone === 'coming-soon'
        ? 'rgba(255,255,255,0.04)'
        : 'rgba(0, 230, 118, 0.08)'};
`

const AprSection = styled.div<{ $comingSoon?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: ${farmsStudioLayout.farmCardAprGap};
  flex-shrink: 0;
  ${({ $comingSoon }) =>
    $comingSoon
      ? `
    flex: 1;
    justify-content: center;
  `
      : ''}
`

const AprValue = styled.div<{ $variant?: 'live' | 'indexing' | 'coming-soon' }>`
  font-size: ${({ $variant }) =>
    $variant === 'indexing' ? '28px' : $variant === 'coming-soon' ? '36px' : '32px'};
  font-weight: 800;
  line-height: ${({ $variant }) =>
    $variant === 'indexing' ? '30px' : $variant === 'coming-soon' ? '38px' : '36px'};
  color: ${({ $variant }) =>
    $variant === 'indexing'
      ? farmsStudioColors.gold
      : $variant === 'coming-soon'
        ? farmsStudioColors.muted
        : farmsStudioColors.green};

  @media (max-width: 767px) {
    font-size: ${({ $variant }) =>
      $variant === 'indexing' ? '26px' : $variant === 'coming-soon' ? '32px' : '28px'};
    line-height: ${({ $variant }) =>
      $variant === 'indexing' ? '28px' : $variant === 'coming-soon' ? '34px' : '32px'};
  }
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: ${farmsStudioLayout.farmCardMetricColGap};
  row-gap: ${farmsStudioLayout.farmCardMetricRowGap};
  flex: 1;
  min-height: 0;
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
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

const MetricValue = styled.span<{ $tone?: 'green' | 'gold' | 'muted' }>`
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? farmsStudioColors.green
      : $tone === 'gold'
        ? farmsStudioColors.gold
        : $tone === 'muted'
          ? farmsStudioColors.muted
          : '#ffffff'};
`

const AnalyzePanel = styled.div`
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid ${farmsStudioColors.rowBorder};
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 18px;
`

const AnalyzeRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
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

const Footer = styled.div<{ $centered?: boolean }>`
  margin-top: ${farmsStudioLayout.farmCardMetricsFooterGap};
  display: flex;
  align-items: center;
  justify-content: ${({ $centered }) => ($centered ? 'center' : 'flex-end')};
  flex-wrap: wrap;
  gap: ${farmsStudioLayout.farmCardBtnGap};
  flex-shrink: 0;
  padding-top: 8px;
`

const CardStakeBtn = styled.button`
  min-width: 72px;
  flex: 1 1 auto;
  max-width: 120px;
  height: ${farmsStudioLayout.farmCardBtnHeight};
  border: none;
  border-radius: 12px;
  background: #d4af37;
  color: #050505;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 150ms ease, filter 150ms ease;

  &:hover {
    filter: brightness(1.05);
    transform: translateY(-1px);
  }

  @media (max-width: 767px) {
    max-width: none;
    flex: 1 1 calc(50% - 4px);
  }
`

const CardAnalyzeBtn = styled.button`
  min-width: 72px;
  flex: 1 1 auto;
  max-width: 120px;
  height: ${farmsStudioLayout.farmCardBtnHeight};
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.55);
  background: transparent;
  color: #d4af37;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 150ms ease, filter 150ms ease;

  &:hover {
    filter: brightness(1.05);
    transform: translateY(-1px);
  }

  @media (max-width: 767px) {
    max-width: none;
    flex: 1 1 calc(50% - 4px);
  }
`

const ComingSoonBadge = styled.div`
  width: 120px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 14px;
  font-weight: 700;
  color: ${farmsStudioColors.muted};
`

function renderTokenIcon(symbol: string, offset?: boolean) {
  if (symbol === 'MARCO') {
    return (
      <TokenIconWrap $offset={offset}>
        <img src={MARCO_LOGO_URI} alt="" width={24} height={24} style={{ borderRadius: '50%', objectFit: 'cover' }} />
      </TokenIconWrap>
    )
  }
  return <TokenFallback style={offset ? { marginLeft: -6 } : undefined}>{symbol.slice(0, 1)}</TokenFallback>
}

function rewardTokenFor(farm: FarmPreviewCard) {
  if (farm.dailyRewards?.includes('MARCO')) return 'MARCO'
  if (farm.status === 'coming-soon') return '—'
  return 'MARCO'
}

function aprVariant(farm: FarmPreviewCard): 'live' | 'indexing' | 'coming-soon' | undefined {
  if (farm.status === 'coming-soon') return 'coming-soon'
  if (farm.status === 'indexing') return 'indexing'
  if (farm.apr) return 'live'
  return undefined
}

function aprDisplay(farm: FarmPreviewCard) {
  if (farm.status === 'finished') return 'Ended'
  if (farm.apr) return farm.apr
  if (farm.status === 'indexing') return '—'
  return '—'
}

function formatRewardValue(value: string) {
  if (!value || value === '—') return value
  return formatCompactDisplay(value.replace(/\s*MARCO\s*$/i, ''))
}

function statusMetric(farm: FarmPreviewCard) {
  if (farm.status === 'live') return 'Live'
  if (farm.status === 'indexing') return 'Indexing'
  if (farm.status === 'finished') return 'Ended'
  return farm.status
}

export interface FarmGridCardProps {
  farm: FarmPreviewCard
}

export const FarmGridCard: React.FC<FarmGridCardProps> = ({ farm }) => {
  const [expanded, setExpanded] = useState(false)
  const { requestModal, account } = useFarmsRuntime()
  const preview = farm.analyzePreview ?? DEFAULT_ANALYZE_PREVIEW
  const aprVar = aprVariant(farm)
  const hasPending = farm.pendingReward?.gt(0)
  const hasStaked = farm.userStaked?.gt(0)

  const renderFooter = () => {
    if (farm.status === 'finished' || farm.cta === 'none') {
      return (
        <Footer $centered>
          <ComingSoonBadge>Ended</ComingSoonBadge>
        </Footer>
      )
    }

    if (farm.status === 'indexing' || farm.cta === 'analyze') {
      return (
        <Footer>
          <CardAnalyzeBtn type="button" onClick={() => setExpanded((v) => !v)}>
            Analyze
          </CardAnalyzeBtn>
        </Footer>
      )
    }

    return (
      <Footer>
        <CardStakeBtn type="button" onClick={() => requestModal(farm, 'stake')}>
          Stake
        </CardStakeBtn>
        {hasStaked && account ? (
          <CardAnalyzeBtn type="button" onClick={() => requestModal(farm, 'unstake')}>
            Withdraw
          </CardAnalyzeBtn>
        ) : null}
        {hasPending && account ? (
          <CardAnalyzeBtn type="button" onClick={() => requestModal(farm, 'claim')}>
            Claim
          </CardAnalyzeBtn>
        ) : null}
        <CardAnalyzeBtn type="button" onClick={() => setExpanded((v) => !v)}>
          Analyze
        </CardAnalyzeBtn>
      </Footer>
    )
  }

  return (
    <Card data-fs-farm-card $expanded={expanded} $archived={farm.status === 'finished'}>
      <Body>
        <TopRow>
          <PairBlock>
            <Icons>
              {renderTokenIcon(farm.tokens[0])}
              {renderTokenIcon(farm.tokens[1], true)}
            </Icons>
            <PairName>{farm.pair}</PairName>
          </PairBlock>
          <StatusPill $tone={farm.status}>
            {farm.status === 'live'
              ? 'Live'
              : farm.status === 'indexing'
                ? 'Indexing'
                : farm.status === 'finished'
                  ? 'Ended'
                  : 'Unavailable'}
          </StatusPill>
        </TopRow>

        <AprSection $comingSoon={farm.status === 'coming-soon' && !farm.apr}>
          <MetricLabel>APR</MetricLabel>
          <AprValue $variant={aprVar}>{aprDisplay(farm)}</AprValue>
        </AprSection>

        {farm.status !== 'finished' ? (
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
            <MetricLabel>Reward Token</MetricLabel>
            <MetricValue>{rewardTokenFor(farm)}</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Multiplier</MetricLabel>
            <MetricValue $tone={farm.multiplier !== '—' ? 'gold' : undefined}>{farm.multiplier}</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Daily Rewards</MetricLabel>
            <MetricValue $tone={farm.dailyRewards !== '—' ? 'green' : undefined}>
              {formatRewardValue(farm.dailyRewards)}
            </MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Status</MetricLabel>
            <MetricValue $tone={farm.status === 'live' ? 'green' : farm.status === 'indexing' ? 'gold' : 'muted'}>
              {statusMetric(farm)}
            </MetricValue>
          </Metric>
        </Metrics>
        ) : null}

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
      </Body>

      {renderFooter()}
    </Card>
  )
}

export default FarmGridCard
