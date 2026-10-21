import assert from 'assert'
import { test } from 'node:test'
import { decideSend, receiptOutcome, reviewAction, sameUserTx, signatureRejected, type PublicUserTx, type SwapReview } from '../lib/userSwapFlow'

const tx = (data: string): PublicUserTx => ({ to: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', data, value: '0x0', chainId: 56 })

function review(partial: Partial<SwapReview>): SwapReview {
  return {
    ok: false,
    feeBps: 20,
    feeAmountRaw: '1',
    gasUnits: '180000',
    venueLabel: 'PancakeSwap',
    amountInRaw: '1000000',
    amountOutRaw: '500000',
    slippageBps: 50,
    destination: '0x7c07082839edd5797737640bba6af47992b9861e',
    approvalTx: null,
    unsignedTx: null,
    ...partial,
  }
}

test('a short allowance asks for approval and withholds the swap', () => {
  assert.equal(reviewAction(review({ approvalTx: tx('0x095ea7b3'), unsignedTx: null })), 'approve')
  assert.equal(reviewAction(review({ ok: true, approvalTx: null, unsignedTx: null, gasUnits: null })), 'blocked')
  assert.equal(reviewAction(review({ ok: true, unsignedTx: tx('0x12345678'), gasUnits: null })), 'confirm')
  assert.equal(reviewAction(review({ ok: true, unsignedTx: tx('0x12345678'), gasUnits: 'not-a-number' })), 'blocked')
  assert.equal(reviewAction(review({ ok: true, unsignedTx: tx('0x12345678'), gasUnits: '180000' })), 'confirm')
})

test('a submitted transaction cannot be sent again until its receipt fails', () => {
  const shown = tx('0xabcdef01')
  const fresh = review({ ok: true, unsignedTx: shown, gasUnits: null })
  assert.equal(decideSend({ phase: 'idle', kind: 'confirm', shown, fresh }), 'send')
  assert.equal(decideSend({ phase: 'submitted', kind: 'confirm', shown, fresh }), 'blocked')
  assert.equal(decideSend({ phase: 'idle', kind: 'confirm', shown, fresh: review({ code: 'QUOTE_STALE', unsignedTx: shown }) }), 'stale')
  assert.equal(decideSend({ phase: 'idle', kind: 'confirm', shown, fresh: review({ ok: true, unsignedTx: tx('0xabcdef02') }) }), 'replaced')
  assert.equal(decideSend({ phase: 'idle', kind: 'approve', shown, fresh: review({ approvalTx: shown }) }), 'send')
  assert.equal(decideSend({ phase: 'submitted', kind: 'approve', shown, fresh: review({ approvalTx: shown }) }), 'blocked')
  assert.equal(receiptOutcome({ status: '1' }), 'confirmed')
})

test('receipt failure can be retried and a pending or confirmed receipt cannot', () => {
  const shown = tx('0xabcdef01')
  const fresh = review({ ok: true, unsignedTx: shown })
  const phase = (outcome: 'confirmed' | 'failed' | 'pending') => (outcome === 'failed' ? 'idle' : 'submitted')
  assert.equal(decideSend({ phase: phase('failed'), kind: 'confirm', shown, fresh }), 'send')
  assert.equal(decideSend({ phase: phase('pending'), kind: 'confirm', shown, fresh }), 'blocked')
  assert.equal(decideSend({ phase: phase('confirmed'), kind: 'approve', shown, fresh: review({ approvalTx: shown }) }), 'blocked')
  assert.equal(receiptOutcome({ status: '0x0' }), 'failed')
})

test('a 0.01 WBNB fee at 20 bps is one charge inside the input', () => {
  const input = 10n ** 16n
  const fee = (input * 20n) / 10_000n
  assert.equal(fee, 20_000_000_000_000n)
  assert.equal(input - fee + fee, input)
})

test('a replaced transaction, a failed receipt, and a rejected signature stay closed', () => {
  const left = tx('0x095ea7b3aa')
  const right = tx('0x095ea7b3bb')
  assert.equal(sameUserTx(left, left), true)
  assert.equal(sameUserTx(left, right), false)
  assert.equal(sameUserTx(left, null), false)
  assert.equal(receiptOutcome(null), 'pending')
  assert.equal(receiptOutcome({ status: '0x1' }), 'confirmed')
  assert.equal(receiptOutcome({ status: '0x0' }), 'failed')
  assert.equal(signatureRejected({ code: 4001, message: 'User rejected' }), true)
  assert.equal(signatureRejected(new Error('timeout')), false)
})
