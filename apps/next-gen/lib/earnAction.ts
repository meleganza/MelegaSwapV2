import { Interface } from '@ethersproject/abi'
import { parseUnits } from '@ethersproject/units'
import { decodePoolInfo, EARN_EXPECTED_LP, EARN_MASTER_CHEF, encodePoolInfo } from './earnRead'

const erc20 = new Interface(['function balanceOf(address) view returns (uint256)', 'function allowance(address,address) view returns (uint256)', 'function decimals() view returns (uint8)'])
const vault = new Interface(['function want() view returns (address)', 'function deposit(uint256)', 'function withdraw(uint256)'])
const chef = new Interface(['function enterStaking(uint256)', 'function leaveStaking(uint256)', 'function userInfo(uint256,address) view returns (uint256,uint256)'])
const VAULT = '0x015E2d1b7aC621370A24B7dd426EF1ef4DA99B86'
const VAULT_ASSET = '0xcE033c748aBd4B5e9aE16efFdb0b0c91fB0c99F1'
const addressPattern = /^0x[0-9a-f]{40}$/i

export type EarnSimulationInput = { chainId?: unknown; account?: unknown; market?: unknown; action?: unknown; amount?: unknown }
type Call = (to: string, data: string, from?: string) => Promise<string>

export async function simulateEarnAction(input: EarnSimulationInput, call: Call) {
  const { chainId, market, action, account, amount } = input
  if (chainId !== 56 || (market !== 'marco' && market !== 'beefy') || (action !== 'deposit' && action !== 'withdraw') ||
      typeof account !== 'string' || !addressPattern.test(account) || /^0x0{40}$/i.test(account) ||
      typeof amount !== 'string' || amount.length > 65 || !/^\d+(\.\d+)?$/.test(amount)) return 'INVALID_INPUT'

  const owner = account.toLowerCase()
  const isFarm = market === 'marco'
  const target = isFarm ? EARN_MASTER_CHEF : VAULT
  const asset = isFarm ? EARN_EXPECTED_LP : VAULT_ASSET
  try {
    if (isFarm) {
      const info = decodePoolInfo((await call(target, encodePoolInfo(0))).toLowerCase())
      if (!info || info.lpToken !== asset.toLowerCase() || (action === 'deposit' && BigInt(info.allocPoint) === 0n)) return 'MARKET_UNAVAILABLE'
    } else {
      const [want] = vault.decodeFunctionResult('want', await call(target, vault.encodeFunctionData('want')))
      if (want.toLowerCase() !== asset.toLowerCase()) return 'MARKET_UNAVAILABLE'
    }

    const amountToken = !isFarm && action === 'withdraw' ? target : asset
    const [decimals] = erc20.decodeFunctionResult('decimals', await call(amountToken, erc20.encodeFunctionData('decimals')))
    if (Number(decimals) > 36) return 'MARKET_UNAVAILABLE'
    let raw
    try { raw = parseUnits(amount, Number(decimals)) } catch { return 'INVALID_INPUT' }
    if (raw.lte(0) || raw.gte(2n ** 256n)) return 'INVALID_INPUT'
    if (isFarm && action === 'withdraw') {
      const [staked] = chef.decodeFunctionResult('userInfo', await call(target, chef.encodeFunctionData('userInfo', [0, owner])))
      if (staked.lt(raw)) return 'INSUFFICIENT_POSITION'
    } else {
      const [balance] = erc20.decodeFunctionResult('balanceOf', await call(amountToken, erc20.encodeFunctionData('balanceOf', [owner])))
      if (balance.lt(raw)) return action === 'deposit' ? 'INSUFFICIENT_BALANCE' : 'INSUFFICIENT_POSITION'
    }
    if (action === 'deposit') {
      const [allowance] = erc20.decodeFunctionResult('allowance', await call(asset, erc20.encodeFunctionData('allowance', [owner, target])))
      if (allowance.lt(raw)) return 'APPROVAL_REQUIRED'
    }
    await call(target, isFarm ? chef.encodeFunctionData(action === 'deposit' ? 'enterStaking' : 'leaveStaking', [raw]) : vault.encodeFunctionData(action, [raw]), owner)
    return 'SIMULATED'
  } catch {
    return 'SIMULATION_UNAVAILABLE'
  }
}
