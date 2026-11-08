/**
 * Earn entry — two immediate actions, then existing routes on demand.
 * Does not mount farm, pool, or indexer producers.
 */
import React, { useId, useState } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { PageMeta } from 'components/Layout/Page'
import { uxRebuildColors, uxRebuildFont } from 'design-system/melega/tokens/uxRebuild'
import { preserveEarlyNavigation } from 'lib/navigation/preserveEarlyNavigation'

const Root = styled.main`
  width: min(440px, 100%);
  margin: 0 auto;
  padding: 8px 0 24px;
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
`

const Title = styled.h1`
  margin: 0 0 6px;
  font-size: 28px;
  line-height: 1.1;
  letter-spacing: -0.04em;
`

const Lede = styled.p`
  margin: 0 0 16px;
  color: ${uxRebuildColors.secondary};
  font-size: 14px;
  line-height: 1.4;
`

const Action = styled(Link).attrs({ prefetch: false })`
  display: flex;
  align-items: center;
  min-height: 56px;
  margin-bottom: 8px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #121212;
  color: #fff;
  text-decoration: none;
  font-size: 16px;
  font-weight: 700;

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }
`

const MoreButton = styled.button`
  width: 100%;
  min-height: 44px;
  margin-top: 8px;
  border: 0;
  background: transparent;
  color: ${uxRebuildColors.gold};
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }
`

const More = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const Quiet = styled(Link).attrs({ prefetch: false })`
  display: flex;
  align-items: center;
  min-height: 44px;
  color: ${uxRebuildColors.secondary};
  text-decoration: none;
  font-size: 15px;
  font-weight: 650;

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }
`

const Unavailable = styled.button`
  min-height: 44px;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.38);
  font-size: 15px;
  font-weight: 650;
  text-align: left;
  cursor: not-allowed;
`

const Positions = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
`

const PositionLink = styled(Link).attrs({ prefetch: false })`
  min-height: 44px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: inline-flex;
  align-items: center;
  color: ${uxRebuildColors.secondary};
  text-decoration: none;
  font-size: 13px;
  font-weight: 650;
`

export const SimpleEarn: React.FC = () => {
  const [open, setOpen] = useState(false)
  const moreId = useId()

  return (
    <Root data-testid="simple-earn">
      <PageMeta />
      <Title>Earn</Title>
      <Lede>Add BNB liquidity or stake MARCO. Everything else stays one step further.</Lede>
      <Action href="/liquidity" data-testid="earn-bnb-liquidity" onClick={(event) => preserveEarlyNavigation(event, '/liquidity')}>
        Add BNB liquidity
      </Action>
      <Action href="/pools" data-testid="earn-stake-marco" onClick={(event) => preserveEarlyNavigation(event, '/pools')}>
        Stake MARCO
      </Action>
      <MoreButton
        type="button"
        aria-expanded={open}
        aria-controls={moreId}
        data-testid="earn-more"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Hide more' : 'More opportunities'}
      </MoreButton>
      {open ? (
        <More id={moreId}>
          <Quiet href="/farms" onClick={(event) => preserveEarlyNavigation(event, '/farms')}>
            Farms
          </Quiet>
          <Quiet href="/pools" onClick={(event) => preserveEarlyNavigation(event, '/pools')}>
            Pools
          </Quiet>
          <Unavailable type="button" aria-disabled="true" data-disabled-reason="External opportunities are not available yet">
            External opportunities
          </Unavailable>
        </More>
      ) : null}
      <Positions aria-label="Your positions">
        <PositionLink
          href="/liquidity-studio?view=remove"
          onClick={(event) => preserveEarlyNavigation(event, '/liquidity-studio?view=remove')}
        >
          Remove liquidity
        </PositionLink>
        <PositionLink href="/farms?view=my" onClick={(event) => preserveEarlyNavigation(event, '/farms?view=my')}>
          Farm positions
        </PositionLink>
        <PositionLink href="/pools?view=positions" onClick={(event) => preserveEarlyNavigation(event, '/pools?view=positions')}>
          Pool positions
        </PositionLink>
      </Positions>
    </Root>
  )
}

export default SimpleEarn
