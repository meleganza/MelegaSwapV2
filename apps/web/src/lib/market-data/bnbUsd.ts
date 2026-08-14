/**
 * Shared BNB/USD fetch — multi-source failover for market-data certification.
 */

export async function fetchBnbUsd(): Promise<{ usd?: number; source?: string }> {
  const sources: Array<{ name: string; run: () => Promise<number | undefined> }> = [
    {
      name: 'coingecko',
      run: async () => {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
          { headers: { accept: 'application/json' } },
        )
        if (!res.ok) return undefined
        const json = (await res.json()) as { binancecoin?: { usd?: number } }
        return json.binancecoin?.usd
      },
    },
    {
      name: 'coinbase',
      run: async () => {
        const res = await fetch('https://api.coinbase.com/v2/prices/BNB-USD/spot', {
          headers: { accept: 'application/json' },
        })
        if (!res.ok) return undefined
        const json = (await res.json()) as { data?: { amount?: string } }
        return json.data?.amount != null ? Number(json.data.amount) : undefined
      },
    },
    {
      name: 'defillama',
      run: async () => {
        const res = await fetch('https://coins.llama.fi/prices/current/coingecko:binancecoin', {
          headers: { accept: 'application/json' },
        })
        if (!res.ok) return undefined
        const json = (await res.json()) as {
          coins?: { 'coingecko:binancecoin'?: { price?: number } }
        }
        return json.coins?.['coingecko:binancecoin']?.price
      },
    },
    {
      name: 'binance.us',
      run: async () => {
        const res = await fetch('https://api.binance.us/api/v3/ticker/price?symbol=BNBUSDT', {
          headers: { accept: 'application/json' },
        })
        if (!res.ok) return undefined
        const json = (await res.json()) as { price?: string }
        return json.price != null ? Number(json.price) : undefined
      },
    },
    {
      name: 'binance.com',
      run: async () => {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT', {
          headers: { accept: 'application/json' },
        })
        if (!res.ok) return undefined
        const json = (await res.json()) as { price?: string }
        return json.price != null ? Number(json.price) : undefined
      },
    },
    {
      name: 'kraken',
      run: async () => {
        const res = await fetch('https://api.kraken.com/0/public/Ticker?pair=BNBUSD', {
          headers: { accept: 'application/json' },
        })
        if (!res.ok) return undefined
        const json = (await res.json()) as { result?: { BNBUSD?: { c?: string[] } } }
        const last = json.result?.BNBUSD?.c?.[0]
        return last != null ? Number(last) : undefined
      },
    },
  ]

  for (const source of sources) {
    try {
      const usd = await source.run()
      if (typeof usd === 'number' && Number.isFinite(usd) && usd > 0) {
        return { usd, source: source.name }
      }
    } catch {
      // continue
    }
  }
  return {}
}
