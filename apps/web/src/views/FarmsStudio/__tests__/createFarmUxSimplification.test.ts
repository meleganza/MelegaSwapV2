import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  CREATE_FARM_FORBIDDEN_PUBLIC_TERMS,
  CREATE_FARM_UX,
} from '../modules/createFarmUxCopy'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('Create Farm UX simplification', () => {
  it('uses human pair selection labels', () => {
    const ui = load('modules/PublicFarmFactoryWorkspace.tsx')
    const copy = load('modules/createFarmUxCopy.ts')
    expect(ui).toContain('CREATE_FARM_UX.useExisting')
    expect(ui).toContain('CREATE_FARM_UX.createNew')
    expect(ui).toContain('CREATE_FARM_UX.increaseLiquidity')
    expect(ui).toContain('CREATE_FARM_UX.addLiquidityManually')
    expect(ui).toContain('CREATE_FARM_UX.marcoRewardFriendly')
    expect(ui).toContain('CREATE_FARM_UX.feeTreasuryNote')
    expect(ui).toContain('CREATE_FARM_UX.advanced')
    expect(copy).toContain(CREATE_FARM_UX.useExisting)
    expect(copy).toContain(CREATE_FARM_UX.createNew)
    expect(copy).toContain(CREATE_FARM_UX.marcoRewardFriendly.split('\n')[0])
  })

  it('shows only the simplified configuration field set by default', () => {
    const ui = load('modules/PublicFarmFactoryWorkspace.tsx')
    expect(ui).toContain('CREATE_FARM_UX.rewardToken')
    expect(ui).toContain('CREATE_FARM_UX.rewardBudget')
    expect(ui).toContain('CREATE_FARM_UX.duration')
    expect(ui).toContain('CREATE_FARM_UX.emission')
    expect(ui).toContain('CREATE_FARM_UX.creationFee')
    expect(ui).toContain('CREATE_FARM_UX.estimatedApr')
    expect(ui).toContain('CREATE_FARM_UX.review')
    expect(ui).toContain('create-farm-advanced-toggle')
  })

  it('never exposes forbidden protocol terminology in the public UI module', () => {
    const ui = load('modules/PublicFarmFactoryWorkspace.tsx')
    for (const term of CREATE_FARM_FORBIDDEN_PUBLIC_TERMS) {
      expect(ui.includes(term), `UI must not contain "${term}"`).toBe(false)
    }
    expect(ui).not.toContain('Factory Deployment Required')
    expect(ui).not.toContain('protocol-managed')
    expect(ui).not.toContain('undeployed')
    expect(ui).not.toContain('MELEGA TREASURY WALLET ·')
    expect(ui).not.toContain('0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b')
  })

  it('keeps protocol engines imported (architecture unchanged)', () => {
    const ui = load('modules/PublicFarmFactoryWorkspace.tsx')
    expect(ui).toContain("from './publicFarmEligibility'")
    expect(ui).toContain("from './publicFarmFactoryFee'")
    expect(ui).toContain("from './publicFarmFactoryDraft'")
    expect(ui).toContain("from './publicFarmFactoryCapability'")
  })

  it('primary CTA follows guided states', () => {
    const ui = load('modules/PublicFarmFactoryWorkspace.tsx')
    expect(ui).toContain('create-farm-next-increase')
    expect(ui).toContain('create-farm-next-continue')
    expect(ui).toContain('create-farm-submit')
    expect(ui).toContain('CREATE_FARM_UX.createFarm')
    expect(ui).toContain('CREATE_FARM_UX.continue')
  })
})

