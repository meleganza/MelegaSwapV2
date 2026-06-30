import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { MelegaBrandLockup } from './MelegaBrandLockup'
import { ht } from './homeTradeTokens'

const Sidebar = styled.aside`
  display: none;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${ht.sidebarWidth};
  background: ${ht.sidebarBg};
  border-right: 1px solid ${ht.borderSoft};
  padding: 24px 16px;
  z-index: 100;
  overflow-y: auto;
  box-sizing: border-box;

  @media (min-width: 1024px) {
    display: block;
  }
`

const BrandRow = styled.div`
  height: 48px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
`

const Section = styled.div`
  margin-top: 18px;

  &:first-of-type {
    margin-top: 0;
  }
`

const SectionLabel = styled.div`
  font-family: ${ht.fontBody};
  font-size: 11px;
  font-weight: 600;
  color: ${ht.textSoft};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 6px;
  padding: 0 4px;
`

const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  text-decoration: none;
  font-family: ${ht.fontBody};
  font-size: 14px;
  color: ${({ $active }) => ($active ? ht.gold : ht.textNavInactive)};
  background: ${({ $active }) => ($active ? ht.goldSoftBg : 'transparent')};
  margin-bottom: 2px;
  transition: background 150ms ease, color 150ms ease;

  &:hover {
    background: ${({ $active }) => ($active ? ht.goldSoftBg : 'rgba(255,255,255,0.04)')};
    color: ${({ $active }) => ($active ? ht.gold : ht.white)};
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    opacity: 0.9;
  }
`

const BottomPanel = styled.div`
  position: absolute;
  bottom: 18px;
  left: 16px;
  right: 16px;
`

const MarcoCard = styled.div`
  height: 74px;
  background: ${ht.surface1};
  border: 1px solid ${ht.borderSoft};
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`

const MarcoLogo = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
`

const MarcoText = styled.div`
  font-family: ${ht.fontBody};
  font-size: 13px;
  color: ${ht.textMain};
  font-weight: 600;
`

const MarcoPrice = styled.div`
  font-size: 12px;
  color: ${ht.green};
  margin-top: 2px;
`

const SocialRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  padding: 0 4px;
`

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid ${ht.borderSoft};
  color: ${ht.textNavInactive};
  text-decoration: none;
  transition: color 150ms ease, border-color 150ms ease;

  &:hover {
    color: ${ht.gold};
    border-color: ${ht.borderGold};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`

const Lang = styled.div`
  font-size: 12px;
  color: ${ht.textSoft};
  padding: 0 4px;
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    {name === 'swap' && <path d="M7 10l3-3 3 3M17 14l-3 3-3-3" />}
    {name === 'drop' && <path d="M12 3c3 4 6 7 6 10a6 6 0 11-12 0c0-3 3-6 6-10z" />}
    {name === 'coins' && (
      <>
        <circle cx="9" cy="14" r="4" />
        <circle cx="15" cy="10" r="4" />
      </>
    )}
    {name === 'compass' && (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M14 10l-2 6-2-6 6-2z" />
      </>
    )}
    {name === 'rocket' && <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />}
    {name === 'wallet' && (
      <>
        <rect x="4" y="7" width="16" height="12" rx="2" />
        <path d="M16 12h4v4h-4z" />
      </>
    )}
    {name === 'folder' && <path d="M4 7h6l2 2h8v9H4z" />}
    {name === 'star' && <path d="M12 3l2.4 5.6L20 9.3l-4.5 3.9 1.4 5.8L12 16.8 7.1 19l1.4-5.8L4 9.3l5.6-.7z" />}
    {name === 'brain' && (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8M12 8v8" />
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

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
)

export const HomeSidebar: React.FC<{ marcoPriceLabel?: string }> = ({ marcoPriceLabel }) => {
  const { pathname } = useRouter()

  return (
    <Sidebar data-home-sidebar="true">
      <BrandRow>
        <MelegaBrandLockup size="desktop" />
      </BrandRow>
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
      <BottomPanel>
        <MarcoCard>
          <MarcoLogo src={ht.marcoLogoUri} alt="MARCO" />
          <div>
            <MarcoText>MARCO</MarcoText>
            {marcoPriceLabel && <MarcoPrice>{marcoPriceLabel}</MarcoPrice>}
          </div>
        </MarcoCard>
        <SocialRow>
          <SocialLink href="https://t.me/melegafinance" target="_blank" rel="noreferrer" aria-label="Telegram">
            <TelegramIcon />
          </SocialLink>
          <SocialLink href="https://x.com/melegafinance" target="_blank" rel="noreferrer" aria-label="X">
            <XIcon />
          </SocialLink>
          <SocialLink href="https://discord.gg/melega" target="_blank" rel="noreferrer" aria-label="Discord">
            <DiscordIcon />
          </SocialLink>
        </SocialRow>
        <Lang>EN</Lang>
      </BottomPanel>
    </Sidebar>
  )
}

export default HomeSidebar
