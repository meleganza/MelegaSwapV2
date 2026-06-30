import { describe, expect, it } from 'vitest'
import { statusTone, toHumanStatus } from '../status-utils'

describe('economic os status utils', () => {
  it('maps technical statuses to human labels', () => {
    expect(toHumanStatus('ready')).toBe('Ready')
    expect(toHumanStatus('not_indexed')).toBe('Not indexed')
    expect(toHumanStatus('blocked')).toBe('Blocked')
    expect(toHumanStatus('planned')).toBe('Planned')
    expect(toHumanStatus('retired')).toBe('Legacy')
  })

  it('returns tone colors for human statuses', () => {
    expect(statusTone('Ready')).toContain('#')
    expect(statusTone('Blocked')).toContain('#')
  })
})
