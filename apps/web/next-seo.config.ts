import { DefaultSeoProps } from 'next-seo'

export const SEO: DefaultSeoProps = {
  titleTemplate: '%s',
  defaultTitle: 'Melega',
  description:
    '',
  twitter: {
    cardType: 'summary_large_image',
    handle: '@',
    site: '@',
  },
  openGraph: {
    title: 'Melega',
    description:
      '',
    images: [{ url: 'https://melega.finance/logo.png' }],
  },
}
