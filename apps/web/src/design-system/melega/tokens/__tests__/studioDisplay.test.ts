import { describe, expect, it } from 'vitest'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import {
  STUDIO_KPI_VALUE,
  STUDIO_LIVE_RUNTIME_LABEL,
  displayStudioMetric,
  isStudioMetricUnavailable,
} from '../studioDisplay'

describe('R764 studioDisplay', () => {
  it('defines unified live badge and KPI rhythm', () => {
    expect(STUDIO_LIVE_RUNTIME_LABEL).toBe('Live Runtime')
    expect(STUDIO_KPI_VALUE.size).toBe('22px')
    expect(STUDIO_KPI_VALUE.fontVariantNumeric).toBe('tabular-nums')
  })

  it('maps em-dash and empty values to unavailable', () => {
    expect(isStudioMetricUnavailable('—')).toBe(true)
    expect(isStudioMetricUnavailable('0 MARCO')).toBe(true)
    expect(displayStudioMetric('—')).toBe(RUNTIME_UNAVAILABLE_LABEL)
    expect(displayStudioMetric('12,450')).toBe('12,450')
  })
})
