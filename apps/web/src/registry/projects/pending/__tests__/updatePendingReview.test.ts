import { describe, expect, it } from 'vitest'
import { formatPendingReviewStatusLabel } from '../updatePendingReview'

describe('updatePendingReview', () => {
  it('formats pending review status labels', () => {
    expect(formatPendingReviewStatusLabel('pending_review')).toBe('Pending Review')
    expect(formatPendingReviewStatusLabel('approved')).toBe('Approved')
    expect(formatPendingReviewStatusLabel('rejected')).toBe('Rejected')
  })
})
