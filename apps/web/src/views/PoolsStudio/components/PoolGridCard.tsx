import React, { useState } from 'react'
import styled from 'styled-components'
import type { PoolPreviewCard } from '../poolsStudioData'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { buildPoolMachineV2 } from '../poolsRuntime/formatPoolPresentation'
import { isForbiddenAprDisplay } from '../poolsRuntime/poolsAprRules'
import { PoolTokenIcon, PsMetricLabel, PsSmallGhostBtn, PsSmallPrimaryBtn } from './poolsStudioPrimitives'

const Card = styled.article<{ $expanded?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: ${poolsStudioLayout.poolCardWidth};
  max-width: 100%;
  min-height: ${poolsStudioLayout.poolCardHeight};
  height: ${({ $expanded }) =>
    $expanded ? poolsStudioLayout.poolCardExpandedHeight : poolsStudioLayout.poolCardHeight};
  max-height: ${({ $expanded }) =>
    $expanded ? poolsStudioLayout.poolCardExpandedHeight : poolsStudioLayout.poolCardHeight};
  padding: 16px;
  border-radius: ${poolsStudioLayout.cardRadius};
  background: ${poolsStudioColors.card};
  border: 1px solid ${poolsStudioColors.border};
  box-sizing: border-box;
  overflow: hidden;
  transition: height ${poolsStudioLayout.drawerTransition} ease, transform ${poolsStudioLayout.hoverTransition} ease,
    border-color ${poolsStudioLayout.hoverTransition} ease;

  &:hover {
    border-color: ${poolsStudioColors.cardBorderHover};
  }
`

const AprValue = styled.div`
  font-family: Orbitron, sans-serif;
  font-size: 40px;
  font-weight: 800;
  line-height: 1;
  color: ${poolsStudioColors.aprGreen};
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const NameBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  margin-bottom: 8px;
`

const PoolName = styled.span`
  font-family: Orbitron, sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: ${poolsStudioColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 190px;
`

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  padding: 0 7px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 1px solid ${poolsStudioColors.aprGreen};
  color: ${poolsStudioColors.aprGreen};
  background: ${poolsStudioColors.greenSoft};
  flex-shrink: 0;
`

const InfoGrid = styled.div<{ $hidden?: boolean }>`
  display: ${({ $hidden }) => ($hidden ? 'none' : 'grid')};
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 8px;
  flex: 1;
  min-height: 0;
`

const MetricValue = styled.span`
  font-family: Inter, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: ${poolsStudioColors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const MetricCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`

const HealthValue = styled(MetricValue)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`

const Footer = styled.div`
  display: flex;
  gap: ${poolsStudioLayout.poolCardBtnGap};
  margin-top: auto;
  padding-top: 8px;
  justify-content: flex-start;
`

const PoolBtn = styled(PsSmallPrimaryBtn)`
  width: ${poolsStudioLayout.poolCardBtnWidth};
  min-width: ${poolsStudioLayout.poolCardBtnWidth};
  height: ${poolsStudioLayout.poolCardBtnHeight};
  min-height: ${poolsStudioLayout.poolCardBtnHeight};
  flex: 0 0 auto;
  font-size: 13px;
  border-radius: ${poolsStudioLayout.poolCardBtnRadius};
`

const AnalyzeBtn = styled(PsSmallGhostBtn)`
  width: ${poolsStudioLayout.poolCardBtnWidth};
  min-width: ${poolsStudioLayout.poolCardBtnWidth};
  height: ${poolsStudioLayout.poolCardBtnHeight};
  min-height: ${poolsStudioLayout.poolCardBtnHeight};
  flex: 0 0 auto;
  font-size: 13px;
  border-radius: ${poolsStudioLayout.poolCardBtnRadius};
`

const AnalyzeBlock = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? 'grid' : 'none')};
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 10px;
  flex: 1;
  min-height: 0;
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px solid ${poolsStudioColors.rowBorder};
  font-size: 11px;
  color: ${poolsStudioColors.subtitle};
  overflow: hidden;

  a,
  button {
    color: ${poolsStudioColors.gold};
    font-weight: 600;
    text-decoration: none;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 11px;
    text-align: left;
    word-break: break-all;
  }
`

const DrawerLabel = styled.span`
  display: block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: ${poolsStudioColors.muted};
  margin-bottom: 2px;
`

const MachineHidden = styled.div`
  display: none;
`

interface Props {
  pool: PoolPreviewCard
}

export const PoolGridCard: React.FC<Props> = ({ pool }) => {
  const [analyzeOpen, setAnalyzeOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { requestModal } = usePoolsRuntime()
  const { chainId } = useActiveChainId()
  const preview = pool.analyzePreview
  const isLive =
    pool.displayStatus === 'LIVE' &&
    pool.status === 'live' &&
    pool.sustainableAprDisplay &&
    !isForbiddenAprDisplay(pool.sustainableAprDisplay)
  const aprText = isLive ? pool.sustainableAprDisplay! : 'Ended'
  const healthScore = pool.healthScore ?? pool.sustainabilityScore ?? 0
  const lockType = pool.visualType ?? pool.poolTypeLabel ?? '—'
  const duration = pool.estimatedDuration ?? preview?.duration ?? pool.lockPeriod ?? '—'
  const machineJson = JSON.stringify(buildPoolMachineV2(pool, chainId))

  const copyContract = async () => {
    if (!pool.contractAddress) return
    try {
      await navigator.clipboard.writeText(pool.contractAddress)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <Card
      data-ps-pool-card
      data-pool-card
      data-pool-status={pool.displayStatus}
      data-pool-apr-status={pool.aprDisplayReason}
      data-pool-contract={pool.contractAddress}
      data-r708-pool-card
      $expanded={analyzeOpen}
    >
      <MachineHidden data-melega-pool-v2={machineJson} data-pools-machine-json aria-hidden />
      <AprValue data-ps-pool-apr>{aprText}</AprValue>

      <NameBlock>
        <PoolTokenIcon symbol={pool.tokens[0] ?? 'MARCO'} size={20} />
        <PoolName>{pool.name}</PoolName>
        {isLive ? <LiveBadge>LIVE</LiveBadge> : null}
      </NameBlock>

      <InfoGrid $hidden={analyzeOpen}>
        <MetricCell>
          <PsMetricLabel>Reward Token</PsMetricLabel>
          <MetricValue>{pool.rewardToken}</MetricValue>
        </MetricCell>
        <MetricCell>
          <PsMetricLabel>Lock Type</PsMetricLabel>
          <MetricValue>{lockType}</MetricValue>
        </MetricCell>
        <MetricCell>
          <PsMetricLabel>Duration</PsMetricLabel>
          <MetricValue>{duration}</MetricValue>
        </MetricCell>
        <MetricCell>
          <PsMetricLabel>Daily Rewards</PsMetricLabel>
          <MetricValue>{preview?.dailyEmission ?? pool.dailyRewards ?? pool.estimatedDailyReward ?? '—'}</MetricValue>
        </MetricCell>
        <MetricCell>
          <PsMetricLabel>Remaining Rewards</PsMetricLabel>
          <MetricValue>{pool.remainingRewards ?? preview?.remainingRewards ?? '—'}</MetricValue>
        </MetricCell>
        <MetricCell>
          <PsMetricLabel>Pool Health</PsMetricLabel>
          <HealthValue>
            <span aria-hidden>🛡</span>
            {healthScore} / 100
          </HealthValue>
        </MetricCell>
      </InfoGrid>

      {preview && analyzeOpen ? (
        <AnalyzeBlock $open={analyzeOpen} data-ps-pool-analyze-panel>
          <div>
            <DrawerLabel>Contract</DrawerLabel>
            {pool.contractLabel ?? preview.contract}
          </div>
          <div>
            <DrawerLabel>Copy</DrawerLabel>
            <button type="button" onClick={copyContract}>
              {copied ? 'Copied' : 'Copy contract'}
            </button>
          </div>
          <div>
            <DrawerLabel>Open BscScan</DrawerLabel>
            {preview.contractExplorerUrl ? (
              <a href={preview.contractExplorerUrl} target="_blank" rel="noopener noreferrer">
                View on BscScan
              </a>
            ) : (
              '—'
            )}
          </div>
          <div>
            <DrawerLabel>Reward Budget</DrawerLabel>
            {pool.rewardBudgetUsd ?? preview.rewardBudget}
          </div>
          <div>
            <DrawerLabel>Emission</DrawerLabel>
            {preview.emission ?? preview.dailyEmission}
          </div>
          <div>
            <DrawerLabel>Remaining Rewards</DrawerLabel>
            {preview.remainingRewards ?? pool.remainingRewards ?? '—'}
          </div>
          <div>
            <DrawerLabel>Estimated duration</DrawerLabel>
            {pool.estimatedDuration ?? preview.emissionEndEstimate ?? preview.duration ?? '—'}
          </div>
          <div>
            <DrawerLabel>Participants</DrawerLabel>
            {pool.participants}
          </div>
          <div>
            <DrawerLabel>Auto Compound</DrawerLabel>
            {preview.autoCompound}
          </div>
          <div>
            <DrawerLabel>Withdrawal fee</DrawerLabel>
            {preview.withdrawFee}
          </div>
          <div>
            <DrawerLabel>Cooldown</DrawerLabel>
            {pool.cooldown ?? '—'}
          </div>
        </AnalyzeBlock>
      ) : null}

      <Footer>
        {isLive ? (
          <>
            <PoolBtn type="button" onClick={() => requestModal(pool, 'stake')} data-ps-stake-btn>
              Stake
            </PoolBtn>
            <AnalyzeBtn
              type="button"
              data-ps-analyze-toggle
              onClick={() => setAnalyzeOpen((v) => !v)}
            >
              {analyzeOpen ? 'Hide Analysis' : 'Analyze'}
            </AnalyzeBtn>
          </>
        ) : (
          <AnalyzeBtn disabled style={{ width: '100%' }}>
            Ended
          </AnalyzeBtn>
        )}
      </Footer>
    </Card>
  )
}

export default PoolGridCard
