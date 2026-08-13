import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import UserMenu from 'components/Menu/UserMenu'
import { NetworkSwitcher } from 'components/NetworkSwitcher'
import { MelegaBrandLockup } from 'design-system/melega/components/BrandLockup'
import { MelegaGlobalHeader, MELEGA_APP_HEADER_HEIGHT } from 'design-system/melega/components/GlobalHeader'
import { MelegaBottomNavigation } from 'design-system/melega/components/BottomNavigation'
import { colors } from 'design-system/melega/tokens/colors'
import { ds001Layout } from 'design-system/melega/tokens/ds001'
import { IconUser } from 'design-system/melega/components/GlobalHeader/HeaderIcons'
import { uxRebuildColors, uxRebuildFont } from 'design-system/melega/tokens/uxRebuild'
import { MyMelegaProvider, preloadMyMelegaDrawer, useMyMelegaDrawer } from 'components/MyMelega/MyMelegaProvider'
import { shellBottomNavItems } from './config/navigation'
import { ShellNavIcon } from './icons'
import { AppShellUIKitNeutralizer, MobileWalletSlot } from './AppShellStyles'
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
`

const MobileNetwork = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-width: 0;

  /* Keep chain control tappable on 390px — icon-only UserMenu must remain a hit target. */
  [data-testid='network-switcher-root'] {
    min-width: 40px;
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
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
 * Mobile (<1024): compact mobile header + 36px Trending Bar + bottom navigation.
 */
const MelegaAppShellInner: React.FC<MelegaAppShellProps> = ({ children }) => {
  const { pathname } = useRouter()
  const { address } = useAccount()
  const { open: isMyMelegaOpen } = useMyMelegaDrawer()

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
        {address ? (
          <MobileWalletSlot>
            <UserMenu />
          </MobileWalletSlot>
        ) : (
          <ConnectWalletButton className="melega-shell-mobile-connect" aria-label="Connect wallet">
            Connect
          </ConnectWalletButton>
        )}
        <MobileMyMelegaButton />
      </MobileHeader>

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
