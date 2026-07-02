import React from 'react'
import styled from 'styled-components'
import type { TrendingProjectCard as TrendingProjectCardType } from '../trendingStudioData'
import { aiScoreColor } from '../trendingStudioData'
import { trendingStudioColors, trendingStudioLayout } from '../trendingStudioTokens'
import {
  AnimatedSparkline,
  TrGhostBtn,
  TrLabel,
  TrPrimaryBtn,
  TrendingProjectLogo,
} from './trendingStudioPrimitives'

const Card = styled.article`
  width: 100%;
  max-width: ${trendingStudioLayout.trendingCardWidth};
  height: ${trendingStudioLayout.trendingCardHeight};
  min-height: ${trendingStudioLayout.trendingCardHeight};
  padding: 16px 18px;
  border-radius: ${trendingStudioLayout.trendingCardRadius};
  border: 1px solid ${trendingStudioColors.border};
  background: ${trendingStudioColors.panel};
  box-shadow: ${trendingStudioColors.shadow};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;

  @media (max-width: 767px) {
    max-width: 100%;
    height: auto;
    min-height: ${trendingStudioLayout.trendingCardHeight};
  }
`

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`

const Rank = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid ${trendingStudioColors.border};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: ${trendingStudioColors.gray};
  flex-shrink: 0;
`

const HeaderMain = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
`

const HeaderText = styled.div`
  min-width: 0;
`

const Name = styled.div`
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  color: ${trendingStudioColors.white};
`

const Pair = styled.div`
  margin-top: 4px;
  font-size: 18px;
  font-weight: 600;
  color: ${trendingStudioColors.gray};
`

const ScoreBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
`

const Score = styled.span<{ $tone: 'green' | 'yellow' }>`
  font-size: 22px;
  font-weight: 800;
  color: ${({ $tone }) => ($tone === 'green' ? trendingStudioColors.green : trendingStudioColors.yellow)};
`

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
`

const Tag = styled.span`
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${trendingStudioColors.border};
  font-size: 11px;
  font-weight: 700;
  color: ${trendingStudioColors.gray};
  display: inline-flex;
  align-items: center;
`

const Summary = styled.p`
  margin: 10px 0 0;
  font-size: 15px;
  line-height: 1.45;
  color: ${trendingStudioColors.gray};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
`

const MetricCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const MetricValue = styled.span<{ $positive?: boolean }>`
  font-size: 15px;
  font-weight: 700;
  color: ${({ $positive }) => ($positive ? trendingStudioColors.green : trendingStudioColors.white)};
`

const Footer = styled.div`
  margin-top: auto;
  padding-top: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${trendingStudioLayout.trendingBtnGap};
  flex-wrap: wrap;

  @media (max-width: 767px) {
    width: 100%;

    button {
      flex: 1;
      min-width: 0;
    }
  }
`

const TradeBtn = styled(TrPrimaryBtn)`
  width: ${trendingStudioLayout.tradeBtnWidth};
  min-width: ${trendingStudioLayout.tradeBtnWidth};
  padding: 0;
`

const OpenBtn = styled(TrGhostBtn)`
  width: ${trendingStudioLayout.openBtnWidth};
  min-width: ${trendingStudioLayout.openBtnWidth};
  padding: 0;
`

const WatchBtn = styled(TrGhostBtn)`
  width: ${trendingStudioLayout.watchBtnWidth};
  min-width: ${trendingStudioLayout.watchBtnWidth};
  padding: 0;
`

interface Props {
  project: TrendingProjectCardType
}

export const TrendingProjectCard: React.FC<Props> = ({ project }) => {
  const tone = aiScoreColor(project.aiScore)

  return (
    <Card data-tr-trending-card>
      <TopRow>
        <Rank>{project.rank}</Rank>
        <HeaderMain>
          <TrendingProjectLogo name={project.name} symbol={project.symbol} size={64} />
          <HeaderText>
            <Name>{project.name}</Name>
            <Pair>{project.pair}</Pair>
          </HeaderText>
        </HeaderMain>
        <ScoreBlock>
          <Score $tone={tone}>{project.aiScore}/100</Score>
          <AnimatedSparkline points={project.sparkline} width={56} height={18} />
        </ScoreBlock>
      </TopRow>

      <Tags>
        {project.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Tags>

      <Summary>{project.summary}</Summary>

      <Metrics>
        <MetricCell>
          <TrLabel>Holders</TrLabel>
          <MetricValue>{project.holders}</MetricValue>
        </MetricCell>
        <MetricCell>
          <TrLabel>Liquidity</TrLabel>
          <MetricValue>{project.liquidity}</MetricValue>
        </MetricCell>
        <MetricCell>
          <TrLabel>24h Volume</TrLabel>
          <MetricValue>{project.volume}</MetricValue>
        </MetricCell>
        <MetricCell>
          <TrLabel>7d Growth</TrLabel>
          <MetricValue $positive={project.growthPositive}>{project.growth}</MetricValue>
        </MetricCell>
      </Metrics>

      <Footer>
        <TradeBtn type="button">Trade</TradeBtn>
        <OpenBtn type="button">Open Project</OpenBtn>
        <WatchBtn type="button">★ Watch</WatchBtn>
      </Footer>
    </Card>
  )
}

export default TrendingProjectCard
