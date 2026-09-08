const { ethers } = require('ethers')

const TOKEN = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const PINK = '0x407993575c91ce7643a4d4cCACc9A98c36eE1BBE'
const RESERVES = [
  '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0',
  '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
  '0x8fC8ac2AF31C67C704DA79DC454A6A29507f8Fed',
]
const LOCK_ABI = [
  'function totalLockCountForToken(address) view returns(uint256)',
  'function getLocksForToken(address,uint256,uint256) view returns(tuple(uint256 id,address token,address owner,uint256 amount,uint256 lockDate,uint256 tgeDate,uint256 tgeBps,uint256 cycle,uint256 cycleBps,uint256 unlockedAmount,string description)[])',
]

async function readSupply(rpc = process.env.MARCO_SUPPLY_RPC_URL || 'https://bsc-dataseed.binance.org', blockTag) {
  const provider = new ethers.providers.StaticJsonRpcProvider({ url: rpc, timeout: 10000 }, { chainId: 56, name: 'bsc' })
  const block = await provider.getBlock(blockTag || 'latest')
  if (!block || (!blockTag && Date.now() / 1000 - block.timestamp > 120)) throw new Error('Stale BSC block')
  const at = { blockTag: block.number }
  const token = new ethers.Contract(TOKEN, [
    'function totalSupply() view returns(uint256)',
    'function decimals() view returns(uint8)',
    'function balanceOf(address) view returns(uint256)',
  ], provider)
  const locker = new ethers.Contract(PINK, LOCK_ABI, provider)
  const [supply, decimals, dead, zero, count, ...reserves] = await Promise.all([
    token.totalSupply(at), token.decimals(at),
    token.balanceOf('0x000000000000000000000000000000000000dEaD', at),
    token.balanceOf(ethers.constants.AddressZero, at),
    locker.totalLockCountForToken(TOKEN, at),
    ...RESERVES.map(address => token.balanceOf(address, at)),
  ])
  if (decimals !== 18 || count.gt(1000)) throw new Error('Unexpected MARCO contract state')
  const locks = count.isZero() ? [] : await locker.getLocksForToken(TOKEN, 0, count.sub(1), at)
  if (locks.length !== count.toNumber()) throw new Error('Incomplete lock records')
  const locked = locks.reduce((sum, lock) => {
    if (lock.token.toLowerCase() !== TOKEN.toLowerCase() || lock.unlockedAmount.gt(lock.amount)) throw new Error('Invalid lock')
    return sum.add(lock.amount.sub(lock.unlockedAmount))
  }, ethers.constants.Zero)
  const total = supply.sub(dead).sub(zero)
  const circulating = reserves.reduce((sum, balance) => sum.sub(balance), total.sub(locked))
  if (circulating.lt(0) || circulating.gt(total)) throw new Error('Invalid circulating supply')
  return { total: ethers.utils.formatUnits(total, 18), circulating: ethers.utils.formatUnits(circulating, 18), block: block.number, timestamp: block.timestamp }
}

function supplyHandler(metric) {
  return async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD')
      return res.status(405).end()
    }
    try {
      const snapshot = await readSupply()
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, must-revalidate')
      res.setHeader('X-Supply-Block', String(snapshot.block))
      res.setHeader('X-Supply-Timestamp', String(snapshot.timestamp))
      return res.status(200).send(snapshot[metric])
    } catch {
      res.setHeader('Cache-Control', 'no-store')
      return res.status(503).end('Supply temporarily unavailable')
    }
  }
}
module.exports = { readSupply, supplyHandler }
