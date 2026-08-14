import { useCallback, useEffect, useState } from 'react'

export const PROJECT_REACTION_IDS = ['like', 'bullish', 'moon', 'watching'] as const
export type ProjectReactionId = (typeof PROJECT_REACTION_IDS)[number]

export function useProjectReactions(slug: string) {
  const storageKey = `melega:project-reaction:${slug}`
  const [selected, setSelected] = useState<ProjectReactionId | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey)
    setSelected(
      stored && PROJECT_REACTION_IDS.includes(stored as ProjectReactionId) ? (stored as ProjectReactionId) : null,
    )
  }, [storageKey])

  const react = useCallback(
    (id: ProjectReactionId) => {
      setSelected((current) => {
        const next = current === id ? null : id
        if (next) window.localStorage.setItem(storageKey, next)
        else window.localStorage.removeItem(storageKey)
        return next
      })
    },
    [storageKey],
  )

  return { selected, react }
}
