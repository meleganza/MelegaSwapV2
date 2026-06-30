import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { useCakeBusdPrice } from 'hooks/useBUSDPrice'
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
  padding: 18px 14px;
  z-index: 100;
  overflow-y: auto;

  @media (min-width: 1024px) {
    display: block;
  }
`

const BrandRow = styled.div`
  height: 48px;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
`

const Section = styled.div`
  margin-top: 22px;
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
  color: ${({ $active }) => ($active ? ht.gold : ht.textMuted)};
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
  left: 14px;
  right: 14px;
`

const MarcoCard = styled.div`
  height: 74px;
  background: ${ht.surface1};
  border: 1px solid ${ht.borderMedium};
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`

const MarcoLogo = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${ht.goldBright}, ${ht.goldDark});
  flex-shrink: 0;
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
  gap: 8px;
  margin-bottom: 8px;
  padding: 0 4px;
`

const SocialLink = styled.a`
  color: ${ht.textMuted};
  font-size: 11px;
  text-decoration: none;
  &:hover {
    color: ${ht.gold};
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
      { href: '/liquidity', label: 'Liquidity', match: (p: string) => p.startsWith('/liquidity') || p.startsWith('/add') || p.startsWith('/remove') },
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
    {name === 'coins' && <><circle cx="9" cy="14" r="4" /><circle cx="15" cy="10" r="4" /></>}
    {name === 'compass' && <><circle cx="12" cy="12" r="9" /><path d="M14 10l-2 6-2-6 6-2z" /></>}
    {name === 'rocket' && <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />}
    {name === 'wallet' && <><rect x="4" y="7" width="16" height="12" rx="2" /><path d="M16 12h4v4h-4z" /></>}
    {name === 'grid' && <><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /></>}
    {name === 'folder' && <path d="M4 7h6l2 2h8v9H4z" />}
    {name === 'star' && <path d="M12 3l2.4 5.6L20 9.3l-4.5 3.9 1.4 5.8L12 16.8 7.1 19l1.4-5.8L4 9.3l5.6-.7z" />}
    {name === 'list' && <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" /></>}
  </svg>
)

const iconFor = (label: string) => {
  if (label === 'Swap') return 'swap'
  if (label === 'Liquidity') return 'drop'
  if (label.includes('Farm') || label.includes('Staking') || label.includes('Reward')) return 'coins'
  if (label.includes('Trending') || label.includes('Projects') || label.includes('Assets')) return label === 'Trending' ? 'star' : 'folder'
  if (label.includes('List') || label.includes('Create')) return 'rocket'
  return 'wallet'
}

export const HomeSidebar: React.FC<{ marcoPriceLabel?: string }> = ({ marcoPriceLabel }) => {
  const { pathname } = useRouter()

  return (
    <Sidebar>
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
          <MarcoLogo />
          <div>
            <MarcoText>MARCO</MarcoText>
            {marcoPriceLabel && <MarcoPrice>{marcoPriceLabel}</MarcoPrice>}
          </div>
        </MarcoCard>
        <SocialRow>
          <SocialLink href="https://t.me/melegafinance" target="_blank" rel="noreferrer">
            TG
          </SocialLink>
          <SocialLink href="https://x.com/melegafinance" target="_blank" rel="noreferrer">
            X
          </SocialLink>
          <SocialLink href="https://discord.gg/melega" target="_blank" rel="noreferrer">
            DC
          </SocialLink>
        </SocialRow>
        <Lang>EN</Lang>
      </BottomPanel>
    </Sidebar>
  )
}

export default HomeSidebar
