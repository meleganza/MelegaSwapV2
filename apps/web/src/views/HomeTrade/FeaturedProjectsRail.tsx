/**
 * Home Featured Projects — four compact equal premium cards (≥1280 one row).
 * Soft ambient gold glow (no yellow border). No scientific-notation prices.
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
      0 0 16px 2px rgba(244, 196, 48, 0.1),
      0 10px 28px rgba(0, 0, 0, 0.34);
  }
  50% {
    box-shadow:
      0 0 0 0 rgba(244, 196, 48, 0),
      0 0 26px 6px rgba(244, 196, 48, 0.2),
      0 12px 32px rgba(0, 0, 0, 0.38);
  }
`

const Shell = styled.section`
  min-width: 0;
  padding: 8px 4px 12px;
  margin: -8px -4px -12px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  min-width: 0;
  align-items: stretch;

  @media (max-width: 1279px) and (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`

const Card = styled.article`
  min-height: 148px;
  max-height: 168px;
  padding: 12px 14px;
  border-radius: ${uxRebuildRadius.card};
  background: linear-gradient(165deg, rgba(22, 22, 22, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
  animation: ${halo} 3.6s ease-in-out infinite;
  overflow: visible;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    box-shadow: 0 0 16px 2px rgba(244, 196, 48, 0.12), 0 10px 28px rgba(0, 0, 0, 0.34);
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
  flex: 1;
`

const Name = styled.div`
  font-size: 14px;
  font-weight: 750;
  color: ${uxRebuildColors.text};
  line-height: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Meta = styled.div`
  font-size: 11px;
  color: ${uxRebuildColors.muted};
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Desc = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 15px;
  color: ${uxRebuildColors.muted};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 0;
`

const Metrics = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`

const Price = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${uxRebuildColors.text};
`

const Change = styled.div<{ $positive?: boolean; $empty?: boolean }>`
  font-size: 11px;
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
  margin-top: auto;
`

const TradeBtn = styled.button`
  height: 40px;
  min-height: 40px;
  border: none;
  border-radius: 10px;
  background: ${uxRebuildColors.gold};
  color: #111;
  font-size: 12px;
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
  height: 40px;
  min-height: 40px;
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
                  size={36}
                  radius="circle"
                />
                <Names>
                  <Name>{p.displayName}</Name>
                  <Meta>
                    {p.symbol} · BNB Smart Chain
                  </Meta>
                </Names>
              </Identity>
              {p.description ? <Desc>{p.description}</Desc> : null}
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
                      ? 'Insufficient credible Melega DEX observations'
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
