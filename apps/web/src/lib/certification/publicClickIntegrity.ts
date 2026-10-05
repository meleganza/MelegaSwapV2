/**
 * Bounded click-integrity helpers for the public Melega application.
 *
 * This intentionally is not a general crawler. The surface allowlist is the
 * canonical public inventory used by the full-funnel certification mission.
 */
export const PUBLIC_MELEGA_SURFACES = [
  { id: 'home', path: '/' },
  { id: 'swap', path: '/swap' },
  { id: 'liquidity', path: '/liquidity' },
  { id: 'farms', path: '/farms' },
  { id: 'pools', path: '/pools' },
  { id: 'bridge', path: '/bridge' },
  { id: 'projects', path: '/projects' },
  { id: 'list', path: '/list' },
  { id: 'portfolio', path: '/portfolio' },
  { id: 'marco-project', path: '/@marco' },
  { id: 'docs', path: '/docs' },
  { id: 'audit', path: '/audit' },
  { id: 'support', path: '/support' },
] as const

const ACTIONABLE_SELECTOR = 'button, a[href], [role="button"], [role="tab"]'
const DEAD_HREF = /^(?:#|javascript:(?:void\s*\(\s*0\s*\)|;?)?)$/i

export type PublicActionable = {
  element: HTMLElement
  label: string
  href: string | null
  disabled: boolean
  disabledReason: string | null
}

export type UiTransitionSnapshot = {
  href: string
  openDialogs: number
  expandedControls: string[]
  bodyFingerprint: string
}

function normalizedText(value: string | null | undefined) {
  return value?.replace(/\s+/g, ' ').trim() ?? ''
}

export function publicActionLabel(element: HTMLElement): string {
  return (
    normalizedText(element.getAttribute('aria-label')) ||
    normalizedText(element.getAttribute('title')) ||
    normalizedText(element.textContent) ||
    normalizedText(element.getAttribute('href')) ||
    '<unlabelled>'
  )
}

export function collectPublicActionables(root: ParentNode): PublicActionable[] {
  return Array.from(root.querySelectorAll<HTMLElement>(ACTIONABLE_SELECTOR)).map((element) => {
    const disabled =
      (element instanceof HTMLButtonElement && element.disabled) || element.getAttribute('aria-disabled') === 'true'
    return {
      element,
      label: publicActionLabel(element),
      href: element instanceof HTMLAnchorElement ? element.getAttribute('href') : null,
      disabled,
      disabledReason:
        normalizedText(element.getAttribute('data-disabled-reason')) ||
        normalizedText(element.getAttribute('aria-description')) ||
        null,
    }
  })
}

export function isDeadPublicHref(href: string | null): boolean {
  if (href == null) return false
  return DEAD_HREF.test(href.trim())
}

export function validatePublicActionable(actionable: PublicActionable): string[] {
  const failures: string[] = []
  if (actionable.label === '<unlabelled>') failures.push('missing accessible label')
  if (isDeadPublicHref(actionable.href)) failures.push(`dead href: ${actionable.href}`)
  if (actionable.disabled && !actionable.disabledReason) failures.push('disabled without a truthful reason')
  return failures
}

export function captureUiTransitionSnapshot(doc: Document = document): UiTransitionSnapshot {
  return {
    href: doc.defaultView?.location.href ?? '',
    openDialogs: doc.querySelectorAll('[role="dialog"], dialog[open]').length,
    expandedControls: Array.from(doc.querySelectorAll<HTMLElement>('[aria-expanded="true"]')).map(publicActionLabel),
    bodyFingerprint: normalizedText(doc.body?.textContent).slice(0, 2_000),
  }
}

export function didObservableUiTransition(before: UiTransitionSnapshot, after: UiTransitionSnapshot): boolean {
  return (
    before.href !== after.href ||
    before.openDialogs !== after.openDialogs ||
    before.bodyFingerprint !== after.bodyFingerprint ||
    before.expandedControls.join('\n') !== after.expandedControls.join('\n')
  )
}

export async function observePublicActionTransition(
  element: HTMLElement,
  settle: () => Promise<void> = () => new Promise((resolve) => setTimeout(resolve, 0)),
): Promise<{ before: UiTransitionSnapshot; after: UiTransitionSnapshot; changed: boolean }> {
  const doc = element.ownerDocument
  const before = captureUiTransitionSnapshot(doc)
  element.click()
  await settle()
  const after = captureUiTransitionSnapshot(doc)
  return { before, after, changed: didObservableUiTransition(before, after) }
}
