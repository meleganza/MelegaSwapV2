import { BigNumber, utils } from 'ethers'
import { OFT_SEND_IFACE, type UnsignedEvmBridgeTx } from './transactionBuilder'
import type { EvmCallResult } from './simulate'

type Rpc = { send(method: string, params: unknown[]): Promise<unknown> }

/** ethers v5 provider.call can return custom-error bytes from an RPC revert. */
export async function simulateEvmBridgeCall(provider: Rpc, tx: UnsignedEvmBridgeTx): Promise<EvmCallResult> {
  try {
    const result = await provider.send('eth_call', [
      { from: tx.from, to: tx.to, data: tx.data, value: utils.hexValue(tx.value) },
      'latest',
    ])
    if (typeof result !== 'string') throw new Error('Invalid eth_call response.')
    if (tx.purpose === 'oft_send') {
      const receipt = OFT_SEND_IFACE.decodeFunctionResult('send', result)[1]
      const param = OFT_SEND_IFACE.decodeFunctionData('send', tx.data).sendParam
      if (
        !BigNumber.from(receipt.amountSentLD).eq(param.amountLD) ||
        !BigNumber.from(receipt.amountReceivedLD).gte(param.minAmountLD)
      )
        throw new Error('Simulated OFT receipt does not match the requested amount.')
    } else if (result !== '0x' && utils.defaultAbiCoder.decode(['bool'], result)[0] !== true) {
      throw new Error('Token approval simulation returned false.')
    }
    return { ok: true, reverted: false, reason: 'eth_call succeeded with validated return data.' }
  } catch (cause) {
    return { ok: false, reverted: true, reason: cause instanceof Error ? cause.message : 'eth_call failed.' }
  }
}
