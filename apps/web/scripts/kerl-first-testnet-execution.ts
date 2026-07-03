#!/usr/bin/env npx tsx
/**
 * KERL Phase T2 — First Controlled TESTNET Execution (Genesis)
 * Requires KERL_TESTNET_EXECUTOR_PRIVATE_KEY with funded BNB Testnet wallet.
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
  enableKerlTestnetExecutionActivation,
  resetGenesisExecutionAttemptFlag,
  resetKerlExecutionHarness,
  runFirstTestnetExecution,
  checkTestnetWalletFunded,
  createGenesisTestnetAdapters,
} from '../src/lib/execution-modes'

const HANDOFF_PATH = resolve(
  __dirname,
  '../public/registry/kerl/handoffs/genesis-testnet-execution-handoff.json',
)

async function main() {
  resetKerlExecutionHarness()
  resetGenesisExecutionAttemptFlag()

  const handoffJson = JSON.parse(readFileSync(HANDOFF_PATH, 'utf8'))
  const privateKey = process.env.KERL_TESTNET_EXECUTOR_PRIVATE_KEY

  if (!privateKey) {
    const result = await runFirstTestnetExecution({
      handoffJson,
      account: undefined,
      walletFunded: false,
    })
    printResult(result)
    process.exit(result.verdict === 'KERL_FIRST_TESTNET_EXECUTION_ABORTED' ? 2 : 1)
  }

  enableKerlTestnetExecutionActivation()

  let account: string
  let funded: boolean
  try {
    const wallet = await checkTestnetWalletFunded(privateKey)
    account = wallet.account
    funded = wallet.funded
  } catch (error) {
    const result = await runFirstTestnetExecution({
      handoffJson,
      account: undefined,
      walletFunded: false,
    })
    printResult({ ...result, error: error instanceof Error ? error.message : String(error) })
    process.exit(2)
  }

  if (!funded) {
    const result = await runFirstTestnetExecution({
      handoffJson,
      account,
      walletFunded: false,
    })
    printResult(result)
    process.exit(2)
  }

  const { adapters, lastReceipt } = createGenesisTestnetAdapters(privateKey)
  const result = await runFirstTestnetExecution({
    handoffJson,
    account,
    walletFunded: true,
    adapters,
    chainId: 97,
    getReceipt: lastReceipt,
  })

  printResult(result)
  process.exit(
    result.verdict === 'KERL_FIRST_TESTNET_EXECUTION_SUCCESS'
      ? 0
      : result.verdict === 'KERL_FIRST_TESTNET_EXECUTION_ABORTED'
        ? 2
        : 1,
  )
}

function printResult(result: Awaited<ReturnType<typeof runFirstTestnetExecution>>) {
  console.log('\n=== KERL_FIRST_TESTNET_EXECUTION ===\n')
  console.log(JSON.stringify(result, null, 2))
  console.log(`\nVERDICT: ${result.verdict}\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
