import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { Interface } from '@ethersproject/abi'
import {
  M7_EXECUTE_SELECTOR,
  M7_FOUNDER_HELPER_PATH,
  M7_HELPER_STOPS,
  assembleM7ExecuteCalldata,
} from '../m7FounderHelper'
import { M7_UNSIGNED_APPROVE, M7_UNSIGNED_CANARY } from '../m7UnsignedCanary'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'

const WEB = path.resolve(__dirname, '../../../..')
const REPO = path.resolve(WEB, '../..')

function extractJsonBlock(html: string, id: string): string {
  const re = new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)</script>`)
  const m = html.match(re)
  if (!m) throw new Error(`missing ${id}`)
  return m[1].trim()
}

describe('SmartSwap M7 Founder helper', () => {
  const helperPath = path.join(REPO, M7_FOUNDER_HELPER_PATH)
  const approvePath = path.join(REPO, M7_UNSIGNED_APPROVE.package)
  const execPath = path.join(REPO, M7_UNSIGNED_CANARY.package)

  it('embeds the exact sealed approve and execute packages', () => {
    expect(existsSync(helperPath)).toBe(true)
    const html = readFileSync(helperPath, 'utf8')
    const approveFile = readFileSync(approvePath, 'utf8').trim()
    const execFile = readFileSync(execPath, 'utf8').trim()
    expect(extractJsonBlock(html, 'm7-approve-package')).toBe(approveFile)
    expect(extractJsonBlock(html, 'm7-execute-package')).toBe(execFile)
    const approve = JSON.parse(extractJsonBlock(html, 'm7-approve-package'))
    const exec = JSON.parse(extractJsonBlock(html, 'm7-execute-package'))
    expect(approve).toEqual(JSON.parse(approveFile))
    expect(exec).toEqual(JSON.parse(execFile))
    expect(exec.intentHash).toBe(M7_UNSIGNED_CANARY.intentHash)
    expect(exec.nonce).toBe(M7_UNSIGNED_CANARY.nonce)
    expect(approve.nonce).toBe(M7_UNSIGNED_APPROVE.nonce)
    expect(exec.pair).toBe('0xd99c7f6c65857ac913a8f880a4cb84032ab2fc5b')
    expect(exec.intent.inputAmount).toBe('10000000000000000')
    expect(exec.economics.venueInputWbnbWei).toBe('9980000000000000')
    expect(exec.intent.feeBps).toBe(20)
    expect(exec.intent.nonce).toBe(2)
    expect(exec.ACTIVE_V2_ROLLOUT).toBe('LEGACY_PRODUCTION')
    expect(exec.UNAUTHORIZED_UI_CHANGE).toBe(0)
    expect(approve.unlimited).toBe(false)
  })

  it('assembles certified execute calldata matching the executor ABI', () => {
    const exec = JSON.parse(readFileSync(execPath, 'utf8')) as {
      intent: {
        version: number
        policyId: string
        policyVersion: string
        chainId: number
        user: string
        inputAsset: string
        outputAsset: string
        inputAmount: string
        minUserOut: string
        venueId: string
        router: string
        routeHash: string
        feeBps: number
        feeAmount: string
        feeAsset: string
        beneficiary: string
        structuralRouteCostBps: number
        deadline: number
        nonce: number
        nativeIn: boolean
        nativeOut: boolean
      }
      path: string[]
    }
    const signature = `0x${'ab'.repeat(65)}`
    const assembled = assembleM7ExecuteCalldata({ ...exec.intent, path: exec.path, signature })
    expect(assembled.startsWith(M7_EXECUTE_SELECTOR)).toBe(true)
    const iface = new Interface([
      'function execute((uint256,bytes32,bytes32,uint256,address,address,address,uint256,uint256,bytes32,address,bytes32,uint16,uint256,address,address,uint256,uint256,uint256,bool,bool),address[],bytes)',
    ])
    const tuple = [
      exec.intent.version,
      exec.intent.policyId,
      exec.intent.policyVersion,
      exec.intent.chainId,
      exec.intent.user,
      exec.intent.inputAsset,
      exec.intent.outputAsset,
      exec.intent.inputAmount,
      exec.intent.minUserOut,
      exec.intent.venueId,
      exec.intent.router,
      exec.intent.routeHash,
      exec.intent.feeBps,
      exec.intent.feeAmount,
      exec.intent.feeAsset,
      exec.intent.beneficiary,
      exec.intent.structuralRouteCostBps,
      exec.intent.deadline,
      exec.intent.nonce,
      exec.intent.nativeIn,
      exec.intent.nativeOut,
    ]
    expect(assembled).toBe(iface.encodeFunctionData('execute', [tuple, exec.path, signature]))
  })

  it('is a fail-closed local helper with no customer UX, key material, unlimited approve, or retry', () => {
    const html = readFileSync(helperPath, 'utf8')
    for (const code of M7_HELPER_STOPS) {
      expect(html).toContain(code)
    }
    expect(html).toContain('personal_sign')
    expect(html).toContain('INCOMPLETE_UNTIL_INTENTSIGNER_PERSONAL_SIGN')
    expect(html).toContain('python3 -m http.server')
    expect(html).toContain('No private key')
    expect(html).not.toContain('PRIVATE_KEY')
    expect(html).not.toContain('mnemonic')
    const approve = JSON.parse(extractJsonBlock(html, 'm7-approve-package')) as {
      unlimited: boolean
      args: { amount: string }
      data: string
    }
    expect(approve.unlimited).toBe(false)
    expect(approve.args.amount).toBe('10000000000000000')
    expect(approve.data.toLowerCase().endsWith('2386f26fc10000')).toBe(true)
    expect(html).not.toContain('wallet_requestPermissions')
    expect(html).toContain('no retry')
    expect(html).toContain('LEGACY_PRODUCTION')
    for (const rel of SMARTSWAP_UX_FREEZE_FILES) {
      expect(helperPath.includes(rel)).toBe(false)
    }
  })
})
