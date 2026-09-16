import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { PUBLIC_FARM_FACTORY_CAPABILITY } from 'views/FarmsStudio/modules/publicFarmFactoryCapability'
import { resolveCreatePoolFeeBnb } from 'config/constants/feeSchedule'

const WEB = path.resolve(__dirname, '../..')

describe('Create Pool + Create Farm permission truth', () => {
  it('does not add a Founder/deployer wallet gate on the Create Farm or Create Pool wizards', () => {
    const farm = readFileSync(path.join(WEB, 'views/FarmsStudio/modules/PublicFarmFactoryWorkspace.tsx'), 'utf8')
    const pool = readFileSync(path.join(WEB, 'views/PoolsStudio/components/CreatePoolCta.tsx'), 'utf8')
    expect(farm).not.toMatch(/AUTHORIZED_MELEGA_DEPLOYER|isFounder|onlyOwner/)
    expect(pool).not.toMatch(/AUTHORIZED_MELEGA_DEPLOYER|isFounder|onlyOwner/)
    expect(farm).toContain("data-factory-deployed={PUBLIC_FARM_FACTORY_CAPABILITY.readiness.walletCanExecute ? 'true' : 'false'}")
  })

  it('records the on-chain farm attestation gate and the missing public pool factory', () => {
    const factory = readFileSync(path.join(WEB, '../../../contracts/public-farm-factory/PublicFarmFactoryV1.sol'), 'utf8')
    expect(factory).toContain('function createFarm(')
    expect(factory).toContain('external payable')
    expect(factory).toContain('_consumeEligibilityAttestation')
    expect(factory).toContain('address public immutable eligibilitySigner')
    expect(factory).not.toMatch(/onlyOwner/)
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.outcome).toBe('A_PERMISSIONLESS_FACTORY_AVAILABLE')
    expect(farmCreateRemainsLockedWithoutAttestation()).toBe(true)
    expect(resolveCreatePoolFeeBnb(false)).toBe('0.25')
    expect(resolveCreatePoolFeeBnb(true)).toBe('0')
  })
})

function farmCreateRemainsLockedWithoutAttestation(): boolean {
  const farm = readFileSync(path.join(WEB, 'views/FarmsStudio/modules/PublicFarmFactoryWorkspace.tsx'), 'utf8')
  return farm.includes('verified creation service is connected')
}
