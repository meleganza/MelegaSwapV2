import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { buildDexManifest } from '../dex-manifest/document'

const ROOT = path.resolve(__dirname, '../../')

describe('Melega DEX machine-readable MARCO surfaces', () => {
  it('publishes marco_pay and marco_connect without fake metrics', () => {
    const manifest = buildDexManifest({
      applicationRef: 'app_sedafoqw6qlxyxb9l8ds',
      executable: false,
    })
    expect(manifest.marco_pay.enabled).toBe(true)
    expect(manifest.marco_pay.merchant_id).toBe('app_sedafoqw6qlxyxb9l8ds')
    expect(manifest.marco_pay.base_url).toBe('https://marco.melega.ai')
    expect(manifest.marco_pay.frontend_never_sets_paid).toBe(true)
    expect(manifest.marco_pay.executable).toBe(false)
    expect(manifest.marco_connect.enabled).toBe(true)
    expect(manifest.marco_connect.payment_requires_passport).toBe(false)
    expect(JSON.stringify(manifest)).not.toMatch(/tvl|volume|users|holders/i)
  })

  it('exposes the requested well-known and live manifest routes', () => {
    const wellKnown = JSON.parse(
      readFileSync(path.join(ROOT, '../public/.well-known/melega-dex.json'), 'utf8'),
    ) as { marco_pay: { merchant_id: string }; marco_connect: { enabled: boolean }; live_manifest: string }
    expect(wellKnown.marco_pay.merchant_id).toBe('app_sedafoqw6qlxyxb9l8ds')
    expect(wellKnown.marco_connect.enabled).toBe(true)
    expect(wellKnown.live_manifest).toBe('/api/public/dex-manifest/')
    expect(
      readFileSync(path.join(ROOT, 'pages/api/public/dex-manifest.ts'), 'utf8'),
    ).toContain('resolveDexManifest')
  })
})
