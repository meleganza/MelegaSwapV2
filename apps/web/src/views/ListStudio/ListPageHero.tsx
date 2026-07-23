/**
 * LIST_MODULE_001_HERO — pixel-locked List page hero.
 * Desktop 1376×360. Mobile 358×auto. Founder background + artwork only.
 */
import React from 'react'
import styled from 'styled-components'
import { TrendingUp, Users, Droplets, Globe } from 'lucide-react'
import { LIST_HERO_ART, LIST_HERO_BG, listOne } from './listTokens'
import { formatListHeroStat, useListHeroStats } from './useListHeroStats'

const Hero = styled.section`
  position: relative;
  width: 100%;
  max-width: ${listOne.contentMax};
  height: ${listOne.heroH};
  margin: ${listOne.heroTop} 0 0;
  box-sizing: border-box;
  overflow: hidden;
  background-color: ${listOne.card};
  background-image: url('${LIST_HERO_BG}');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: right center;
  font-family: ${listOne.font};
  display: grid;
  grid-template-columns: ${listOne.leftPct}fr ${listOne.rightPct}fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'text art'
    'stats art';
  column-gap: ${listOne.colGap};
  align-items: center;
  padding: 20px 28px 20px 32px;

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    height: auto;
    min-height: 0;
    margin-top: ${listOne.heroTopMobile};
    padding: 24px 16px 20px;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      'text'
      'art'
      'stats';
    row-gap: 20px;
    background-position: center top;
    background-size: cover;
  }
`

const Left = styled.div`
  grid-area: text;
  position: relative;
  z-index: 1;
  min-width: 0;
  max-width: 100%;
  align-self: end;

  @media (max-width: 767px) {
    align-self: start;
  }
`

const Title = styled.h1`
  margin: 0;
  width: ${listOne.headlineW};
  max-width: 100%;
  font-family: ${listOne.font};
  font-size: ${listOne.headlineSize};
  line-height: ${listOne.headlineLh};
  font-weight: ${listOne.headlineWeight};
  letter-spacing: -0.02em;
  color: ${listOne.text};

  @media (max-width: 767px) {
    width: 100%;
    font-size: 34px;
    line-height: 40px;
  }
`

const Gold = styled.span`
  color: ${listOne.gold};
`

const Description = styled.p`
  margin: ${listOne.descTop} 0 0;
  width: ${listOne.descW};
  max-width: 100%;
  font-size: ${listOne.descSize};
  line-height: ${listOne.descLh};
  font-weight: 400;
  color: ${listOne.secondary};

  @media (max-width: 767px) {
    width: 100%;
    font-size: 15px;
    line-height: 22px;
  }
`

const Stats = styled.div`
  grid-area: stats;
  margin-top: 28px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: ${listOne.statGap};
  width: max-content;
  max-width: 100%;
  align-self: start;

  @media (max-width: 767px) {
    margin-top: 0;
    width: 100%;
    max-width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
`

const StatCard = styled.div`
  width: ${listOne.statW};
  height: ${listOne.statH};
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid ${listOne.border};
  background: rgba(21, 21, 21, 0.92);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  flex-shrink: 0;

  @media (max-width: 767px) {
    width: 100%;
    height: ${listOne.statH};
  }
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
  letter-spacing: -0.01em;
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
  grid-area: art;
  position: relative;
  z-index: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 767px) {
    height: auto;
    min-height: 220px;
  }
`

const ArtFrame = styled.div`
  width: ${listOne.artW};
  height: ${listOne.artH};
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  @media (max-width: 767px) {
    width: 100%;
    height: auto;
    aspect-ratio: 560 / 320;
  }
`

const ArtImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
  user-select: none;
  pointer-events: none;
`

const STAT_META = [
  { key: 'listedTokens' as const, label: 'Listed Tokens', Icon: TrendingUp },
  { key: 'projects' as const, label: 'Projects', Icon: Users },
  { key: 'marketCap' as const, label: 'Total Market Cap', Icon: Droplets },
  { key: 'networks' as const, label: 'Networks', Icon: Globe },
]

export const ListPageHero: React.FC = () => {
  const stats = useListHeroStats()

  return (
    <Hero
      data-testid="list-one-page-header"
      data-list-hero="true"
      data-hero-bg={LIST_HERO_BG}
      data-pixel-hero="1376x360"
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
      </Left>

      <Stats data-testid="list-hero-stats">
        {STAT_META.map(({ key, label, Icon }) => (
          <StatCard key={key} data-testid={`list-hero-stat-${key}`} data-pixel-stat="120x72">
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

      <Right data-testid="list-hero-art-col">
        <ArtFrame data-testid="list-hero-art-frame" data-pixel-art="560x320">
          <ArtImg
            src={LIST_HERO_ART}
            alt=""
            data-testid="list-hero-artwork"
            data-hero-art={LIST_HERO_ART}
            draggable={false}
          />
        </ArtFrame>
      </Right>
    </Hero>
  )
}

export default ListPageHero
