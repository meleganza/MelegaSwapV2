import { ContextApi } from '@pancakeswap/localization'
import type { FooterLinkType } from '@pancakeswap/uikit'

/** Melega DEX unified footer — constitution v1.2. */
export const melegaFooterLinks: (t: ContextApi['t']) => FooterLinkType[] = (t) => [
  {
    label: 'Melega DEX',
    items: [
      {
        label: t('Docs'),
        href: 'https://docs.melega.finance/',
        isHighlighted: true,
        blank: true,
      },
      {
        label: t('Swap'),
        href: '/trade',
      },
      {
        label: t('Liquidity'),
        href: '/liquidity-studio',
      },
      {
        label: t('Farms'),
        href: '/farms',
      },
      {
        label: t('Pools'),
        href: '/pools',
      },
      {
        label: t('Create'),
        href: '/build-studio#build-import',
      },
      {
        label: t('Explore'),
        href: '/projects',
      },
      {
        label: t('My Economy'),
        href: '/command-center',
      },
    ],
  },
]

export default melegaFooterLinks
