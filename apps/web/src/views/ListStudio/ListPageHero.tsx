/**
 * LIST hero — premium Melega ecosystem (dark / gold). No blurry banner artwork.
 */
import React from 'react'
import styled from 'styled-components'
import { TrendingUp, Users, Layers, Globe } from 'lucide-react'
import { listOne } from './listTokens'
import { formatListHeroStat, useListHeroStats } from './useListHeroStats'

const Hero = styled.section`
  position: relative;
  width: 100%;
  max-width: ${listOne.contentMax};
  min-height: 280px;
  margin: ${listOne.heroTop} 0 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(242, 200, 76, 0.16);
  background:
    radial-gradient(ellipse 55% 80% at 88% 20%, rgba(242, 200, 76, 0.14) 0%, rgba(5, 5, 5, 0) 55%),
    radial-gradient(ellipse 40% 70% at 12% 80%, rgba(242, 200, 76, 0.06) 0%, rgba(5, 5, 5, 0) 60%),
    linear-gradient(135deg, #0c0c0c 0%, #101010 45%, #0a0a0a 100%);
  font-family: ${listOne.font};
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 28px;
  align-items: center;
  padding: 28px 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    min-height: 0;
    padding: 24px;
  }

  @media (max-width: 767px) {
    margin-top: ${listOne.heroTopMobile};
    padding: 22px 16px;
    border-radius: 14px;
  }
`

const Left = styled.div`
  position: relative;
  z-index: 1;
  min-width: 0;
`

const Title = styled.h1`
  margin: 0;
  max-width: 560px;
  font-family: ${listOne.font};
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1.08;
  font-weight: 750;
  letter-spacing: -0.03em;
  color: ${listOne.text};
`

const Gold = styled.span`
  color: ${listOne.gold};
`

const Description = styled.p`
  margin: 16px 0 0;
  max-width: 480px;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  color: ${listOne.secondary};
`

const Stats = styled.div`
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  max-width: 640px;

  @media (max-width: 767px) {
    grid-template-columns: 1fr 1fr;
    margin-top: 20px;
  }
`

const StatCard = styled.div`
  box-sizing: border-box;
  min-height: 72px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(16, 16, 16, 0.92);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 12px;
`

const StatIcon = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(242, 200, 76, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${listOne.gold};

  svg {
    display: block;
    width: 16px;
    height: 16px;
  }
`

const StatText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const StatValue = styled.span`
  font-size: 18px;
  line-height: 22px;
  font-weight: 700;
  color: ${listOne.text};
`

const StatLabel = styled.span`
  font-size: 11px;
  line-height: 14px;
  font-weight: 500;
  color: ${listOne.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Right = styled.div`
  position: relative;
  z-index: 1;
  min-width: 0;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 1024px) {
    min-height: 160px;
  }
`

const Emblem = styled.div`
  width: min(100%, 360px);
  aspect-ratio: 5 / 3;
  border-radius: 16px;
  border: 1px solid rgba(242, 200, 76, 0.22);
  background:
    radial-gradient(circle at 30% 30%, rgba(242, 200, 76, 0.22), transparent 45%),
    radial-gradient(circle at 70% 70%, rgba(242, 200, 76, 0.1), transparent 50%),
    linear-gradient(160deg, #151515 0%, #0d0d0d 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
`

const EmblemTitle = styled.div`
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${listOne.gold};
`

const EmblemSub = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
`

const STAT_META = [
  { key: 'listedTokens' as const, label: 'Listed Tokens', Icon: TrendingUp },
  { key: 'projects' as const, label: 'Projects', Icon: Users },
  { key: 'markets' as const, label: 'Markets', Icon: Layers },
  { key: 'networks' as const, label: 'Networks', Icon: Globe },
]

export const ListPageHero: React.FC = () => {
  const stats = useListHeroStats()

  return (
    <Hero
      data-testid="list-one-page-header"
      data-list-hero="true"
      data-list-hero-premium="true"
      aria-label="List"
    >
      <Left data-testid="list-hero-text">
        <Title data-testid="list-hero-headline">
          List, Launch,
          <br />
          and Grow
          <br />
          on <Gold>Melega.</Gold>
        </Title>
        <Description data-testid="list-hero-description">
          Bring your token or project to life. Join the ecosystem, get discovered, and unlock powerful DeFi tools.
        </Description>
        <Stats data-testid="list-hero-stats">
          {STAT_META.map(({ key, label, Icon }) => (
            <StatCard key={key} data-testid={`list-hero-stat-${key}`}>
              <StatIcon aria-hidden>
                <Icon strokeWidth={1.75} />
              </StatIcon>
              <StatText>
                <StatValue>{formatListHeroStat(stats[key])}</StatValue>
                <StatLabel>{label}</StatLabel>
              </StatText>
            </StatCard>
          ))}
        </Stats>
      </Left>

      <Right data-testid="list-hero-art-col">
        <Emblem data-testid="list-hero-emblem" aria-hidden>
          <EmblemTitle>Melega DEX</EmblemTitle>
          <EmblemSub>Ecosystem listing desk</EmblemSub>
        </Emblem>
      </Right>
    </Hero>
  )
}

export default ListPageHero
