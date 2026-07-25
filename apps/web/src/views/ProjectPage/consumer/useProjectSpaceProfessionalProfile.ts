import { useEffect, useState } from 'react'
import type { SpaceProfessionalProfileSnapshot } from 'lib/space-professional-profile'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; snapshot: SpaceProfessionalProfileSnapshot }

/**
 * Client read of Project Page → SPACE relationship.
 * Failures are isolated — never blocks Project Page shell.
 */
export function useProjectSpaceProfessionalProfile(slug: string): LoadState {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)

    ;(async () => {
      try {
        const res = await fetch(`/api/public/projects/${encodeURIComponent(slug)}/space-professional-profile/`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) throw new Error(`HTTP_${res.status}`)
        const json = (await res.json()) as {
          spaceProfessionalProfile?: SpaceProfessionalProfileSnapshot
          profile?: SpaceProfessionalProfileSnapshot | null
        }
        const snapshot =
          json.profile ||
          ({
            authority: 'SPACE',
            status: json.spaceProfessionalProfile?.status || 'SPACE_UNAVAILABLE',
            profileId: json.spaceProfessionalProfile?.profileId ?? null,
            canonicalUrl: json.spaceProfessionalProfile?.canonicalUrl ?? null,
            services: [],
            badges: [],
            certifications: [],
            fetchedAt: json.spaceProfessionalProfile?.fetchedAt || new Date().toISOString(),
            freshness: json.spaceProfessionalProfile?.freshness || 'unavailable',
            provenance: 'SPACE',
            partialData: Boolean(json.spaceProfessionalProfile?.partialData),
            errorState: json.spaceProfessionalProfile?.errorState ?? 'SPACE_SUMMARY_ONLY',
            message:
              json.spaceProfessionalProfile?.message ||
              'SPACE profile temporarily unavailable',
          } as SpaceProfessionalProfileSnapshot)

        // Prefer summary-backed empty snapshot for unlinked/unavailable.
        const summary = json.spaceProfessionalProfile
        const merged: SpaceProfessionalProfileSnapshot = json.profile
          ? snapshot
          : {
              authority: 'SPACE',
              status: summary?.status || 'NO_CANONICAL_LINK',
              profileId: summary?.profileId ?? null,
              canonicalUrl: summary?.canonicalUrl ?? null,
              profileType: summary?.profileType ?? undefined,
              verificationState: summary?.verificationState ?? undefined,
              profileStatus: summary?.profileStatus ?? undefined,
              services: [],
              badges: [],
              certifications: [],
              version: summary?.version ?? undefined,
              updatedAt: summary?.updatedAt ?? null,
              fetchedAt: summary?.fetchedAt || new Date().toISOString(),
              freshness: summary?.freshness || 'unknown',
              provenance: 'SPACE',
              partialData: Boolean(summary?.partialData),
              errorState: summary?.errorState ?? null,
              message: summary?.message || 'Professional Profile not linked',
            }

        if (!cancelled) setState({ status: 'ready', snapshot: merged })
      } catch (err) {
        if (cancelled) return
        setState({
          status: 'ready',
          snapshot: {
            authority: 'SPACE',
            status: 'SPACE_UNAVAILABLE',
            profileId: null,
            canonicalUrl: null,
            services: [],
            badges: [],
            certifications: [],
            fetchedAt: new Date().toISOString(),
            freshness: 'unavailable',
            provenance: 'SPACE',
            partialData: false,
            errorState: err instanceof Error && err.name === 'AbortError' ? 'SPACE_TIMEOUT' : 'SPACE_FETCH_FAILED',
            message: 'SPACE profile temporarily unavailable',
          },
        })
      } finally {
        clearTimeout(timer)
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timer)
    }
  }, [slug])

  return state
}
