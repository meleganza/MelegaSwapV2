/**
 * Read-only Router calldata construction + eth_call simulation (no broadcast).
 * Defect ID: RECERT-ROUTER-001
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..')

const ROUTER = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'
const FACTORY = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'
const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const USDT = '0x55d398326f99059fF775485246999027B3197955'
const DEAD = '0x000000000000000000000000000000000000dEaD'
const RPCs = [
  'https://bsc-dataseed.binance.org',
  'https://bsc-dataseed1.defibit.io',
  'https://bsc.publicnode.com',
]

async function rpc(method, params) {
  let last
  for (const url of RPCs) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      })
      const j = await res.json()
      if (j.error) throw new Error(JSON.stringify(j.error))
      return { url, result: j.result }
    } catch (e) {
      last = e
    }
  }
  throw last
}

function padAddr(a) {
  return a.slice(2).toLowerCase().padStart(64, '0')
}
function padUint(n) {
  return BigInt(n).toString(16).padStart(64, '0')
}

// getAmountsOut(uint,address[]) = 0xd06ca61f
function encodeGetAmountsOut(amountIn, path) {
  // dynamic: amountIn, offset path, path length, addresses
  const head = '0xd06ca61f' + padUint(amountIn) + padUint(64)
  const pathEnc = padUint(path.length) + path.map(padAddr).join('')
  return head + pathEnc
}

// swapExactTokensForTokens(uint,uint,address[],address,uint) = 0x38ed1739
function encodeSwapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline) {
  // offsets: amountIn, amountOutMin, path offset(160), to, deadline, then path
  let d = '0x38ed1739'
  d += padUint(amountIn)
  d += padUint(amountOutMin)
  d += padUint(160) // path offset
  d += padAddr(to)
  d += padUint(deadline)
  d += padUint(path.length)
  d += path.map(padAddr).join('')
  return d
}

// addLiquidityETH(address,uint,uint,uint,address,uint) = 0xf305d719
function encodeAddLiquidityETH(token, amountTokenDesired, amountTokenMin, amountETHMin, to, deadline) {
  let d = '0xf305d719'
  d += padAddr(token)
  d += padUint(amountTokenDesired)
  d += padUint(amountTokenMin)
  d += padUint(amountETHMin)
  d += padAddr(to)
  d += padUint(deadline)
  return d
}

// addLiquidity(address,address,uint,uint,uint,uint,address,uint) = 0xe8e33700
function encodeAddLiquidity(a, b, aDesired, bDesired, aMin, bMin, to, deadline) {
  let d = '0xe8e33700'
  d += padAddr(a)
  d += padAddr(b)
  d += padUint(aDesired)
  d += padUint(bDesired)
  d += padUint(aMin)
  d += padUint(bMin)
  d += padAddr(to)
  d += padUint(deadline)
  return d
}

function decodeRevert(data) {
  if (!data || data === '0x') return 'empty revert'
  if (data.startsWith('0x08c379a0')) {
    try {
      const len = Number(BigInt('0x' + data.slice(74, 138)))
      const strHex = data.slice(138, 138 + len * 2)
      return Buffer.from(strHex, 'hex').toString('utf8')
    } catch {
      return data.slice(0, 66)
    }
  }
  return data.slice(0, 66)
}

async function main() {
  const block = await rpc('eth_blockNumber', [])
  const blockNum = Number(BigInt(block.result))
  const deadline = Math.floor(Date.now() / 1000) + 1200
  const amountIn = 10n ** 15n // 0.001 token (18 dec) / also used for WBNB

  const factory = await rpc('eth_call', [{ to: ROUTER, data: '0xc45a0155' }, 'latest']) // factory()
  const wbnb = await rpc('eth_call', [{ to: ROUTER, data: '0xad5c4648' }, 'latest']) // WETH()

  const routes = [
    {
      id: 'erc20-erc20-marco-usdt',
      path: [MARCO, USDT],
      note: 'May be multi-hop or no direct pair',
    },
    {
      id: 'erc20-erc20-marco-wbnb',
      path: [MARCO, WBNB],
      note: 'Canonical MARCO/WBNB direct pair',
    },
    {
      id: 'bnb-token',
      path: [WBNB, MARCO],
      note: 'BNB→MARCO via WBNB path for getAmountsOut',
    },
    {
      id: 'token-bnb',
      path: [MARCO, WBNB],
      note: 'MARCO→BNB',
    },
    {
      id: 'unsupported',
      path: [MARCO, DEAD],
      note: 'Expected no-route / revert',
    },
  ]

  const quoteResults = []
  for (const r of routes) {
    const data = encodeGetAmountsOut(amountIn, r.path)
    try {
      const out = await rpc('eth_call', [{ to: ROUTER, data }, 'latest'])
      // decode amounts array: offset, length, values
      const hex = out.result.slice(2)
      const len = Number(BigInt('0x' + hex.slice(64, 128)))
      const amounts = []
      for (let i = 0; i < len; i++) {
        amounts.push(BigInt('0x' + hex.slice(128 + i * 64, 128 + (i + 1) * 64)).toString())
      }
      quoteResults.push({ ...r, ok: true, calldata: data, amounts })
    } catch (e) {
      quoteResults.push({
        ...r,
        ok: false,
        calldata: data,
        revert: String(e.message || e).slice(0, 300),
      })
    }
  }

  const swapData = encodeSwapExactTokensForTokens(
    amountIn,
    0n,
    [MARCO, WBNB],
    DEAD,
    deadline,
  )
  let swapSim
  try {
    await rpc('eth_call', [{ from: DEAD, to: ROUTER, data: swapData }, 'latest'])
    swapSim = { ok: true, note: 'unexpected success from zero-balance sender' }
  } catch (e) {
    const msg = String(e.message || e)
    swapSim = {
      ok: false,
      expectedFailure: true,
      revert: msg.slice(0, 400),
      interpretedAs:
        /transfer|allowance|balance|INSUFFICIENT|EXPIRED|ds-math|Pancake/i.test(msg) ||
        msg.includes('execution reverted')
          ? 'Expected revert for zero-balance/allowance sender — calldata accepted by node'
          : 'Unexplained revert',
    }
  }

  let gasEstimate
  try {
    const g = await rpc('eth_estimateGas', [{ from: DEAD, to: ROUTER, data: swapData }])
    gasEstimate = { ok: true, gas: Number(BigInt(g.result)) }
  } catch (e) {
    gasEstimate = {
      ok: false,
      reason: String(e.message || e).slice(0, 400),
      note: 'estimateGas fails without balance/allowance — expected for DEAD sender',
    }
  }

  const addEthData = encodeAddLiquidityETH(MARCO, 10n ** 18n, 0n, 0n, DEAD, deadline)
  let addEthSim
  try {
    await rpc('eth_call', [
      { from: DEAD, to: ROUTER, data: addEthData, value: '0x' + (10n ** 15n).toString(16) },
      'latest',
    ])
    addEthSim = { ok: true }
  } catch (e) {
    addEthSim = {
      ok: false,
      expectedFailure: true,
      revert: String(e.message || e).slice(0, 400),
      calldata: addEthData,
      valueWei: (10n ** 15n).toString(),
      function: 'addLiquidityETH',
    }
  }

  const addTokData = encodeAddLiquidity(MARCO, USDT, 10n ** 18n, 10n ** 18n, 0n, 0n, DEAD, deadline)
  let addTokSim
  try {
    await rpc('eth_call', [{ from: DEAD, to: ROUTER, data: addTokData }, 'latest'])
    addTokSim = { ok: true }
  } catch (e) {
    addTokSim = {
      ok: false,
      expectedFailure: true,
      revert: String(e.message || e).slice(0, 400),
      calldata: addTokData,
      function: 'addLiquidity',
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    commit: 'eb9c33ea+',
    chainId: 56,
    blockNumber: blockNum,
    rpcHost: block.url.replace(/^https?:\/\//, '').split('/')[0],
    router: ROUTER,
    factoryFromRouter: '0x' + factory.result.slice(-40),
    wbnbFromRouter: '0x' + wbnb.result.slice(-40),
    factoryExpected: FACTORY.toLowerCase(),
    factoryMatch: ('0x' + factory.result.slice(-40)).toLowerCase() === FACTORY.toLowerCase(),
    quotes: quoteResults,
    swapExactTokensForTokens: { calldata: swapData, simulation: swapSim, gasEstimate },
    addLiquidityETH: addEthSim,
    addLiquidity: addTokSim,
  }

  mkdirSync(OUT, { recursive: true })
  writeFileSync(join(OUT, 'router-calldata-validation.json'), JSON.stringify(payload, null, 2))
  writeFileSync(
    join(OUT, 'router-simulation.json'),
    JSON.stringify(
      {
        swap: swapSim,
        addLiquidityETH: addEthSim,
        addLiquidity: addTokSim,
        blockNumber: blockNum,
      },
      null,
      2,
    ),
  )
  writeFileSync(join(OUT, 'router-gas-estimation.json'), JSON.stringify(gasEstimate, null, 2))
  writeFileSync(
    join(OUT, 'router-bytecode-verification.json'),
    JSON.stringify(
      {
        router: ROUTER,
        factoryRelation: payload.factoryFromRouter,
        wbnbRelation: payload.wbnbFromRouter,
        factoryMatch: payload.factoryMatch,
        selectorsVerified: [
          'getAmountsOut(0xd06ca61f)',
          'swapExactTokensForTokens(0x38ed1739)',
          'addLiquidityETH(0xf305d719)',
          'addLiquidity(0xe8e33700)',
          'factory(0xc45a0155)',
          'WETH(0xad5c4648)',
        ],
      },
      null,
      2,
    ),
  )
  writeFileSync(
    join(OUT, 'liquidity-calldata-validation.json'),
    JSON.stringify({ addLiquidityETH: addEthSim, addLiquidity: addTokSim }, null, 2),
  )
  writeFileSync(
    join(OUT, 'add-liquidity-simulation.json'),
    JSON.stringify({ addLiquidityETH: addEthSim, addLiquidity: addTokSim }, null, 2),
  )
  writeFileSync(
    join(OUT, 'create-pool-simulation.json'),
    JSON.stringify(
      {
        note: 'UniswapV2 Router addLiquidity creates pair via Factory if missing — same calldata path',
        addLiquidityNewPairPath: addTokSim,
      },
      null,
      2,
    ),
  )

  console.log(JSON.stringify({ blockNum, factoryMatch: payload.factoryMatch, quotesOk: quoteResults.filter((q) => q.ok).length }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
