/**
 * Review preview stays read-only.
 * Certification later sets BETA_REVIEW_EXECUTION=certify. The default is closed.
 */
export function reviewPreviewBlocksExecution(env: Record<string, string | undefined> = process.env): boolean {
  return env.BETA_REVIEW_EXECUTION !== 'certify'
}
