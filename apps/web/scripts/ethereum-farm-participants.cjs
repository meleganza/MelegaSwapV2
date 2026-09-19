// Read-only release index. Discover depositors from the complete paginated explorer
// log index, then verify current stake and LP conservation at one Ethereum block.
const { Contract, providers, utils } = require('ethers')
const fs = require('fs')
const path = require('path')
const chefAddress = '0x585364c747CaF6cF6441656F803796230fb1d61c'
async function main() {
  const p = new providers.JsonRpcProvider('https://ethereum-rpc.publicnode.com')
  if ((await p.getNetwork()).chainId !== 1) throw Error('ETHEREUM_REQUIRED')
  const head = await p.getBlockNumber()
  const candidates = new Map()
  let next = {}
  let pages = 0
  do {
    const url = new URL(`https://eth.blockscout.com/api/v2/addresses/${chefAddress}/logs`)
    Object.entries(next).forEach(([k, v]) => url.searchParams.set(k, String(v)))
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
    if (!response.ok) throw Error(`INDEX_HTTP_${response.status}`)
    const body = await response.json()
    if (!Array.isArray(body.items)) throw Error('INVALID_INDEX')
    for (const e of body.items) {
      if (e.block_number > head || e.topics[0] !== utils.id('Deposit(address,uint256,uint256)')) continue
      const pid = Number(BigInt(e.topics[2])),
        wallet = utils.getAddress('0x' + e.topics[1].slice(-40))
      if (!candidates.has(pid)) candidates.set(pid, new Set())
      candidates.get(pid).add(wallet)
    }
    next = body.next_page_params
    if (++pages > 10000) throw Error('INDEX_INCOMPLETE')
  } while (next)
  const chef = new Contract(chefAddress, require('../src/config/abi/masterchef.json'), p)
  const at = { blockTag: head },
    count = Number(await chef.poolLength(at)),
    active = new Set(),
    farms = {},
    reconciliation = []
  const updatedAt = new Date().toISOString()
  for (let pid = 0; pid < count; pid++) {
    const pool = await chef.poolInfo(pid, at)
    const users = await Promise.all(
      [...(candidates.get(pid) || [])].map(async (wallet) => ({
        wallet,
        raw: (await chef.userInfo(pid, wallet, at)).amount.toString(),
      })),
    )
    const positive = users.filter((u) => BigInt(u.raw) > 0n)
    if (pid > 0) {
      const lp = new Contract(pool.lpToken, ['function balanceOf(address) view returns(uint256)'], p)
      const held = (await lp.balanceOf(chefAddress, at)).toString()
      const sum = positive.reduce((n, u) => n + BigInt(u.raw), 0n).toString()
      if (held !== sum) throw Error(`INCOMPLETE_CENSUS_PID_${pid}: ${sum} != ${held}`)
      positive.forEach((u) => active.add(u.wallet))
      reconciliation.push({
        pid,
        lp: pool.lpToken,
        stakedRaw: sum,
        masterChefLpBalanceRaw: held,
        participants: positive.length,
      })
    }
    farms[`1:${chefAddress.toLowerCase()}:${pid}`] = {
      participants: positive.length,
      lastIndexedBlock: head,
      chainHead: head,
      updatedAt,
    }
  }
  const output = path.join(__dirname, '../src/lib/yield-participants/yieldParticipants.generated.json')
  const snapshot = JSON.parse(fs.readFileSync(output))
  snapshot.farms = { ...snapshot.farms, ...farms }
  snapshot.farmTotals = {
    ...snapshot.farmTotals,
    [`1:${chefAddress.toLowerCase()}`]: {
      participants: active.size,
      lastIndexedBlock: head,
      chainHead: head,
      updatedAt,
    },
  }
  fs.writeFileSync(output, JSON.stringify(snapshot, null, 2) + '\n')
  const proof = {
    chainId: 1,
    masterChef: chefAddress,
    head,
    pages,
    updatedAt,
    source: 'Blockscout complete deposit index + RPC userInfo + LP conservation',
    reconciliation,
    uniqueActiveLpFarmers: active.size,
  }
  fs.mkdirSync(path.join(__dirname, '../../../acceptance/ethereum-farms'), { recursive: true })
  fs.writeFileSync(
    path.join(__dirname, '../../../acceptance/ethereum-farms/participant-proof.json'),
    JSON.stringify(proof, null, 2) + '\n',
  )
  console.log(JSON.stringify(proof, null, 2))
}
main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
