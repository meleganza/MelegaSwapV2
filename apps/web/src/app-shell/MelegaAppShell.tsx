import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import UserMenu from 'components/Menu/UserMenu'
import { NetworkSwitcher } from 'components/NetworkSwitcher'
import {
  MelegaBrandLockup,
  MelegaGlobalHeader,
  MELEGA_APP_HEADER_HEIGHT,
  MelegaBottomNavigation,
  colors,
  ds001Colors,
  ds001Layout,
} from 'design-system/melega'
import { uxRebuildColors, uxRebuildFont } from 'design-system/melega/tokens/uxRebuild'
import { shellBottomNavItems } from './config/navigation'
import { ShellNavIcon } from './icons'
import { AppShellUIKitNeutralizer, MobileWalletSlot } from './AppShellStyles'

const DesktopMain = styled.main`
  margin-left: 0;
  padding: calc(48px + env(safe-area-inset-top, 0px)) 12px calc(68px + env(safe-area-inset-bottom, 0px));
  background: ${uxRebuildColors.pageBg};
  min-height: 100dvh;
  min-height: 100vh;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (min-width: 1024px) {
    margin-left: 0;
    padding: calc(${MELEGA_APP_HEADER_HEIGHT} + ${ds001Layout.pagePaddingTopBelowHeader})
      ${ds001Layout.pagePaddingX} ${ds001Layout.pagePaddingBottom};
  }

  @media (min-width: 1024px) and (max-width: 1279px) {
    padding-left: 24px;
    padding-right: 24px;
  }
`

const Root = styled.div`
  min-height: 100vh;
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
  height: calc(60px + env(safe-area-inset-top, 0px));
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
  min-width: 0;
`

export interface MelegaAppShellProps {
  children: React.ReactNode
}

/**
 * DS001.2 — Shared Melega DEX shell.
 * Desktop: 72px global header, no permanent left sidebar.
 * Mobile (<1024): compact mobile header + bottom navigation.
 */
const MelegaAppShell: React.FC<MelegaAppShellProps> = ({ children }) => {
  const { pathname } = useRouter()
  const { address } = useAccount()

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

      {/* Desktop permanent sidebar removed (DS001.2). Navigation lives in MelegaGlobalHeader. */}
      <MelegaGlobalHeader />

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
      </MobileHeader>

      <DesktopMain data-melega-shell-main>
        <Content>{children}</Content>
      </DesktopMain>

      <MelegaBottomNavigation items={bottomItems} activeId={activeBottomId} />
    </Root>
  )
}

export default MelegaAppShell
