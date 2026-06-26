import { DefaultSeoProps } from 'next-seo'

const SITE_DESCRIPTION =
  'Melega DEX — AI-native liquidity on BSC, Base, Ethereum, and Polygon. Swap, liquidity, farms, and pools with classic DEX compatibility.'

export const SEO: DefaultSeoProps = {
  titleTemplate: '%s',
  defaultTitle: 'Melega DEX',
  description: SITE_DESCRIPTION,
  twitter: {
    cardType: 'summary_large_image',
    handle: '@meleganews',
    site: '@meleganews',
  },
  openGraph: {
    title: 'Melega DEX',
    description: SITE_DESCRIPTION,
    images: [{ url: 'https://melega.finance/main.jpg' }],
  },
}
