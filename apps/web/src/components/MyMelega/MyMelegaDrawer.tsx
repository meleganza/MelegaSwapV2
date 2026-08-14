/**
 * My Melega — premium wallet positions drawer (portal overlay).
 */
import React, { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import styled from 'styled-components'
import { useAccount, useDisconnect, useNetwork } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { MELEGA_LOGO_URI } from 'design-system/melega/constants/brand'
import { melegaZIndex } from 'design-system/melega/tokens/melegaZIndex'
import { uxRebuildColors, uxRebuildFont } from 'design-system/melega/tokens/uxRebuild'
import { MY_MELEGA_ROUTES } from 'lib/data-truth/myMelegaPositions'
import { explorerAddressUrl, shortenAddress } from 'views/PortfolioStudio/helpers'
import { useMyMelegaDrawer } from './MyMelegaProvider'

const gold = uxRebuildColors.gold
const line = 'rgba(255,255,255,0.1)'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${melegaZIndex.overlay};
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  font-family: ${uxRebuildFont};

  @media (max-width: 767px) {
    align-items: flex-end;
    justify-content: stretch;
  }
`

const Panel = styled.aside`
  width: min(460px, 100%);
  max-width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #141414 0%, #0a0a0a 100%);
  border-left: 1px solid ${line};
  box-shadow: -24px 0 48px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  min-width: 0;
  color: #fff;

  @media (max-width: 767px) {
    width: 100%;
    height: min(92vh, 100%);
    border-left: 0;
    border-top: 1px solid ${line};
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -16px 40px rgba(0, 0, 0, 0.5);
  }
`

const Head = styled.header`
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 16px 12px;
  border-bottom: 1px solid ${line};
  background: rgba(12, 12, 12, 0.96);
  backdrop-filter: blur(10px);
`

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const BrandLogo = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  object-fit: contain;
  flex-shrink: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: ${gold};
`

const WalletLine = styled.div`
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.78);
  font-variant-numeric: tabular-nums;
`

const HeadActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
`

const TinyBtn = styled.button`
  min-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${line};
  background: rgba(255, 255, 255, 0.03);
  color: #f5f5f5;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    border-color: rgba(244, 196, 48, 0.35);
  }
`
const TinyLink = styled.a`
  min-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${line};
  background: rgba(255, 255, 255, 0.03);
  color: #f5f5f5;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  &:hover {
    border-color: rgba(244, 196, 48, 0.35);
  }
`

const CloseBtn = styled.button`
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid ${line};
  background: transparent;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  flex-shrink: 0;
`

const Body = styled.div`
  flex: 1;
  overflow: auto;
  padding: 12px 16px 20px;
  min-height: 0;
`

const Section = styled.section`
  margin-bottom: 16px;
`

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 8px;
`

const CountRow = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  color: inherit;
  text-decoration: none;
  font-size: 13px;
  font-weight: 650;
  &:hover {
    border-color: ${line};
    background: rgba(255, 255, 255, 0.03);
  }
`

const Muted = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.4;
`

const QuickGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`

const QuickBtn = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 56px;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid ${line};
  background: rgba(255, 255, 255, 0.02);
  color: #fff;
  text-decoration: none;
  font-size: 11px;
  font-weight: 700;
  &:hover {
    border-color: rgba(244, 196, 48, 0.35);
  }
`

const PortfolioLink = styled(Link)`
  display: block;
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 650;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  min-height: 40px;
  line-height: 40px;
  &:hover {
    color: ${gold};
  }
`

const ConnectWrap = styled.div`
  display: grid;
  gap: 12px;
  padding: 24px 8px;
  text-align: center;
`

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)
}

export const MyMelegaDrawer: React.FC = () => {
  const { open, closeDrawer } = useMyMelegaDrawer()
  const { address } = useAccount()
  const { chain } = useNetwork()
  const { disconnect } = useDisconnect()
  const titleId = useId()
  const panelRef = useRef<HTMLElement | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const [copied, setCopied] = React.useState(false)

  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('button, a')?.focus()
    }, 10)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeDrawer()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const nodes = getFocusable(panelRef.current)
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, closeDrawer])

  if (!open || typeof document === 'undefined') return null

  const connected = Boolean(address)
  const chainId = chain?.id ?? null
  const explorer = address ? explorerAddressUrl(address, chainId) : null

  const tree = (
    <Overlay
      data-melega-layer="overlay"
      data-testid="my-melega-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeDrawer()
      }}
    >
      <Panel
        ref={panelRef as React.RefObject<HTMLElement>}
        role="dialog"
        aria-modal="true"
        aria-label="My Melega"
        aria-labelledby={titleId}
        data-testid="my-melega-drawer"
      >
        <Head>
          <div style={{ minWidth: 0 }}>
            <BrandRow>
              <BrandLogo src={MELEGA_LOGO_URI} alt="" width={28} height={28} data-testid="my-melega-logo" />
              <Title id={titleId}>MY MELEGA</Title>
            </BrandRow>
            {connected && address ? (
              <>
                <WalletLine>
                  <span data-testid="my-melega-wallet">{shortenAddress(address)}</span>
                  {chainId ? <MelegaExploreChainBadge chainId={chainId} /> : null}
                </WalletLine>
                <HeadActions>
                  <TinyBtn
                    type="button"
                    data-testid="my-melega-copy"
                    onClick={() => {
                      void navigator.clipboard?.writeText(address).then(() => {
                        setCopied(true)
                        window.setTimeout(() => setCopied(false), 1200)
                      })
                    }}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </TinyBtn>
                  {explorer ? (
                    <TinyLink href={explorer} target="_blank" rel="noreferrer" data-testid="my-melega-explorer">
                      Explorer
                    </TinyLink>
                  ) : null}
                  <TinyBtn
                    type="button"
                    data-testid="my-melega-disconnect"
                    onClick={() => {
                      disconnect()
                      closeDrawer()
                    }}
                  >
                    Disconnect
                  </TinyBtn>
                </HeadActions>
              </>
            ) : null}
          </div>
          <CloseBtn type="button" aria-label="Close My Melega" data-testid="my-melega-close" onClick={closeDrawer}>
            ×
          </CloseBtn>
        </Head>

        <Body>
          {!connected ? (
            <ConnectWrap data-testid="my-melega-disconnected">
              <Muted>Connect your wallet to see your positions across Melega DEX.</Muted>
              <ConnectWalletButton data-testid="my-melega-connect">Connect Wallet</ConnectWalletButton>
            </ConnectWrap>
          ) : (
            <>
              <Section data-testid="my-melega-positions">
                <SectionLabel>Your Melega</SectionLabel>
                <Muted>
                  Live positions are loaded inside their workspace, so opening this menu never starts three indexers at once.
                </Muted>
                <CountRow href={MY_MELEGA_ROUTES.liquidity} onClick={closeDrawer} data-testid="my-melega-count-liquidity">
                  <span>Liquidity positions</span><span aria-hidden>→</span>
                </CountRow>
                <CountRow href={MY_MELEGA_ROUTES.farms} onClick={closeDrawer} data-testid="my-melega-count-farms">
                  <span>Farm positions</span><span aria-hidden>→</span>
                </CountRow>
                <CountRow href={MY_MELEGA_ROUTES.pools} onClick={closeDrawer} data-testid="my-melega-count-pools">
                  <span>Staking positions</span><span aria-hidden>→</span>
                </CountRow>
                <CountRow href={MY_MELEGA_ROUTES.liquidityBuilder} onClick={closeDrawer} data-testid="my-melega-count-builder">
                  <span>Liquidity Builder</span><span aria-hidden>→</span>
                </CountRow>
              </Section>

              <Section data-testid="my-melega-quick">
                <SectionLabel>Quick Actions</SectionLabel>
                <QuickGrid>
                  <QuickBtn href={MY_MELEGA_ROUTES.addLiquidity} onClick={closeDrawer}>
                    <span aria-hidden>◇</span>
                    Add Liquidity
                  </QuickBtn>
                  <QuickBtn href={MY_MELEGA_ROUTES.createFarm} onClick={closeDrawer}>
                    <span aria-hidden>▣</span>
                    Create Farm
                  </QuickBtn>
                  <QuickBtn href={MY_MELEGA_ROUTES.createPool} onClick={closeDrawer}>
                    <span aria-hidden>○</span>
                    Create Pool
                  </QuickBtn>
                  <QuickBtn href={MY_MELEGA_ROUTES.swap} onClick={closeDrawer}>
                    <span aria-hidden>⇄</span>
                    Swap
                  </QuickBtn>
                </QuickGrid>
                <PortfolioLink
                  href={MY_MELEGA_ROUTES.portfolio}
                  onClick={closeDrawer}
                  data-testid="my-melega-full-portfolio"
                >
                  View Full Portfolio
                </PortfolioLink>
              </Section>
            </>
          )}
        </Body>
      </Panel>
    </Overlay>
  )

  const target = document.getElementById('portal-root') ?? document.body
  return createPortal(tree, target)
}

export default MyMelegaDrawer
