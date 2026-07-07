import React, { useState } from 'react'
import styled from 'styled-components'
import type { PoolPreviewCard } from '../poolsStudioData'
import { poolsStudioLayout } from '../poolsStudioTokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { buildPoolMachineV2 } from '../poolsRuntime/formatPoolPresentation'
import { isForbiddenAprDisplay } from '../poolsRuntime/poolsAprRules'

const Card = styled.article<{ $expanded?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: ${poolsStudioLayout.poolCardWidth};
  max-width: 100%;
  height: ${({ $expanded }) =>
    $expanded ? poolsStudioLayout.poolCardExpandedHeight : poolsStudioLayout.poolCardHeight};
  min-height: ${({ $expanded }) =>
    $expanded ? poolsStudioLayout.poolCardExpandedHeight : poolsStudioLayout.poolCardHeight};
  max-height: ${({ $expanded }) =>
    $expanded ? poolsStudioLayout.poolCardExpandedHeight : poolsStudioLayout.poolCardHeight};
  padding: 22px;
  padding-bottom: 74px;
  border-radius: 18px;
  background: #141414;
  border: 1px solid rgba(212, 175, 55, 0.18);
  box-sizing: border-box;
  overflow: hidden;
  transition: height 180ms ease-out, box-shadow 180ms ease-out;

  &:hover {
    box-shadow:
      0 0 0 1px rgba(212, 175, 55, 0.35),
      0 12px 28px rgba(0, 0, 0, 0.28);
  }

  @media (max-width: 767px) {
    width: 100%;
    height: ${({ $expanded }) => ($expanded ? '360px' : '244px')};
    min-height: ${({ $expanded }) => ($expanded ? '360px' : '244px')};
    max-height: ${({ $expanded }) => ($expanded ? '360px' : '244px')};
  }
`

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

const AprValue = styled.div`
  font-family: Orbitron, sans-serif;
  font-size: 56px;
  font-weight: 800;
  line-height: 60px;
  color: #19f08a;
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: visible;
  flex-shrink: 0;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 7px;
  height: 28px;
  min-height: 28px;
  max-height: 28px;
  min-width: 0;
  margin-bottom: 10px;
  overflow: hidden;
`

const PoolName = styled.span`
  font-family: Orbitron, sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
  color: #f7f7f7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 185px;
  flex-shrink: 1;
  min-width: 0;
`

const BadgeRow = styled.div`
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
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
  letter-spacing: 1.3px;
  text-transform: uppercase;
  color: #7d7d7d;
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
  overflow: hidden;
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
  overflow: hidden;
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
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 22px;
  display: flex;
  gap: ${poolsStudioLayout.poolCardBtnGap};
  flex-shrink: 0;

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
  const isLive =
    pool.displayStatus === 'LIVE' &&
    pool.status === 'live' &&
    pool.sustainableAprDisplay &&
    !isForbiddenAprDisplay(pool.sustainableAprDisplay)
  const aprText = isLive ? pool.sustainableAprDisplay! : 'Ended'
  const healthScore = pool.healthScore ?? pool.sustainabilityScore ?? 0
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
    >
      <MachineHidden data-melega-pool-v2={machineJson} data-pools-machine-json aria-hidden />

      <CardBody data-ps-card-body>
        <AprValue data-ps-pool-apr>{aprText}</AprValue>

        <TitleRow>
          <PoolName data-ps-pool-name>{pool.name}</PoolName>
          <BadgeRow>
            {isLive ? <Pill $variant="live">LIVE</Pill> : null}
            {rewardBadge ? <Pill $variant={rewardBadge}>{pool.rewardBadge ?? pool.visualType}</Pill> : null}
          </BadgeRow>
        </TitleRow>

        {!analyzeOpen ? (
          <InfoGrid data-ps-collapsed-info>
            <MetricCell>
              <MetricLabel>Reward Token</MetricLabel>
              <MetricValue>{pool.rewardToken}</MetricValue>
            </MetricCell>
            <MetricCell>
              <MetricLabel>Lock Type</MetricLabel>
              <MetricValue>{lockLabel}</MetricValue>
            </MetricCell>
            <MetricCell>
              <MetricLabel>Remaining Rewards</MetricLabel>
              <MetricValue>{pool.remainingRewards ?? preview?.remainingRewards ?? '—'}</MetricValue>
            </MetricCell>
            <HealthCell data-ps-pool-health>
              <MetricLabel>Pool Health</MetricLabel>
              <MetricValue>{healthScore}/100</MetricValue>
              <HealthBarTrack aria-hidden>
                <HealthBarFill $score={healthScore} />
              </HealthBarTrack>
            </HealthCell>
          </InfoGrid>
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
                <MetricLabel>Daily Rewards</MetricLabel>
                <MetricValue>{preview.dailyEmission ?? pool.dailyRewards ?? pool.estimatedDailyReward ?? '—'}</MetricValue>
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
              <MetricCell>
                <MetricLabel>Estimated ROI</MetricLabel>
                <MetricValue>{preview.estimatedRoi ?? '—'}</MetricValue>
              </MetricCell>
              <MetricCell>
                <MetricLabel>Emission/day</MetricLabel>
                <MetricValue>{preview.emission ?? preview.dailyEmission ?? '—'}</MetricValue>
              </MetricCell>
              <MetricCell>
                <MetricLabel>BscScan</MetricLabel>
                {explorerUrl ? (
                  <ChipBtn
                    type="button"
                    onClick={() => window.open(explorerUrl, '_blank', 'noopener,noreferrer')}
                    data-ps-bscscan-btn
                  >
                    BscScan
                  </ChipBtn>
                ) : (
                  <MetricValue>—</MetricValue>
                )}
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
        {isLive ? (
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
