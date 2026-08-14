import { describe, expect, it } from 'vitest'
import { resolveRuntimeProfile } from '../runtimeProfile'

describe('route runtime profile', () => {
  it('keeps document-only pages free of chain polling', () => {
    expect(resolveRuntimeProfile('/docs/liquidity-builder/overview')).toBe('static')
    expect(resolveRuntimeProfile('/support')).toBe('static')
  })

  it('uses read-only runtime for discovery surfaces', () => {
    expect(resolveRuntimeProfile('/')).toBe('market')
    expect(resolveRuntimeProfile('/projects')).toBe('market')
    expect(resolveRuntimeProfile('/project-hq/marco')).toBe('market')
  })

  it('reserves write-capable runtime for transaction surfaces', () => {
    expect(resolveRuntimeProfile('/swap')).toBe('transactional')
    expect(resolveRuntimeProfile('/pools')).toBe('transactional')
    expect(resolveRuntimeProfile('/liquidity-studio?tab=add')).toBe('transactional')
  })
})
