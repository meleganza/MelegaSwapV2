#!/usr/bin/env node
/** R731 — Generate BSC pool gate audit markdown from canonical inventory + live block. */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const INVENTORY = path.join(ROOT, 'docs/pools-canonical-inventory.json')
const OUT = path.join(ROOT, 'docs/runtime/R731_POOL_GATE_AUDIT.md')
const RPC = process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'

async function getCurrentBlock() {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
  })
  const json = await res.json()
  return parseInt(json.result, 16)
}

function mapHiddenReason(row, currentBlock) {
  if (row.currentlyVisible) return null
  if (row.reasonHidden && row.reasonHidden !== '—') {
    if (row.reasonHidden.includes('bonusEndBlock')) return 'POOL_ENDED'
    return row.reasonHidden
  }
  if (typeof row.bonusEndBlock === 'number' && row.bonusEndBlock < currentBlock) return 'POOL_ENDED'
  if (row.category === 'C' || row.category === 'D') return 'POOL_ENDED'
  if (row.category === 'A') return null
  return 'VISIBILITY_GATE'
}

function categoryFrom(row, hiddenReason, displayable) {
  if (displayable) return 'valid_live'
  if (hiddenReason === 'POOL_ENDED' || hiddenReason?.includes('bonusEndBlock')) return 'ended'
  return 'hidden_by_policy'
}

function bscscan(contract) {
  if (!contract || contract === '—') return 'https://bscscan.com'
  return `https://bscscan.com/address/${contract}`
}

async function main() {
  const inventory = JSON.parse(fs.readFileSync(INVENTORY, 'utf8'))
  const currentBlock = await getCurrentBlock()
  const bscPools = inventory.results.filter((r) => r.chain === 56)

  const rows = bscPools.map((row) => {
    const hiddenReason = mapHiddenReason(row, currentBlock)
    const displayable = row.currentlyVisible && row.category !== 'C' && row.category !== 'D'
    return {
      poolId: row.sousId === 0 && row.poolName.includes('Manual') ? 'sous-0' : `sous-${row.sousId}`,
      contract: row.contract ?? '—',
      stakingToken: row.stakingToken,
      rewardToken: row.earningToken,
      rewardBalance: 'on-chain query required',
      emissionRate: 'on-chain query required',
      startBlock: row.startBlock,
      endBlock: row.bonusEndBlock,
      currentBlock,
      tvl: 'on-chain query required',
      rawApr: 'runtime only',
      displayApr: 'runtime only',
      status: displayable ? 'live' : hiddenReason === 'POOL_ENDED' ? 'ended' : 'hidden',
      hiddenReason,
      displayable,
      category: categoryFrom(row, hiddenReason, displayable),
      bscscanUrl: bscscan(row.contract),
      poolName: row.poolName,
    }
  })

  const summary = {
    discovered: rows.length,
    displayable: rows.filter((r) => r.displayable).length,
    ended: rows.filter((r) => r.category === 'ended').length,
    hiddenByPolicy: rows.filter((r) => !r.displayable && r.category !== 'ended').length,
    currentBlock,
  }

  const header = `# R731 — BSC Pool Gate Audit

**Generated:** ${new Date().toISOString()}  
**Chain:** BSC (56)  
**Current block:** ${currentBlock}  
**Source:** \`docs/pools-canonical-inventory.json\` + live RPC block  

---

## Summary

| Metric | Count |
| --- | ---: |
| Discovered (BSC config) | ${summary.discovered} |
| Displayable (inventory snapshot) | ${summary.displayable} |
| Ended / past bonusEndBlock | ${summary.ended} |
| Hidden (policy / funding / APR gates at runtime) | ${summary.hiddenByPolicy} |

**Runtime note:** Full APR/TVL/emission values require live \`/pools\` runtime (\`machine.gateAudit\`). This audit uses canonical inventory + current block for ended/live classification. Visual visibility gates (APR, reward budget, emission) are evaluated only at runtime — not relaxed in R731.

---

## Full audit table

| Pool | ID | Contract | Stake | Reward | Start | End | Status | Hidden reason | Displayable | BscScan |
| --- | --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- |
`

  const table = rows
    .map(
      (r) =>
        `| ${r.poolName} | ${r.poolId} | \`${r.contract}\` | ${r.stakingToken} | ${r.rewardToken} | ${r.startBlock} | ${r.endBlock} | ${r.status} | ${r.hiddenReason ?? '—'} | ${r.displayable} | [link](${r.bscscanUrl}) |`,
    )
    .join('\n')

  const footer = `

---

## Displayable pools (inventory)

${rows.filter((r) => r.displayable).map((r) => `- **${r.poolName}** (\`${r.contract}\`)`).join('\n') || '_None in inventory snapshot_'}

## Primary hidden reasons

${[...new Set(rows.filter((r) => r.hiddenReason).map((r) => r.hiddenReason))].map((r) => `- ${r}`).join('\n') || '_None_'}

## Policy note (not applied)

If on-chain pools with active emission but zero TVL should surface, relax \`evaluatePoolVisibility\` \`INVALID_APR\` gate to allow estimated emission APR when raw APR is zero.

---

## Machine payload

Live per-pool gate report: \`/pools\` → \`machine.gateAudit\` (see \`buildPoolGateReport.ts\`).
`

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, header + table + footer)
  console.log(`Wrote ${OUT}`)
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
