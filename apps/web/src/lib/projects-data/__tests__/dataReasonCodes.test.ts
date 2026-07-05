import { describe, expect, it } from 'vitest'
import {
  missingMetric,
  metricReasonLabel,
  PROJECT_DATA_REASON_LABELS,
} from 'lib/projects-data/dataReasonCodes'

describe('dataReasonCodes', () => {
  it('maps reason codes to human labels', () => {
    expect(metricReasonLabel('NO_POOL_FOUND')).toBe(PROJECT_DATA_REASON_LABELS.NO_POOL_FOUND)
    expect(metricReasonLabel('EXPLORER_SOURCE_MISSING')).toBe('Explorer source missing')
  })

  it('missingMetric never uses Unavailable as display', () => {
    const metric = missingMetric('DATA_SOURCE_NOT_CONFIGURED')
    expect(metric.display).toBe('—')
    expect(metric.reasonCode).toBe('DATA_SOURCE_NOT_CONFIGURED')
  })
})
