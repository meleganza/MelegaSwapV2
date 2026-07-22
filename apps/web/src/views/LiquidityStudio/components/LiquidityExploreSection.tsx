import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import {
  uxRebuildColors,
  uxRebuildFont,
  uxRebuildRadius,
  uxRebuildShadow,
} from 'design-system/melega/tokens/uxRebuild'

const Card = styled.section`
  min-height: 180px;
  padding: 22px;
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  box-shadow: ${uxRebuildShadow.card};
  font-family: ${uxRebuildFont};
`

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${uxRebuildColors.text};
`

const Body = styled.p`
  margin: 10px 0 0;
  max-width: 520px;
  font-size: 14px;
  line-height: 21px;
  color: ${uxRebuildColors.secondary};
`

const Row = styled.div`
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const Gold = styled(Link)`
  height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  background: ${uxRebuildColors.gold};
  color: #080808;
  font-size: 14px;
  font-weight: 650;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
`

const Ghost = styled(Link)`
  height: 42px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid ${uxRebuildColors.borderStrong};
  background: ${uxRebuildColors.cardElevated};
  color: ${uxRebuildColors.text};
  font-size: 14px;
  font-weight: 650;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
`

/**
 * Explore surface — routes into certified pool directory and Add Liquidity.
 * No fabricated pool rows.
 */
export const LiquidityExploreSection: React.FC = () => (
  <Card data-testid="ls-explore-surface" data-ls-view="explore">
    <Title>Explore pools</Title>
    <Body>
      Browse live Melega liquidity markets, then add liquidity to a certified pool. Pool metrics stay on
      the Pools directory — this surface does not invent TVL or volume.
    </Body>
    <Row>
      <Gold href="/pools?view=explore" data-testid="ls-explore-pools">
        Browse Pools
      </Gold>
      <Ghost href="/liquidity-studio?view=add" data-testid="ls-explore-add">
        Add Liquidity
      </Ghost>
    </Row>
  </Card>
)

export default LiquidityExploreSection
