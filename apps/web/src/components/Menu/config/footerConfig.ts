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
        href: '/swap',
      },
      {
        label: t('Liquidity'),
        href: '/liquidity',
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
        label: t('Launch'),
        href: '/launch',
      },
      {
        label: t('Workspace'),
        href: '/workspace',
      },
      {
        label: t('Discover'),
        href: '/projects',
      },
    ],
  },
]

export default melegaFooterLinks
