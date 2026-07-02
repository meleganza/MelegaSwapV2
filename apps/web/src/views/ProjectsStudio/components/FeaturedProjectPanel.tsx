import React from 'react'
import styled, { keyframes } from 'styled-components'
import { projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'
import { PrGhostBtn, PrMetricLabel, PrMetricValue, PrPanel, PrPrimaryBtn, ProjectLogo } from './projectsStudioPrimitives'

const shimmer = keyframes`
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
`

const Inner = styled.div`
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
  height: calc(100% - 8px);
  min-height: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`

const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`

const Name = styled.h2`
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: ${projectsStudioColors.text};
`

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(0, 230, 118, 0.1);
  border: 1px solid ${projectsStudioColors.green};
  color: ${projectsStudioColors.green};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Tag = styled.span`
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${projectsStudioColors.borderStrong};
  font-size: 11px;
  font-weight: 700;
  color: ${projectsStudioColors.secondary};
  display: inline-flex;
  align-items: center;
`

const Desc = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${projectsStudioColors.summary};
  max-width: 520px;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1099px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
  flex-wrap: wrap;
`

const ChartWrap = styled.div`
  border-radius: 14px;
  border: 1px solid ${projectsStudioColors.border};
  background: ${projectsStudioColors.panel};
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
`

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`

const Price = styled.span`
  font-size: 22px;
  font-weight: 800;
  color: ${projectsStudioColors.text};
`

const Change = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${projectsStudioColors.green};
`

const ChartSvg = styled.svg`
  width: 100%;
  height: 120px;
  flex: 1;
`

const ChartLine = styled.path`
  animation: ${shimmer} 8s ease-in-out infinite;
`

const Timeframes = styled.div`
  display: flex;
  gap: 6px;
`

const Tf = styled.button<{ $active?: boolean }>`
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid ${({ $active }) => ($active ? projectsStudioColors.gold : projectsStudioColors.borderStrong)};
  background: ${({ $active }) => ($active ? projectsStudioColors.goldBg : 'transparent')};
  color: ${({ $active }) => ($active ? projectsStudioColors.gold : projectsStudioColors.muted)};
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
`

export const FeaturedProjectPanel: React.FC = () => (
  <PrPanel data-pr-panel data-pr-featured $height={projectsStudioLayout.featuredHeight} style={{ padding: '22px' }}>
    <Inner>
      <Main>
        <TitleRow>
          <ProjectLogo name="MARCO" symbol="MARCO" size={48} />
          <Name>MARCO</Name>
          <VerifiedBadge>Verified</VerifiedBadge>
        </TitleRow>
        <Tags>
          <Tag>DEX</Tag>
          <Tag>DeFi</Tag>
          <Tag>AI Integrated</Tag>
          <Tag>BNB Chain</Tag>
        </Tags>
        <Desc>
          Melega native coordination token powering swap, liquidity, farms, and pools across the Melega DEX ecosystem.
        </Desc>
        <Metrics>
          <Metric>
            <PrMetricLabel>Holders</PrMetricLabel>
            <PrMetricValue>186.4K</PrMetricValue>
          </Metric>
          <Metric>
            <PrMetricLabel>Liquidity</PrMetricLabel>
            <PrMetricValue $tone="green">
              $3.21M
            </PrMetricValue>
          </Metric>
          <Metric>
            <PrMetricLabel>FDV</PrMetricLabel>
            <PrMetricValue>$12.48M</PrMetricValue>
          </Metric>
          <Metric>
            <PrMetricLabel>Volume 24h</PrMetricLabel>
            <PrMetricValue $tone="green">
              $1.28M
            </PrMetricValue>
          </Metric>
          <Metric>
            <PrMetricLabel>Age</PrMetricLabel>
            <PrMetricValue $tone="gray">
              312 Days
            </PrMetricValue>
          </Metric>
        </Metrics>
        <BtnRow>
          <PrPrimaryBtn type="button">Trade MARCO</PrPrimaryBtn>
          <PrGhostBtn type="button">Open Project</PrGhostBtn>
          <PrGhostBtn type="button">☆ Follow</PrGhostBtn>
        </BtnRow>
      </Main>
      <ChartWrap aria-hidden>
        <PriceRow>
          <Price>$0.0004</Price>
          <Change>+2.35%</Change>
        </PriceRow>
        <ChartSvg viewBox="0 0 260 120" preserveAspectRatio="none">
          <ChartLine
            d="M 0 95 L 30 82 L 60 88 L 90 62 L 120 72 L 150 48 L 180 56 L 210 38 L 240 44 L 260 28"
            fill="none"
            stroke={projectsStudioColors.green}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 0 95 L 30 82 L 60 88 L 90 62 L 120 72 L 150 48 L 180 56 L 210 38 L 240 44 L 260 28 L 260 120 L 0 120 Z"
            fill="url(#prChartFill)"
            opacity="0.15"
          />
          <defs>
            <linearGradient id="prChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={projectsStudioColors.green} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </ChartSvg>
        <Timeframes>
          {['1D', '7D', '1M', '3M', '1Y'].map((tf, i) => (
            <Tf key={tf} type="button" $active={i === 1}>
              {tf}
            </Tf>
          ))}
        </Timeframes>
      </ChartWrap>
    </Inner>
  </PrPanel>
)

export default FeaturedProjectPanel
