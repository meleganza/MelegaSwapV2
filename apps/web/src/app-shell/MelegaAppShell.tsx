import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { MarcoConnect } from 'components/MarcoWidgets'
import { NetworkSwitcher } from 'components/NetworkSwitcher'
import { MelegaBrandLockup } from 'design-system/melega/components/BrandLockup'
import { MelegaGlobalHeader, MELEGA_APP_HEADER_HEIGHT } from 'design-system/melega/components/GlobalHeader'
import { MelegaBottomNavigation } from 'design-system/melega/components/BottomNavigation'
import { colors } from 'design-system/melega/tokens/colors'
import { ds001Layout } from 'design-system/melega/tokens/ds001'
import { uxRebuildColors, uxRebuildFont } from 'design-system/melega/tokens/uxRebuild'
import { MyMelegaProvider } from 'components/MyMelega/MyMelegaProvider'
import { TopMoversSnapshotProvider } from 'views/HomeTrade/TopMoversSnapshotContext'
import { shellBottomNavItems } from './config/navigation'
import { ShellNavIcon } from './icons'
import { AppShellUIKitNeutralizer } from './AppShellStyles'

const MOBILE_HEADER_H = '56px'
const MOBILE_BOTTOM_NAV_H = '64px'

const DesktopMain = styled.main`
  margin-left: 0;
  padding: calc(${MOBILE_HEADER_H} + env(safe-area-inset-top, 0px)) 16px
    calc(${MOBILE_BOTTOM_NAV_H} + env(safe-area-inset-bottom, 0px));
  background: ${uxRebuildColors.pageBg};
  min-height: 100dvh;
  min-height: 100svh;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (min-width: 1024px) {
    margin-left: 0;
    padding: ${MELEGA_APP_HEADER_HEIGHT} ${ds001Layout.pagePaddingX}
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

const MobileBrand = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
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

export interface MelegaAppShellProps {
  children: React.ReactNode
}

/**
 * DS001.2 — Shared Melega DEX shell.
 * Desktop: 72px global header + 44px Trending Bar, no permanent left sidebar.
 * Mobile (<1024): compact mobile header + 36px Trending Bar + bottom navigation.
 */
const MelegaAppShellInner: React.FC<MelegaAppShellProps> = ({ children }) => {
  const { pathname } = useRouter()

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

      <MobileHeader data-melega-mobile-header>
        <MobileBrand>
          <MelegaBrandLockup size="mobile" iconOnly />
        </MobileBrand>
        <MobileNetwork className="melega-shell-mobile-network">
          <NetworkSwitcher />
        </MobileNetwork>
        <MarcoConnect size="icon" activation="mobile" />
      </MobileHeader>

      <DesktopMain data-melega-shell-main>
        <Content>
          {children}
        </Content>
      </DesktopMain>

      <MelegaBottomNavigation items={bottomItems} activeId={activeBottomId} />
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
