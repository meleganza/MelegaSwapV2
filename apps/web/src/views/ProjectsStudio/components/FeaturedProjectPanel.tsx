import React from 'react'
import styled, { keyframes } from 'styled-components'
import { projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
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
  grid-template-columns: repeat(5, minmax(88px, 1fr));
  gap: 14px 16px;

  @media (max-width: 1099px) {
    grid-template-columns: repeat(3, minmax(88px, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

const BtnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid ${projectsStudioColors.rowBorder};

  a,
  button {
    flex: 0 1 auto;
    min-height: ${projectsStudioLayout.btnHeight};
  }

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;

    a,
    button {
      width: 100%;
    }
  }
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
  color: ${projectsStudioColors.muted};
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

const UnavailableChart = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: ${projectsStudioColors.muted};
  min-height: 120px;
`

export const FeaturedProjectPanel: React.FC = () => {
  const { featured } = useProjectsRuntime()

  return (
    <PrPanel data-pr-panel data-pr-featured $height={projectsStudioLayout.featuredHeight} style={{ padding: '22px' }}>
      <Inner>
        <Main>
          <TitleRow>
            <ProjectLogo name={featured.name} symbol={featured.symbol} size={48} />
            <Name>{featured.name}</Name>
            {featured.verified ? <VerifiedBadge>Verified</VerifiedBadge> : null}
          </TitleRow>
          <Tags>
            {featured.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Tags>
          <Desc>{featured.description}</Desc>
          <Metrics>
            {featured.metrics.map((metric) => (
              <Metric key={metric.label}>
                <PrMetricLabel>{metric.label}</PrMetricLabel>
                <PrMetricValue $tone={metric.tone}>{metric.value}</PrMetricValue>
              </Metric>
            ))}
          </Metrics>
          <BtnRow>
            <PrPrimaryBtn as="a" href={featured.tradeHref ?? '/swap'}>
              Trade {featured.symbol}
            </PrPrimaryBtn>
            <PrGhostBtn as="a" href={featured.projectHref}>
              Open Project
            </PrGhostBtn>
            {featured.radarHref ? (
              <PrGhostBtn as="a" href={featured.radarHref}>
                Radar
              </PrGhostBtn>
            ) : null}
            {featured.spaceUrl ? (
              <PrGhostBtn as="a" href={featured.spaceUrl} target="_blank" rel="noopener noreferrer">
                Professional Audit
              </PrGhostBtn>
            ) : null}
          </BtnRow>
        </Main>
        <ChartWrap aria-hidden={!featured.hasPriceData}>
          <PriceRow>
            <Price>{featured.hasPriceData ? featured.price : 'Unavailable'}</Price>
            <Change>{featured.hasPriceData ? featured.priceChange : ''}</Change>
          </PriceRow>
          {featured.hasPriceData ? (
            <>
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
            </>
          ) : (
            <UnavailableChart>Price chart unavailable</UnavailableChart>
          )}
        </ChartWrap>
      </Inner>
    </PrPanel>
  )
}

export default FeaturedProjectPanel
