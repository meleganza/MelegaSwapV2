import {
  MenuItemsType,
  DropdownMenuItems,
  SwapIcon,
  SwapFillIcon,
  EarnFillIcon,
  EarnIcon,
  ResourcesIcon,
  HomeIcon,
  CapitalIcon,
  LaunchPadIcon,
} from '@pancakeswap/uikit'
import { ContextApi } from '@pancakeswap/localization'
import { SUPPORT_FARMS } from 'config/constants/supportChains'

export type ConfigMenuDropDownItemsType = DropdownMenuItems & { hideSubNav?: boolean }
export type ConfigMenuItemsType = Omit<MenuItemsType, 'items'> & { hideSubNav?: boolean; image?: string } & {
  items?: ConfigMenuDropDownItemsType[]
}

const addMenuItemSupported = (item, chainId) => {
  if (!chainId || !item.supportChainIds) {
    return item
  }
  if (item.supportChainIds?.includes(chainId)) {
    return item
  }
  return {
    ...item,
    disabled: true,
  }
}

/** UX Constitution v1.2 — Human Mode navigation (single system). */
const config: (
  t: ContextApi['t'],
  isDark: boolean,
  languageCode?: string,
  chainId?: number,
) => ConfigMenuItemsType[] = (t, isDark, languageCode, chainId) =>
  [
    {
      label: 'Home',
      href: '/',
      icon: HomeIcon,
      showItemsOnMobile: true,
      items: [],
    },
    {
      label: t('Swap'),
      icon: SwapIcon,
      fillIcon: SwapFillIcon,
      href: '/swap',
      showItemsOnMobile: true,
      items: [
        {
          label: t('Exchange'),
          href: '/swap',
        },
        {
          label: t('Liquidity'),
          href: '/liquidity',
        },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    {
      label: t('Earn'),
      href: '/farms',
      icon: EarnIcon,
      fillIcon: EarnFillIcon,
      supportChainIds: SUPPORT_FARMS,
      showItemsOnMobile: true,
      items: [
        {
          label: t('Farms'),
          href: '/farms',
        },
        {
          label: t('Pools'),
          href: '/pools',
        },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    {
      label: t('Launch'),
      href: '/launch',
      icon: LaunchPadIcon,
      fillIcon: LaunchPadIcon,
      showItemsOnMobile: true,
      items: [],
    },
    {
      label: t('Discover'),
      href: '/projects',
      icon: ResourcesIcon,
      fillIcon: ResourcesIcon,
      showItemsOnMobile: true,
      items: [
        {
          label: t('Projects'),
          href: '/projects',
        },
        {
          label: t('Assets'),
          href: '/assets',
        },
        {
          label: t('Collectibles'),
          href: '/collectibles',
        },
        {
          label: t('Presence'),
          href: '/presence',
        },
        {
          label: t('Graph'),
          href: '/graph',
        },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    {
      label: t('Workspace'),
      href: '/workspace',
      icon: CapitalIcon,
      fillIcon: CapitalIcon,
      showItemsOnMobile: true,
      items: [],
    },
  ].map((item) => addMenuItemSupported(item, chainId))

export default config
