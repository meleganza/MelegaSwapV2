import { BigNumber } from '@ethersproject/bignumber'
import { Interface } from '@ethersproject/abi'
import { parseUnits } from '@ethersproject/units'
import wrapperAbi from 'lib/melega-smart-router/wrapper/MelegaSmartRouterWrapper.abi.json'
import type { ExecutionRequest } from './types'
import { resolveWrapperExecutionParams } from './consumer'

const WRAPPER_IFACE = new Interface(wrapperAbi as readonly unknown[])
const ERC20_IFACE = new Interface([
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
])

const SWAP_GAS_MARGIN_NUM = 130
const SWAP_GAS_MARGIN_DEN = 100
const SWAP_MIN_GAS = 350_000
const SWAP_MAX_GAS = 1_500_000

function capSwapGas(estimated: BigNumber): BigNumber {
  const withMargin = estimated.mul(SWAP_GAS_MARGIN_NUM).div(SWAP_GAS_MARGIN_DEN)
  const floored = withMargin.lt(SWAP_MIN_GAS) ? BigNumber.from(SWAP_MIN_GAS) : withMargin
  return floored.gt(SWAP_MAX_GAS) ? BigNumber.from(SWAP_MAX_GAS) : floored
}

async function ensureAllowance(
  signer: import('@ethersproject/contracts').Contract['signer'],
  token: string,
  owner: string,
  spender: string,
  amount: BigNumber,
) {
  const { Contract } = await import('@ethersproject/contracts')
  const erc20 = new Contract(token, ERC20_IFACE, signer)
  const allowance: BigNumber = await erc20.allowance(owner, spender)
  if (allowance.gte(amount)) return
  const tx = await erc20.approve(spender, BigNumber.from(2).pow(256).sub(1))
  await tx.wait(1)
}

export interface WrapperSwapResult {
  hash: string
  executionMethod: 'swapExactETHForTokens' | 'swapExactTokensForTokens'
}

/**
 * Wrapper-only execution entrypoint for KRMP testnet.
 * ExecutionRequest → Wrapper — no direct DEX router routing.
 */
export async function executeKerlWrapperSwap(
  request: ExecutionRequest,
  signer: import('@ethersproject/contracts').Contract['signer'],
): Promise<WrapperSwapResult> {
  const params = resolveWrapperExecutionParams(request)
  const { Contract } = await import('@ethersproject/contracts')
  const wrapper = new Contract(params.wrapperAddress, wrapperAbi, signer)
  const account = await signer.getAddress()
  const gross = BigNumber.from(params.amountRaw)
  if (gross.lte(0)) {
    throw new Error('Amount must be greater than zero')
  }

  const recipient = params.recipient ?? account
  const deadline = Math.floor(Date.now() / 1000) + 1200
  const minOut = 1

  if (!params.inputIsNative && params.inputToken) {
    await ensureAllowance(signer, params.inputToken, account, params.wrapperAddress, gross)
  }

  if (params.inputIsNative) {
    const gasEstimate = await wrapper.estimateGas.swapExactETHForTokens(minOut, params.path, recipient, deadline, {
      value: gross,
    })
    const tx = await wrapper.swapExactETHForTokens(minOut, params.path, recipient, deadline, {
      value: gross,
      gasLimit: capSwapGas(gasEstimate),
    })
    return { hash: tx.hash as string, executionMethod: 'swapExactETHForTokens' }
  }

  const gasEstimate = await wrapper.estimateGas.swapExactTokensForTokens(
    gross,
    minOut,
    params.path,
    recipient,
    deadline,
  )
  const tx = await wrapper.swapExactTokensForTokens(gross, minOut, params.path, recipient, deadline, {
    gasLimit: capSwapGas(gasEstimate),
  })
  return { hash: tx.hash as string, executionMethod: 'swapExactTokensForTokens' }
}

/** Preview fee from KERL-certified route — not DEX routing. */
export function previewKerlExecutionFee(amountHuman: string, feeBps: number) {
  const gross = parseUnits(amountHuman || '0', 18)
  const fee = gross.mul(feeBps).div(10_000)
  return {
    gross: gross.toString(),
    fee: fee.toString(),
    net: gross.sub(fee).toString(),
    feeBps,
  }
}
