/**
 * Home Featured Projects — four premium founder cards (MM72, EYED, Young Degens, BLION).
 * No detached section title; cards communicate featured status. No fabricated metrics.
 */
import React, { useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled, { keyframes, css } from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { uxRebuildColors, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'
import { resolveFounderFeaturedProjects } from './featuredProjectsCatalog'

const halo = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(244, 196, 48, 0.0), 0 10px 28px rgba(0, 0, 0, 0.28); }
  50% { box-shadow: 0 0 0 3px rgba(244, 196, 48, 0.18), 0 12px 32px rgba(0, 0, 0, 0.32); }
  100% { box-shadow: 0 0 0 0 rgba(244, 196, 48, 0.0), 0 10px 28px rgba(0, 0, 0, 0.28); }
`

const Shell = styled.section`
  min-width: 0;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  min-width: 0;

  @media (max-width: 1439px) and (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`

const Card = styled.article`
  min-height: 188px;
  padding: 16px;
  border-radius: ${uxRebuildRadius.card};
  background:
    linear-gradient(165deg, rgba(28, 28, 28, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%);
  border: 1px solid rgba(244, 196, 48, 0.42);
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  animation: ${halo} 4.8s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
  }
`

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const Badge = styled.span`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${uxRebuildColors.gold};
`

const Network = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${uxRebuildColors.muted};
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

const Symbol = styled.div`
  font-size: 12px;
  color: ${uxRebuildColors.muted};
  margin-top: 2px;
`

const Desc = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 16px;
  color: ${uxRebuildColors.muted};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 32px;
`

const Metrics = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
`

const Price = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${uxRebuildColors.text};
`

const Change = styled.div<{ $positive?: boolean; $empty?: boolean }>`
  font-size: 13px;
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
  border: none;
  border-radius: 10px;
  background: ${uxRebuildColors.gold};
  color: #111;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
`

const ViewLink = styled(Link)`
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: ${uxRebuildColors.text};
  font-size: 12px;
  font-weight: 650;
`

export const FeaturedProjectsRail: React.FC = () => {
  const router = useRouter()
  const cards = useMemo(() => resolveFounderFeaturedProjects(), [])

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
      // Seed swap query for HomeSwapPanel consumers that read router.query
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
        {cards.map((p) => (
          <Card key={p.slug} data-featured-slug={p.slug} data-featured-resolved={p.resolved ? '1' : '0'}>
            <Top>
              <Badge>Featured</Badge>
              <Network>BNB Smart Chain</Network>
            </Top>
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
                <Symbol>{p.symbol}</Symbol>
              </Names>
            </Identity>
            <Desc>{p.description || p.category || 'Listed Melega DEX project'}</Desc>
            <Metrics>
              <Price>—</Price>
              <Change $empty title="Factual 24H change unavailable">
                —
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
        ))}
      </Grid>
    </Shell>
  )
}

export default FeaturedProjectsRail
