/** Footer link SSOT — shared by MelegaDexFooter and founder acceptance tests. */

export const MELEGA_FOOTER_COPYRIGHT = '© 2026 Melega Labs. All rights reserved.'

export const MELEGA_FOOTER_NAV = [
  { label: 'Docs', href: '/docs', external: false },
  { label: 'API / Agent documentation', href: '/api-agents', external: false },
  { label: 'Devs', href: '/devs', external: false },
  { label: 'Audit', href: '/audit', external: false },
  { label: 'Support', href: '/support', external: false },
] as const

export const MELEGA_FOOTER_SOCIALS = [
  { id: 'x', label: 'X', href: 'https://x.com/meleganews' },
  { id: 'telegram-community', label: 'Telegram Community', href: 'https://t.me/melegacommunity' },
  { id: 'telegram-announcements', label: 'Telegram Announcements', href: 'https://t.me/melegachannel' },
  {
    id: 'cmc',
    label: 'CoinMarketCap Community',
    href: 'https://coinmarketcap.com/community/profile/melegalabs',
  },
  {
    id: 'binance-square',
    label: 'Binance Square',
    href: 'https://www.binance.com/en/square/profile/MelegaSwap',
  },
  { id: 'publish0x', label: 'Publish0x', href: 'https://www.publish0x.com/@MelegaSwap' },
  { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@melega.finance' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/melega.finance/' },
  { id: 'medium', label: 'Medium', href: 'https://medium.com/@melega' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/meleganza/melegaswap' },
] as const
