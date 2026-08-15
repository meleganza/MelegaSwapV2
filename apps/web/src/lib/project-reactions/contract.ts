export const PROJECT_REACTION_IDS = ['like', 'watching', 'bullish', 'bearish', 'moon'] as const
export type ProjectReactionId = (typeof PROJECT_REACTION_IDS)[number]
export type ProjectReactionCounts = Record<ProjectReactionId, number>

export const PROJECT_REACTION_SIGNATURE_MAX_AGE_MS = 5 * 60 * 1_000

export function buildProjectReactionMessage(input: {
  slug: string
  account: string
  reaction: ProjectReactionId
  active: boolean
  signedAt: string
}): string {
  return [
    'Melega DEX Project Reaction',
    `Project: ${input.slug.trim().toLowerCase()}`,
    `Wallet: ${input.account.trim().toLowerCase()}`,
    `Reaction: ${input.reaction}`,
    `State: ${input.active ? 'active' : 'inactive'}`,
    `Signed at: ${input.signedAt}`,
    'This signature does not authorize a transaction or transfer funds.',
  ].join('\n')
}
