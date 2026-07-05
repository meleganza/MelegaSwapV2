import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import {
  formatPendingReviewStatusLabel,
  updatePendingReview,
} from 'registry/projects/pending/updatePendingReview'
import type { PendingProjectStatus } from 'registry/projects/pending/types'
import { useImportRuntime } from '../importExistingTokenRuntime/ImportRuntimeContext'
import { IT_FONT_BODY, importTokenColors } from '../importTokenTokens'
import { ItOutlineBtn, ItPanel, ItPrimaryBtn, ItSectionLabel } from './importTokenPrimitives'

const Panel = styled(ItPanel)`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Title = styled.h3`
  margin: 0;
  font-family: ${IT_FONT_BODY};
  font-size: 20px;
  font-weight: 700;
  color: ${importTokenColors.white};
`

const Body = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${importTokenColors.body};
`

const Meta = styled.div`
  font-size: 12px;
  color: ${importTokenColors.muted};
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const StatusBadge = styled.span<{ $tone: 'gold' | 'green' | 'red' | 'gray' }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? importTokenColors.green
      : $tone === 'red'
        ? '#f87171'
        : $tone === 'gold'
          ? importTokenColors.gold
          : importTokenColors.muted};
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'green'
        ? 'rgba(27, 231, 122, 0.45)'
        : $tone === 'red'
          ? 'rgba(248, 113, 113, 0.45)'
          : $tone === 'gold'
            ? 'rgba(214, 180, 69, 0.45)'
            : 'rgba(255,255,255,0.12)'};
`

const NotesArea = styled.textarea`
  width: 100%;
  min-height: 72px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  color: ${importTokenColors.body};
  font-family: ${IT_FONT_BODY};
  font-size: 13px;
  resize: vertical;
  box-sizing: border-box;
`

const BtnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const ErrorText = styled.div`
  font-size: 12px;
  color: #f87171;
`

const PromotionNote = styled.div`
  font-size: 12px;
  color: ${importTokenColors.muted};
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(214, 180, 69, 0.25);
  background: rgba(214, 180, 69, 0.06);
`

function statusTone(status: PendingProjectStatus): 'gold' | 'green' | 'red' | 'gray' {
  if (status === 'approved') return 'green'
  if (status === 'rejected') return 'red'
  if (status === 'pending_review' || status === 'discovered') return 'gold'
  return 'gray'
}

export const PendingReviewCard: React.FC = () => {
  const { analysis, refreshAnalysis } = useImportRuntime()
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitReview = useCallback(
    async (status: PendingProjectStatus) => {
      if (!analysis?.pendingProject) return
      setBusy(true)
      setError(null)
      const result = await updatePendingReview(analysis.pendingProject.id, {
        status,
        reviewed_by: 'dex-reviewer',
        review_notes: notes.trim() || undefined,
      })
      setBusy(false)
      if (!result.ok) {
        setError(result.reason ?? 'Review update failed')
        return
      }
      refreshAnalysis()
    },
    [analysis?.pendingProject, notes, refreshAnalysis],
  )

  if (!analysis?.pending || !analysis.pendingProject) return null

  const pending = analysis.pendingProject
  const reviewStatus = pending.status

  return (
    <Panel data-iet-pending-review>
      <ItSectionLabel>Pending Registry Review</ItSectionLabel>
      <Title>{pending.name.available ? pending.name.value : 'Unknown Project'}</Title>
      <StatusBadge $tone={statusTone(reviewStatus)}>
        {formatPendingReviewStatusLabel(reviewStatus)}
      </StatusBadge>
      <Body>{analysis.summary}</Body>
      <Meta>
        <span>Pending ID: {pending.id}</span>
        <span>Contract: {pending.contract}</span>
        <span>Chain: {pending.chain}</span>
        {pending.review.reviewed_by ? <span>Reviewer: {pending.review.reviewed_by}</span> : null}
        {pending.review.review_notes ? <span>Notes: {pending.review.review_notes}</span> : null}
        {pending.review.reviewed_at ? <span>Reviewed: {pending.review.reviewed_at}</span> : null}
      </Meta>

      <NotesArea
        placeholder="Reviewer notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        aria-label="Reviewer notes"
      />

      <BtnRow>
        <ItPrimaryBtn type="button" disabled={busy} onClick={() => submitReview('pending_review')}>
          Submit for Review
        </ItPrimaryBtn>
        <ItOutlineBtn type="button" disabled={busy} onClick={() => submitReview('approved')}>
          Approve
        </ItOutlineBtn>
        <ItOutlineBtn type="button" disabled={busy} onClick={() => submitReview('rejected')}>
          Reject
        </ItOutlineBtn>
      </BtnRow>

      {error ? <ErrorText>{error}</ErrorText> : null}

      {reviewStatus === 'approved' ? (
        <PromotionNote>
          Approved — pending profile remains non-canonical until manual merge into STATIC_PROJECTS.
          Visible in Projects and Radar with Pending Review badge until promotion.
        </PromotionNote>
      ) : null}
    </Panel>
  )
}

export default PendingReviewCard
