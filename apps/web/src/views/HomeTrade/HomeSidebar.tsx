import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { MelegaBrandLockup } from './MelegaBrandLockup'
import { SafeLogo } from './homeTradeShared'
import { ht } from './homeTradeTokens'

const Sidebar = styled.aside`
  display: none;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${ht.sidebarWidth};
  background: ${ht.sidebarBg};
  border-right: 1px solid ${ht.borderSidebar};
  padding: 22px 14px 18px;
  z-index: 100;
  box-sizing: border-box;
  flex-direction: column;

  @media (min-width: 1024px) {
    display: flex;
    overflow: hidden;
  }
`

const BrandRow = styled.div`
  height: 46px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

const NavScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 2px;

  &::-webkit-scrollbar {
    width: 0;
  }
`

const Section = styled.div`
  margin-top: 22px;

  &:first-child {
    margin-top: 0;
  }
`

const SectionLabel = styled.div`
  font-family: ${ht.fontBody};
  font-size: 10px;
  font-weight: 700;
  color: ${ht.textSoft};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 8px;
  padding: 0 2px;
`

const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  text-decoration: none;
  font-family: ${ht.fontBody};
  font-size: 13px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? ht.gold : ht.textNavInactive)};
  background: ${({ $active }) => ($active ? ht.goldSoftBg : 'transparent')};
  margin-bottom: 4px;
  position: relative;
  transition: background 150ms ease, color 150ms ease;

  ${({ $active }) =>
    $active &&
    `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 8px;
      bottom: 8px;
      width: 2px;
      border-radius: 2px;
      background: ${ht.gold};
    }
  `}

  &:hover {
    background: ${({ $active }) => ($active ? ht.goldSoftBg : 'rgba(255,255,255,0.045)')};
    color: ${({ $active }) => ($active ? ht.gold : ht.white)};
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    stroke-width: 1.75;
  }
`

const BottomPanel = styled.div`
  flex-shrink: 0;
  margin-top: 12px;
  padding-top: 12px;
`

const MarcoCard = styled.div`
  width: 100%;
  height: 72px;
  background: ${ht.surface1};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
`

const MarcoMeta = styled.div`
  min-width: 0;
`

const MarcoText = styled.div`
  font-family: ${ht.fontBody};
  font-size: 13px;
  font-weight: 700;
  color: ${ht.white};
`

const MarcoPrice = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${ht.green};
  margin-top: 2px;
`

const Lang = styled.div`
  font-size: 12px;
  color: ${ht.textSoft};
  margin-top: 8px;
  height: 28px;
  display: flex;
  align-items: center;
  padding: 0 2px;
`

const sections = [
  {
    label: 'TRADE',
    items: [
      { href: '/', label: 'Swap', match: (p: string) => p === '/' },
      {
        href: '/liquidity',
        label: 'Liquidity',
        match: (p: string) => p.startsWith('/liquidity') || p.startsWith('/add') || p.startsWith('/remove'),
      },
    ],
  },
  {
    label: 'EARN',
    items: [
      { href: '/farms', label: 'Farms', match: (p: string) => p.startsWith('/farms') },
      { href: '/pools', label: 'Staking', match: (p: string) => p.startsWith('/pools') },
    ],
  },
  {
    label: 'FIND',
    items: [
      { href: '/projects', label: 'Trending', match: (p: string) => p === '/projects' },
      { href: '/projects', label: 'Projects', match: (p: string) => p.startsWith('/projects') },
      { href: '/assets', label: 'Assets', match: (p: string) => p.startsWith('/assets') },
      { href: '/query', label: 'Intelligence', match: (p: string) => p.startsWith('/query') || p.startsWith('/presence') },
    ],
  },
  {
    label: 'BUILD',
    items: [
      { href: '/launch', label: 'List project', match: (p: string) => p.startsWith('/launch') },
      { href: '/add', label: 'Create pool', match: (p: string) => p.startsWith('/add') },
      { href: '/pools', label: 'Reward MARCO holders', match: () => false },
    ],
  },
  {
    label: 'PORTFOLIO',
    items: [
      { href: '/workspace', label: 'Overview', match: (p: string) => p === '/workspace' },
      { href: '/liquidity', label: 'Positions', match: (p: string) => p === '/liquidity' },
      { href: '/farms', label: 'Rewards', match: () => false },
      { href: '/workspace', label: 'Activity', match: () => false },
    ],
  },
]

const NavIcon: React.FC<{ name: string }> = ({ name }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    {name === 'swap' && <path d="M7 10l3-3 3 3M17 14l-3 3-3-3" />}
    {name === 'drop' && <path d="M12 3c3 4 6 7 6 10a6 6 0 11-12 0c0-3 3-6 6-10z" />}
    {name === 'coins' && (
      <>
        <circle cx="9" cy="14" r="4" />
        <circle cx="15" cy="10" r="4" />
      </>
    )}
    {name === 'brain' && (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8M12 8v8" />
      </>
    )}
    {name === 'folder' && <path d="M4 7h6l2 2h8v9H4z" />}
    {name === 'star' && <path d="M12 3l2.4 5.6L20 9.3l-4.5 3.9 1.4 5.8L12 16.8 7.1 19l1.4-5.8L4 9.3l5.6-.7z" />}
    {name === 'rocket' && <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />}
    {name === 'wallet' && (
      <>
        <rect x="4" y="7" width="16" height="12" rx="2" />
        <path d="M16 12h4v4h-4z" />
      </>
    )}
  </svg>
)

const iconFor = (label: string) => {
  if (label === 'Swap') return 'swap'
  if (label === 'Liquidity') return 'drop'
  if (label.includes('Farm') || label.includes('Staking') || label.includes('Reward')) return 'coins'
  if (label === 'Intelligence') return 'brain'
  if (label.includes('Trending')) return 'star'
  if (label.includes('Projects') || label.includes('Assets')) return 'folder'
  if (label.includes('List') || label.includes('Create')) return 'rocket'
  return 'wallet'
}

export const HomeSidebar: React.FC<{ marcoPriceLabel?: string }> = ({ marcoPriceLabel }) => {
  const { pathname } = useRouter()

  return (
    <Sidebar data-home-sidebar="true">
      <BrandRow>
        <MelegaBrandLockup size="desktop" />
      </BrandRow>
      <NavScroll>
        {sections.map((section) => (
          <Section key={section.label}>
            <SectionLabel>{section.label}</SectionLabel>
            {section.items.map((item) => (
              <NavItem key={`${section.label}-${item.label}`} href={item.href} $active={item.match(pathname)}>
                <NavIcon name={iconFor(item.label)} />
                {item.label}
              </NavItem>
            ))}
          </Section>
        ))}
      </NavScroll>
      <BottomPanel>
        <MarcoCard>
          <SafeLogo src={ht.marcoLogoUri} alt="MARCO" size={32} fallbackMark="M" />
          <MarcoMeta>
            <MarcoText>MARCO</MarcoText>
            {marcoPriceLabel && <MarcoPrice>{marcoPriceLabel}</MarcoPrice>}
          </MarcoMeta>
        </MarcoCard>
        <Lang>EN</Lang>
      </BottomPanel>
    </Sidebar>
  )
}

export default HomeSidebar
