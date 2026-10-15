export type SectionId = 'swap' | 'bridge' | 'earn' | 'portfolio' | 'tools'

export interface SectionCopy {
  id: SectionId
  title: string
  navLabel: string
  href: string
  primary: boolean
  statements: string[]
}

export const SECTIONS: SectionCopy[] = [
  {
    id: 'swap',
    title: 'Swap',
    navLabel: 'Swap',
    href: '/',
    primary: true,
    statements: [
      'A BNB quote preview runs only after you ask. It does not sign or send a transaction.',
      'Multichain swap execution is not claimed.',
      'A Melega protocol fee is not certified as collected, and this preview does not collect one.',
    ],
  },
  {
    id: 'bridge',
    title: 'MARCO Bridge',
    navLabel: 'MARCO Bridge',
    href: '/bridge',
    primary: true,
    statements: [
      'This beta does not build or send a bridge transfer.',
      'Public MARCO pairs are listed from the live activation table. The transfer opens on the live DEX.',
    ],
  },
  {
    id: 'earn',
    title: 'Earn',
    navLabel: 'Earn',
    href: '/earn',
    primary: true,
    statements: [
      'One BNB farm row is read only after you open Earn.',
      'Yield figures are omitted unless that read returns them.',
      'Public Create Farm and Create Pool are not offered.',
      'Wallet withdrawal remains on the live DEX.',
    ],
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    navLabel: 'Portfolio',
    href: '/portfolio',
    primary: false,
    statements: [
      'A BNB balance read runs only after you submit a public address.',
      'This beta does not connect a wallet and cannot sign or withdraw.',
      'LP and farm positions are not scanned here. Withdrawal stays on the live DEX.',
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    navLabel: 'Tools',
    href: '/tools',
    primary: false,
    statements: [
      'Commercial tools load only after you open them.',
      'Public Create Farm and Create Pool are not offered. Custom work is not accepted here.',
    ],
  },
]

export function sectionById(id: SectionId): SectionCopy {
  const found = SECTIONS.find((section) => section.id === id)
  if (!found) throw new Error(`Unknown section ${id}`)
  return found
}

export const PRIMARY_SECTIONS = SECTIONS.filter((section) => section.primary)
