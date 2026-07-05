import type { PendingProjectRecord, PendingProjectStatus } from './types'

export interface UpdatePendingReviewInput {
  status: PendingProjectStatus
  reviewed_by?: string
  review_notes?: string
}

export interface UpdatePendingReviewResult {
  ok: boolean
  profile?: PendingProjectRecord
  reason?: string
  machine_code?: string
}

export async function updatePendingReview(
  pendingId: string,
  input: UpdatePendingReviewInput,
): Promise<UpdatePendingReviewResult> {
  const res = await fetch(`/api/registry/projects/pending/${encodeURIComponent(pendingId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = (await res.json()) as UpdatePendingReviewResult & { profile?: PendingProjectRecord }
  if (!res.ok) {
    return {
      ok: false,
      reason: data.reason ?? `Review update failed (${res.status})`,
      machine_code: data.machine_code,
    }
  }
  return { ok: true, profile: data.profile }
}

export function formatPendingReviewStatusLabel(status: PendingProjectStatus): string {
  switch (status) {
    case 'discovered':
      return 'Discovered'
    case 'pending_review':
      return 'Pending Review'
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    case 'archived':
      return 'Archived'
    default:
      return status
  }
}
