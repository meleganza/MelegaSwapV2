import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { buildingHref, programFromQuery } from '../../../views/LiquidityStudio/liquidityBuilding/liquidityBuildingStep'

const PROGRAM = '0xA15aDa28A9b7d4d9f6Ac781407bAf1A2CFB802EB'

describe('LB program deep link foundation', () => {
  it('parses program query address', () => {
    expect(programFromQuery(PROGRAM)).toBe(PROGRAM)
    expect(programFromQuery('not-an-address')).toBeNull()
    expect(programFromQuery([PROGRAM])).toBe(PROGRAM)
  })

  it('builds building href with program identifier', () => {
    const href = buildingHref('dashboard', PROGRAM)
    expect(href).toContain('view=building')
    expect(href).toContain('step=dashboard')
    expect(href.toLowerCase()).toContain(`program=${PROGRAM.toLowerCase()}`)
  })

  it('card read model accepts programAddress override without removing activeProgram path', () => {
    const root = path.resolve(__dirname, '../../../views/LiquidityStudio/liquidityBuilding')
    const readModel = readFileSync(path.join(root, 'useProgramReadModel.ts'), 'utf8')
    const card = readFileSync(path.join(root, 'useLiquidityBuildingCard.ts'), 'utf8')
    expect(readModel).toContain('programAddress?:')
    expect(readModel).toContain('deepLinkedProgram')
    expect(readModel).toContain('activeProgramCallArgs')
    expect(card).toContain('programFromQuery(router.query.program)')
    expect(card).toContain('programAddress: deepLinkProgram')
  })
})
