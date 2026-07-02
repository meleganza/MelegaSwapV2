import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import UserMenu from 'components/Menu/UserMenu'
import { NetworkSwitcher } from 'components/NetworkSwitcher'
import {
  MelegaBrandLockup,
  MelegaSidebar,
  MelegaMarcoCard,
  MelegaAppHeader,
  MELEGA_SIDEBAR_WIDTH,
  MELEGA_APP_HEADER_HEIGHT,
  MelegaSearchBar,
  MelegaSocialIcons,
  MelegaBottomNavigation,
  colors,
  spacing,
} from 'design-system/melega'
import { shellNavigation, shellBottomNavItems } from './config/navigation'
import { ShellNavIcon } from './icons'
import { AppShellUIKitNeutralizer, MobileWalletSlot } from './AppShellStyles'
import MelegaLanguageControl from './MelegaLanguageControl'
import SidebarExpandableSection from './SidebarExpandableSection'
import useAppShellData from './hooks/useAppShellData'

const DesktopMain = styled.main`
  margin-left: 0;
  padding: 70px 14px calc(96px + env(safe-area-inset-bottom, 0px));
  background: #0a0a0a;
  min-height: 100vh;
  box-sizing: border-box;

  @media (min-width: 768px) {
    margin-left: ${MELEGA_SIDEBAR_WIDTH};
    padding: 80px 24px 24px;
    max-width: none;
  }
`

const Root = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: ${colors.textPrimary};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`

const Content = styled.div`
  max-width: 1180px;
  margin: 0 auto;
`

const MobileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing[3]};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 58px;
  padding: 0 14px;
  background: ${colors.canvas};
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 95;

  @media (min-width: 768px) {
    display: none;
  }
`

const MobileNetwork = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  min-width: 0;
`

const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M17 12h4v4h-4z" />
  </svg>
)

export interface MelegaAppShellProps {
  children: React.ReactNode
}

const MelegaAppShell: React.FC<MelegaAppShellProps> = ({ children }) => {
  const { pathname } = useRouter()
  const { address } = useAccount()
  const { marcoPriceLabel } = useAppShellData()

  const navigation = useMemo(
    () =>
      shellNavigation.map((section) => (
        <SidebarExpandableSection
          key={section.label}
          label={section.label}
          items={section.items}
          visibleCount={section.visibleCount}
          pathname={pathname}
        />
      )),
    [pathname],
  )

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
    <Root data-melega-app-shell>
      <AppShellUIKitNeutralizer />

      <MelegaSidebar
        brand={<MelegaBrandLockup size="desktop" iconOnly />}
        navigation={navigation}
        footer={<MelegaMarcoCard priceLabel={marcoPriceLabel} />}
      />

      <MelegaAppHeader
        left={<MelegaSearchBar placeholder="Search tokens, farms, projects..." />}
        right={
          <>
            <MelegaSocialIcons />
            <MelegaLanguageControl />
            <div className="melega-shell-network">
              <NetworkSwitcher />
            </div>
            {address ? (
              <UserMenu />
            ) : (
              <ConnectWalletButton className="melega-shell-connect">Connect Wallet</ConnectWalletButton>
            )}
          </>
        }
      />

      <MobileHeader data-melega-mobile-header>
        <MelegaBrandLockup size="mobile" />
        <MobileNetwork className="melega-shell-mobile-network">
          <NetworkSwitcher />
        </MobileNetwork>
        {address ? (
          <MobileWalletSlot>
            <UserMenu />
          </MobileWalletSlot>
        ) : (
          <ConnectWalletButton className="melega-shell-wallet-icon" aria-label="Connect wallet">
            <WalletIcon />
          </ConnectWalletButton>
        )}
      </MobileHeader>

      <DesktopMain>
        <Content>{children}</Content>
      </DesktopMain>

      <MelegaBottomNavigation items={bottomItems} activeId={activeBottomId} />
    </Root>
  )
}

export default MelegaAppShell
