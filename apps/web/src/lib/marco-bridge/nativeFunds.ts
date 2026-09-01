import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { MarcoBridgeError, type MarcoBridgeNetworkId } from './types'

/**
 * BSC ERC20 approve is typically ~46k gas. 65_000 is a conservative ceiling for
 * proxy / fee-on-transfer token variance.
 */
export const BNB_APPROVE_GAS_LIMIT = 65_000

/**
 * LayerZero OFT adapter `send` on BSC is typically 200–350k gas. 400_000 is a
 * conservative ceiling for option / path variance.
 */
export const BNB_OFT_SEND_GAS_LIMIT = 400_000

/**
 * 20% gas-price headroom between estimate and the mined transaction.
 * Named in true basis points: 12_000 / 10_000 = 1.20×.
 */
export const BNB_GAS_PRICE_HEADROOM_BPS = 12_000

/**
 * BSC public mempool is typically 1–3 gwei. 5 gwei is a conservative ceiling
 * when `eth_gasPrice` is unavailable. This is not a LayerZero fee.
 */
export const BNB_GAS_PRICE_FALLBACK_WEI = '5000000000'

export const INSUFFICIENT_BNB_REASON = 'INSUFFICIENT BNB'
export const NATIVE_BNB_CHECKING_REASON = 'Checking BNB balance.'
export const NATIVE_BNB_UNAVAILABLE_REASON = 'BNB balance unavailable. Refresh before sending.'

export type NativeFundsReadState = 'idle' | 'loading' | 'ready' | 'unavailable'

export type NativeFundsProvider = {
  getBalance(address: string): Promise<{ toString(): string } | string>
  getGasPrice(): Promise<{ toString(): string } | string>
}

export type NativeFundsVerdict =
  | { ok: true; requiredWei: string; balanceWei: string }
  | {
      ok: false
      code: 'INSUFFICIENT_BNB' | 'INSUFFICIENT_GAS'
      reason: string
      requiredWei: string
      balanceWei: string
    }

export function requiredNativeWeiForBridge(input: {
  nativeFeeWei: string
  gasPriceWei: string
  approvalRequired: boolean
}): BigNumber {
  const approveGas = input.approvalRequired ? BNB_APPROVE_GAS_LIMIT : 0
  const gasUnits = approveGas + BNB_OFT_SEND_GAS_LIMIT
  const gasCost = BigNumber.from(input.gasPriceWei).mul(gasUnits).mul(BNB_GAS_PRICE_HEADROOM_BPS).div(10_000)
  return BigNumber.from(input.nativeFeeWei).add(gasCost)
}

export function isNativeFundsBlocked(
  verdict: NativeFundsVerdict,
): verdict is Extract<NativeFundsVerdict, { ok: false }> {
  return verdict.ok === false
}

export function evaluateNativeFunds(input: {
  from: MarcoBridgeNetworkId
  balanceWei: string
  nativeFeeWei: string
  gasPriceWei: string
  approvalRequired: boolean
}): NativeFundsVerdict {
  const requiredWei = requiredNativeWeiForBridge(input)
  const balanceWei = BigNumber.from(input.balanceWei)
  if (balanceWei.gte(requiredWei)) {
    return { ok: true, requiredWei: requiredWei.toString(), balanceWei: balanceWei.toString() }
  }
  if (input.from === 'bnb') {
    return {
      ok: false,
      code: 'INSUFFICIENT_BNB',
      reason: INSUFFICIENT_BNB_REASON,
      requiredWei: requiredWei.toString(),
      balanceWei: balanceWei.toString(),
    }
  }
  return {
    ok: false,
    code: 'INSUFFICIENT_GAS',
    reason: `Insufficient native gas on ${input.from}.`,
    requiredWei: requiredWei.toString(),
    balanceWei: balanceWei.toString(),
  }
}

export async function readNativeBalanceWei(provider: NativeFundsProvider, address: string): Promise<string> {
  return BigNumber.from(await provider.getBalance(address)).toString()
}

export async function readGasPriceWei(provider: NativeFundsProvider): Promise<string> {
  try {
    return BigNumber.from(await provider.getGasPrice()).toString()
  } catch {
    return BNB_GAS_PRICE_FALLBACK_WEI
  }
}

export function requiredNativeGasDecimal(requiredWei: string): string {
  return formatUnits(requiredWei, 18)
}

/** Fail-closed UI binding: never appear submittable while walletSubmit would reject. */
export function resolveNativeFundsBlockReason(input: {
  from: MarcoBridgeNetworkId
  quoteLive: boolean
  nativeFeeWei?: string
  readState: NativeFundsReadState
  balanceWei: string | null
  gasPriceWei: string | null
  approvalRequired: boolean
}): string | null {
  if (input.from !== 'bnb' || !input.quoteLive) return null
  if (input.readState === 'loading' || input.readState === 'idle') return NATIVE_BNB_CHECKING_REASON
  if (input.readState === 'unavailable' || input.balanceWei == null || !input.nativeFeeWei) {
    return NATIVE_BNB_UNAVAILABLE_REASON
  }
  const verdict = evaluateNativeFunds({
    from: input.from,
    balanceWei: input.balanceWei,
    nativeFeeWei: input.nativeFeeWei,
    gasPriceWei: input.gasPriceWei ?? BNB_GAS_PRICE_FALLBACK_WEI,
    approvalRequired: input.approvalRequired,
  })
  return isNativeFundsBlocked(verdict) ? verdict.reason : null
}
