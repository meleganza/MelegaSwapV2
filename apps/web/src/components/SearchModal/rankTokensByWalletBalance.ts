import type { CurrencyAmount, Token } from '@pancakeswap/sdk'

type BalanceMap = { [tokenAddress: string]: CurrencyAmount<Token> | undefined }

function hasPositiveBalance(balance?: CurrencyAmount<Token>): boolean {
  return Boolean(balance && balance.greaterThan('0'))
}

export function compareTokensByWalletBalance(
  tokenA: Token,
  tokenB: Token,
  balances: BalanceMap,
): number {
  const balanceA = balances[tokenA.address]
  const balanceB = balances[tokenB.address]
  const positiveA = hasPositiveBalance(balanceA)
  const positiveB = hasPositiveBalance(balanceB)
  if (positiveA !== positiveB) return positiveA ? -1 : 1
  if (positiveA && positiveB && balanceA && balanceB) {
    if (balanceA.equalTo(balanceB)) return 0
    return balanceA.greaterThan(balanceB) ? -1 : 1
  }
  return 0
}

/**
 * Stable rank: tokens with a positive cached wallet balance first (larger first),
 * then preserve the incoming order (query relevance / existing sort).
 * Disconnected or empty maps are a no-op.
 */
export function rankTokensByWalletBalance<T extends Token>(tokens: T[], balances: BalanceMap): T[] {
  if (!tokens.length) return tokens
  if (!balances || Object.keys(balances).length === 0) return tokens
  return [...tokens].sort((tokenA, tokenB) => compareTokensByWalletBalance(tokenA, tokenB, balances))
}
