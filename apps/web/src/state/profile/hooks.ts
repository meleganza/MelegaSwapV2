export interface LegacyProfileSummary {
  username: string
}

export function useProfile(): { profile: LegacyProfileSummary | null; isLoading: boolean } {
  return { profile: null, isLoading: false }
}
