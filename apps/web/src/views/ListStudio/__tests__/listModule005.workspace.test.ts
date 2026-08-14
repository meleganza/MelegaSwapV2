/**
 * LIST Final — denser workspace beside right How guide.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIST Workspace (founder-final)', () => {
  it('uses auto-height denser workspace shell', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("workspaceH: 'auto'")
    expect(tokens).toContain("workspaceW: '1376px'")
    expect(tokens).toContain('workspaceMinH')
  })

  it('keeps token detection, liquidity and project setup in the same listing modal', () => {
    const ws = load('ListWorkspace.tsx')
    const liquidity = load('ListInlineLiquidityStep.tsx')
    expect(ws).toContain("'import-token': 'List Your Token'")
    expect(ws).toContain('Contract Address')
    expect(ws).toContain('ListInlineLiquidityStep')
    expect(ws).toContain("journey: 'listing'")
    expect(ws).toContain("liquidity: 'confirmed'")
    expect(ws).not.toContain("pathname: '/liquidity'")
    expect(ws).not.toContain('Continue to liquidity')
    expect(ws).toContain('ListAiCopilot')
    expect(ws).toContain('Continue')
    expect(ws).toContain('Cancel')
    expect(ws).toContain('Publish')
    expect(ws).not.toContain('createPortal')
    expect(ws).not.toContain('Modal')
    expect(ws).not.toContain('Drawer')
    expect(liquidity).toContain('<LiquidityAddModule embedded />')
    expect(liquidity).toContain("runtime.addTxLifecycle !== 'confirmed'")
  })

  it('opens the unified workspace as an official listing modal', () => {
    const screen = load('ListStudioScreen.tsx')
    expect(screen).toContain("dynamic(() => import('./ListWorkspace')")
    expect(screen).toContain('list-adaptive-modal')
    expect(screen).toContain('aria-label="Melega DEX listing flow"')
    expect(screen).toContain('<ListContractFirstFunnel')
    expect(screen).toContain('<ListWorkspace')
    expect(screen).not.toContain('<ListHowItWorks')
  })

  it('uses consumer listing language and removes the duplicate hero brand', () => {
    const hero = load('ListContractFirstFunnel.tsx')
    expect(hero).toContain('List your project')
    expect(hero).toContain('Bring your token.')
    expect(hero).toContain('Token detected')
    expect(hero).not.toContain('CONTRACT-FIRST ADAPTIVE FUNNEL')
    expect(hero).not.toContain('Contract-first adaptive funnel')
    expect(hero).not.toContain('<Brand')
  })

  it('shows the certified Create Token execution path', () => {
    const ws = load('ListWorkspace.tsx')
    expect(ws).toContain('LIST_CREATE_TOKEN_AVAILABLE')
    expect(ws).toContain('list-create-token-ready')
    expect(ws).toContain('parseTokenCreatedReceipt')
    expect(ws).toContain('verifyDeployedToken')
  })
})
