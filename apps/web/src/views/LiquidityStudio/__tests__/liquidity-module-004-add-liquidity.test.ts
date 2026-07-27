/**
 * LIQUIDITY_MODULE_004_ADD_LIQUIDITY — UI shell, runtime reuse, freezes, CTA states.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { LIQUIDITY_ADD_COPY, LIQUIDITY_MODULE_001_003_FREEZE, liquidityAdd } from '../modules/liquidityAddTokens'
import { humanizeAddError, mapApprovalState, resolveLiquidityAddCta } from '../modules/liquidityAddCta'
import { LIQUIDITY_MODULE_PLAN } from '../liquidityArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const STUDIO = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(STUDIO, rel), 'utf8')
}

function sha256File(filePath: string) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex')
}

describe('LIQUIDITY_MODULE_004 Add Liquidity', () => {
  it('keeps Modules 001–003 frozen', () => {
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityHeroModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_003_FREEZE.LiquidityHeroModule,
    )
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityActionsModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_003_FREEZE.LiquidityActionsModule,
    )
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityPoolDiscoveryModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_003_FREEZE.LiquidityPoolDiscoveryModule,
    )
  })

  it('locks desktop geometry 1376 container / 900+24+424 panels', () => {
    expect(liquidityAdd.contentMax).toBe('1376px')
    expect(liquidityAdd.mainW).toBe('900px')
    expect(liquidityAdd.sideW).toBe('424px')
    expect(liquidityAdd.columnGap).toBe('24px')
    const panelSum =
      parseInt(liquidityAdd.mainW, 10) +
      parseInt(liquidityAdd.columnGap, 10) +
      parseInt(liquidityAdd.sideW, 10)
    // Mission panel contract (900 + 24 + 424); remaining width is page/chrome margin inside 1376.
    expect(panelSum).toBe(1348)
    expect(parseInt(liquidityAdd.contentMax, 10) - panelSum).toBe(28)

    const mod = load('modules/LiquidityAddModule.tsx')
    expect(mod).toContain('data-liquidity-add-geometry="900-24-424"')
    expect(mod).toContain('grid-template-columns: 1fr')
  })

  it('consumes existing mint runtime and slippage settings — no second engine', () => {
    const mod = load('modules/LiquidityAddModule.tsx')
    expect(mod).toContain('LiquidityRuntimeProvider')
    expect(mod).toContain('useLiquidityRuntime')
    expect(mod).toContain('onPrimaryAction')
    expect(mod).toContain('SettingsModal')
    expect(mod).toContain('SettingsMode.SWAP_LIQUIDITY')
    expect(mod).toContain('MelegaTokenAvatar')
    expect(mod).not.toContain('addLiquidityETH')
    expect(mod).not.toContain('calculateSlippageAmount')
    expect(mod).not.toContain('useDerivedMintInfo')
    expect(mod).not.toContain('useRouterContract')
  })

  it('maps wallet / approve / add / error CTA states without dead labels', () => {
    expect(resolveLiquidityAddCta({ account: null, approvalA: 'UNKNOWN', approvalB: 'UNKNOWN' })).toEqual({
      state: 'connect',
      label: 'Connect Wallet',
      disabled: false,
    })
    expect(
      resolveLiquidityAddCta({
        account: '0xabc',
        approvalA: 'NOT_APPROVED',
        approvalB: 'UNKNOWN',
      }).label,
    ).toBe('Approve Token A')
    expect(
      resolveLiquidityAddCta({
        account: '0xabc',
        approvalA: 'APPROVED',
        approvalB: 'NOT_APPROVED',
      }).label,
    ).toBe('Approve Token B')
    expect(
      resolveLiquidityAddCta({
        account: '0xabc',
        approvalA: 'PENDING',
        approvalB: 'APPROVED',
      }).label,
    ).toBe('Confirming')
    expect(
      resolveLiquidityAddCta({
        account: '0xabc',
        approvalA: 'APPROVED',
        approvalB: 'APPROVED',
      }).label,
    ).toBe('Add Liquidity')
    expect(
      resolveLiquidityAddCta({
        account: '0xabc',
        approvalA: 'APPROVED',
        approvalB: 'APPROVED',
        errorCode: 'INSUFFICIENT_TOKEN_A',
      }).label,
    ).toBe('Insufficient Balance')
    expect(
      resolveLiquidityAddCta({
        account: '0xabc',
        approvalA: 'APPROVED',
        approvalB: 'APPROVED',
        wrongChain: true,
      }).label,
    ).toBe('Wrong Network')
    expect(mapApprovalState(1)).toBe('NOT_APPROVED')
    expect(mapApprovalState(2)).toBe('PENDING')
    expect(mapApprovalState(3)).toBe('APPROVED')
  })

  it('humanizes factual error states', () => {
    expect(humanizeAddError('INSUFFICIENT_TOKEN_A')).toBe('Insufficient balance')
    expect(humanizeAddError('APPROVAL_REQUIRED')).toBe('Approval required')
    expect(humanizeAddError('POOL_CLOSED')).toBe('Pool unavailable')
    expect(humanizeAddError('INVALID_RATIO')).toBe('Price changed')
    expect(humanizeAddError('UNKNOWN', 'boom')).toBe('boom')
    expect(humanizeAddError('ENTER_AMOUNT')).toBeNull()
  })

  it('ships locked copy without fake APR / earnings claims', () => {
    expect(LIQUIDITY_ADD_COPY.title).toBe('Add Liquidity')
    expect(LIQUIDITY_ADD_COPY.previewTitle).toBe('Position Preview')
    const mod = load('modules/LiquidityAddModule.tsx')
    expect(mod).not.toMatch(/\bAPR\b/)
    expect(mod).not.toContain('preview.apr')
    expect(mod).not.toMatch(/guaranteed|risk-free|earn \$/i)
    expect(mod).toContain('liquidity-add-preview-panel')
    expect(mod).toContain('liquidity-add-form-panel')
  })

  it('supports token0/token1 seed query and anchor id', () => {
    expect(liquidityAdd.anchorId).toBe('add-liquidity')
    const mod = load('modules/LiquidityAddModule.tsx')
    expect(mod).toContain("id={liquidityAdd.anchorId}")
    expect(mod).toContain('router.query.token0')
    expect(mod).toContain('router.query.token1')
    expect(mod).toContain('setCurrencyA')
    expect(mod).toContain('setCurrencyB')
  })

  it('mounts Module 004 after Discovery and above frozen legacy Pool', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/liquidity.tsx'), 'utf8')
    expect(page).toContain('LiquidityAddModule')
    expect(page).toContain('data-liquidity-module-004="mounted"')
    const discovery = page.indexOf('<LiquidityPoolDiscoveryModule')
    const add = page.indexOf('<LiquidityAddModule')
    const legacy = page.indexOf('data-liquidity-legacy-body')
    expect(discovery).toBeGreaterThan(-1)
    expect(add).toBeGreaterThan(discovery)
    expect(legacy).toBeGreaterThan(add)
    expect(page).toContain('views/Pool')
  })

  it('does not modify forbidden execution surfaces in this mission', () => {
    // Module 004 files must not import or rewrite router/contracts/exchange write paths.
    const bundle = [
      load('modules/LiquidityAddModule.tsx'),
      load('modules/liquidityAddTokens.ts'),
      load('modules/liquidityAddCta.ts'),
    ].join('\n')
    expect(bundle).not.toContain('config/constants/contracts')
    expect(bundle).not.toContain("from 'utils/exchange'")
    expect(bundle).not.toContain('liquidityBuilding/')
  })

  it('records ownership, plan certification, and evidence artifacts', () => {
    const map = readFileSync(path.join(WEB, 'docs/runtime/LIQUIDITY_MODULE_OWNERSHIP_MAP.md'), 'utf8')
    expect(map).toContain('LiquidityAddModule.tsx')
    expect(map).toContain('liquidity-module-004-add-liquidity')
    expect(LIQUIDITY_MODULE_PLAN.find((m) => m.id === '004-add-liquidity')?.phase).toBe(
      'certified-by-this-mission',
    )
    const evidence = path.join(WEB, 'docs/runtime/liquidity-module-004-add-liquidity')
    expect(existsSync(evidence)).toBe(true)
    expect(existsSync(path.join(WEB, 'docs/runtime/LIQUIDITY_MODULE_004_ADD_LIQUIDITY_REPORT.md'))).toBe(true)
    expect(existsSync(path.join(evidence, 'test-summary.json'))).toBe(true)
    expect(existsSync(path.join(evidence, 'geometry-evidence.json'))).toBe(true)
  })
})
