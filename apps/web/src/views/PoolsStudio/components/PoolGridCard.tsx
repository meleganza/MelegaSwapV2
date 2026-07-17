import React, { useState } from 'react'
import styled from 'styled-components'
import type { PoolPreviewCard } from '../poolsStudioData'
import { poolsStudioLayout } from '../poolsStudioTokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { buildPoolMachineV2, resolvePoolMachineRecommendedAction } from '../poolsRuntime/formatPoolPresentation'
import { isForbiddenAprDisplay } from '../poolsRuntime/poolsAprRules'

const Card = styled.article<{ $expanded?: boolean; $ended?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 320px;
  max-width: 380px;
  min-height: 440px;
  padding: 24px;
  gap: 16px;
  border-radius: 18px;
  background: #141414;
  border: 1px solid rgba(212, 175, 55, 0.18);
  box-sizing: border-box;
  overflow: hidden;
  transition: box-shadow 180ms ease-out;

  &:hover {
    box-shadow:
      0 0 0 1px rgba(212, 175, 55, 0.35),
      0 12px 28px rgba(0, 0, 0, 0.28);
  }

  @media (max-width: 767px) {
    min-width: 0;
    max-width: 100%;
    min-height: ${({ $expanded, $ended }) => ($expanded ? 'auto' : $ended ? '360px' : '400px')};
  }
`

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 12px;
`

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
`

const AprValue = styled.div<{ $ended?: boolean }>`
  font-family: Orbitron, sans-serif;
  font-size: ${({ $ended }) => ($ended ? '44px' : 'clamp(32px, 5vw, 48px)')};
  font-weight: 800;
  line-height: 1;
  color: ${({ $ended }) => ($ended ? '#8a8a8a' : '#19f08a')};
  margin: 0 0 ${({ $ended }) => ($ended ? '4px' : '0')};
  flex-shrink: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const TitleRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
`

const PoolName = styled.span`
  font-family: Orbitron, sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.15;
  color: #f7f7f7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
`

const BadgeRow = styled.div`
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  flex-shrink: 0;
`

const Pill = styled.span<{ $variant: 'live' | 'official' | 'partner' | 'community' | 'infrastructure' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: ${({ $variant }) => ($variant === 'live' ? '20px' : '22px')};
  min-width: ${({ $variant }) => ($variant === 'live' ? '42px' : 'auto')};
  padding: 0 10px;
  border-radius: 999px;
  font-family: Inter, sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid
    ${({ $variant }) => {
      if ($variant === 'live') return '#19f08a'
      if ($variant === 'official') return '#d4af37'
      if ($variant === 'partner') return '#4da3ff'
      if ($variant === 'community') return '#a86cff'
      return '#ff9f43'
    }};
  color: ${({ $variant }) => {
    if ($variant === 'live') return '#19f08a'
    if ($variant === 'official') return '#d4af37'
    if ($variant === 'partner') return '#4da3ff'
    if ($variant === 'community') return '#a86cff'
    return '#ff9f43'
  }};
  background: ${({ $variant }) => {
    if ($variant === 'live') return 'rgba(25, 240, 138, 0.12)'
    return 'transparent'
  }};
`

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
  min-height: 0;
`

const MetricCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

const MetricLabel = styled.span`
  font-family: Inter, sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7d7d7d;
  display: block;
  min-width: 0;
  max-width: 100%;
  line-height: 1.3;
  white-space: normal;
  overflow-wrap: break-word;
`

const MetricValue = styled.span`
  font-family: Inter, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #f2f2f2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const HealthCell = styled(MetricCell)`
  gap: 6px;
`

const HealthBarTrack = styled.div`
  width: 64px;
  height: 5px;
  border-radius: 999px;
  background: #2a2a2a;
  overflow: hidden;
  flex-shrink: 0;
`

const HealthBarFill = styled.div<{ $score: number }>`
  height: 100%;
  border-radius: 999px;
  width: ${({ $score }) => `${Math.min(100, Math.max(0, $score))}%`};
  background: ${({ $score }) => {
    if ($score > 80) return '#19f08a'
    if ($score >= 60) return '#f2c94c'
    return '#ff4d4d'
  }};
`

const AnalysisSection = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? 'flex' : 'none')};
  flex-direction: column;
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  padding-top: 14px;
  border-top: 1px solid #262626;
`

const AnalysisHeading = styled.div`
  font-family: Orbitron, sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 18px;
  color: #f7f7f7;
  margin-bottom: 12px;
  flex-shrink: 0;
`

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
  flex: 1;
  min-height: 0;
`

const PrimaryExplorerRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

const ChipBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #d4af37;
  background: rgba(212, 175, 55, 0.06);
  color: #d4af37;
  font-family: Inter, sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  width: fit-content;
  max-width: 100%;

  &:hover {
    box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.35);
  }
`

const ContractValue = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
`

const CopyBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  color: #d4af37;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 11px;
`

const Footer = styled.div`
  display: flex;
  gap: ${poolsStudioLayout.poolCardBtnGap};
  flex-shrink: 0;
  margin-top: auto;
  padding-top: 16px;

  @media (max-width: 767px) {
    flex-direction: column;
  }
`

const PoolBtn = styled.button`
  width: ${poolsStudioLayout.poolCardBtnWidth};
  min-width: ${poolsStudioLayout.poolCardBtnWidth};
  height: ${poolsStudioLayout.poolCardBtnHeight};
  min-height: ${poolsStudioLayout.poolCardBtnHeight};
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #f6d44a 0%, #d4af37 100%);
  color: #080808;
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  flex: 0 0 auto;
  transition: box-shadow 180ms ease-out;

  &:hover {
    box-shadow: 0 0 20px rgba(212, 175, 55, 0.28);
  }

  @media (max-width: 767px) {
    width: 100%;
    min-width: 0;
  }
`

const AnalyzeBtn = styled.button`
  width: ${poolsStudioLayout.poolCardBtnWidth};
  min-width: ${poolsStudioLayout.poolCardBtnWidth};
  height: ${poolsStudioLayout.poolCardBtnHeight};
  min-height: ${poolsStudioLayout.poolCardBtnHeight};
  border: 1px solid #d4af37;
  border-radius: 12px;
  background: transparent;
  color: #d4af37;
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  flex: 0 0 auto;
  transition: box-shadow 180ms ease-out;

  &:hover {
    box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.35);
  }

  @media (max-width: 767px) {
    width: 100%;
    min-width: 0;
  }
`

const MachineHidden = styled.div`
  display: none;
`

const JsonPreview = styled.pre`
  display: none;
  margin: 0;
  padding: 8px;
  border-radius: 8px;
  background: #0d0d0d;
  font-size: 9px;
  line-height: 1.35;
  color: #b8b8b8;
  overflow: auto;
  max-height: 48px;
  grid-column: 1 / -1;

  &[data-open='true'] {
    display: block;
  }
`

function shortenContract(address?: string, label?: string): string {
  if (label && /0x[a-fA-F0-9]{4}/.test(label)) {
    return label.includes('...') ? label : label.replace('…', '...')
  }
  if (!address || address.length < 10) return label ?? '—'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function badgeVariant(badge?: string, visualType?: string): 'official' | 'partner' | 'community' | 'infrastructure' | null {
  const key = (badge ?? visualType ?? '').toLowerCase()
  if (key.includes('official')) return 'official'
  if (key.includes('partner')) return 'partner'
  if (key.includes('community')) return 'community'
  if (key.includes('infrastructure')) return 'infrastructure'
  return null
}

interface Props {
  pool: PoolPreviewCard
}

export const PoolGridCard: React.FC<Props> = ({ pool }) => {
  const [analyzeOpen, setAnalyzeOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [jsonOpen, setJsonOpen] = useState(false)
  const { requestModal } = usePoolsRuntime()
  const { chainId } = useActiveChainId()
  const preview = pool.analyzePreview
  const isRewarding = Boolean(pool.lifecycle?.rewarding)
  const isEnded = pool.status === 'ended' || pool.lifecycle?.finished
  /** Canonical card presentation status — drives ended badge / Official / health visibility. */
  const isDisplayEnded = pool.displayStatus === 'ENDED'
  const recommendedAction = resolvePoolMachineRecommendedAction(pool)
  const showEndedViewDetails = isDisplayEnded && recommendedAction === 'none'
  const isLive =
    isRewarding &&
    pool.sustainableAprDisplay &&
    !isForbiddenAprDisplay(pool.sustainableAprDisplay)
  const aprText = isLive
    ? pool.sustainableAprDisplay!
    : isRewarding
      ? 'Rewards Active'
      : isEnded
        ? 'ENDED'
        : '—'
  const healthScore = pool.healthScore ?? pool.sustainabilityScore ?? 0
  const showHealth = !isDisplayEnded && healthScore > 0
  const showRemainingRewards =
    !isEnded &&
    pool.remainingRewards &&
    pool.remainingRewards !== '—' &&
    pool.remainingRewards !== 'Unavailable'
  const lockLabel = pool.lockPeriod ?? pool.visualType ?? pool.poolTypeLabel ?? '—'
  const duration = pool.estimatedDuration ?? preview?.duration ?? preview?.emissionEndEstimate ?? '—'
  const contractShort = shortenContract(pool.contractAddress, pool.contractLabel ?? preview?.contract)
  const explorerUrl = preview?.contractExplorerUrl ?? pool.explorerUrl
  const rewardBadge = badgeVariant(pool.rewardBadge, pool.visualType)
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
      data-r717-pool-card
      data-r718-pool-card
      $expanded={analyzeOpen}
      $ended={isEnded}
    >
      <MachineHidden data-melega-pool-v2={machineJson} data-pools-machine-json aria-hidden />

      <CardBody data-ps-card-body>
        <HeaderRow>
          <TitleRow>
            <PoolName data-ps-pool-name>{pool.name}</PoolName>
            <BadgeRow data-ps-lifecycle-badges>
              {isDisplayEnded ? (
                <Pill $variant="community" data-ps-lifecycle-badge>
                  ENDED
                </Pill>
              ) : isRewarding ? (
                <Pill $variant="live" data-ps-lifecycle-badge>
                  LIVE
                </Pill>
              ) : null}
              {rewardBadge && !isDisplayEnded ? (
                <Pill $variant={rewardBadge} data-ps-product-badge>
                  {pool.rewardBadge ?? pool.visualType}
                </Pill>
              ) : null}
            </BadgeRow>
          </TitleRow>
        </HeaderRow>

        {!isEnded ? (
          <AprValue data-ps-pool-apr $ended={!isLive}>
            {aprText}
          </AprValue>
        ) : null}

        {!analyzeOpen ? (
          <InfoGrid data-ps-collapsed-info>
            <MetricCell>
              <MetricLabel data-ps-stake-token-label>Stake Token</MetricLabel>
              <MetricValue data-ps-stake-token-value>{pool.stakeToken ?? pool.name?.split(' ')[0] ?? '—'}</MetricValue>
            </MetricCell>
            <MetricCell>
              <MetricLabel data-ps-reward-token-label>Reward Token</MetricLabel>
              <MetricValue data-ps-reward-token-value>{pool.rewardToken}</MetricValue>
            </MetricCell>
            <MetricCell>
              <MetricLabel>Lock Type</MetricLabel>
              <MetricValue>{lockLabel}</MetricValue>
            </MetricCell>
            {showRemainingRewards ? (
              <MetricCell>
                <MetricLabel>Remaining Rewards</MetricLabel>
                <MetricValue>{pool.remainingRewards ?? preview?.remainingRewards}</MetricValue>
              </MetricCell>
            ) : showHealth ? (
              <HealthCell data-ps-pool-health>
                <MetricLabel>Pool Health</MetricLabel>
                <MetricValue>{healthScore}/100</MetricValue>
                <HealthBarTrack aria-hidden>
                  <HealthBarFill $score={healthScore} />
                </HealthBarTrack>
              </HealthCell>
            ) : isEnded && duration !== '—' ? (
              <MetricCell>
                <MetricLabel>Duration</MetricLabel>
                <MetricValue>{duration}</MetricValue>
              </MetricCell>
            ) : null}
          </InfoGrid>
        ) : null}

        {explorerUrl ? (
          <PrimaryExplorerRow data-ps-primary-explorer>
            <MetricLabel>Explorer</MetricLabel>
            <ChipBtn
              type="button"
              onClick={() => window.open(explorerUrl, '_blank', 'noopener,noreferrer')}
              data-ps-bscscan-btn
              data-ps-explorer-url={explorerUrl}
              aria-label="View contract on BscScan"
            >
              BscScan
            </ChipBtn>
          </PrimaryExplorerRow>
        ) : null}

        {preview ? (
          <AnalysisSection $open={analyzeOpen} data-ps-pool-analyze-panel>
            <AnalysisHeading>Pool Analysis</AnalysisHeading>
            <AnalysisGrid>
              <MetricCell>
                <MetricLabel>Duration</MetricLabel>
                <MetricValue>{duration}</MetricValue>
              </MetricCell>
              <MetricCell>
                <MetricLabel>Contract</MetricLabel>
                <ContractValue>
                  <MetricValue>{contractShort}</MetricValue>
                  {pool.contractAddress ? (
                    <CopyBtn type="button" onClick={copyContract} title="Copy" aria-label="Copy contract">
                      {copied ? '✓' : '⧉'}
                    </CopyBtn>
                  ) : null}
                </ContractValue>
              </MetricCell>
              <MetricCell>
                <MetricLabel>Cooldown</MetricLabel>
                <MetricValue>{pool.cooldown ?? '—'}</MetricValue>
              </MetricCell>
              {!isDisplayEnded ? (
                <MetricCell data-ps-estimated-roi>
                  <MetricLabel>Estimated ROI</MetricLabel>
                  <MetricValue>{preview.estimatedRoi ?? '—'}</MetricValue>
                </MetricCell>
              ) : null}
              <MetricCell>
                <MetricLabel>Emission/day</MetricLabel>
                <MetricValue data-ps-emission-value>
                  {preview.emission ?? preview.dailyEmission ?? '—'}
                </MetricValue>
              </MetricCell>
              <MetricCell>
                <MetricLabel>Machine</MetricLabel>
                <ChipBtn type="button" onClick={() => setJsonOpen((v) => !v)} data-ps-machine-json-btn>
                  Machine JSON
                </ChipBtn>
              </MetricCell>
              <JsonPreview data-open={jsonOpen ? 'true' : 'false'} data-ps-machine-json-preview>
                {machineJson}
              </JsonPreview>
            </AnalysisGrid>
          </AnalysisSection>
        ) : null}
      </CardBody>

      <Footer data-ps-card-footer>
        {isRewarding ? (
          <>
            <PoolBtn type="button" onClick={() => requestModal(pool, 'stake')} data-ps-stake-btn>
              Stake
            </PoolBtn>
            <AnalyzeBtn
              type="button"
              data-ps-analyze-toggle
              onClick={() => {
                setAnalyzeOpen((v) => {
                  if (v) setJsonOpen(false)
                  return !v
                })
              }}
            >
              {analyzeOpen ? 'Hide Analysis' : 'Analyze'}
            </AnalyzeBtn>
          </>
        ) : showEndedViewDetails ? (
          <AnalyzeBtn
            type="button"
            data-ps-analyze-toggle
            data-ps-ended-details-cta
            style={{ width: '100%', minWidth: 0 }}
            onClick={() => {
              setAnalyzeOpen((v) => {
                if (v) setJsonOpen(false)
                return !v
              })
            }}
          >
            {analyzeOpen ? 'Hide Analysis' : 'View Details'}
          </AnalyzeBtn>
        ) : (
          <AnalyzeBtn disabled style={{ width: '100%', minWidth: 0 }}>
            Ended
          </AnalyzeBtn>
        )}
      </Footer>
    </Card>
  )
}

export default PoolGridCard
