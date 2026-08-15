import { shouldReconcile } from './updater'
import { TransactionDetails } from './reducer'

describe('transactions updater', () => {
  const pendingTransaction: TransactionDetails = { hash: 'Ox78903', addedTime: 6, from: '0x787213' }
  const trxDetailWithReceipt: TransactionDetails = {
    hash: 'Ox78903',
    addedTime: 6,
    from: '0x787213',
    receipt: {
      blockHash: '0x787292',
      blockNumber: 12738921,
      contractAddress: '0x787219',
      from: '0x787213',
      status: 1,
      to: '0x787212',
      transactionHash: '0x12378123',
      transactionIndex: 5,
    },
  }
  describe('shouldReconcile', () => {
    it('keeps a transaction eligible until a receipt exists', () => {
      expect(shouldReconcile(pendingTransaction)).toEqual(true)
    })
    it('returns false if trx has receipt', () => {
      expect(shouldReconcile(trxDetailWithReceipt)).toEqual(false)
    })
  })
})
