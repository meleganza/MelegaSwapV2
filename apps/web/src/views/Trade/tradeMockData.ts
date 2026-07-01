/** Presentation-only mock data for trade terminal layout preview. */
export const TRADE_MOCK_LABEL = 'Preview layout'

export const MOCK_ROUTE_ENTRIES = [
  {
    rank: 1,
    chain: 'BNB Chain',
    source: 'PancakeSwap',
    amount: '2,534.12 MARCO',
    delta: 'Best price',
    gas: '0.0003 BNB',
    time: '30 sec',
    best: true,
  },
  {
    rank: 2,
    chain: 'Polygon',
    source: 'QuickSwap',
    amount: '2,521.45',
    delta: '-0.5%',
    gas: '—',
    time: '45 sec',
    best: false,
  },
  {
    rank: 3,
    chain: 'Arbitrum',
    source: 'SushiSwap',
    amount: '2,501.22',
    delta: '-1.3%',
    gas: '—',
    time: '60 sec',
    best: false,
  },
] as const

export const MOCK_ASSETS = [
  { symbol: 'BNB', balance: '1.245', usd: '≈ $673' },
  { symbol: 'MARCO', balance: '12,450', usd: '≈ $4.90' },
] as const

export const MOCK_ROUTER_STATUS = {
  status: 'All systems operational',
  uptime: '99.98%',
  routes: '24',
  chains: '5',
} as const

export const MOCK_RECENT_SWAPS = [
  { id: 'm1', time: '2m ago', pair: 'MARCO / BNB', type: 'buy' as const, amount: '0.50 BNB', received: '1,267.06 MARCO', route: 'BNB→PCS→Melega' },
  { id: 'm2', time: '5m ago', pair: 'MARCO / BNB', type: 'sell' as const, amount: '2,100 MARCO', received: '0.82 BNB', route: 'Melega→PCS→BNB' },
  { id: 'm3', time: '8m ago', pair: 'BNB / USDT', type: 'buy' as const, amount: '1.20 BNB', received: '748.32 USDT', route: 'BNB→PCS' },
  { id: 'm4', time: '12m ago', pair: 'MARCO / BNB', type: 'buy' as const, amount: '0.25 BNB', received: '633.50 MARCO', route: 'BNB→PCS→Melega' },
  { id: 'm5', time: '18m ago', pair: 'MARCO / BNB', type: 'sell' as const, amount: '500 MARCO', received: '0.19 BNB', route: 'Melega→PCS→BNB' },
  { id: 'm6', time: '24m ago', pair: 'BNB / MARCO', type: 'buy' as const, amount: '0.10 BNB', received: '253.41 MARCO', route: 'BNB→PCS→Melega' },
] as const

export const MOCK_WATCHLIST = [
  { id: 'w1', pair: 'MARCO / BNB', href: '/trade' },
  { id: 'w2', pair: 'BNB / USDT', href: '/trade' },
  { id: 'w3', pair: 'ETH / BNB', href: '/trade' },
] as const
