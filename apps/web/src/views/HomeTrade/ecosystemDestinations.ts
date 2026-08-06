/**
 * Explore Melega Ecosystem destinations — public LIVE URLs only.
 * Radar and Labs removed from Founder-facing Home (RC2 emergency repair).
 * BlackPump canonical public URL: https://blackpump.fun/ (Melega launchpad).
 */
export type EcosystemDestination = {
  id: string
  title: string
  subtitle: string
  href?: string
  external?: boolean
  /** Honest unavailable — no invented URL */
  disabled?: boolean
  disabledLabel?: string
}

export const ECOSYSTEM_DESTINATIONS: EcosystemDestination[] = [
  {
    id: 'passport',
    title: 'PASSPORT',
    subtitle: 'Identity & rewards.',
    href: 'https://marco.melega.ai',
    external: true,
  },
  {
    id: 'smartdrop',
    title: 'SMARTDROP',
    subtitle: 'Acquire active holders.',
    href: 'https://smartdrop.melega.ai/dashboard',
    external: true,
  },
  {
    id: 'blackpump',
    title: 'BLACK',
    subtitle: 'Fair-launch infrastructure.',
    href: 'https://blackpump.fun/',
    external: true,
  },
  {
    id: 'space',
    title: 'SPACE',
    subtitle: 'Increase project visibility.',
    href: 'https://melega.space/',
    external: true,
  },
  {
    id: 'maiora',
    title: 'MAIORA',
    subtitle: 'Melega strategic layer.',
    disabled: true,
    disabledLabel: '—',
  },
]
