import { SalesSectionProps } from '.'

export const swapSectionData: SalesSectionProps = {
  headingText: 'MelegaSwap',
  bodyText: 'The best AMM DEX on Binance Smart Chain and BASE Chain providing friendly trading and better project support.',
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
  bodyText: 'MelegaSwap makes it easy to make your crypto work for you.',
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
    'MARCO token is at the heart of the MelegaSwap Melega Space. Buy it, win it, farm it, spend it, stake it... heck, you can even vote with it!',
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
