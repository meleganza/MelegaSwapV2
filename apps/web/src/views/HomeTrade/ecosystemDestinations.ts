/**
 * Explore Melega Ecosystem destinations — live URLs only where known in product surface.
 * Maiora has no certified public URL in this codebase; keep disabled.
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
    subtitle: 'Identity and portfolio hub.',
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
    id: 'labs',
    title: 'LABS',
    subtitle: 'Trade narratives before listing.',
    href: 'https://labs.melega.ai/labs',
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
    id: 'radar',
    title: 'RADAR',
    subtitle: 'Discover trends and claim profiles.',
    href: '/radar',
    external: false,
  },
  {
    id: 'maiora',
    title: 'MAIORA',
    subtitle: 'Melega strategic layer.',
    disabled: true,
    disabledLabel: 'Not public yet',
  },
]
