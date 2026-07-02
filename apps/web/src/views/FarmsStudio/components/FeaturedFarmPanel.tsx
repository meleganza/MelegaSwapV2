import React from 'react'
import styled, { keyframes } from 'styled-components'
import { farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'
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
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  gap: 10px;
  margin-top: auto;
`

const ChartWrap = styled.div`
  width: 300px;
  height: 110px;
  border-radius: 12px;
  border: 1px solid ${farmsStudioColors.border};
  background: ${farmsStudioColors.panelAlt};
  position: relative;
  overflow: hidden;
  flex-shrink: 0;

  @media (max-width: 767px) {
    width: 100%;
  }
`

const ChartGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 24px 24px;
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

export const FeaturedFarmPanel: React.FC = () => (
  <FsPanel
    data-fs-panel
    data-fs-featured
    $width={farmsStudioLayout.featuredWidth}
    $height={farmsStudioLayout.featuredHeight}
  >
    <FsPanelTitle style={{ marginBottom: 10 }}>Featured Farm</FsPanelTitle>
    <Inner>
      <Main>
        <Pair>MARCO / BNB</Pair>
        <Apr>36.08%</Apr>
        <Metrics>
          <Metric>
            <MetricLabel>TVL</MetricLabel>
            <MetricValue>$3.21M</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Rewards / day</MetricLabel>
            <MetricValue>42,000 MARCO</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Multiplier</MetricLabel>
            <MetricValue>3x</MetricValue>
          </Metric>
        </Metrics>
        <BtnRow>
          <FsPrimaryBtn type="button">Stake</FsPrimaryBtn>
          <FsGhostBtn type="button">Details</FsGhostBtn>
        </BtnRow>
      </Main>
      <ChartWrap data-fs-mini-chart aria-hidden>
        <ChartGrid />
        <ChartSvg viewBox="0 0 280 90" preserveAspectRatio="none">
          <ChartLine
            d="M 0 72 L 40 58 L 80 64 L 120 38 L 160 48 L 200 22 L 240 30 L 280 14"
            fill="none"
            stroke={farmsStudioColors.goldBright}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 0 72 L 40 58 L 80 64 L 120 38 L 160 48 L 200 22 L 240 30 L 280 14 L 280 90 L 0 90 Z"
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

export default FeaturedFarmPanel
