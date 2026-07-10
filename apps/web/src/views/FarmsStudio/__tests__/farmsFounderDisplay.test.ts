import { describe, expect, it } from 'vitest'
import {
  displayFarmMetric,
  isUnavailableFarmMetric,
  MARCO_EMITS_TODAY_LABEL,
  stripTokenSymbol,
} from '../farmsStudioDisplay'
import { farmsTypography } from '../farmsStudioTokens'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'

describe('R763 farms founder display', () => {
  it('never treats fake zero emission as available', () => {
    expect(isUnavailableFarmMetric('0 MARCO')).toBe(true)
    expect(isUnavailableFarmMetric('—')).toBe(true)
    expect(displayFarmMetric('0 MARCO')).toBe(RUNTIME_UNAVAILABLE_LABEL)
  })

  it('strips duplicate MARCO suffix from emission values', () => {
    expect(stripTokenSymbol('12,450 MARCO')).toBe('12,450')
    expect(stripTokenSymbol('1.23K MARCO')).toBe('1.23K')
  })

  it('uses institutional KPI typography aligned with Trade', () => {
    expect(farmsTypography.kpiValue.size).toBe('22px')
    expect(farmsTypography.kpiValue.weight).toBe(700)
    expect(farmsTypography.fontVariantNumeric).toBe('tabular-nums')
    expect(MARCO_EMITS_TODAY_LABEL).toBe('Marco Emits Today')
  })
})
