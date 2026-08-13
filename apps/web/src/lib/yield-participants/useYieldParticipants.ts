import useSWR from 'swr'
import generatedSnapshot from './yieldParticipants.generated.json'
import type { YieldParticipantApiResponse, YieldParticipantSnapshot } from './types'

const initialSnapshot = generatedSnapshot as YieldParticipantSnapshot

async function fetchParticipants(): Promise<YieldParticipantApiResponse> {
  const response = await fetch('/api/yield/participants')
  if (!response.ok) throw new Error(`Participant index unavailable (${response.status})`)
  return response.json()
}

export function useYieldParticipants() {
  const { data, error, isValidating } = useSWR<YieldParticipantApiResponse>(
    'yield-participants-v1',
    fetchParticipants,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300_000,
      refreshInterval: 300_000,
    },
  )

  return {
    // The generated snapshot is bundled with the release, so participant fields
    // never flicker back to an ambiguous dash while the cacheable API revalidates.
    snapshot: data ?? initialSnapshot,
    loading: !data && isValidating,
    error: error instanceof Error ? error : null,
  }
}
