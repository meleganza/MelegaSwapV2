import assert from 'assert'
import { test } from 'node:test'
import { simulateEarnAction } from '../lib/earnAction'
import { earnSandboxUrl, submitSandbox } from '../lib/earnSandbox'
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
        case '0x41441d3b':
          assert.equal(to, EARN_MASTER_CHEF)
          assert.equal(from, account)
          assert.equal(data.slice(10), word(amount))
          return '0x'
        default: throw new Error('Unexpected call')
      }
    })
    assert.equal(code, allowance ? 'SIMULATED' : 'APPROVAL_REQUIRED')
  }
})

test('the sandbox configuration is limited to preview and localhost', () => {
  const rpc = 'https://sandbox.example.org/'
  assert.equal(earnSandboxUrl({ VERCEL_ENV: 'production', EVO_EARN_SANDBOX_RPC_URL: rpc }), null)
  assert.equal(earnSandboxUrl({ VERCEL_ENV: 'preview', EVO_EARN_SANDBOX_RPC_URL: rpc }), rpc)
  assert.equal(earnSandboxUrl({ VERCEL_ENV: 'preview', EVO_EARN_SANDBOX_RPC_URL: rpc + '?key=secret' }), null)
  assert.equal(earnSandboxUrl({ EVO_EARN_SANDBOX_RPC_URL: rpc }), null)
  assert.equal(earnSandboxUrl({ EVO_EARN_SANDBOX_RPC_URL: 'http://127.0.0.1:8545' }), 'http://127.0.0.1:8545/')
})

test('submitting is blocked on BNB mainnet before any contract or signing request', async () => {
  const calls: string[] = []
  await assert.rejects(submitSandbox({
    async request({ method }) {
      calls.push(method)
      return '0x38'
    },
  }, { from: account, to: EARN_MASTER_CHEF, data: '0x41441d3b', value: '0x0' }, deposit), /Switch your wallet/)
  assert.deepEqual(calls, ['eth_chainId'])
})
