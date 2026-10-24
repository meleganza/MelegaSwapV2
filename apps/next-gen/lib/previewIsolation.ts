/**
 * The public review route stays closed.
 * No environment value, header, cookie, or request field reopens it.
 */
export function reviewPreviewBlocksExecution(_env?: Record<string, string | undefined>): boolean {
  return true
}
