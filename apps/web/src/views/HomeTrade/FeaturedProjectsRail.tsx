/**
 * Home Featured Projects — four equal premium cards.
 * Soft pulsating gold glow (no yellow border). Logo / name / symbol / price / 24h / CTAs.
 */
import React, { useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled, { keyframes, css } from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { uxRebuildColors, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'
import { resolveFounderFeaturedProjects } from './featuredProjectsCatalog'
import {
  formatFeaturedChange,
  formatFeaturedPrice,
  useFeaturedProjectMarkets,
} from './useFeaturedProjectMarkets'

const halo = keyframes`
  0%, 100% {
    box-shadow:
      0 0 0 0 rgba(244, 196, 48, 0),
      0 0 22px 4px rgba(244, 196, 48, 0.12),
      0 14px 36px rgba(0, 0, 0, 0.36);
  }
  50% {
    box-shadow:
      0 0 0 0 rgba(244, 196, 48, 0),
      0 0 36px 10px rgba(244, 196, 48, 0.28),
      0 16px 40px rgba(0, 0, 0, 0.4);
  }
`

const Shell = styled.section`
  min-width: 0;
  padding: 10px 6px 14px;
  margin: -10px -6px -14px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  min-width: 0;
  align-items: stretch;

  /* Desktop ≥1440: one complete row of 4. Tablet: 2×2. Mobile: 1 column. */
  @media (max-width: 1439px) and (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`

const Card = styled.article`
  height: 196px;
  min-height: 196px;
  max-height: 196px;
  padding: 16px;
  border-radius: ${uxRebuildRadius.card};
  background: linear-gradient(165deg, rgba(22, 22, 22, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  animation: ${halo} 3.6s ease-in-out infinite;
  overflow: visible;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    box-shadow: 0 0 22px 4px rgba(244, 196, 48, 0.14), 0 14px 36px rgba(0, 0, 0, 0.36);
  }
`

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const Names = styled.div`
  min-width: 0;
`

const Name = styled.div`
  font-size: 16px;
  font-weight: 750;
  color: ${uxRebuildColors.text};
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Meta = styled.div`
  font-size: 11px;
  color: ${uxRebuildColors.muted};
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Metrics = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
`

const Price = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${uxRebuildColors.text};
`

const Change = styled.div<{ $positive?: boolean; $empty?: boolean }>`
  font-size: 12px;
  font-weight: 700;
  ${({ $empty, $positive }) =>
    $empty
      ? css`
          color: ${uxRebuildColors.muted};
        `
      : css`
          color: ${$positive ? '#3DDC97' : '#FF6B6B'};
        `}
`

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`

const TradeBtn = styled.button`
  height: 36px;
  min-height: 44px;
  border: none;
  border-radius: 10px;
  background: ${uxRebuildColors.gold};
  color: #111;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }
`

const ViewLink = styled(Link)`
  height: 36px;
  min-height: 44px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: ${uxRebuildColors.text};
  font-size: 12px;
  font-weight: 650;
  box-sizing: border-box;

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }
`

export const FeaturedProjectsRail: React.FC = () => {
  const router = useRouter()
  const cards = useMemo(() => resolveFounderFeaturedProjects(), [])
  const { rowsBySlug } = useFeaturedProjectMarkets()

  const onTrade = useCallback(
    (address?: string) => {
      if (!address) return
      const q = `outputCurrency=${address}&inputCurrency=BNB`
      void router.push(`/?focus=swap&${q}`, undefined, { shallow: true }).then(() => {
        const root = document.querySelector<HTMLElement>('[data-home-section="swap"]')
        root?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        window.setTimeout(() => {
          const input =
            root?.querySelector<HTMLElement>('.home-trade-swap input.token-amount-input') ||
            root?.querySelector<HTMLElement>('.home-trade-swap input')
          input?.focus({ preventScroll: true })
        }, 280)
      })
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.set('outputCurrency', address)
        url.searchParams.set('inputCurrency', 'BNB')
        url.searchParams.set('focus', 'swap')
        window.history.replaceState({}, '', `${url.pathname}?${url.searchParams.toString()}`)
        window.dispatchEvent(new Event('popstate'))
      }
    },
    [router],
  )

  return (
    <Shell data-testid="dex-home-featured-projects" data-home-section="featured-projects">
      <Grid>
        {cards.map((p) => {
          const market = rowsBySlug[p.slug]
          const change = formatFeaturedChange(market)
          return (
            <Card
              key={p.slug}
              data-featured-slug={p.slug}
              data-featured-resolved={p.resolved ? '1' : '0'}
              data-featured-market-status={market?.status ?? 'LOADING'}
            >
              <Identity>
                <MelegaTokenAvatar
                  symbol={p.symbol}
                  name={p.displayName}
                  address={p.address}
                  chainId={p.chainId}
                  size={40}
                  radius="circle"
                />
                <Names>
                  <Name>{p.displayName}</Name>
                  <Meta>
                    {p.symbol} · BNB Smart Chain
                  </Meta>
                </Names>
              </Identity>
              <Metrics>
                <Price
                  title={
                    market?.source === 'melega-factory-reserves'
                      ? 'Reserve price · Melega Factory'
                      : 'Melega DEX'
                  }
                >
                  {formatFeaturedPrice(market)}
                </Price>
                <Change
                  $empty={change.empty}
                  $positive={change.positive}
                  title={
                    change.empty
                      ? 'Factual Melega DEX change unavailable'
                      : `Melega DEX · ${market?.periodLabel ?? '24H'}`
                  }
                >
                  {change.text}
                </Change>
              </Metrics>
              <Actions>
                <TradeBtn
                  type="button"
                  disabled={!p.address}
                  onClick={() => onTrade(p.address)}
                  data-testid={`featured-trade-${p.slug}`}
                >
                  Trade
                </TradeBtn>
                <ViewLink href={p.href} data-testid={`featured-view-${p.slug}`}>
                  View Project
                </ViewLink>
              </Actions>
            </Card>
          )
        })}
      </Grid>
    </Shell>
  )
}

export default FeaturedProjectsRail
