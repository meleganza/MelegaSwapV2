/**
 * Compact Featured Farm for Hero right column.
 * Shown only when a factual eligible farm exists.
 */
import React from 'react'
import styled from 'styled-components'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { farmsHero } from './farmsHeroTokens'

const Card = styled.aside`
  width: 100%;
  max-width: ${farmsHero.trustBoxW};
  min-width: 0;
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid rgba(244, 196, 48, 0.28);
  background: linear-gradient(145deg, rgba(22, 20, 12, 0.98) 0%, rgba(12, 12, 12, 0.98) 100%);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Eyebrow = styled.span`
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f4c430;
`

const Pair = styled.div`
  font-size: 16px;
  font-weight: 750;
  color: #f6f6f6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Meta = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.62);
`

const Apr = styled.span`
  color: #6ddc8c;
  font-weight: 750;
`

const Links = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`

const Link = styled.a`
  color: rgba(244, 196, 48, 0.92);
  font-size: 11px;
  font-weight: 650;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`

const StakeBtn = styled.button`
  appearance: none;
  cursor: pointer;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(244, 196, 48, 0.45);
  background: rgba(244, 196, 48, 0.16);
  color: #f4c430;
  font-size: 12px;
  font-weight: 700;
`

const Empty = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`

export const FarmsHeroFeaturedCompact: React.FC = () => {
  const { featured, requestModal } = useFarmsRuntime()
  if (!featured?.card) {
    return (
      <Card data-testid="farms-hero-featured-compact" data-featured="empty">
        <Eyebrow>Featured Farm</Eyebrow>
        <Empty>No eligible active farm with measurable TVL and sustainable APR.</Empty>
      </Card>
    )
  }
  const card = featured.card
  const farmUrl = card.masterChefExplorerUrl
  const lpUrl = card.explorerUrl
  const canStake = card.cta === 'stake' || card.status === 'live'

  return (
    <Card data-testid="farms-hero-featured-compact" data-featured="ready" data-farm-pid={card.pid ?? undefined}>
      <Eyebrow>Featured Farm</Eyebrow>
      <Pair title={featured.pair}>{featured.pair}</Pair>
      <Meta>
        {featured.displayApr || featured.apr ? <Apr>{featured.displayApr ?? featured.apr}</Apr> : null}
        {featured.tvl ? <span>TVL {featured.tvl}</span> : null}
        {featured.rewardToken ? <span>Earn {featured.rewardToken}</span> : null}
      </Meta>
      <Links>
        {canStake ? (
          <StakeBtn
            type="button"
            data-testid="farms-featured-stake"
            onClick={() => requestModal(card, 'stake')}
          >
            Stake
          </StakeBtn>
        ) : null}
        {farmUrl ? (
          <Link href={farmUrl} target="_blank" rel="noopener noreferrer" data-testid="farms-featured-farm-contract">
            Farm Contract ↗
          </Link>
        ) : null}
        {lpUrl ? (
          <Link href={lpUrl} target="_blank" rel="noopener noreferrer" data-testid="farms-featured-lp-contract">
            LP Contract ↗
          </Link>
        ) : null}
      </Links>
    </Card>
  )
}

export default FarmsHeroFeaturedCompact
