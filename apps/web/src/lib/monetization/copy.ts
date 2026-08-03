/**
 * Uniform human-first copy for RC Sprint 1 monetization + wallet surfaces.
 */
export const RC_COPY = {
  connectWallet: 'Connect wallet',
  switchNetwork: 'Switch to BNB Smart Chain',
  approveToken: 'Approve token',
  confirmInWallet: 'Confirm in your wallet',
  success: 'Done',
  paymentCancelled: 'Payment cancelled — you can continue.',
  wrongNetwork: 'Wrong network. Switch to BNB Smart Chain to continue.',
  walletUnavailable: 'Wallet not available. Install or unlock a browser wallet.',
  featuredTitle: 'Get Featured on Home',
  featuredBody:
    'Optional Home Featured placement. Pick a package, pay in BNB, USDT, USDC, or MARCO. Declining never blocks your project.',
  trendBoostTitle: 'Trend Boost',
  trendBoostBody:
    'Optional Trending surface boost. Pick a duration, pay in BNB, USDT, USDC, or MARCO. Settles to MELEGA TREASURY.',
  continueWithoutFeatured: 'Continue without Featured',
  continueWithoutTrendBoost: 'Continue without Trend Boost',
  searchPlaceholder: 'Search name or paste address',
  noResults: 'No tokens match that search.',
  loading: 'Loading…',
  errorRetry: 'Something went wrong. Try again.',
  payWith: 'Pay with',
  packageLabel: 'Package',
  treasuryNote: 'Settles directly to MELEGA TREASURY. No refund after confirmation.',
} as const

export type WalletFlowStage =
  | 'idle'
  | 'connect'
  | 'switch_network'
  | 'approve'
  | 'confirm'
  | 'success'
  | 'error'
  | 'cancelled'

export function walletFlowMessage(stage: WalletFlowStage, detail?: string): string {
  switch (stage) {
    case 'connect':
      return RC_COPY.connectWallet
    case 'switch_network':
      return RC_COPY.switchNetwork
    case 'approve':
      return detail ? `Approve ${detail}` : RC_COPY.approveToken
    case 'confirm':
      return RC_COPY.confirmInWallet
    case 'success':
      return detail || RC_COPY.success
    case 'cancelled':
      return RC_COPY.paymentCancelled
    case 'error':
      return detail || RC_COPY.errorRetry
    default:
      return ''
  }
}
