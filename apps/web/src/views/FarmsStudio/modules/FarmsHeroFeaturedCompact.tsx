/**
 * Compact Featured Farm for Hero right column (not the legacy giant bottom card).
 */
import React from 'react'
import styled from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
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

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const Avatars = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  & > *:last-child {
    margin-left: -8px;
  }
`

const Pair = styled.div`
  font-size: 16px;
  font-weight: 750;
  color: #f6f6f6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
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

const Empty = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`

export const FarmsHeroFeaturedCompact: React.FC = () => {
  const { featured } = useFarmsRuntime()
  if (!featured) {
    return (
      <Card data-testid="farms-hero-featured-compact" data-featured="empty">
        <Eyebrow>Featured Farm</Eyebrow>
        <Empty>No rewarding farm available</Empty>
      </Card>
    )
  }
  const token0 = featured.tokens?.[0]
  const token1 = featured.tokens?.[1]
  const token0Addr = featured.card?.rawFarm?.token?.address
  const token1Addr = featured.card?.rawFarm?.quoteToken?.address
  return (
    <Card data-testid="farms-hero-featured-compact" data-featured="ready">
      <Eyebrow>Featured Farm</Eyebrow>
      <Identity>
        <Avatars>
          <MelegaTokenAvatar symbol={token0} address={token0Addr} chainId={56} size={28} radius="circle" />
          <MelegaTokenAvatar symbol={token1} address={token1Addr} chainId={56} size={28} radius="circle" />
        </Avatars>
        <Pair title={featured.pair}>{featured.pair}</Pair>
      </Identity>
      <Meta>
        {featured.card?.displayApr || featured.apr ? (
          <Apr>{featured.card?.displayApr ?? featured.apr}</Apr>
        ) : null}
        {featured.tvl ? <span>TVL {featured.tvl}</span> : null}
        {featured.rewardToken ? <span>Earn {featured.rewardToken}</span> : null}
      </Meta>
    </Card>
  )
}

export default FarmsHeroFeaturedCompact
