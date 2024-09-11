import {
  MenuItemsType,
  // DropdownMenuItemType,
  SwapIcon,
  SwapFillIcon,
  EarnFillIcon,
  EarnIcon,
  // TrophyIcon,
  // TrophyFillIcon,
  // NftIcon,
  // NftFillIcon,
  // MoreIcon,
  DropdownMenuItems,
  // FarmIcon,
  InfoIcon,
  // IfoIcon,
  ResourcesIcon,
  TradeIcon,
  TradeFilledIcon,
  HomeIcon,
  CapitalIcon,
  MultisenderIcon,
  LaunchPadIcon,
  // LanguageCurrencyIcon,
  TokenIcon,
} from '@pancakeswap/uikit'
import { ContextApi } from '@pancakeswap/localization'
// import { nftsBaseUrl } from 'views/Nft/market/constants'
// import { getPerpetualUrl } from 'utils/getPerpetualUrl'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'

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
      items: []
    },
    {
      label: t('Funds'),
      href: '/bitcoin-funds',
      icon: CapitalIcon,
      fillIcon: CapitalIcon,
      image: '/images/cgt.png',
      showItemsOnMobile: true,
      hideSubNav: false,
      items: [
        {
          label: t('Bitcoin Funds'),
          href: '/bitcoin-funds',
        },
        {
          label: t('Venture Funds'),
          href: '/venture-funds',
        },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    {
      label: t('Exchange'),
      href: '/exchange',
      icon: SwapIcon,
      fillIcon: SwapIcon,
      image: '/images/cgt.png',
      showItemsOnMobile: false,
      items: [
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    {
      label: t('About'),
      href: '/about',
      icon: InfoIcon,
      fillIcon: InfoIcon,
      image: '/images/cgt.png',
      showItemsOnMobile: false,
      items: [
        // {
        //   label: t('The Firm'),
        //   href: '/firm',
        // },
        // {
        //   label: t('The Team'),
        //   href: '/team',
        // },
        // {
        //   label: t('Contact us'),
        //   href: '/contacts',
        // },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    // {
    //   label: t('Tumbler'),
    //   href: '/tumbler',
    //   icon: LanguageCurrencyIcon,
    //   fillIcon: LanguageCurrencyIcon,
    //   image: '/images/cgt.png',
    //   showItemsOnMobile: false,
    //   items: [
    //   ].map((item) => addMenuItemSupported(item, chainId)),
    // },
    // {
    //   label: t('Games'),
    //   href: '/prediction',
    //   icon: TrophyIcon,
    //   fillIcon: TrophyFillIcon,
    //   // supportChainIds: SUPPORT_MULTI_CHAINS,
    //   items: [
    //     {
    //       label: t('Prediction'),
    //       href: '/prediction',
    //       image: '/images/decorations/prediction.png',
    //     },
    //     {
    //       label: t('Lottery'),
    //       href: '/lottery',
    //       image: '/images/decorations/lottery.png',
    //     },
    //     {
    //       label: t('Pottery'),
    //       href: '/pottery',
    //       image: '/images/decorations/lottery.png',
    //     },
    //   ],
    // },
    // {
    //   label: 'Info',
    //   href: '/info',
    //   icon: InfoIcon,
    //   hideSubNav: true,
    //   showItemsOnMobile: false,
    //   items: [
    //     // {
    //     //   label: t('Info'),
    //     //   href: '/info',
    //     // },
    //     // {
    //     //   label: t('IFO'),
    //     //   href: '/ifo',
    //     //   supportChainIds: SUPPORT_MULTI_CHAINS,
    //     //   image: '/images/ifos/ifo-bunny.png',
    //     // },
    //     // {
    //     //   label: t('Voting'),
    //     //   href: '/voting',
    //     //   supportChainIds: SUPPORT_MULTI_CHAINS,
    //     //   image: '/images/voting/voting-bunny.png',
    //     // },
    //     // {
    //     //   type: DropdownMenuItemType.DIVIDER,
    //     // },
    //     // {
    //     //   label: t('Leaderboard'),
    //     //   href: '/teams',
    //     //   supportChainIds: SUPPORT_MULTI_CHAINS,
    //     //   image: '/images/decorations/leaderboard.png',
    //     // },
    //     // {
    //     //   type: DropdownMenuItemType.DIVIDER,
    //     // },
    //     // {
    //     //   label: t('Blog'),
    //     //   href: 'https://medium.com/pancakeswap',
    //     //   type: DropdownMenuItemType.EXTERNAL_LINK,
    //     // },
    //     // {
    //     //   label: t('Docs'),
    //     //   href: 'https://docs.pancakeswap.finance',
    //     //   type: DropdownMenuItemType.EXTERNAL_LINK,
    //     // },
    //   ].map((item) => addMenuItemSupported(item, chainId)),
    // },
    // {
    //   label: t('NFT'),
    //   href: `${nftsBaseUrl}`,
    //   icon: NftIcon,
    //   fillIcon: NftFillIcon,
    //   supportChainIds: SUPPORT_MULTI_CHAINS,
    //   image: '/images/decorations/nft.png',
    //   showItemsOnMobile: false,
    //   items: [
    //     // {
    //     //   label: t('Overview'),
    //     //   href: `${nftsBaseUrl}`,
    //     // },
    //     // {
    //     //   label: t('Collections'),
    //     //   href: `${nftsBaseUrl}/collections`,
    //     // },
    //     // {
    //     //   label: t('Activity'),
    //     //   href: `${nftsBaseUrl}/activity`,
    //     // },
    //   ],
    // },
    // {
    //   label: 'Docs',
    //   href: '/docs',
    //   icon: ResourcesIcon,
    //   hideSubNav: true,
    //   showItemsOnMobile: false,
    //   items: []
    // },
  ].map((item) => addMenuItemSupported(item, chainId))

export default config
