import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { Menu as UikitMenu, NextLinkFromReactRouter, Button, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useTranslation, languageList } from '@pancakeswap/localization'
import PhishingWarningBanner from 'components/PhishingWarningBanner'
import { NetworkSwitcher } from 'components/NetworkSwitcher'
import useTheme from 'hooks/useTheme'
import { useCakeBusdPrice } from 'hooks/useBUSDPrice'
import { usePhishingBannerManager } from 'state/user/hooks'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { melegaOperational as tokens } from 'ui/tokens'
import UserMenu from './UserMenu'
import { useMenuItems } from './hooks/useMenuItems'
import { getActiveMenuItem, getActiveSubMenuItem } from './utils'
import GlobalSettings from './GlobalSettings'
import { SettingsMode } from './GlobalSettings/types'
import { melegaFooterLinks } from './config/footerConfig'

const solanaButtonStyle = {
  background: tokens.surface,
  color: tokens.textSecondary,
  alignItems: 'center' as const,
  border: `1px solid ${tokens.border}`,
  height: '36px',
  borderRadius: tokens.radiusSm,
  fontSize: '13px',
  fontWeight: 500,
}

const Menu = (props) => {
  const { isDark, setTheme } = useTheme()
  const { isMobile } = useMatchBreakpoints()
  const cakePriceUsd = useCakeBusdPrice({ forceMainnet: true })
  const { currentLanguage, setLanguage, t } = useTranslation()
  const { pathname } = useRouter()
  const [showPhishingWarningBanner] = usePhishingBannerManager()

  const { chainId } = useActiveChainId()
  const menuItems = useMenuItems()

  const activeMenuItem = getActiveMenuItem({ menuConfig: [...menuItems], pathname })
  const activeSubMenuItem = getActiveSubMenuItem({ menuItem: activeMenuItem, pathname })

  const toggleTheme = useMemo(() => {
    return () => setTheme(isDark ? 'dark' : 'light')
  }, [setTheme, isDark])

  const getFooterLinks = useMemo(() => {
    return melegaFooterLinks(t)
  }, [t])

  return (
    <>
      <UikitMenu
        linkComponent={(linkProps) => {
          return <NextLinkFromReactRouter to={linkProps.href} {...linkProps} prefetch={false} />
        }}
        leftSide={<NetworkSwitcher />}
        rightSide={
          <>
            <Button className="melega-solana-link" style={solanaButtonStyle}>
              {isMobile ? (
                <a href="https://solana.melega.finance/" target="_blank" rel="noreferrer">
                  SolanaFi
                </a>
              ) : (
                <a href="https://solana.melega.finance/" target="_blank" rel="noreferrer">
                  Solana MelegaFi
                </a>
              )}
            </Button>
            <GlobalSettings mode={SettingsMode.GLOBAL} />
            <UserMenu />
          </>
        }
        banner={showPhishingWarningBanner && typeof window !== 'undefined' && <PhishingWarningBanner />}
        isDark={isDark}
        toggleTheme={toggleTheme}
        currentLang={currentLanguage.code}
        langs={languageList}
        setLang={setLanguage}
        cakePriceUsd={cakePriceUsd}
        links={menuItems}
        subLinks={activeMenuItem?.hideSubNav || activeSubMenuItem?.hideSubNav ? [] : activeMenuItem?.items}
        footerLinks={getFooterLinks}
        activeItem={activeMenuItem?.href}
        activeSubItem={activeSubMenuItem?.href}
        buyCakeLabel={t('Buy MARCO')}
        buyCakeLink={`/swap?chain=${CHAIN_QUERY_NAME[chainId]}`}
        {...props}
      />
    </>
  )
}

export default Menu
