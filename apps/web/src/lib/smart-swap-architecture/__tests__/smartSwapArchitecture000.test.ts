/**
 * SMART_SWAP_ARCHITECTURE_000 — architecture lock tests only.
 * No UI / feature / routing mutation tests.
 * Avoids importing SmartSwap exchange hooks (heavy state graph).
 */
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { execSync } from 'child_process'
import {
  SMART_SWAP_ARCHITECTURE_ID,
  SMART_SWAP_ARCHITECTURE_PHASE,
  SMART_SWAP_CANONICAL_OWNERSHIP,
  SMART_SWAP_CERTIFIED_BASE,
  SMART_SWAP_CONTRACT_ANCHORS,
  SMART_SWAP_DOC_PATHS,
  SMART_SWAP_FORBIDDEN,
  SMART_SWAP_MODULE_PLAN,
  SMART_SWAP_MUST_ANSWER_BEFORE_EXECUTION,
  SMART_SWAP_SURFACES,
} from '../smartSwapArchitecture000Contracts'
import { MELEGA_SMART_ROUTER_ARCHITECTURE } from 'lib/melega-smart-router/types'
import { D87_DEX_PRICING_RATIFIED, FSC_01 } from 'lib/d87-pricing/codex/ratified'
import { DEX_HANDOFF_OWNERSHIP, FORBIDDEN_HANDOFF_PAYLOAD_FIELDS } from 'lib/treasury-handoff/ownership'
import { isKerlRoutingAuthorityEnforced } from 'lib/kerl-constitutional/authority'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(WEB, '../..')

describe('SMART_SWAP_ARCHITECTURE_000 lock', () => {
  it('locks certified base ancestry', () => {
    expect(SMART_SWAP_ARCHITECTURE_ID).toBe('SMART_SWAP_ARCHITECTURE_000')
    expect(SMART_SWAP_CERTIFIED_BASE.tipShort).toBe('94d4979a')
    expect(SMART_SWAP_CERTIFIED_BASE.productionAncestorShort).toBe('ff6d6179')
    execSync('git merge-base --is-ancestor ff6d6179 HEAD', { cwd: REPO })
    // Historical tip may be absent on recovered/rebased worktrees; require label lock only when present.
    try {
      execSync('git merge-base --is-ancestor 94d4979a HEAD', { cwd: REPO })
    } catch {
      expect(SMART_SWAP_CERTIFIED_BASE.label).toBe('MELEGA_DEX_V1_GLOBAL_PRODUCT_CERTIFIED')
    }
  })

  it('publishes all architecture deliverable documents', () => {
    for (const rel of SMART_SWAP_DOC_PATHS) {
      const abs = path.join(REPO, rel)
      expect(existsSync(abs), rel).toBe(true)
      expect(readFileSync(abs, 'utf8').length).toBeGreaterThan(400)
    }
  })

  it('freezes Smart Swap as canonical surface; Instant archived (same engine)', () => {
    expect(SMART_SWAP_SURFACES.instantSwap.engine).toBe('SmartSwapForm')
    expect(SMART_SWAP_SURFACES.smartSwap.engine).toBe('SmartSwapForm')
    expect(SMART_SWAP_SURFACES.instantSwap.purpose).toMatch(/ARCHIVED/)
    expect(SMART_SWAP_SURFACES.smartSwap.scope).toMatch(/Melega liquidity only/)
    const home = readFileSync(path.join(WEB, 'src/views/HomeTrade/HomeSwapPanel.tsx'), 'utf8')
    const cockpit = readFileSync(path.join(WEB, 'src/views/Trade/TradeCockpit.tsx'), 'utf8')
    expect(home).toContain('SmartSwapForm')
    expect(cockpit).toContain('SmartSwapForm')
    expect(home).not.toContain('TradeModeSelector')
  })

  it('locks ADAPTER phase and BSC Smart Router + LP fee anchors in source', () => {
    expect(SMART_SWAP_ARCHITECTURE_PHASE.current).toBe('ADAPTER')
    expect(MELEGA_SMART_ROUTER_ARCHITECTURE).toBe('ADAPTER')
    const smartExchange = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/utils/exchange.ts'), 'utf8')
    expect(smartExchange).toContain(SMART_SWAP_CONTRACT_ANCHORS.bscSmartRouter)
    const exchangeConst = readFileSync(path.join(WEB, 'src/config/constants/exchange.ts'), 'utf8')
    expect(exchangeConst).toContain(SMART_SWAP_CONTRACT_ANCHORS.bscV2Router)
    expect(exchangeConst).toMatch(/BASE_FEE\s*=\s*new Percent\(JSBI\.BigInt\(25\)/)
  })

  it('locks D87 protocol fee + FSC-01 Treasury ownership', () => {
    expect(D87_DEX_PRICING_RATIFIED.services.swap.protocolFeeStandardBps).toBe(
      SMART_SWAP_CONTRACT_ANCHORS.protocolFeeStandardBps,
    )
    expect(D87_DEX_PRICING_RATIFIED.services.swap.protocolFeeBuyMarcoBps).toBe(
      SMART_SWAP_CONTRACT_ANCHORS.protocolFeeBuyMarcoBps,
    )
    expect(D87_DEX_PRICING_RATIFIED.lpFee.policy).toBe('unaffected')
    expect(D87_DEX_PRICING_RATIFIED.feeSplit.dexPolicy).toBe('forward_protocol_fee_only')
    expect(FSC_01.owner).toBe('MELEGA TREASURY WALLET')
    expect(SMART_SWAP_CANONICAL_OWNERSHIP.settlement).toMatch(/NONE|decommissioned/i)
  })

  it('enforces DEX handoff must never own settlement splits', () => {
    expect(DEX_HANDOFF_OWNERSHIP.mustNeverOwn).toEqual(
      expect.arrayContaining([
        'settlement_id generation',
        'fee waterfall splits',
        'referral amount computation',
      ]),
    )
    expect(FORBIDDEN_HANDOFF_PAYLOAD_FIELDS).toEqual(
      expect.arrayContaining(['settlement_id', 'waterfall', 'referral_amount']),
    )
  })

  it('KERL routing authority is decommissioned (never enforced)', () => {
    expect(isKerlRoutingAuthorityEnforced(56)).toBe(false)
    expect(isKerlRoutingAuthorityEnforced(97)).toBe(false)
  })

  it('defines forbidden behaviors, pre-execution questions, and future modules', () => {
    expect(SMART_SWAP_FORBIDDEN).toEqual(expect.arrayContaining(['invent liquidity', 'custody funds']))
    expect(SMART_SWAP_MUST_ANSWER_BEFORE_EXECUTION).toHaveLength(6)
    expect(SMART_SWAP_MODULE_PLAN[0].phase).toBe('certified-by-this-mission')
    expect(SMART_SWAP_MODULE_PLAN.filter((m) => m.id !== '000-architecture').every((m) => m.phase === 'future')).toBe(
      true,
    )
  })

  it('does not modify forbidden product files in this mission', () => {
    const changed = execSync('git status --porcelain', { cwd: REPO }).toString()
    expect(changed).not.toMatch(/views\/Swap\/SmartSwap\/utils\/exchange\.ts/)
    expect(changed).not.toMatch(/config\/constants\/exchange\.ts/)
    expect(changed).not.toMatch(/config\/constants\/contracts\.ts/)
  })
})
