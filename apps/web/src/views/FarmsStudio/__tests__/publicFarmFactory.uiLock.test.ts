import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('publicFarmFactory UI locks', () => {
  it('FarmsStudioScreen still mounts CreateFarmWorkspace before Explore', () => {
    const screen = load('FarmsStudioScreen.tsx')
    expect(screen.indexOf('<CreateFarmWorkspace')).toBeGreaterThan(-1)
    expect(screen.indexOf('<CreateFarmWorkspace')).toBeLessThan(screen.indexOf('<FarmsExploreFarmsModule'))
    expect(screen).toContain('data-farms-create-farm="mounted"')
  })

  it('CreateFarmWorkspace re-exports PublicFarmFactoryWorkspace', () => {
    const workspace = load('modules/CreateFarmWorkspace.tsx')
    expect(workspace).toContain('export const CreateFarmWorkspace = PublicFarmFactoryWorkspace')
  })

  it('PublicFarmFactoryWorkspace covers required orchestration surfaces', () => {
    const ui = load('modules/PublicFarmFactoryWorkspace.tsx')
    expect(ui).toContain('data-testid="create-farm-workspace"')
    expect(ui).toContain('data-public-farm-factory="true"')
    expect(ui).toContain('data-masterbuilder-exposed="false"')
    expect(ui).toContain('CREATE_FARM_UX.useExisting')
    expect(ui).toContain('CREATE_FARM_UX.createNew')
    expect(ui).toContain('public-farm-low-liquidity-remediation')
    expect(ui).toContain('CREATE_FARM_UX.increaseLiquidity')
    expect(ui).toContain('CREATE_FARM_UX.addLiquidityManually')
    expect(ui).toContain('public-farm-marco-reward-rejection')
    expect(ui).toContain('CREATE_FARM_UX.marcoRewardFriendly')
    expect(ui).toContain('PUBLIC_FARM_FACTORY_CAPABILITY')
    expect(ui).not.toContain('MasterChef.add')
    const copy = load('modules/createFarmUxCopy.ts')
    expect(copy).toContain('MARCO rewards are reserved for official Melega Farms')
    const eligibility = load('modules/publicFarmEligibility.ts')
    expect(eligibility).toContain(
      'MARCO reward farms are protocol-managed and cannot be created through the Public Farm Factory.',
    )
    const capability = load('modules/publicFarmFactoryCapability.ts')
    expect(capability).toContain('A_PERMISSIONLESS_FACTORY_AVAILABLE')
    expect(capability).toContain('B_FACTORY_DEPLOYMENT_REQUIRED')
  })

  it('mobile-friendly styles remain present', () => {
    const ui = load('modules/PublicFarmFactoryWorkspace.tsx')
    expect(ui).toContain('@media (max-width: 767px)')
    expect(ui).toContain('@media (max-width: 1023px)')
  })
})
