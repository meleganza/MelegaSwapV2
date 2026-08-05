import { describe, expect, it } from 'vitest'
import {
  missingMetric,
  metricReasonLabel,
  metricUiReasonLabel,
  PROJECT_DATA_REASON_LABELS,
} from 'lib/projects-data/dataReasonCodes'

describe('dataReasonCodes', () => {
  it('maps reason codes to Unavailable user language', () => {
    expect(metricReasonLabel('NO_POOL_FOUND')).toBe(PROJECT_DATA_REASON_LABELS.NO_POOL_FOUND)
    expect(metricReasonLabel('EXPLORER_SOURCE_MISSING')).toBe('Unavailable')
  })

  it('missingMetric uses Unavailable display (never invent zeros)', () => {
    const metric = missingMetric('DATA_SOURCE_NOT_CONFIGURED')
    expect(metric.display).toBe('Unavailable')
    expect(metric.reasonCode).toBe('DATA_SOURCE_NOT_CONFIGURED')
  })

  it('metricUiReasonLabel never surfaces Source not configured / Waiting explorer', () => {
    expect(metricUiReasonLabel('DATA_SOURCE_NOT_CONFIGURED')).toBe('Unavailable')
    expect(metricUiReasonLabel('EXPLORER_SOURCE_MISSING')).toBe('Unavailable')
    expect(metricUiReasonLabel('NO_EVENTS_INDEXED')).toBe('Unavailable')
  })
})
