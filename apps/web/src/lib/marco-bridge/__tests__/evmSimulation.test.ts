import { describe, expect, it, vi } from 'vitest'
import { utils } from 'ethers'
import { simulateEvmBridgeCall } from '../evmSimulation'
import { OFT_SEND_IFACE, type UnsignedEvmBridgeTx } from '../transactionBuilder'

const address = '0x1111111111111111111111111111111111111111'
const amount = '1000000000000'
const tx: UnsignedEvmBridgeTx = {
  family: 'evm',
  purpose: 'oft_send',
  chainId: 137,
  from: address,
  to: '0xF31A621A0e75d90fdA320EeE52956D718Fa34615',
  nativeFeeSymbol: 'POL',
  value: '0x01',
  data: OFT_SEND_IFACE.encodeFunctionData('send', [
    [30102, utils.hexZeroPad(address, 32), amount, amount, '0x', '0x', '0x'],
    [1, 0],
    address,
  ]),
}
const success = (received = amount) =>
  OFT_SEND_IFACE.encodeFunctionResult('send', [
    [utils.hexZeroPad('0x01', 32), 1, 1, 0],
    [amount, received],
  ])

describe('strict unsigned EVM simulation', () => {
  it('rejects RPC errors without provider.call swallowing custom reverts', async () => {
    const send = vi.fn().mockRejectedValue(new Error('execution reverted: ERC20InsufficientBalance'))
    expect((await simulateEvmBridgeCall({ send }, tx)).ok).toBe(false)
    expect(send).toHaveBeenCalledWith('eth_call', [expect.objectContaining({ value: '0x1' }), 'latest'])
  })
  it('rejects custom revert bytes returned as a successful RPC result', async () => {
    const error =
      '0xe450d38c' + utils.defaultAbiCoder.encode(['address', 'uint256', 'uint256'], [address, 0, amount]).slice(2)
    expect((await simulateEvmBridgeCall({ send: async () => error }, tx)).ok).toBe(false)
  })
  it('accepts an exact OFT receipt', async () => {
    expect((await simulateEvmBridgeCall({ send: async () => success() }, tx)).ok).toBe(true)
  })
  it('rejects empty or insufficient receive results', async () => {
    for (const response of ['0x', success('0')])
      expect((await simulateEvmBridgeCall({ send: async () => response }, tx)).ok).toBe(false)
  })
  it('rejects a false ERC20 approval response', async () => {
    expect(
      (
        await simulateEvmBridgeCall(
          { send: async () => utils.defaultAbiCoder.encode(['bool'], [false]) },
          { ...tx, purpose: 'approve' },
        )
      ).ok,
    ).toBe(false)
  })
})
