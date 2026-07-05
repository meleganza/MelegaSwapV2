import React, { useState } from 'react'
import styled from 'styled-components'
import { PR_FONT_BODY, projectsStudioColors, projectsStudioLayout, projectsStudioType } from '../projectsStudioTokens'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
import {
  PrFeaturedOutlineBtn,
  PrFeaturedOutlineBtnDisabled,
  PrFeaturedPrimaryBtn,
  PrMetricLabel,
  PrMetricValue,
  PrPanel,
  ProjectLogo,
} from './projectsStudioPrimitives'

const Panel = styled(PrPanel)`
  height: ${projectsStudioLayout.featuredHeight};
  padding: 24px;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: ${projectsStudioLayout.mobileBreakpoint}) {
    height: auto;
    overflow: visible;
  }
`

const Inner = styled.div`
  display: grid;
  grid-template-columns: ${projectsStudioLayout.featuredSplitLeft} ${projectsStudioLayout.featuredSplitRight};
  gap: ${projectsStudioLayout.cardGap};
  height: 100%;
  min-height: 0;

  @media (max-width: ${projectsStudioLayout.mobileBreakpoint}) {
    grid-template-columns: 1fr;
    height: auto;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  min-height: 0;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`

const Name = styled.h2`
  margin: 0;
  font-family: ${PR_FONT_BODY};
  font-size: ${projectsStudioType.featuredName};
  font-weight: 700;
  line-height: 1.05;
  color: ${projectsStudioColors.text};
`

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border-radius: 13px;
  background: rgba(27, 231, 122, 0.08);
  border: 1px solid ${projectsStudioColors.green};
  color: ${projectsStudioColors.green};
  font-family: ${PR_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const Tags = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow: hidden;
`

const Tag = styled.span`
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${projectsStudioColors.cardBorder};
  font-family: ${PR_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  color: ${projectsStudioColors.secondary};
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
`

const Summary = styled.p`
  margin: 0;
  font-family: ${PR_FONT_BODY};
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  color: ${projectsStudioColors.summary};
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${projectsStudioLayout.featuredMetricGapY} ${projectsStudioLayout.featuredMetricGapX};
`

const Metric = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const BtnRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${projectsStudioLayout.featuredBtnGap};
  margin-top: auto;
  padding-top: ${projectsStudioLayout.featuredActionGroupMarginTop};
  width: 100%;

  @media (max-width: ${projectsStudioLayout.mobileBreakpoint}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: ${projectsStudioLayout.featuredBtnGap};
    row-gap: ${projectsStudioLayout.featuredMobileBtnRowGap};
  }
`

const Right = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  min-width: 0;
`

const Price = styled.div`
  font-family: ${PR_FONT_BODY};
  font-size: ${projectsStudioType.featuredPrice};
  font-weight: 700;
  line-height: 1;
  color: ${projectsStudioColors.text};
`

const ChartBox = styled.div`
  flex: 1;
  min-height: 0;
  border-radius: 16px;
  border: 1px solid ${projectsStudioColors.cardBorder};
  background: ${projectsStudioColors.chartBg};
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
`

const ChartArea = styled.div`
  height: ${projectsStudioLayout.featuredChartHeight};
  min-height: ${projectsStudioLayout.featuredChartHeight};
  display: flex;
  flex-direction: column;

  @media (max-width: ${projectsStudioLayout.mobileBreakpoint}) {
    height: ${projectsStudioLayout.featuredChartHeightMobile};
    min-height: ${projectsStudioLayout.featuredChartHeightMobile};
  }
`

const ChartSvg = styled.svg`
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 0;
`

const Timeframes = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
`

const Tf = styled.button<{ $active?: boolean }>`
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? projectsStudioColors.gold : projectsStudioColors.cardBorder)};
  background: ${({ $active }) => ($active ? projectsStudioColors.goldBg : 'transparent')};
  color: ${({ $active }) => ($active ? projectsStudioColors.gold : projectsStudioColors.muted)};
  font-family: ${PR_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`

const ChartPlaceholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${PR_FONT_BODY};
  font-size: 13px;
  color: ${projectsStudioColors.muted};
  height: 100%;
`

function metricValue(
  metrics: { label: string; value: string; tone?: string }[],
  label: string,
  fallback = '—',
) {
  const found = metrics.find((m) => m.label.toLowerCase().includes(label.toLowerCase()))
  return found?.value ?? fallback
}

export const FeaturedProjectPanel: React.FC = () => {
  const { featured, projects } = useProjectsRuntime()
  const [timeframe, setTimeframe] = useState(1)
  const card = projects.find((p) => p.slug === featured.slug)

  const rowOne = [
    { label: 'Holders', value: metricValue(featured.metrics, 'Holders') },
    { label: 'Liquidity', value: metricValue(featured.metrics, 'Liquidity') },
    { label: 'FDV', value: metricValue(featured.metrics, 'FDV') },
    { label: '24h Volume', value: metricValue(featured.metrics, 'Volume') },
  ]
  const rowTwo = [
    { label: 'Age', value: metricValue(featured.metrics, 'Age'), muted: true },
    { label: 'Risk', value: card?.risk ?? '—', muted: !card || card.risk === '—' || card.risk === 'Unavailable' },
    { label: 'Audit', value: metricValue(featured.metrics, 'Audit', card?.metrics.find((m) => m.label === 'Audit')?.value ?? '—'), muted: true },
    { label: 'Website', value: card?.website ?? '—', muted: !card || card.website === '—' || card.website === 'Unavailable' },
  ]
  const metrics = [...rowOne, ...rowTwo]

  return (
    <Panel data-pr-featured>
      <Inner>
        <Left>
          <TitleRow>
            <ProjectLogo
              name={featured.name}
              symbol={featured.symbol}
              size={72}
              address={featured.contractAddress}
            />
            <div style={{ minWidth: 0 }}>
              <Name>{featured.name}</Name>
              {featured.verified ? <VerifiedBadge>Verified</VerifiedBadge> : null}
            </div>
          </TitleRow>
          <Tags>
            {featured.tags.slice(0, 4).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Tags>
          <Summary>{featured.description}</Summary>
          <MetricsGrid>
            {metrics.map((metric) => (
              <Metric key={metric.label}>
                <PrMetricLabel>{metric.label}</PrMetricLabel>
                <PrMetricValue
                  $muted={metric.value === '—' || metric.value === 'Unavailable' || Boolean(metric.muted)}
                >
                  {metric.value}
                </PrMetricValue>
              </Metric>
            ))}
          </MetricsGrid>
          <BtnRow>
            <PrFeaturedPrimaryBtn href={featured.tradeHref ?? '/swap'}>
              Trade
            </PrFeaturedPrimaryBtn>
            <PrFeaturedOutlineBtn href={featured.projectHref}>Open Project</PrFeaturedOutlineBtn>
            {featured.radarHref ? (
              <PrFeaturedOutlineBtn href={featured.radarHref}>Radar</PrFeaturedOutlineBtn>
            ) : (
              <PrFeaturedOutlineBtnDisabled>Radar</PrFeaturedOutlineBtnDisabled>
            )}
            {featured.spaceUrl ? (
              <PrFeaturedOutlineBtn href={featured.spaceUrl} target="_blank" rel="noopener noreferrer">
                Professional Audit
              </PrFeaturedOutlineBtn>
            ) : (
              <PrFeaturedOutlineBtnDisabled>Professional Audit</PrFeaturedOutlineBtnDisabled>
            )}
          </BtnRow>
        </Left>
        <Right>
          <Price>{featured.hasPriceData ? featured.price : '—'}</Price>
          <ChartBox>
            <ChartArea>
              {featured.hasPriceData ? (
                <ChartSvg viewBox="0 0 300 160" preserveAspectRatio="none">
                  <path
                    d="M 0 120 L 40 98 L 80 104 L 120 78 L 160 88 L 200 62 L 240 70 L 280 48 L 300 54"
                    fill="none"
                    stroke={projectsStudioColors.green}
                    strokeWidth="2"
                  />
                </ChartSvg>
              ) : (
                <ChartPlaceholder>Chart unavailable</ChartPlaceholder>
              )}
            </ChartArea>
            <Timeframes>
              {['1D', '7D', '1M', '3M', '1Y'].map((tf, i) => (
                <Tf key={tf} type="button" $active={timeframe === i} onClick={() => setTimeframe(i)}>
                  {tf}
                </Tf>
              ))}
            </Timeframes>
          </ChartBox>
        </Right>
      </Inner>
    </Panel>
  )
}

export default FeaturedProjectPanel
