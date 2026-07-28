/** Forbidden advisory / guarantee phrases — never emit these. */
export const SMART_SWAP_AI_FORBIDDEN_PATTERNS: RegExp[] = [
  /\bbuy this token\b/i,
  /\bsell this token\b/i,
  /\bbest investment\b/i,
  /\bmaximize profit\b/i,
  /\bincrease your position\b/i,
  /\bguaranteed savings\b/i,
  /\bguaranteed better price\b/i,
  /\bguaranteed outcome\b/i,
  /\byou should (buy|sell|maximize|increase)\b/i,
  /\bbest route guaranteed\b/i,
]

export function containsForbiddenAIContent(text: string): boolean {
  return SMART_SWAP_AI_FORBIDDEN_PATTERNS.some((re) => re.test(text))
}

/** Strip accidental forbidden language; prefer refusing over rewriting into advice. */
export function assertSafeAIExplanation(text: string): string {
  if (!text || !text.trim()) return 'Information unavailable.'
  if (containsForbiddenAIContent(text)) {
    return 'Information unavailable.'
  }
  return text.trim()
}
