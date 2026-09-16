import { CurrencyAmount, ERC20Token } from '@pancakeswap/sdk'
import { describe, expect, it } from 'vitest'
import { rankTokensByWalletBalance } from '../rankTokensByWalletBalance'

const TOKEN_A = new ERC20Token(56, '0x1111111111111111111111111111111111111111', 18, 'AAA', 'Aaa')
const TOKEN_B = new ERC20Token(56, '0x2222222222222222222222222222222222222222', 18, 'BBB', 'Bbb')
const TOKEN_C = new ERC20Token(56, '0x3333333333333333333333333333333333333333', 18, 'CCC', 'Ccc')

describe('rankTokensByWalletBalance', () => {
  it('leaves order unchanged when disconnected or balances are empty', () => {
    const incoming = [TOKEN_C, TOKEN_A, TOKEN_B]
    expect(rankTokensByWalletBalance(incoming, {})).toEqual(incoming)
  })

  it('ranks positive wallet balances first without hiding zero-balance tokens', () => {
    const balances = {
      [TOKEN_B.address]: CurrencyAmount.fromRawAmount(TOKEN_B, '200'),
      [TOKEN_A.address]: CurrencyAmount.fromRawAmount(TOKEN_A, '50'),
    }
    const ranked = rankTokensByWalletBalance([TOKEN_C, TOKEN_A, TOKEN_B], balances)
    expect(ranked.map((token) => token.symbol)).toEqual(['BBB', 'AAA', 'CCC'])
  })

  it('keeps query/source order among tokens that share the same zero balance', () => {
    const ranked = rankTokensByWalletBalance([TOKEN_C, TOKEN_A, TOKEN_B], {
      [TOKEN_A.address]: CurrencyAmount.fromRawAmount(TOKEN_A, '0'),
    })
    expect(ranked.map((token) => token.symbol)).toEqual(['CCC', 'AAA', 'BBB'])
  })
})
