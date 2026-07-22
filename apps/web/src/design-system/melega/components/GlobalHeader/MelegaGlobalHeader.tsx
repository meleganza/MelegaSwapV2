import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import UserMenu from 'components/Menu/UserMenu'
import { NetworkSwitcher } from 'components/NetworkSwitcher'
import { MELEGA_LOGO_URI } from '../../constants/brand'
import { ds001FontFamily, ds001Layout } from '../../tokens/ds001'
import { uxRebuildColors } from '../../tokens/uxRebuild'
import {
  ANALYTICS_MORE_ITEM,
  GLOBAL_HEADER_NAV,
  MORE_DROPDOWN_ITEMS,
  type HeaderNavItem,
} from 'app-shell/config/globalHeaderNav'
import MelegaLanguageControl from 'app-shell/MelegaLanguageControl'
import GlobalSearch from 'app-shell/components/GlobalSearch'
import HeaderNavDropdown from './HeaderNavDropdown'
import { IconChevronDown, IconMenu } from './HeaderIcons'

const Bar = styled.header`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: ${ds001Layout.headerHeight};
  z-index: ${ds001Layout.headerZIndex};
  background: ${uxRebuildColors.headerBg};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid ${uxRebuildColors.divider};
  box-shadow: none;
  box-sizing: border-box;

  @media (min-width: 1024px) {
    display: block;
  }
`

const Inner = styled.div`
  width: 100%;
  max-width: none;
  height: ${ds001Layout.headerHeight};
  padding: 0 ${ds001Layout.headerPaddingX};
  display: flex;
  align-items: center;
  gap: 0;
  box-sizing: border-box;

  @media (min-width: 1600px) {
    padding: 0 ${ds001Layout.headerPaddingXWide};
  }
`

const Brand = styled(Link)`
  width: ${ds001Layout.headerLogoBlockWidth};
  height: ${ds001Layout.headerHeight};
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  gap: ${ds001Layout.headerLogoTitleGap};
  text-decoration: none;
  flex-shrink: 0;
  transition: opacity 160ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    opacity: 0.92;
  }

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 4px;
    border-radius: 10px;
  }
`

const Logo = styled.img`
  width: ${ds001Layout.headerLogoSize};
  height: ${ds001Layout.headerLogoSize};
  flex: 0 0 ${ds001Layout.headerLogoSize};
  object-fit: contain;
  border-radius: 50%;
`

const Wordmark = styled.span`
  display: flex;
  align-items: baseline;
  white-space: nowrap;
  font-family: ${ds001FontFamily.sans};
  font-size: 20px;
  line-height: 24px;
  font-weight: 700;
  letter-spacing: -0.4px;
`

const MelegaWord = styled.span`
  color: #ffffff;
`

const DexWord = styled.span`
  color: ${uxRebuildColors.gold};
  margin-left: 3px;
`

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${ds001Layout.headerNavItemGap};
  height: ${ds001Layout.headerHeight};
  flex-shrink: 0;
  margin-left: 0;
`

const NavItemWrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  height: ${ds001Layout.headerHeight};
`

const NavTrigger = styled.button<{ $active?: boolean; $open?: boolean }>`
  position: relative;
  height: ${ds001Layout.headerNavItemHeight};
  padding: 0 ${ds001Layout.headerNavItemPaddingX};
  border-radius: ${ds001Layout.headerNavItemRadius};
  border: 0;
  background: ${({ $open }) => ($open ? '#181818' : 'transparent')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-family: ${ds001FontFamily.sans};
  font-size: 14px;
  line-height: 18px;
  font-weight: 550;
  letter-spacing: -0.1px;
  color: ${({ $active, $open }) =>
    $active ? uxRebuildColors.gold : $open ? uxRebuildColors.text : uxRebuildColors.secondary};
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 160ms cubic-bezier(0.4, 0, 0.2, 1),
    color 160ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${uxRebuildColors.hover};
    color: ${uxRebuildColors.text};
  }

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }

  &[data-compact-hide='true'] {
    @media (max-width: 1279px) {
      display: none;
    }
  }
`

const NavLink = styled(Link)<{ $active?: boolean }>`
  position: relative;
  height: ${ds001Layout.headerNavItemHeight};
  padding: 0 ${ds001Layout.headerNavItemPaddingX};
  border-radius: 999px;
  border: ${({ $active }) => ($active ? `1px solid rgba(221,185,47,0.45)` : '1px solid transparent')};
  background: ${({ $active }) => ($active ? 'rgba(221,185,47,0.08)' : 'transparent')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: ${ds001FontFamily.sans};
  font-size: 14px;
  line-height: 18px;
  font-weight: 550;
  letter-spacing: -0.1px;
  color: ${({ $active }) => ($active ? uxRebuildColors.gold : uxRebuildColors.secondary)};
  white-space: nowrap;
  text-decoration: none;
  transition:
    background-color 160ms cubic-bezier(0.4, 0, 0.2, 1),
    color 160ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 160ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${uxRebuildColors.hover};
    color: ${uxRebuildColors.text};
  }

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }

  &[data-compact-hide='true'] {
    @media (max-width: 1279px) {
      display: none;
    }
  }
`

const NewBadge = styled.span`
  height: 14px;
  padding: 0 5px;
  border-radius: 999px;
  background: ${uxRebuildColors.newViolet};
  color: #ffffff;
  font-size: 8px;
  line-height: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
`

const Chevron = styled.span<{ $open?: boolean }>`
  display: inline-flex;
  transition: transform 160ms ease;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'none')};
`

const SearchRegion = styled.div`
  flex: 1 1 auto;
  min-width: 220px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-left: 12px;
  margin-right: 8px;

  [data-melega-global-search] {
    width: clamp(190px, 18vw, 300px);
  }

  @media (max-width: 1279px) {
    [data-melega-global-search] {
      width: clamp(180px, 16vw, 210px);
    }
  }
`

const RightCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: ${ds001Layout.headerHeight};
  flex-shrink: 0;
`

const OverflowBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: ${uxRebuildColors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: ${uxRebuildColors.hover};
    border-color: ${uxRebuildColors.borderStrong};
    color: ${uxRebuildColors.text};
  }

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }
`

const LangSlot = styled.div`
  @media (max-width: 1279px) {
    display: none;
  }
`

function isNavActive(item: HeaderNavItem, pathname: string): boolean {
  return item.match(pathname)
}

export const MELEGA_APP_HEADER_HEIGHT = ds001Layout.headerHeight

export interface MelegaGlobalHeaderProps {
  /** Optional override for tests. */
  pathnameOverride?: string
}

const MelegaGlobalHeader: React.FC<MelegaGlobalHeaderProps> = ({ pathnameOverride }) => {
  const router = useRouter()
  const pathname = pathnameOverride ?? router.pathname
  const asPath = router.asPath?.split('?')[0] ?? pathname
  const query = router.query as Record<string, string | string[] | undefined>
  const { address } = useAccount()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const rootRef = useRef<HTMLElement>(null)

  const resolvedPath = useMemo(() => {
    if (asPath.startsWith('/@') || asPath.startsWith('/project-hq')) return asPath
    return pathname
  }, [asPath, pathname])

  const moreItems = useMemo(() => {
    const hasAnalytics = MORE_DROPDOWN_ITEMS.some((i) => i.id === 'analytics')
    return hasAnalytics ? MORE_DROPDOWN_ITEMS : [ANALYTICS_MORE_ITEM, ...MORE_DROPDOWN_ITEMS]
  }, [])

  const closeMenus = useCallback(() => setOpenMenu(null), [])

  useEffect(() => {
    closeMenus()
  }, [pathname, router.asPath, closeMenus])

  useEffect(() => {
    if (!openMenu) return undefined
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeMenus()
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [openMenu, closeMenus])

  return (
    <Bar ref={rootRef} data-melega-app-header data-melega-global-header data-testid="melega-global-header">
      <Inner>
        <Brand href="/" aria-label="Melega DEX home" data-testid="melega-header-brand">
          <Logo src={MELEGA_LOGO_URI} alt="" width={36} height={36} />
          <Wordmark>
            <MelegaWord>Melega</MelegaWord>
            <DexWord>DEX</DexWord>
          </Wordmark>
        </Brand>

        <Nav aria-label="Primary navigation" data-testid="melega-header-primary-nav">
          {GLOBAL_HEADER_NAV.map((item) => {
            const active = isNavActive(item, resolvedPath)
            if (item.kind === 'link') {
              return (
                <NavItemWrap key={item.id}>
                  <NavLink
                    href={item.href}
                    $active={active}
                    data-compact-hide={item.compactHide ? 'true' : undefined}
                    aria-current={active ? 'page' : undefined}
                    data-testid={`melega-header-nav-${item.id}`}
                  >
                    {item.label}
                    {item.badge === 'NEW' ? <NewBadge aria-label="New">NEW</NewBadge> : null}
                  </NavLink>
                </NavItemWrap>
              )
            }

            const open = openMenu === item.id
            const menuItems = item.id === 'more' ? moreItems : item.items
            return (
              <NavItemWrap key={item.id}>
                <NavTrigger
                  type="button"
                  $active={active}
                  $open={open}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  data-testid={`melega-header-nav-${item.id}`}
                  onClick={() => setOpenMenu(open ? null : item.id)}
                >
                  {item.label}
                  <Chevron $open={open}>
                    <IconChevronDown />
                  </Chevron>
                </NavTrigger>
                {open ? (
                  <HeaderNavDropdown
                    items={menuItems}
                    width={item.menuWidth}
                    pathname={resolvedPath}
                    query={query}
                    onClose={closeMenus}
                    onNavigate={closeMenus}
                    showIcons={item.id === 'more'}
                  />
                ) : null}
              </NavItemWrap>
            )
          })}
        </Nav>

        <SearchRegion>
          <GlobalSearch />
        </SearchRegion>

        <RightCluster data-testid="melega-header-actions">
          <div className="melega-shell-network" data-testid="melega-header-chain">
            <NetworkSwitcher />
          </div>
          <LangSlot>
            <MelegaLanguageControl />
          </LangSlot>
          {address ? (
            <UserMenu />
          ) : (
            <ConnectWalletButton className="melega-shell-connect" data-testid="melega-header-connect">
              Connect Wallet
            </ConnectWalletButton>
          )}
          <OverflowBtn
            type="button"
            aria-label="Open application menu"
            aria-haspopup="menu"
            aria-expanded={openMenu === 'more'}
            data-testid="melega-header-overflow"
            onClick={() => setOpenMenu(openMenu === 'more' ? null : 'more')}
          >
            <IconMenu />
          </OverflowBtn>
        </RightCluster>
      </Inner>
    </Bar>
  )
}

export default MelegaGlobalHeader
