/** R757 — canonical Melega social links (single source of truth). */
export const MELEGA_SOCIAL_LINKS = [
  {
    id: 'telegram',
    label: 'Telegram',
    href: 'https://t.me/melegacommunity',
  },
  {
    id: 'x',
    label: 'X',
    href: 'https://x.com/meleganews',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/melega.finance/',
  },
] as const

export type MelegaSocialLink = (typeof MELEGA_SOCIAL_LINKS)[number]

export function getMelegaSocialLink(id: MelegaSocialLink['id']): MelegaSocialLink {
  const link = MELEGA_SOCIAL_LINKS.find((entry) => entry.id === id)
  if (!link) throw new Error(`Unknown social link: ${id}`)
  return link
}
