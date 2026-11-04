import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

describe('MARCO Bridge hydration boundary', () => {
  it('omits only page Suspense while preserving server rendering', () => {
    const bridgePage = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/bridge/index.tsx'), 'utf8')
    const app = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/_app.tsx'), 'utf8')

    expect(bridgePage).toContain('BridgePage.disablePageSuspense = true')
    expect(app).toContain("dynamic(() => import('app-runtime/FullMyApp'), { ssr: true })")
  })
})
