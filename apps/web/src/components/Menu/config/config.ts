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
  InfoIcon,
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

/** UX Constitution v1.2 — Epic B human intent navigation. */
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
        { label: t('Exchange'), href: '/swap' },
        { label: t('Liquidity'), href: '/liquidity' },
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
        { label: t('Farms'), href: '/farms' },
        { label: t('Pools'), href: '/pools' },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    {
      label: t('Create'),
      href: '/launch',
      icon: LaunchPadIcon,
      fillIcon: LaunchPadIcon,
      showItemsOnMobile: true,
      items: [],
    },
    {
      label: t('Explore'),
      href: '/projects',
      icon: ResourcesIcon,
      fillIcon: ResourcesIcon,
      showItemsOnMobile: true,
      items: [
        { label: t('Projects'), href: '/projects' },
        { label: t('Assets'), href: '/assets' },
        { label: 'Identity Hub', href: '/collectibles' },
        { label: t('Presence'), href: '/presence' },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    {
      label: t('My Economy'),
      href: '/workspace',
      icon: CapitalIcon,
      fillIcon: CapitalIcon,
      showItemsOnMobile: true,
      items: [],
    },
    {
      label: 'AI',
      href: '/map',
      icon: InfoIcon,
      fillIcon: InfoIcon,
      showItemsOnMobile: false,
      items: [
        { label: 'Surface Map', href: '/map' },
        { label: 'Pipeline', href: '/pipeline' },
        { label: 'Runtime', href: '/runtime/labs' },
        { label: 'Review', href: '/review' },
        { label: 'Orchestrator', href: '/orchestrator' },
        { label: 'Dry Run', href: '/dry-run' },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
  ].map((item) => addMenuItemSupported(item, chainId))

export default config
