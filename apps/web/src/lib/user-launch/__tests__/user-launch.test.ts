import { describe, expect, it } from 'vitest'
import {
  LAUNCH_CAPABILITY_IDS,
  resolveUserLaunchReadModel,
  serializeUserLaunchManifest,
  getLaunchCapabilityById,
  assertLaunchCapabilityCoverage,
} from '../index'

describe('user launch read model', () => {
  it('covers all required capability ids', () => {
    assertLaunchCapabilityCoverage()
    const model = resolveUserLaunchReadModel()
    expect(model.capabilities).toHaveLength(LAUNCH_CAPABILITY_IDS.length)
  })

  it('exposes constitutional canonical economy', () => {
    const model = resolveUserLaunchReadModel()
    expect(model.constitutional.canonicalChain).toBe('BNB Chain')
    expect(model.constitutional.canonicalAsset).toBe('MARCO')
    expect(model.readOnly).toBe(true)
    expect(model.executionEnabled).toBe(false)
  })

  it('links existing liquidity and pool flows without duplication', () => {
    const liquidity = getLaunchCapabilityById('create_liquidity')!
    const pool = getLaunchCapabilityById('create_pool')!
    expect(liquidity.status).toBe('AVAILABLE_EXISTING_FLOW')
    expect(liquidity.existingFlowHref).toBe('/add')
    expect(pool.existingFlowHref).toBe('/add')
  })

  it('marks farm creation as blocked with existing farms link', () => {
    const farm = getLaunchCapabilityById('create_farm')!
    expect(farm.status).toBe('BLOCKED')
    expect(farm.existingFlowHref).toBe('/farms')
    expect(farm.warnings.some((warning) => warning.includes('fake'))).toBe(true)
  })

  it('marks token deploy as planned not fake live', () => {
    const token = getLaunchCapabilityById('create_token')!
    expect(token.status).toBe('PLANNED')
    expect(token.existingFlowHref).toBeUndefined()
  })

  it('exposes activation and presence as live read model', () => {
    const activation = getLaunchCapabilityById('activate_economic_presence')!
    expect(activation.status).toBe('LIVE')
    expect(activation.existingFlowHref).toBe('/new-project')
    expect(activation.registryHref).toBe('/presence')
    expect(activation.walletRequirement).toBe('none')
  })

  it('includes required inputs and dependencies per capability', () => {
    const model = resolveUserLaunchReadModel()
    model.capabilities.forEach((capability) => {
      expect(capability.requiredInputs.length).toBeGreaterThan(0)
      expect(capability.contractDependency.reference).toBeTruthy()
      expect(capability.executionDependency.reference).toBeTruthy()
      expect(capability.machineManifest).toContain('user-launch')
    })
  })

  it('serializes machine manifest as read-only', () => {
    const manifest = serializeUserLaunchManifest(resolveUserLaunchReadModel())
    expect(manifest.manifest).toContain('user-launch')
    expect(manifest.read_only).toBe(true)
    expect(manifest.execution_enabled).toBe(false)
    expect(manifest.capabilities.length).toBe(9)
  })
})
