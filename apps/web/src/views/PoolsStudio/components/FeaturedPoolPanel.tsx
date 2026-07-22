import React, { useState } from 'react'
import styled from 'styled-components'
import { OpenNewIcon } from '@pancakeswap/uikit'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { buildPoolMachineV2 } from '../poolsRuntime/formatPoolPresentation'
import { isForbiddenAprDisplay } from '../poolsRuntime/poolsAprRules'
import { PsGhostBtn, PsPanel, PsPrimaryBtn, PoolTokenIcon } from './poolsStudioPrimitives'
import FeaturedPoolInfoStack from './FeaturedPoolInfoStack'

const Inner = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 65%) minmax(0, 35%);
  gap: 24px;
  height: 100%;
  min-height: 0;

  @media (max-width: 991px) {
    grid-template-columns: 1fr;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  height: 100%;
`

const Right = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-left: 1px solid ${poolsStudioColors.rowBorder};
  padding-left: 24px;

  @media (max-width: 991px) {
    border-left: none;
    padding-left: 0;
    border-top: 1px solid ${poolsStudioColors.rowBorder};
    padding-top: 20px;
  }
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`

const PoolName = styled.h2`
  margin: 0;
  font-family: Sora, sans-serif;
  font-size: 36px;
  font-weight: 800;
  color: ${poolsStudioColors.text};
  line-height: 1.1;
`

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${poolsStudioColors.aprGreen};
  background: rgba(24, 229, 123, 0.08);
  color: ${poolsStudioColors.aprGreen};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const RewardBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${poolsStudioColors.gold};
  background: ${poolsStudioColors.previewBadgeBg};
  color: ${poolsStudioColors.goldBright};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const FinishedBadge = styled(LiveBadge)`
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.04);
  color: ${poolsStudioColors.muted};
`

const Apr = styled.div`
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
  color: ${poolsStudioColors.aprGreen};
`

const DailyReward = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${poolsStudioColors.secondary};
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const MetricLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${poolsStudioColors.muted};
`

const MetricValue = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${poolsStudioColors.text};
`

const ContractLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: ${poolsStudioColors.goldBright};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
  padding-top: 8px;

  @media (max-width: 767px) {
    position: fixed;
    left: 16px;
    right: 16px;
    bottom: 16px;
    z-index: 20;
    background: ${poolsStudioColors.canvas};
    padding: 8px 0 0;
  }
`

const AnalyzeBlock = styled.div<{ $open: boolean }>`
  overflow: hidden;
  max-height: ${({ $open }) => ($open ? '560px' : '0')};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transition: max-height 250ms ease-in-out, opacity 250ms ease-in-out;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  font-size: 11px;
  color: ${poolsStudioColors.secondary};
  margin-top: 8px;
  padding-top: ${({ $open }) => ($open ? '12px' : '0')};
  border-top: 1px solid ${poolsStudioColors.rowBorder};

  a {
    color: ${poolsStudioColors.goldBright};
    font-weight: 700;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`

const AnalysisGroup = styled.div`
  grid-column: span 2;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${poolsStudioColors.muted};
  margin-top: 4px;
`

const AnalysisCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const LoadingLine = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${poolsStudioColors.muted};
`

const MachineHidden = styled.div`
  display: none;
`

export const FeaturedPoolPanel: React.FC = () => {
  const { featured, loadingLabel, requestModal, account } = usePoolsRuntime()
  const card = featured.card
  const [analyzeOpen, setAnalyzeOpen] = useState(false)
  const preview = card?.analyzePreview
  const isLive = card?.displayStatus === 'LIVE'
  const aprText = isLive && featured.apr && !isForbiddenAprDisplay(featured.apr) ? featured.apr : card ? 'ENDED' : ''
  const currentAprText =
    card?.currentApr && !isForbiddenAprDisplay(card.currentApr) ? card.currentApr : aprText || 'ENDED'
  const machineJson = card ? JSON.stringify(buildPoolMachineV2(card)) : ''

  return (
    <PsPanel
      data-ps-panel
      data-ps-featured
      $height={poolsStudioLayout.featuredHeight}
      $radius="20px"
      style={{ padding: '24px' }}
    >
      {card ? (
        <MachineHidden data-melega-pool-v2={JSON.stringify(buildPoolMachineV2(card))} aria-hidden />
      ) : null}
      <Inner>
        <Left>
          {loadingLabel ? (
            <LoadingLine>{loadingLabel}</LoadingLine>
          ) : !card ? (
            <LoadingLine>No live pools with active rewards. Ended pools are hidden from the grid.</LoadingLine>
          ) : (
            <>
              <TitleRow>
                <PoolTokenIcon symbol={featured.symbol} size={40} />
                <PoolName>{featured.name}</PoolName>
                {isLive ? <LiveBadge>LIVE</LiveBadge> : <FinishedBadge>ENDED</FinishedBadge>}
                {card?.rewardBadge ? <RewardBadge>{card.rewardBadge}</RewardBadge> : null}
              </TitleRow>
              <Apr>{aprText}</Apr>
              <DailyReward>{featured.estimatedDailyReward}</DailyReward>
              <Metrics>
                <Metric>
                  <MetricLabel>Stake Token</MetricLabel>
                  <MetricValue>{featured.stakeToken}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Lock</MetricLabel>
                  <MetricValue>{featured.lockPeriod}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Reward Token</MetricLabel>
                  <MetricValue>{featured.rewardToken}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Cooldown</MetricLabel>
                  <MetricValue>{featured.cooldown}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Pool Type</MetricLabel>
                  <MetricValue>{featured.visualType}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Auto Compound</MetricLabel>
                  <MetricValue>{preview?.autoCompound ?? '—'}</MetricValue>
                </Metric>
              </Metrics>
              <Metric>
                <MetricLabel>Contract</MetricLabel>
                <ContractLink href={featured.explorerUrl} target="_blank" rel="noopener noreferrer">
                  {featured.contractLabel}
                  <OpenNewIcon color={poolsStudioColors.goldBright} width="14px" />
                </ContractLink>
              </Metric>
              <Metric>
                <MetricLabel>Remaining Rewards</MetricLabel>
                <MetricValue>{featured.remainingRewards}</MetricValue>
              </Metric>
              <Metric>
                <MetricLabel>Estimated Duration</MetricLabel>
                <MetricValue>{card?.estimatedDuration ?? '—'}</MetricValue>
              </Metric>
              <Metric>
                <MetricLabel>Current APR</MetricLabel>
                <MetricValue>{currentAprText}</MetricValue>
              </Metric>
              <Metric>
                <MetricLabel>Reward Budget</MetricLabel>
                <MetricValue>{card?.rewardBudgetUsd ?? '—'}</MetricValue>
              </Metric>
              <BtnRow>
                <PsPrimaryBtn
                  type="button"
                  onClick={() => card && requestModal(card, 'stake')}
                  disabled={!account || !card || card.status === 'ended'}
                  style={{
                    width: poolsStudioLayout.featuredStakeBtnWidth,
                    minWidth: poolsStudioLayout.featuredStakeBtnWidth,
                    height: poolsStudioLayout.featuredBtnHeight,
                    minHeight: poolsStudioLayout.featuredBtnHeight,
                  }}
                >
                  Stake
                </PsPrimaryBtn>
                <PsGhostBtn
                  type="button"
                  onClick={() => setAnalyzeOpen((v) => !v)}
                  disabled={!preview}
                  style={{
                    width: poolsStudioLayout.featuredAnalyzeBtnWidth,
                    minWidth: poolsStudioLayout.featuredAnalyzeBtnWidth,
                    height: poolsStudioLayout.featuredBtnHeight,
                    minHeight: poolsStudioLayout.featuredBtnHeight,
                  }}
                >
                  {analyzeOpen ? 'Hide Analysis' : 'Analyze'}
                </PsGhostBtn>
              </BtnRow>
              {analyzeOpen && preview ? (
                <AnalyzeBlock $open={analyzeOpen}>
                  <AnalysisGroup>Rewards</AnalysisGroup>
                  <AnalysisCell><MetricLabel>Reward Budget</MetricLabel>{preview.rewardBudget}</AnalysisCell>
                  <AnalysisCell><MetricLabel>Remaining Rewards</MetricLabel>{preview.remainingRewards}</AnalysisCell>
                  <AnalysisCell><MetricLabel>Daily Emission</MetricLabel>{preview.dailyEmission}</AnalysisCell>
                  <AnalysisCell><MetricLabel>Emission End Estimate</MetricLabel>{preview.emissionEndEstimate}</AnalysisCell>
                  <AnalysisGroup>Performance</AnalysisGroup>
                  <AnalysisCell><MetricLabel>APR History</MetricLabel>{preview.aprHistory}</AnalysisCell>
                  <AnalysisCell><MetricLabel>Reward Sustainability</MetricLabel>{preview.rewardSustainability}</AnalysisCell>
                  <AnalysisCell><MetricLabel>Risk</MetricLabel>{preview.risk}</AnalysisCell>
                  <AnalysisGroup>Contracts</AnalysisGroup>
                  <AnalysisCell>
                    <MetricLabel>Contract Address</MetricLabel>
                    <a href={preview.contractExplorerUrl} target="_blank" rel="noopener noreferrer">View on BscScan</a>
                  </AnalysisCell>
                  <AnalysisCell><MetricLabel>SousChef Address</MetricLabel>{preview.sousChefAddress}</AnalysisCell>
                  <AnalysisGroup>Fees &amp; Settings</AnalysisGroup>
                  <AnalysisCell><MetricLabel>Deposit Fee</MetricLabel>{preview.depositFee}</AnalysisCell>
                  <AnalysisCell><MetricLabel>Withdraw Fee</MetricLabel>{preview.withdrawFee}</AnalysisCell>
                  <AnalysisCell><MetricLabel>Harvest Interval</MetricLabel>{preview.harvestInterval}</AnalysisCell>
                  <AnalysisCell><MetricLabel>Auto Compound</MetricLabel>{preview.autoCompound}</AnalysisCell>
                  <AnalysisCell><MetricLabel>Pool Version</MetricLabel>{preview.poolVersion}</AnalysisCell>
                  <AnalysisCell><MetricLabel>Created</MetricLabel>{preview.created}</AnalysisCell>
                  <AnalysisCell><MetricLabel>Last Updated</MetricLabel>{preview.lastUpdated}</AnalysisCell>
                  <AnalysisGroup>Machine</AnalysisGroup>
                  <AnalysisCell style={{ gridColumn: 'span 2' }}>
                    <MetricLabel>Machine JSON</MetricLabel>
                    <div style={{ fontSize: 10, wordBreak: 'break-all' }}>{machineJson}</div>
                  </AnalysisCell>
                </AnalyzeBlock>
              ) : null}
            </>
          )}
        </Left>
        <Right>
          <FeaturedPoolInfoStack />
        </Right>
      </Inner>
    </PsPanel>
  )
}

export default FeaturedPoolPanel
