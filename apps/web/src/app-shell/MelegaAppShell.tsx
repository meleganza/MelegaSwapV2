import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { MarcoConnect } from 'components/MarcoWidgets'
import { NetworkSwitcher } from 'components/NetworkSwitcher'
import { MelegaBrandLockup } from 'design-system/melega/components/BrandLockup'
import { MelegaGlobalHeader, MELEGA_APP_HEADER_HEIGHT } from 'design-system/melega/components/GlobalHeader'
import { MelegaBottomNavigation } from 'design-system/melega/components/BottomNavigation'
import { colors } from 'design-system/melega/tokens/colors'
import { ds001Layout } from 'design-system/melega/tokens/ds001'
import { melegaZIndex } from 'design-system/melega/tokens/melegaZIndex'
import { IconUser } from 'design-system/melega/components/GlobalHeader/HeaderIcons'
import { uxRebuildColors, uxRebuildFont } from 'design-system/melega/tokens/uxRebuild'
import { MyMelegaProvider, preloadMyMelegaDrawer, useMyMelegaDrawer } from 'components/MyMelega/MyMelegaProvider'
import { shellBottomNavItems } from './config/navigation'
import { GLOBAL_HEADER_NAV } from './config/globalHeaderNav'
import { ShellNavIcon } from './icons'
import { AppShellUIKitNeutralizer } from './AppShellStyles'
import {
  GlobalTrendingBar,
  MELEGA_TRENDING_BAR_DESKTOP_HEIGHT,
  MELEGA_TRENDING_BAR_MOBILE_HEIGHT,
} from './GlobalTrendingBar'
import { MelegaDexFooter } from 'views/HomeTrade/MelegaDexFooter'
import { TopMoversSnapshotProvider } from 'views/HomeTrade/TopMoversSnapshotContext'

const MyMelegaDrawer = dynamic(preloadMyMelegaDrawer, { ssr: false, loading: () => null })

const MOBILE_HEADER_H = '56px'
const MOBILE_BOTTOM_NAV_H = '64px'

const DesktopMain = styled.main`
  margin-left: 0;
  /* Mobile sticky stack: mobile header + trending bar */
  padding: calc(${MOBILE_HEADER_H} + env(safe-area-inset-top, 0px) + ${MELEGA_TRENDING_BAR_MOBILE_HEIGHT}) 16px
    calc(${MOBILE_BOTTOM_NAV_H} + env(safe-area-inset-bottom, 0px));
  background: ${uxRebuildColors.pageBg};
  min-height: 100dvh;
  min-height: 100svh;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (min-width: 1024px) {
    margin-left: 0;
    /* Desktop sticky stack: 72 header + 44 trending — content begins below stack */
    padding: calc(${MELEGA_APP_HEADER_HEIGHT} + ${MELEGA_TRENDING_BAR_DESKTOP_HEIGHT}) ${ds001Layout.pagePaddingX}
      ${ds001Layout.pagePaddingBottom};
  }

  @media (min-width: 1024px) and (max-width: 1279px) {
    padding-left: 24px;
    padding-right: 24px;
  }

  /* Desktop browser narrowed below 1024px: retain the desktop chrome while
     page modules may continue using their responsive layouts. */
  @media (min-width: 768px) and (max-width: 1023px) and (hover: hover) and (pointer: fine) {
    padding: calc(${MELEGA_APP_HEADER_HEIGHT} + ${MELEGA_TRENDING_BAR_DESKTOP_HEIGHT}) 24px
      ${ds001Layout.pagePaddingBottom};
  }
`

const Root = styled.div`
  min-height: 100dvh;
  min-height: 100svh;
  background: ${uxRebuildColors.pageBg};
  color: ${colors.textPrimary};
  font-family: ${uxRebuildFont};
  overflow-x: hidden;
  width: 100%;
`

const Content = styled.div`
  max-width: ${ds001Layout.contentMaxWidth};
  margin: 0 auto;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
`

const FooterSlot = styled.div`
  margin-top: 20px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  /* Clear mobile bottom nav */
  padding-bottom: 8px;

  @media (max-width: 1023px) {
    padding-bottom: calc(${MOBILE_BOTTOM_NAV_H} + 8px + env(safe-area-inset-bottom, 0px));
  }

  @media (min-width: 768px) and (max-width: 1023px) and (hover: hover) and (pointer: fine) {
    padding-bottom: 8px;
  }
`

const MobileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: calc(${MOBILE_HEADER_H} + env(safe-area-inset-top, 0px));
  padding: env(safe-area-inset-top, 0px) 10px 0;
  background: ${uxRebuildColors.pageBg};
  border-bottom: 1px solid ${uxRebuildColors.divider};
  z-index: 95;
  box-sizing: border-box;

  @media (min-width: 1024px) {
    display: none;
  }

  @media (min-width: 768px) and (max-width: 1023px) and (hover: hover) and (pointer: fine) {
    display: none;
  }
`

const MobileNetwork = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-width: 0;

  /* Keep chain control tappable on 390px beside the official MARCO Connect control. */
  [data-testid='network-switcher-root'] {
    min-width: 40px;
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  [data-network-status-pill] {
    width: 40px;
    min-width: 40px;
    max-width: 40px;
    overflow: hidden;
  }

  [data-network-status-pill] > div {
    padding-left: 8px !important;
    padding-right: 8px !important;
    justify-content: center !important;
  }

  [data-chain-label] {
    display: none !important;
  }
`

const MobileMyMelegaTrigger = styled.button`
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(244, 196, 48, 0.35);
  background: linear-gradient(160deg, rgba(244, 196, 48, 0.16) 0%, rgba(20, 20, 20, 0.9) 100%);
  color: ${uxRebuildColors.gold};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }

  &[aria-expanded='true'] {
    border-color: rgba(244, 196, 48, 0.7);
  }

  @media (max-width: 419px) {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
  }
`

const MobileMenuTrigger = styled.button`
  width: 40px;
  height: 40px;
  min-width: 40px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(244, 196, 48, 0.35);
  background: rgba(18, 18, 18, 0.96);
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 4px;
  color: ${uxRebuildColors.gold};
  cursor: pointer;
  flex-shrink: 0;

  span {
    display: block;
    width: 100%;
    height: 2px;
    border-radius: 999px;
    background: currentColor;
    transition: transform 160ms ease, opacity 160ms ease;
  }

  &[aria-expanded='true'] span:nth-child(1) {
    transform: translateY(6px) rotate(45deg);
  }

  &[aria-expanded='true'] span:nth-child(2) {
    opacity: 0;
  }

  &[aria-expanded='true'] span:nth-child(3) {
    transform: translateY(-6px) rotate(-45deg);
  }

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }
`

const MobileMenu = styled.nav`
  position: fixed;
  top: calc(${MOBILE_HEADER_H} + env(safe-area-inset-top, 0px));
  right: 8px;
  z-index: ${melegaZIndex.chromeDropdown};
  width: min(272px, calc(100vw - 16px));
  padding: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  border: 1px solid rgba(244, 196, 48, 0.32);
  border-radius: 14px;
  background: rgba(8, 8, 8, 0.98);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.58);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  a {
    min-width: 0;
    height: 40px;
    padding: 0 10px;
    border-radius: 9px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: ${uxRebuildColors.secondary};
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }

  a[aria-current='page'] {
    color: ${uxRebuildColors.gold};
    border-color: rgba(244, 196, 48, 0.42);
    background: rgba(244, 196, 48, 0.1);
  }

  @media (min-width: 1024px) {
    display: none;
  }

  @media (min-width: 768px) and (max-width: 1023px) and (hover: hover) and (pointer: fine) {
    display: none;
  }
`

export interface MelegaAppShellProps {
  children: React.ReactNode
}

const MobileMyMelegaButton: React.FC = () => {
  const { open, toggleDrawer } = useMyMelegaDrawer()
  return (
    <MobileMyMelegaTrigger
      type="button"
      aria-label="Open My Melega"
      title="My Melega"
      aria-haspopup="dialog"
      aria-expanded={open}
      data-testid="melega-mobile-my-melega"
      onClick={toggleDrawer}
      onPointerEnter={preloadMyMelegaDrawer}
      onFocus={preloadMyMelegaDrawer}
    >
      <IconUser size={18} />
    </MobileMyMelegaTrigger>
  )
}

/**
 * DS001.2 — Shared Melega DEX shell.
 * Desktop: 72px global header + 44px Trending Bar, no permanent left sidebar.
 * Compact desktop (768–1023 with mouse/trackpad): compressed desktop header.
 * Mobile/touch (<1024): compact mobile header + 36px Trending Bar + bottom navigation.
 */
const MelegaAppShellInner: React.FC<MelegaAppShellProps> = ({ children }) => {
  const { pathname } = useRouter()
  const { open: isMyMelegaOpen } = useMyMelegaDrawer()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const bottomItems = useMemo(
    () =>
      shellBottomNavItems.map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        icon: <ShellNavIcon name={item.icon} />,
      })),
    [],
  )

  const activeBottomId = shellBottomNavItems.find((item) => item.match(pathname))?.id

  return (
    <Root data-melega-app-shell data-melega-shell-no-sidebar>
      <AppShellUIKitNeutralizer />

      <MelegaGlobalHeader />
      <GlobalTrendingBar />

      <MobileHeader data-melega-mobile-header>
        <MelegaBrandLockup size="mobile" iconOnly />
        <MobileNetwork className="melega-shell-mobile-network">
          <NetworkSwitcher />
        </MobileNetwork>
        <MarcoConnect size="icon" activation="mobile" />
        <MobileMyMelegaButton />
        <MobileMenuTrigger
          type="button"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="melega-mobile-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
          data-testid="melega-mobile-menu-trigger"
        >
          <span />
          <span />
          <span />
        </MobileMenuTrigger>
      </MobileHeader>

      {mobileMenuOpen ? (
        <MobileMenu id="melega-mobile-navigation" aria-label="Mobile navigation" data-testid="melega-mobile-menu">
          {GLOBAL_HEADER_NAV.filter((item) => item.kind === 'link').map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={item.match(pathname) ? 'page' : undefined}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </MobileMenu>
      ) : null}

      <DesktopMain data-melega-shell-main>
        <Content>
          {children}
          <FooterSlot data-testid="melega-global-footer">
            <MelegaDexFooter />
          </FooterSlot>
        </Content>
      </DesktopMain>

      <MelegaBottomNavigation items={bottomItems} activeId={activeBottomId} />
      {isMyMelegaOpen ? <MyMelegaDrawer /> : null}
    </Root>
  )
}

const MelegaAppShell: React.FC<MelegaAppShellProps> = ({ children }) => (
  <TopMoversSnapshotProvider>
    <MyMelegaProvider>
      <MelegaAppShellInner>{children}</MelegaAppShellInner>
    </MyMelegaProvider>
  </TopMoversSnapshotProvider>
)

export default MelegaAppShell
