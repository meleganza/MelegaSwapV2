import { describe, expect, it } from 'vitest'
import {
  RUNTIME_UNAVAILABLE_LABEL,
  RUNTIME_LOADING_LABEL,
  resolveRuntimeMetric,
  isRuntimeUnavailableDisplay,
  runtimeReasonFromCode,
} from '../format'

describe('runtime-truth R756', () => {
  it('resolveRuntimeMetric returns READY for valid string values', () => {
    const field = resolveRuntimeMetric('$1.2M')
    expect(field.status).toBe('READY')
    expect(field.display).toBe('$1.2M')
  })

  it('resolveRuntimeMetric returns LOADING when loading flag set', () => {
    const field = resolveRuntimeMetric(undefined, { loading: true })
    expect(field.status).toBe('LOADING')
    expect(field.display).toBe(RUNTIME_LOADING_LABEL)
  })

  it('resolveRuntimeMetric returns UNAVAILABLE with explicit reason', () => {
    const field = resolveRuntimeMetric(undefined, { reasonCode: 'PAIR_NOT_INDEXED' })
    expect(field.status).toBe('UNAVAILABLE')
    expect(field.display).toBe(RUNTIME_UNAVAILABLE_LABEL)
    expect(field.reason).toBe('Pair not indexed in Melega subgraph')
  })

  it('isRuntimeUnavailableDisplay detects unavailable labels', () => {
    expect(isRuntimeUnavailableDisplay(RUNTIME_UNAVAILABLE_LABEL)).toBe(true)
    expect(isRuntimeUnavailableDisplay('—')).toBe(true)
    expect(isRuntimeUnavailableDisplay('$42K')).toBe(false)
  })

  it('runtimeReasonFromCode maps known data reason codes', () => {
    expect(runtimeReasonFromCode('NO_EVENTS_INDEXED')).toContain('swap events')
  })
})
