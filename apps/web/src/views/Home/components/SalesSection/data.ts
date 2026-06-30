import { SalesSectionProps } from '.'

export const swapSectionData: SalesSectionProps = {
  headingText: 'Melega DEX',
  bodyText:
    'AI-native liquidity on BSC, Base, Ethereum, and Polygon. Classic swap and LP flows today, with smart routing on the roadmap.',
  reverse: false,
  primaryButton: {
    to: '/swap',
    text: 'Trade Now',
    external: false,
  },
 
  images: {
    path: '/images/home/trade/',
    attributes: [
      { src: 'MARCO', alt: 'MARCO token' },
    ],
  },
}

export const earnSectionData: SalesSectionProps = {
  headingText: 'Earn passive income with crypto.',
  bodyText: 'Stake LP tokens and MARCO in farms and pools to earn on Melega DEX.',
  reverse: true,
  primaryButton: {
    to: '/farms',
    text: 'Explore',
    external: false,
  },
 
  images: {
    path: '/images/home/earn/',
    attributes: [
      { src: 'pie', alt: 'Pie chart' },
      { src: 'stonks', alt: 'Stocks chart' },
      { src: 'folder', alt: 'Folder with cake token' },
    ],
  },
}

export const cakeSectionData: SalesSectionProps = {
  headingText: 'MARCO makes our world go round.',
  bodyText:
    'MARCO powers rewards across Melega DEX — the liquidity surface of MELEGA AI | KIRI CIVILIZATION. Trade it, farm it, stake it, and govern with it.',
  reverse: false,
  primaryButton: {
    to: '/swap?outputCurrency=0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    text: 'Buy MARCO',
    external: false,
  },
 

  images: {
    path: '/images/home/cake/',
    attributes: [
      { src: 'bottom-right', alt: 'Small 3d pancake' },
      { src: 'top-right', alt: 'Small 3d pancake' },
      { src: 'coin', alt: 'MARCO token' },
      { src: 'top-left', alt: 'Small 3d pancake' },
    ],
  },
}
