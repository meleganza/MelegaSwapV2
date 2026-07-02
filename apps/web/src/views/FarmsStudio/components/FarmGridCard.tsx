import React, { useState } from 'react'
import styled from 'styled-components'
import { MelegaLogoSvg } from 'design-system/melega/components/BrandLockup/MelegaLogoSvg'
import type { FarmPreviewCard } from '../farmsStudioData'
import { DEFAULT_ANALYZE_PREVIEW } from '../farmsStudioData'
import { farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'

const Card = styled.article<{ $expanded?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: ${({ $expanded }) =>
    $expanded ? farmsStudioLayout.farmCardHeightExpanded : farmsStudioLayout.farmCardHeight};
  min-height: ${farmsStudioLayout.farmCardHeight};
  padding: ${farmsStudioLayout.farmCardPadding};
  border-radius: 18px;
  background: ${farmsStudioColors.panel};
  border: 1px solid ${farmsStudioColors.border};
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
  transition: height 250ms ease, border-color 150ms ease, transform 150ms ease;

  @media (max-width: 767px) {
    height: auto;
    min-height: ${farmsStudioLayout.farmCardHeight};
  }
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  flex: 1;
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 32px;
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

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 18px;
  row-gap: 12px;
  max-height: 168px;
`

const Metric = styled.div<{ $isApr?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-height: 34px;
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

const MetricValue = styled.span<{ $variant?: 'live' | 'indexing' | 'coming-soon' | 'default'; $tone?: 'green' | 'gold' }>`
  font-size: ${({ $variant }) =>
    $variant === 'live' ? '40px' : $variant === 'indexing' ? '32px' : $variant === 'coming-soon' ? '30px' : '16px'};
  font-weight: ${({ $variant }) => ($variant ? 800 : 700)};
  line-height: ${({ $variant }) => ($variant === 'live' ? '42px' : '1.2')};
  color: ${({ $variant, $tone }) =>
    $variant === 'indexing'
      ? farmsStudioColors.gold
      : $variant === 'coming-soon'
        ? farmsStudioColors.muted
        : $variant === 'live'
          ? farmsStudioColors.green
          : $tone === 'green'
            ? farmsStudioColors.green
            : $tone === 'gold'
              ? farmsStudioColors.gold
              : '#ffffff'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const AnalyzePanel = styled.div`
  margin-top: 4px;
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
  height: ${farmsStudioLayout.farmCardFooterHeight};
  min-height: ${farmsStudioLayout.farmCardFooterHeight};
  display: flex;
  align-items: center;
  justify-content: ${({ $centered }) => ($centered ? 'center' : 'flex-end')};
  gap: 10px;
  flex-shrink: 0;

  @media (max-width: 767px) {
    height: auto;
    min-height: ${farmsStudioLayout.farmCardFooterHeight};
    margin-top: 12px;
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
        <MelegaLogoSvg size={24} />
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
  const aprVar = aprVariant(farm)

  const renderFooter = () => {
    if (farm.status === 'coming-soon' || farm.cta === 'none') {
      return (
        <Footer $centered>
          <ComingSoonBadge>Coming Soon</ComingSoonBadge>
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
        <CardStakeBtn type="button">Stake</CardStakeBtn>
        <CardAnalyzeBtn type="button" onClick={() => setExpanded((v) => !v)}>
          Analyze
        </CardAnalyzeBtn>
      </Footer>
    )
  }

  return (
    <Card data-fs-farm-card $expanded={expanded}>
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
                : 'Coming soon'}
          </StatusPill>
        </TopRow>

        <Metrics>
          <Metric $isApr>
            <MetricLabel>APR</MetricLabel>
            <MetricValue $variant={aprVar}>{aprDisplay(farm)}</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Liquidity</MetricLabel>
            <MetricValue>{farm.liquidity}</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>TVL</MetricLabel>
            <MetricValue>{farm.tvl}</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Daily Rewards</MetricLabel>
            <MetricValue $tone={farm.dailyRewards !== '—' ? 'green' : undefined}>{farm.dailyRewards}</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Reward Token</MetricLabel>
            <MetricValue>{rewardTokenFor(farm)}</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Multiplier</MetricLabel>
            <MetricValue $tone={farm.multiplier !== '—' ? 'gold' : undefined}>{farm.multiplier}</MetricValue>
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
      </Body>

      {renderFooter()}
    </Card>
  )
}

export default FarmGridCard
