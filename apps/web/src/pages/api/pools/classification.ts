import type { NextApiHandler } from 'next'
import { getBlockNumber } from 'lib/bsc-indexer/rpc/chunkedLogs'
import { discoverSmartChefOnChain } from 'lib/bsc-indexer/registry/discoverSmartChefOnChain'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const currentBlock = await getBlockNumber()
  const { smartChef, meta } = await discoverSmartChefOnChain(currentBlock)
  // This discovery performs several public RPC reads and changes only as new
  // blocks/pools arrive, so short edge caching removes duplicate cold work.
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  const rows = smartChef.pools.map((pool) => ({
    address: pool.contractAddress,
    callable: true,
    stakedToken: pool.stakedToken,
    rewardToken: pool.rewardToken,
    startBlock: pool.startBlock,
    bonusEndBlock: pool.endBlock,
    rewardPerBlock: pool.rewardPerBlock,
    rewardTokenBalance: pool.rewardBalance,
    currentBlock,
    active: pool.active,
    rewarding: pool.rewarding,
    ended: pool.state === 'ended',
    funded: pool.funded,
    invalid: false,
    reasonCodes: pool.rewarding ? ['REWARDING'] : pool.active ? ['ACTIVE'] : ['ENDED'],
    bscscanUrl: pool.bscscanUrl,
  }))

  return res.status(200).json({
    generatedAt: new Date().toISOString(),
    currentBlock,
    counts: meta,
    rows,
    samples: rows.slice(0, 5),
  })
}

export default handler
