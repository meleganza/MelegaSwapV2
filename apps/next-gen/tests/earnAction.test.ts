import assert from 'node:assert/strict'
import { test } from 'node:test'
import { simulateEarnAction } from '../lib/earnAction'
import { EARN_EXPECTED_LP, EARN_MASTER_CHEF } from '../lib/earnRead'

const account = '0x0000000000000000000000000000000000000011'
const deposit = { chainId: 56, account, market: 'marco', action: 'deposit', amount: '1' }
const word = (value: bigint) => value.toString(16).padStart(64, '0')
const pool = '0x' + word(BigInt(EARN_EXPECTED_LP)) + word(1n) + word(0n) + word(0n)
const amount = 10n ** 18n

test('rejects unsupported targets before reading the chain', async () => {
  const call = async () => { throw new Error('Unexpected RPC') }
  assert.equal(await simulateEarnAction({ ...deposit, chainId: 1 }, call), 'INVALID_INPUT')
  assert.equal(await simulateEarnAction({ ...deposit, market: 'custom' }, call), 'INVALID_INPUT')
})

test('simulates the canonical MARCO deposit only with sufficient allowance', async () => {
  for (const allowance of [0n, amount]) {
    const code = await simulateEarnAction(deposit, async (to, data, from) => {
      switch (data.slice(0, 10)) {
        case '0x1526fe27': return pool
        case '0x313ce567': return '0x' + word(18n)
        case '0x70a08231': return '0x' + word(amount)
        case '0xdd62ed3e': return '0x' + word(allowance)
        case '0xe2bbb158':
          assert.equal(to, EARN_MASTER_CHEF)
          assert.equal(from, account)
          assert.equal(data.slice(10), word(0n) + word(amount))
          return '0x'
        default: throw new Error('Unexpected call')
      }
    })
    assert.equal(code, allowance ? 'SIMULATED' : 'APPROVAL_REQUIRED')
  }
})
