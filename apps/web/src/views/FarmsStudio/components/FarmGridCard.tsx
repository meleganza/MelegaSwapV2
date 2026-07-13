import React, { useState } from 'react'
import styled from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { formatCompactDisplay } from 'design-system/melega'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { isMarcoSymbol, MARCO_BSC_ADDRESS, MARCO_BSC_CHAIN_ID } from 'design-system/melega/constants/brand'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { getMasterChefAddress } from 'utils/addressHelpers'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import type { FarmPreviewCard } from '../farmsStudioData'
import { DEFAULT_ANALYZE_PREVIEW } from '../farmsStudioData'
import { farmsStudioColors, farmsStudioLayout, farmsTypography } from '../farmsStudioTokens'
import { displayFarmMetric, isUnavailableFarmMetric, shortenContractAddress } from '../farmsStudioDisplay'
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
  font-size: ${farmsTypography.cardMetricValue.size};
  font-weight: ${farmsTypography.cardMetricValue.weight};
  line-height: ${farmsTypography.cardMetricValue.lineHeight};
  font-variant-numeric: ${farmsTypography.fontVariantNumeric};
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

const ContractLink = styled.a`
  color: ${farmsStudioColors.text};
  text-decoration: none;
  font-variant-numeric: ${farmsTypography.fontVariantNumeric};

  &:hover {
    text-decoration: underline;
    color: ${farmsStudioColors.gold};
  }
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
  font-size: ${farmsTypography.analyzeValue.size};
  font-weight: ${farmsTypography.analyzeValue.weight};
  line-height: ${farmsTypography.analyzeValue.lineHeight};
  color: ${farmsStudioColors.text};
  font-variant-numeric: ${farmsTypography.fontVariantNumeric};
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

const CardConnectBtn = styled(ConnectWalletButton)`
  && {
    min-width: 72px;
    flex: 1 1 auto;
    max-width: 120px;
    height: ${farmsStudioLayout.farmCardBtnHeight};
    min-height: ${farmsStudioLayout.farmCardBtnHeight};
    padding: 0 12px;
    border: none;
    border-radius: 12px;
    background: #d4af37;
    color: #050505;
    font-size: 13px;
    font-weight: 700;
    box-shadow: none;
    transition: transform 150ms ease, filter 150ms ease;
  }

  &&:hover:not(:disabled) {
    filter: brightness(1.05);
    transform: translateY(-1px);
  }

  @media (max-width: 767px) {
    && {
      max-width: none;
      flex: 1 1 calc(50% - 4px);
    }
  }
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

function renderTokenIcon(
  symbol: string,
  tokenAddress?: string,
  chainId?: number,
  offset?: boolean,
) {
  return (
    <TokenIconWrap $offset={offset}>
      <MelegaTokenAvatar
        name={symbol}
        symbol={symbol}
        size={24}
        address={isMarcoSymbol(symbol) ? MARCO_BSC_ADDRESS : tokenAddress}
        chainId={isMarcoSymbol(symbol) ? MARCO_BSC_CHAIN_ID : chainId}
        radius="circle"
      />
    </TokenIconWrap>
  )
}

function aprVariant(farm: FarmPreviewCard): 'live' | 'indexing' | 'coming-soon' | undefined {
  if (farm.status === 'coming-soon') return 'coming-soon'
  if (farm.status === 'indexing') return 'indexing'
  if (farm.displayApr ?? farm.apr) return 'live'
  return undefined
}

function rewardTokenFor(farm: FarmPreviewCard) {
  if (farm.status === 'coming-soon') return RUNTIME_UNAVAILABLE_LABEL
  return farm.rewardToken ?? 'MARCO'
}

function aprDisplay(farm: FarmPreviewCard) {
  if (farm.status === 'finished') return 'Ended'
  const apr = farm.displayApr ?? farm.apr
  if (apr) return apr
  return RUNTIME_UNAVAILABLE_LABEL
}

function formatRewardValue(value: string) {
  if (value === '—') return RUNTIME_UNAVAILABLE_LABEL
  if (value === '0.00') return '0.00'
  if (isUnavailableFarmMetric(value)) return RUNTIME_UNAVAILABLE_LABEL
  return formatCompactDisplay(value.replace(/\s*MARCO\s*$/i, ''))
}

function metricTone(
  value: string,
  preferred?: 'green' | 'gold' | 'muted',
): 'green' | 'gold' | 'muted' | undefined {
  if (value === RUNTIME_UNAVAILABLE_LABEL) return 'muted'
  return preferred
}

function statusMetric(farm: FarmPreviewCard) {
  if (farm.status === 'live') return 'Live'
  if (farm.status === 'indexing') return RUNTIME_UNAVAILABLE_LABEL
  if (farm.status === 'finished') return 'Ended'
  return farm.status
}

export interface FarmGridCardProps {
  farm: FarmPreviewCard
}

export const FarmGridCard: React.FC<FarmGridCardProps> = ({ farm }) => {
  const [expanded, setExpanded] = useState(false)
  const { requestModal, account } = useFarmsRuntime()
  const { chainId } = useActiveChainId()
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
            {expanded ? 'Hide Analysis' : 'Analyze'}
          </CardAnalyzeBtn>
        </Footer>
      )
    }

    return (
      <Footer>
        {account ? (
          <CardStakeBtn type="button" onClick={() => requestModal(farm, 'stake')}>
            Stake
          </CardStakeBtn>
        ) : (
          <CardConnectBtn>Connect Wallet</CardConnectBtn>
        )}
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
          {expanded ? 'Hide Analysis' : 'Analyze'}
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
              {renderTokenIcon(
                farm.tokens[0],
                farm.rawFarm?.token?.address,
                chainId,
              )}
              {renderTokenIcon(
                farm.tokens[1],
                farm.rawFarm?.quoteToken?.address,
                chainId,
                true,
              )}
            </Icons>
            <PairName>{farm.pair}</PairName>
          </PairBlock>
          <StatusPill $tone={farm.status}>
            {farm.status === 'live'
              ? 'Live'
              : farm.status === 'indexing'
                ? 'Unavailable'
                : farm.status === 'finished'
                  ? 'Ended'
                  : 'Pending'}
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
            <MetricValue $tone={metricTone(displayFarmMetric(farm.tvl))}>{displayFarmMetric(farm.tvl)}</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Liquidity</MetricLabel>
            <MetricValue $tone={metricTone(displayFarmMetric(farm.liquidity))}>
              {displayFarmMetric(farm.liquidity)}
            </MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Reward Token</MetricLabel>
            <MetricValue>{rewardTokenFor(farm)}</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Multiplier</MetricLabel>
            <MetricValue $tone={metricTone(displayFarmMetric(farm.multiplier), 'gold')}>
              {displayFarmMetric(farm.multiplier)}
            </MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Daily Rewards</MetricLabel>
            <MetricValue $tone={metricTone(formatRewardValue(farm.dailyRewards), 'green')}>
              {formatRewardValue(farm.dailyRewards)}
            </MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Status</MetricLabel>
            <MetricValue
              $tone={
                farm.status === 'live' ? 'green' : farm.status === 'finished' ? 'muted' : 'muted'
              }
            >
              {statusMetric(farm)}
            </MetricValue>
          </Metric>
        </Metrics>
        ) : null}

        {expanded ? (
          <AnalyzePanel>
            <AnalyzeRow>
              <AnalyzeLabel>APR History</AnalyzeLabel>
              <AnalyzeValue>{displayFarmMetric(preview.aprHistory)}</AnalyzeValue>
            </AnalyzeRow>
            <AnalyzeRow>
              <AnalyzeLabel>Reward Token</AnalyzeLabel>
              <AnalyzeValue>{preview.rewardToken}</AnalyzeValue>
            </AnalyzeRow>
            <AnalyzeRow>
              <AnalyzeLabel>Emission</AnalyzeLabel>
              <AnalyzeValue>{displayFarmMetric(preview.emission)}</AnalyzeValue>
            </AnalyzeRow>
            <AnalyzeRow>
              <AnalyzeLabel>Contract</AnalyzeLabel>
              <AnalyzeValue>
                {preview.contractExplorerUrl && farm.rawFarm?.lpAddress ? (
                  <ContractLink
                    href={preview.contractExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={farm.rawFarm.lpAddress}
                  >
                    {shortenContractAddress(farm.rawFarm.lpAddress)}
                  </ContractLink>
                ) : (
                  displayFarmMetric(preview.contract)
                )}
              </AnalyzeValue>
            </AnalyzeRow>
            {farm.masterChefExplorerUrl ? (
              <AnalyzeRow>
                <AnalyzeLabel>MasterChef</AnalyzeLabel>
                <AnalyzeValue>
                  <ContractLink
                    href={farm.masterChefExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortenContractAddress(getMasterChefAddress(chainId))}
                  </ContractLink>
                </AnalyzeValue>
              </AnalyzeRow>
            ) : null}
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
