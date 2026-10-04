import { describe, expect, it, vi } from 'vitest'
import {
  MARCO_REFERRAL_MAX_AGE_MS,
  MARCO_REFERRAL_STORAGE_KEY,
  captureMarcoReferral,
  readStoredMarcoReferral,
  resolveMarcoReferralForCheckout,
  quoteMarcoReferralForCheckout,
} from '../client'
import { dexReferralCatalogRef } from '../catalog'

class MemoryStorage {
  private values = new Map<string, string>()
  getItem(key: string) {
    return this.values.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
  removeItem(key: string) {
    this.values.delete(key)
  }
}

function resolveResponse(code: string, valid = true) {
  return new Response(
    JSON.stringify({
      ok: true,
      valid,
      referral_code: code,
      pro_certified: valid,
      certified_surfaces: valid ? ['melega-dex', 'melega-space'] : [],
    }),
    { status: valid ? 200 : 404, headers: { 'content-type': 'application/json' } },
  )
}

describe('MARCO Passport PRO referral transport', () => {
  it('stays passive when browser storage is denied', () => {
    const denied = {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => {
        throw new Error('denied')
      },
      removeItem: () => {
        throw new Error('denied')
      },
    }
    expect(readStoredMarcoReferral(denied)).toBeNull()
    expect(captureMarcoReferral('https://dex.melega.ai/?ref=founder-1', denied)).toBeNull()
  })

  it('keeps the first valid touch through navigation and rejects overwrite attempts', () => {
    const storage = new MemoryStorage()
    const first = captureMarcoReferral('https://dex.melega.ai/swap?ref=founder-1', storage, 1_000)
    const second = captureMarcoReferral('https://dex.melega.ai/farms?ref=other-pro', storage, 2_000)
    expect(first?.code).toBe('founder-1')
    expect(second?.code).toBe('founder-1')
    expect(readStoredMarcoReferral(storage, 2_000)?.expiresAt).toBe(1_000 + MARCO_REFERRAL_MAX_AGE_MS)
  })

  it('keeps destination and campaign as analytics context on the same code', () => {
    const storage = new MemoryStorage()
    const captured = captureMarcoReferral(
      'https://melega.finance/swap?ref=founder-1&rd=melega-dex&rc=launch-2026',
      storage,
      1_000,
    )
    expect(captured).toMatchObject({
      code: 'founder-1',
      destinationRef: 'melega-dex',
      campaignRef: 'launch-2026',
    })
  })

  it('accepts only an exact authoritative quote and carries analytics context', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      expect(url).toContain('rd=melega-dex')
      expect(url).toContain('rc=launch-2026')
      return new Response(JSON.stringify({
        ok: true,
        referral_code: 'founder-1',
        catalog_ref: 'mpp_ref_dex_trend_6h',
        listed_price_minor: '10000',
        discount_minor: '1000',
        net_paid_minor: '9000',
        commission_amount_minor: '2700',
      }))
    })
    await expect(quoteMarcoReferralForCheckout({
      code: 'founder-1',
      catalogRef: 'mpp_ref_dex_trend_6h',
      destinationRef: 'melega-dex',
      campaignRef: 'launch-2026',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })).resolves.toMatchObject({ net_paid_minor: '9000', commission_amount_minor: '2700' })
  })

  it('expires attribution after 30 days', () => {
    const storage = new MemoryStorage()
    captureMarcoReferral('https://dex.melega.ai/?ref=founder-1', storage, 1_000)
    expect(readStoredMarcoReferral(storage, 1_000 + MARCO_REFERRAL_MAX_AGE_MS)).toBeNull()
    expect(storage.getItem(MARCO_REFERRAL_STORAGE_KEY)).toBeNull()
  })

  it('exposes only a referral certified by MARCO for Melega DEX', async () => {
    const storage = new MemoryStorage()
    captureMarcoReferral('https://dex.melega.ai/?ref=founder-1', storage, 1_000)
    const fetchImpl = vi.fn(async () => resolveResponse('founder-1'))
    const verified = await resolveMarcoReferralForCheckout(
      storage,
      fetchImpl as unknown as typeof fetch,
      2_000,
    )
    expect(verified).toMatchObject({ code: 'founder-1', status: 'VERIFIED', verifiedAt: 2_000 })
  })

  it('fails closed for an invalid or uncertified code', async () => {
    const storage = new MemoryStorage()
    captureMarcoReferral('https://dex.melega.ai/?ref=invalid-1', storage, 1_000)
    const fetchImpl = vi.fn(async () => resolveResponse('invalid-1', false))
    await expect(
      resolveMarcoReferralForCheckout(storage, fetchImpl as unknown as typeof fetch, 2_000),
    ).resolves.toBeNull()
    expect(storage.getItem(MARCO_REFERRAL_STORAGE_KEY)).toBeNull()
  })

  it('keeps an already verified first touch during a temporary MARCO outage', async () => {
    const storage = new MemoryStorage()
    storage.setItem(
      MARCO_REFERRAL_STORAGE_KEY,
      JSON.stringify({ code: 'founder-1', capturedAt: 1_000, expiresAt: 99_000, verifiedAt: 2_000, status: 'VERIFIED' }),
    )
    const fetchImpl = vi.fn(async () => {
      throw new Error('offline')
    })
    await expect(
      resolveMarcoReferralForCheckout(storage, fetchImpl as unknown as typeof fetch, 3_000),
    ).resolves.toMatchObject({ code: 'founder-1', status: 'VERIFIED' })
  })

  it('maps every currently live DEX visibility package to an authoritative catalogue ref', () => {
    for (const packageId of [
      'featured_24h',
      'featured_72h',
      'featured_1w',
      'featured_1m',
      'trend_1h',
      'trend_3h',
      'trend_6h',
      'trend_12h',
      'trend_24h',
    ]) {
      expect(dexReferralCatalogRef(packageId)).toMatch(/^mpp_ref_dex_/)
    }
  })
})
