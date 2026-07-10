import { describe, expect, it } from 'vitest'
import { resolveBscScanApiKey } from '../resolveBscScanApiKey'

describe('resolveBscScanApiKey', () => {
  it('prefers server-side BSCSCAN_API_KEY', () => {
    const prevServer = process.env.BSCSCAN_API_KEY
    const prevCanonical = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY
    process.env.BSCSCAN_API_KEY = 'server-key'
    process.env.NEXT_PUBLIC_BSCSCAN_API_KEY = 'public-key'
    try {
      const resolved = resolveBscScanApiKey()
      expect(resolved.apiKey).toBe('server-key')
      expect(resolved.source).toBe('BSCSCAN_API_KEY')
    } finally {
      if (prevServer === undefined) delete process.env.BSCSCAN_API_KEY
      else process.env.BSCSCAN_API_KEY = prevServer
      if (prevCanonical === undefined) delete process.env.NEXT_PUBLIC_BSCSCAN_API_KEY
      else process.env.NEXT_PUBLIC_BSCSCAN_API_KEY = prevCanonical
    }
  })

  it('prefers canonical NEXT_PUBLIC_BSCSCAN_API_KEY when server key missing', () => {
    const prevCanonical = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY
    const prevTypo = process.env.NEXT_PUBLIC_BSCSAN_API_KEY
    const prevServer = process.env.BSCSCAN_API_KEY
    delete process.env.BSCSCAN_API_KEY
    process.env.NEXT_PUBLIC_BSCSCAN_API_KEY = 'canonical-key'
    process.env.NEXT_PUBLIC_BSCSAN_API_KEY = 'typo-key'
    try {
      const resolved = resolveBscScanApiKey()
      expect(resolved.apiKey).toBe('canonical-key')
      expect(resolved.source).toBe('NEXT_PUBLIC_BSCSCAN_API_KEY')
      expect(resolved.typoAliasUsed).toBe(false)
    } finally {
      if (prevCanonical === undefined) delete process.env.NEXT_PUBLIC_BSCSCAN_API_KEY
      else process.env.NEXT_PUBLIC_BSCSCAN_API_KEY = prevCanonical
      if (prevTypo === undefined) delete process.env.NEXT_PUBLIC_BSCSAN_API_KEY
      else process.env.NEXT_PUBLIC_BSCSAN_API_KEY = prevTypo
      if (prevServer === undefined) delete process.env.BSCSCAN_API_KEY
      else process.env.BSCSCAN_API_KEY = prevServer
    }
  })

  it('falls back to typo NEXT_PUBLIC_BSCSAN_API_KEY when canonical missing', () => {
    const prevCanonical = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY
    const prevTypo = process.env.NEXT_PUBLIC_BSCSAN_API_KEY
    const prevServer = process.env.BSCSCAN_API_KEY
    delete process.env.BSCSCAN_API_KEY
    delete process.env.NEXT_PUBLIC_BSCSCAN_API_KEY
    process.env.NEXT_PUBLIC_BSCSAN_API_KEY = 'typo-key'
    try {
      const resolved = resolveBscScanApiKey()
      expect(resolved.apiKey).toBe('typo-key')
      expect(resolved.source).toBe('NEXT_PUBLIC_BSCSAN_API_KEY')
      expect(resolved.typoAliasUsed).toBe(true)
    } finally {
      if (prevCanonical === undefined) delete process.env.NEXT_PUBLIC_BSCSCAN_API_KEY
      else process.env.NEXT_PUBLIC_BSCSCAN_API_KEY = prevCanonical
      if (prevTypo === undefined) delete process.env.NEXT_PUBLIC_BSCSAN_API_KEY
      else process.env.NEXT_PUBLIC_BSCSAN_API_KEY = prevTypo
      if (prevServer === undefined) delete process.env.BSCSCAN_API_KEY
      else process.env.BSCSCAN_API_KEY = prevServer
    }
  })
})
