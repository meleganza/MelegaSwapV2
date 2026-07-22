import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import UserMenu from 'components/Menu/UserMenu'
import { NetworkSwitcher } from 'components/NetworkSwitcher'
import { MELEGA_LOGO_URI } from '../../constants/brand'
import { ds001Colors, ds001FontFamily, ds001Layout } from '../../tokens/ds001'
import { GLOBAL_HEADER_NAV, type HeaderNavItem } from 'app-shell/config/globalHeaderNav'
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
  background: ${ds001Layout.headerBackground};
  backdrop-filter: blur(${ds001Layout.headerBackdropBlur});
  -webkit-backdrop-filter: blur(${ds001Layout.headerBackdropBlur});
  border-bottom: 1px solid ${ds001Layout.headerBorder};
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

  @media (min-width: 1280px) {
    padding: 0 22px;
  }

  @media (min-width: 1440px) {
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
    outline: 2px solid ${ds001Colors.primaryGold};
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
  border: 1px solid #d8b328;
`

const Wordmark = styled.span`
  display: flex;
  align-items: baseline;
  white-space: nowrap;
  font-family: ${ds001FontFamily.sans};
  font-size: 21px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: -0.02em;
`

const MelegaWord = styled.span`
  color: #ffffff;
`

const DexWord = styled.span`
  color: ${ds001Colors.primaryGold};
  margin-left: 3px;
`

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${ds001Layout.headerNavItemGap};
  height: ${ds001Layout.headerHeight};
  flex-shrink: 0;
  margin-left: 30px;
`

const NavItemWrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  height: ${ds001Layout.headerHeight};

  &[data-compact-hide='true'] {
    @media (max-width: 1179px) {
      display: none;
    }
  }
`

const NavTrigger = styled.button<{ $active?: boolean; $open?: boolean }>`
  position: relative;
  height: ${ds001Layout.headerNavItemHeight};
  padding: 0 ${ds001Layout.headerNavItemPaddingX};
  border-radius: ${ds001Layout.headerNavItemRadius};
  border: 0;
  background: ${({ $open, $active }) =>
    $open || $active ? 'rgba(255, 255, 255, 0.055)' : 'transparent'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-family: ${ds001FontFamily.sans};
  font-size: 14px;
  line-height: 18px;
  font-weight: 500;
  letter-spacing: -0.1px;
  color: ${({ $active, $open }) =>
    $active || $open ? '#FFFFFF' : 'rgba(255, 255, 255, 0.68)'};
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 140ms ease,
    color 140ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.055);
    color: #ffffff;
  }

  &:focus-visible {
    outline: 2px solid ${ds001Colors.primaryGold};
    outline-offset: 2px;
  }

  &[data-compact-hide='true'] {
    @media (max-width: 1179px) {
      display: none;
    }
  }
`

const NavLink = styled(Link)<{ $active?: boolean }>`
  position: relative;
  height: ${ds001Layout.headerNavItemHeight};
  padding: 0 ${ds001Layout.headerNavItemPaddingX};
  border-radius: ${ds001Layout.headerNavItemRadius};
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-family: ${ds001FontFamily.sans};
  font-size: 14px;
  line-height: 18px;
  font-weight: 500;
  letter-spacing: -0.1px;
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.68)')};
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.055)' : 'transparent')};
  white-space: nowrap;
  text-decoration: none;
  transition:
    background-color 140ms ease,
    color 140ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.055);
    color: #ffffff;
  }

  &:focus-visible {
    outline: 2px solid ${ds001Colors.primaryGold};
    outline-offset: 2px;
  }

  &[data-compact-hide='true'] {
    @media (max-width: 1179px) {
      display: none;
    }
  }
`

const ActiveBar = styled.span`
  display: none;
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
    width: clamp(240px, 22vw, 320px);
  }

  @media (max-width: 1279px) {
    [data-melega-global-search] {
      width: clamp(210px, 18vw, 280px);
    }
  }

  @media (max-width: 1179px) {
    [data-melega-global-search] {
      width: clamp(180px, 16vw, 240px);
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

const OverflowWrap = styled.div`
  position: relative;
  display: none;

  @media (max-width: 1179px) {
    display: block;
  }
`

const OverflowBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: ${ds001Colors.secondaryText};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: #141414;
    border-color: #232323;
    color: #ffffff;
  }

  &:focus-visible {
    outline: 2px solid ${ds001Colors.primaryGold};
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
          <Logo src={MELEGA_LOGO_URI} alt="" width={38} height={38} />
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
                <NavItemWrap key={item.id} data-compact-hide={item.compactHide ? 'true' : undefined}>
                  <NavLink
                    href={item.href}
                    $active={active}
                    aria-current={active ? 'page' : undefined}
                    data-testid={`melega-header-nav-${item.id}`}
                  >
                    {item.label}
                    {active ? <ActiveBar aria-hidden /> : null}
                  </NavLink>
                </NavItemWrap>
              )
            }

            const open = openMenu === item.id
            return (
              <NavItemWrap key={item.id} data-compact-hide={item.compactHide ? 'true' : undefined}>
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
                  {active && !open ? <ActiveBar aria-hidden /> : null}
                </NavTrigger>
                {open ? (
                  <HeaderNavDropdown
                    items={item.items}
                    width={item.menuWidth}
                    pathname={resolvedPath}
                    query={query}
                    onClose={closeMenus}
                    onNavigate={closeMenus}
                    showIcons={item.id === 'build'}
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
          <OverflowWrap>
            <OverflowBtn
              type="button"
              aria-label="Open Build menu"
              aria-haspopup="menu"
              aria-expanded={openMenu === 'overflow-build'}
              data-testid="melega-header-overflow"
              onClick={() => setOpenMenu(openMenu === 'overflow-build' ? null : 'overflow-build')}
            >
              <IconMenu />
            </OverflowBtn>
            {openMenu === 'overflow-build'
              ? (() => {
                  const build = GLOBAL_HEADER_NAV.find((i) => i.id === 'build')
                  if (!build || build.kind !== 'menu') return null
                  return (
                    <HeaderNavDropdown
                      items={build.items}
                      width={build.menuWidth}
                      pathname={resolvedPath}
                      query={query}
                      onClose={closeMenus}
                      onNavigate={closeMenus}
                      showIcons
                    />
                  )
                })()
              : null}
          </OverflowWrap>
        </RightCluster>
      </Inner>
    </Bar>
  )
}

export default MelegaGlobalHeader
