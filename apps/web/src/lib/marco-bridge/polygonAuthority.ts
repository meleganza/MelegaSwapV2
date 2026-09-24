import { ethers } from 'ethers'
import type { CanonicalMmnRouteState } from './routeAuthority'
import { MARCO_WAVE1_NETWORKS, POLYGON_ROUND_TRIP_CERTIFIED, localRouteActivationEnabled } from './wave1Registry'

export type PolygonLiveBinding = { verified: boolean; reason: string }
const SAFE = '0x840410fef54CA6A922Eb248c8a12011144E17508'
const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()
const ABI = [
  'function name() view returns(string)',
  'function symbol() view returns(string)',
  'function decimals() view returns(uint8)',
  'function sharedDecimals() view returns(uint8)',
  'function token() view returns(address)',
  'function owner() view returns(address)',
  'function endpoint() view returns(address)',
  'function peers(uint32) view returns(bytes32)',
  'function routeEnabled(uint32) view returns(bool)',
  'function routePaused(uint32) view returns(bool)',
]

/** Read-only, no cache: a failed Polygon binding closes only the Polygon routes. */
export async function readPolygonLiveBinding(): Promise<PolygonLiveBinding> {
  try {
    const polygon = MARCO_WAVE1_NETWORKS.polygon
    const bnb = MARCO_WAVE1_NETWORKS.bnb
    const providers = [
      new ethers.providers.StaticJsonRpcProvider(
        { url: process.env.POLYGON_RPC_URL || 'https://polygon-bor-rpc.publicnode.com', timeout: 8000 },
        137,
      ),
      new ethers.providers.StaticJsonRpcProvider(
        { url: process.env.BSC_RPC_URL || 'https://bsc-rpc.publicnode.com', timeout: 8000 },
        56,
      ),
    ]
    const apps = [polygon, bnb].map((n, i) => new ethers.Contract(n.endpointContract, ABI, providers[i]))
    const [p, b] = apps
    const [
      chainP,
      chainB,
      name,
      symbol,
      decimals,
      shared,
      token,
      peerP,
      peerB,
      owner,
      enabled,
      paused,
      endpointP,
      endpointB,
    ] = await Promise.all([
      providers[0].send('eth_chainId', []),
      providers[1].send('eth_chainId', []),
      p.name(),
      p.symbol(),
      p.decimals(),
      p.sharedDecimals(),
      b.token(),
      p.peers(30102),
      b.peers(30109),
      p.owner(),
      b.routeEnabled(30109),
      b.routePaused(30109),
      p.endpoint(),
      b.endpoint(),
    ])
    if (
      Number(chainP) !== 137 ||
      Number(chainB) !== 56 ||
      name !== 'MELEGA' ||
      symbol !== 'MARCO' ||
      Number(decimals) !== 18 ||
      Number(shared) !== 6 ||
      !same(token, bnb.marcoIdentity) ||
      !same(owner, SAFE) ||
      !same(peerP, ethers.utils.hexZeroPad(bnb.endpointContract, 32)) ||
      !same(peerB, ethers.utils.hexZeroPad(polygon.endpointContract, 32)) ||
      !enabled ||
      paused
    ) {
      throw new Error('Polygon live identity, peer or route mismatch.')
    }
    const endpointAbi = [
      'function getSendLibrary(address,uint32) view returns(address)',
      'function eid() view returns(uint32)',
      'function delegates(address) view returns(address)',
    ]
    const ep = new ethers.Contract(endpointP, endpointAbi, providers[0])
    const eb = new ethers.Contract(endpointB, endpointAbi, providers[1])
    const [sendP, sendB, eidP, eidB, delegate] = await Promise.all([
      ep.getSendLibrary(polygon.endpointContract, 30102),
      eb.getSendLibrary(bnb.endpointContract, 30109),
      ep.eid(),
      eb.eid(),
      ep.delegates(polygon.endpointContract),
    ])
    if (
      !same(sendP, '0x6c26c61a97006888ea9E4FA36584c7df57Cd9dA3') ||
      !same(sendB, '0x9F8C645f2D0b2159767Bd6E0839DE4BE49e823DE') ||
      Number(eidP) !== 30109 ||
      Number(eidB) !== 30102 ||
      !same(delegate, SAFE)
    )
      throw new Error('Polygon live endpoint or send library mismatch.')
    return { verified: true, reason: 'Live Polygon identity, peers and route verified.' }
  } catch (cause) {
    return { verified: false, reason: cause instanceof Error ? cause.message : 'Polygon verification unavailable.' }
  }
}

/** Same authority consumed by quote/build/submit; no independent public-execution gate. */
export function applyPolygonBinding(
  authority: CanonicalMmnRouteState,
  live: PolygonLiveBinding,
): CanonicalMmnRouteState {
  const n = MARCO_WAVE1_NETWORKS.polygon
  const upstream = authority.networks.find((network) => network.id === 'polygon')
  const paused = !live.verified || Boolean(upstream?.paused)
  const networks = [
    ...authority.networks.filter((network) => network.id !== 'polygon'),
    {
      id: n.id,
      name: n.label,
      family: n.walletFamily,
      chain_id: n.chainId,
      eid: n.layerZeroEid,
      model: 'evm_oft' as const,
      token: n.marcoIdentity,
      token_decimals: n.tokenDecimals,
      endpoint_contract: n.endpointContract,
      requires_approval: false,
      paused,
    },
  ]
  const routes = authority.routes.filter((route) => route.from !== 'polygon' && route.to !== 'polygon')
  for (const [from, to] of [
    ['bnb', 'polygon'],
    ['polygon', 'bnb'],
  ] as const) {
    const prior = authority.routes.find((route) => route.from === from && route.to === to)
    const routePaused =
      paused || Boolean(prior?.paused) || Boolean(networks.find((network) => network.id === 'bnb')?.paused)
    const certified = POLYGON_ROUND_TRIP_CERTIFIED && live.verified
    const active = certified && !routePaused && localRouteActivationEnabled(from, to)
    routes.push({
      from,
      to,
      certified,
      paused: routePaused,
      publicly_active: active,
      execution_enabled: active,
      live_binding_verified: live.verified,
      reason: !live.verified
        ? live.reason
        : !POLYGON_ROUND_TRIP_CERTIFIED
        ? 'Awaiting reverse canary DELIVERED, zero Polygon supply and BNB unlock accounting.'
        : routePaused
        ? 'Canonical route is paused.'
        : 'Certified BNB↔Polygon route.',
    })
  }
  return { ...authority, networks, routes }
}
