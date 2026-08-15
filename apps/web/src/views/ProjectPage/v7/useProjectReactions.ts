import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import {
  PROJECT_REACTION_IDS,
  buildProjectReactionMessage,
  type ProjectReactionCounts,
  type ProjectReactionId,
} from 'lib/project-reactions/contract'

export { PROJECT_REACTION_IDS }
export type { ProjectReactionId }

const EMPTY_COUNTS: ProjectReactionCounts = { like: 0, watching: 0, bullish: 0, bearish: 0, moon: 0 }

export function useProjectReactions(slug: string) {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [selected, setSelected] = useState<ProjectReactionId[]>([])
  const [counts, setCounts] = useState<ProjectReactionCounts>(EMPTY_COUNTS)
  const [pending, setPending] = useState<ProjectReactionId | null>(null)
  const endpoint = useMemo(() => {
    const query = address ? `?account=${encodeURIComponent(address)}` : ''
    return `/api/projects/${encodeURIComponent(slug)}/reactions${query}`
  }, [address, slug])

  useEffect(() => {
    let active = true
    void fetch(endpoint, { credentials: 'same-origin' })
      .then((response) => (response.ok ? response.json() : null))
      .then((snapshot) => {
        if (!active || !snapshot?.ok) return
        setCounts({ ...EMPTY_COUNTS, ...snapshot.counts })
        setSelected(Array.isArray(snapshot.selected) ? snapshot.selected : [])
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [endpoint])

  const react = useCallback(
    async (id: ProjectReactionId) => {
      if (!address || pending) return
      const active = !selected.includes(id)
      const signedAt = new Date().toISOString()
      const message = buildProjectReactionMessage({ slug, account: address, reaction: id, active, signedAt })
      setPending(id)
      try {
        const signature = await signMessageAsync({ message })
        const response = await fetch(`/api/projects/${encodeURIComponent(slug)}/reactions`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ account: address, reaction: id, active, signedAt, signature }),
        })
        if (!response.ok) throw new Error('REACTION_UPDATE_FAILED')
        const snapshot = await response.json()
        setCounts({ ...EMPTY_COUNTS, ...snapshot.counts })
        setSelected(Array.isArray(snapshot.selected) ? snapshot.selected : [])
      } catch {
        // A rejected signature or temporary receiver failure leaves canonical counts untouched.
      } finally {
        setPending(null)
      }
    },
    [address, pending, selected, signMessageAsync, slug],
  )

  return { selected, counts, pending, walletConnected: Boolean(address), react }
}
