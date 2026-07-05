import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { FsGhostBtn, FsPanel, FsPanelTitle, FsPrimaryBtn } from './farmsStudioPrimitives'

const shimmer = keyframes`
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
`

const Inner = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
  height: calc(100% - 46px);
  min-height: 0;
  align-items: stretch;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`

const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`

const Pair = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: ${farmsStudioColors.text};
  line-height: 1;
`

const Apr = styled.div`
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
  color: ${farmsStudioColors.green};

  @media (max-width: 767px) {
    font-size: 40px;
  }
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

const MetricLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${farmsStudioColors.muted};
`

const MetricValue = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${farmsStudioColors.text};
`

const BtnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${farmsStudioLayout.farmCardBtnGap};
  margin-top: auto;
  padding-top: 4px;
`

const ChartWrap = styled.div`
  width: 300px;
  height: 110px;
  margin-left: 12px;
  border-radius: 12px;
  border: 1px solid ${farmsStudioColors.border};
  background: ${farmsStudioColors.panelAlt};
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  filter: brightness(1.04);

  @media (max-width: 767px) {
    width: 100%;
    margin-left: 0;
  }
`

const ChartGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 1;
`

const ChartSvg = styled.svg`
  position: absolute;
  inset: 8px 8px 12px;
  width: calc(100% - 16px);
  height: calc(100% - 20px);
`

const ChartLine = styled.path`
  animation: ${shimmer} 8s ease-in-out infinite;
`

const LoadingLine = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${farmsStudioColors.muted};
`

const ConnectWrap = styled.div`
  button {
    height: 40px !important;
    min-height: 40px !important;
    padding: 0 20px !important;
    border-radius: 12px !important;
  }
`

function sparklinePath(points: number[]): string {
  if (!points.length) return 'M 0 72 L 280 14'
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  return points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 280
      const y = 90 - ((p - min) / range) * 76 - 7
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

export const FeaturedFarmPanel: React.FC = () => {
  const { featured, loadingLabel, requestModal, account } = useFarmsRuntime()
  const card = featured.card
  const [analyzeOpen, setAnalyzeOpen] = useState(false)
  const preview = card?.analyzePreview
  const hasPending = card?.pendingReward?.gt(0)
  const hasStaked = card?.userStaked?.gt(0)
  const linePath = sparklinePath(featured.sparkline)

  return (
    <FsPanel
      data-fs-panel
      data-fs-featured
      $width="100%"
      $height={farmsStudioLayout.featuredHeight}
      style={{ padding: '18px' }}
    >
      <FsPanelTitle style={{ marginBottom: 10 }}>Featured Farm</FsPanelTitle>
      <Inner>
        <Main>
          {loadingLabel ? (
            <LoadingLine>{loadingLabel}</LoadingLine>
          ) : (
            <>
              <Pair>{featured.pair}</Pair>
              <Apr>{featured.apr}</Apr>
              <Metrics>
                <Metric>
                  <MetricLabel>TVL</MetricLabel>
                  <MetricValue>{featured.tvl}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Rewards / day</MetricLabel>
                  <MetricValue>{featured.dailyRewards}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Multiplier</MetricLabel>
                  <MetricValue>{featured.multiplier}</MetricValue>
                </Metric>
              </Metrics>
              <BtnRow>
                {card && account ? (
                  <>
                    <FsPrimaryBtn type="button" onClick={() => requestModal(card, 'stake')}>
                      Stake
                    </FsPrimaryBtn>
                    {hasStaked ? (
                      <FsGhostBtn type="button" onClick={() => requestModal(card, 'unstake')}>
                        Withdraw
                      </FsGhostBtn>
                    ) : null}
                    {hasPending ? (
                      <FsGhostBtn type="button" onClick={() => requestModal(card, 'claim')}>
                        Claim
                      </FsGhostBtn>
                    ) : null}
                  </>
                ) : (
                  <ConnectWrap>
                    <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
                  </ConnectWrap>
                )}
                <FsGhostBtn
                  type="button"
                  onClick={() => setAnalyzeOpen((v) => !v)}
                  disabled={!preview}
                  title={preview ? undefined : 'Analysis unavailable'}
                >
                  {analyzeOpen ? 'Hide Analysis' : 'Analyze'}
                </FsGhostBtn>
              </BtnRow>
              {analyzeOpen && preview ? (
                <div style={{ marginTop: 12, fontSize: 12, color: farmsStudioColors.muted, lineHeight: 1.5 }}>
                  <div>APR History: {preview.aprHistory}</div>
                  <div>Reward Token: {preview.rewardToken}</div>
                  <div>Contract: {preview.contract}</div>
                  <div>Risk: {preview.risk}</div>
                </div>
              ) : null}
            </>
          )}
        </Main>
        <ChartWrap data-fs-mini-chart aria-hidden>
          <ChartGrid />
          <ChartSvg viewBox="0 0 280 90" preserveAspectRatio="none">
            <ChartLine
              d={linePath}
              fill="none"
              stroke={farmsStudioColors.goldBright}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={`${linePath} L 280 90 L 0 90 Z`}
              fill="url(#fsAprFill)"
              opacity="0.18"
            />
            <defs>
              <linearGradient id="fsAprFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={farmsStudioColors.green} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </ChartSvg>
        </ChartWrap>
      </Inner>
    </FsPanel>
  )
}

export default FeaturedFarmPanel
