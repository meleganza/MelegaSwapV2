import {
  MenuItemsType,
  // DropdownMenuItemType,
  SwapIcon,
  SwapFillIcon,
  EarnFillIcon,
  EarnIcon,
  TrophyIcon,
  TrophyFillIcon,
  // NftIcon,
  // NftFillIcon,
  // MoreIcon,
  DropdownMenuItems,
  // FarmIcon,
  InfoIcon,
  IfoIcon,
  IfoGenericIfoCard,
  PoolIcon,
  ResourcesIcon,
  TradeIcon,
  TradeFilledIcon,
  HomeIcon,
  CapitalIcon,
  MultisenderIcon,
  LaunchPadIcon,
  LanguageCurrencyIcon,
  TokenIcon,
  FarmIcon,
  NftIcon,
  NftFillIcon,
} from '@pancakeswap/uikit'
import { ContextApi } from '@pancakeswap/localization'
// import { nftsBaseUrl } from 'views/Nft/market/constants'
// import { getPerpetualUrl } from 'utils/getPerpetualUrl'
import { SUPPORT_ONLY_BSC } from 'config/constants/supportChains'

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
      label: t('Trade'),
      icon: TradeIcon,
      fillIcon: TradeFilledIcon,
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
    // {
    //   label: t('Game'),
    //   icon: TrophyIcon,
    //   fillIcon: TrophyFillIcon,
    //   href: '/flip',
    //   showItemsOnMobile: true,
    //   items: [
    //     {
    //       label: t('Flip'),
    //       href: '/flip',
    //     },
    //     {
    //       label: t('Dice'),
    //       href: '/dice',
    //     },
    //   ].map((item) => addMenuItemSupported(item, chainId)),
    // },
    // {
    //   label: 'Presale',
    //   href: '/presale',
    //   icon: IfoIcon,
    //   hideSubNav: true,
    //   showItemsOnMobile: false,
    //   items: []
    // },
    // {
    //   label: t('Liquidity'),
    //   icon: SwapIcon,
    //   fillIcon: SwapFillIcon,
    //   href: '/liquidity',
    //   showItemsOnMobile: false,
    //   items: [].map((item) => addMenuItemSupported(item, chainId)),
    // },
    {
      label: t('Farms'),
      href: '/farms',
      icon: FarmIcon,
      fillIcon: FarmIcon,
      image: '/images/knb.png',
      showItemsOnMobile: false,
      items: [
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    {
      label: t('Pools'),
      href: '/pools',
      icon: PoolIcon,
      fillIcon: PoolIcon,
      image: '/images/knb.png',
      showItemsOnMobile: false,
      items: [
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    // {
    //   label: t('Margin'),
    //   href: '/long',
    //   icon: SwapIcon,
    //   fillIcon: SwapFillIcon,
    //   items: [
    //     {
    //       label: t('Long'),
    //       href: '/long',
    //     },
    //     {
    //       label: t('Short'),
    //       href: '/short',
    //     },
    //   ].map((item) => addMenuItemSupported(item, chainId)),
    // },
    // {
    //   label: t('Earn'),
    //   href: '/farms',
    //   icon: EarnIcon,
    //   fillIcon: EarnFillIcon,
    //   image: '/images/logo.png',
    //   items: [
    //     {
    //       label: t('Farms'),
    //       href: '/farms',
    //     },
    //     {
    //       label: t('Pools'),
    //       href: '/pools',
    //     },
    //   ].map((item) => addMenuItemSupported(item, chainId)),
    // },
    // {
    //   label: t('Bridge'),
    //   href: '/bridge',
    //   icon: TradeIcon,
    //   fillIcon: TradeFilledIcon,
    //   image: '/images/cgt.png',
    //   showItemsOnMobile: false,
    //   items: [
    //   ].map((item) => addMenuItemSupported(item, chainId)),
    // },
    // {
    //   label: t('Funds'),
    //   href: '/funds',
    //   icon: CapitalIcon,
    //   fillIcon: CapitalIcon,
    //   image: '/images/cgt.png',
    //   showItemsOnMobile: false,
    //   hideSubNav: false,
    //   items: [
    //     {
    //       label: t('Bitcoin'),
    //       href: '/bitcoin-funds',
    //     },
    //     {
    //       label: t('Venture'),
    //       href: '/venture-funds',
    //     },
    //   ].map((item) => addMenuItemSupported(item, chainId)),
    // },
    // {
    //   label: t('Lock'),
    //   href: '/token',
    //   icon: TokenIcon,
    //   fillIcon: TokenIcon,
    //   image: '/images/cgt.png',
    //   showItemsOnMobile: false,
    //   hideSubNav: true,
    //   items: [
    //     {
    //       label: t('Create a lock'),
    //       href: '/create-lock',
    //     },
    //     {
    //       label: t('Lock list'),
    //       href: '/lock-list',
    //     },
    //   ].map((item) => addMenuItemSupported(item, chainId)),
    // },
    // {
    //   label: t('MultiSender'),
    //   href: '/multisender',
    //   icon: MultisenderIcon,
    //   fillIcon: MultisenderIcon,
    //   image: '/images/cgt.png',
    //   showItemsOnMobile: false,
    //   items: [
    //   ].map((item) => addMenuItemSupported(item, chainId)),
    // },
    // {
    //   label: t('Staking'),
    //   href: '/stake',
    //   icon: EarnIcon,
    //   fillIcon: EarnFillIcon,
    //   image: '/images/cgt.png',
    //   showItemsOnMobile: false,
    //   items: [
    //   ].map((item) => addMenuItemSupported(item, chainId)),
    // },
    // {
    //   label: t('KYC'),
    //   href: '/kyc',
    //   icon: InfoIcon,
    //   fillIcon: InfoIcon,
    //   image: '/images/cgt.png',
    //   showItemsOnMobile: false,
    //   items: [
    //   ].map((item) => addMenuItemSupported(item, chainId)),
    // },
    {
      label: t('ILO'),
      href: '/ilo',
      icon: IfoIcon,
      fillIcon: IfoIcon,
      image: '/images/knb.png',
      showItemsOnMobile: false,
      items: [
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    {
      label: t('NFT'),
      href: `/nft`,
      icon: NftIcon,
      fillIcon: NftFillIcon,
      supportChainIds: SUPPORT_ONLY_BSC,
      image: '/images/decorations/nft.png',
      showItemsOnMobile: false,
      items: [
        {
          label: t('Mint it NOW'),
          href: `/nft`,
        },
        {
          label: t('NFT wallet'),
          href: `/viewNFTs`,
        },
        {
          label: t('Market'),
          href: `/nftmarket`,
        },
      ],
    },
    {
      label: t('Chart'),
      href: '/chat',
      icon: InfoIcon,
      fillIcon: InfoIcon,
      image: '/images/cgt.png',
      showItemsOnMobile: false,
      items: [
        {
          label: t('Coingecko'),
          href: 'https://www.coingecko.com/en/exchanges/melegaswap',
        },
        {
          label: t('Dex Guru'),
          href: 'https://dex.guru/markets/melegaswap/tvl',
        }
      ],
    },
    {
      label: t('Solana MelegaFi'),
      href: 'https://solana.melega.finance/',
      icon: TrophyIcon,
      fillIcon: TrophyIcon,
      image: '/images/cgt.png',
      showItemsOnMobile: false,
      // items: [
      //   {
      //     label: t('Coingecko'),
      //     href: 'https://www.coingecko.com/en/exchanges/melegaswap',
      //   },
      //   {
      //     label: t('Dex Guru'),
      //     href: 'https://dex.guru/markets/melegaswap/tvl',
      //   }
      // ],
    },
    // {
    //   label: t('About'),
    //   href: '/about',
    //   icon: ResourcesIcon,
    //   fillIcon: ResourcesIcon,
    //   image: '/images/cgt.png',
    //   showItemsOnMobile: false,
    //   items: [
    //     {
    //       label: t('The Firm'),
    //       href: '/firm',
    //     },
    //     {
    //       label: t('The Team'),
    //       href: '/team',
    //     },
    //     {
    //       label: t('Contact us'),
    //       href: '/contacts',
    //     },
    //   ].map((item) => addMenuItemSupported(item, chainId)),
    // },
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
    //   // supportChainIds: SUPPORT_ONLY_BSC,
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
    //     //   supportChainIds: SUPPORT_ONLY_BSC,
    //     //   image: '/images/ifos/ifo-bunny.png',
    //     // },
    //     // {
    //     //   label: t('Voting'),
    //     //   href: '/voting',
    //     //   supportChainIds: SUPPORT_ONLY_BSC,
    //     //   image: '/images/voting/voting-bunny.png',
    //     // },
    //     // {
    //     //   type: DropdownMenuItemType.DIVIDER,
    //     // },
    //     // {
    //     //   label: t('Leaderboard'),
    //     //   href: '/teams',
    //     //   supportChainIds: SUPPORT_ONLY_BSC,
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
    //   label: 'Docs',
    //   href: '/docs',
    //   icon: ResourcesIcon,
    //   hideSubNav: true,
    //   showItemsOnMobile: false,
    //   items: []
    // },
  ].map((item) => addMenuItemSupported(item, chainId))

export default config
