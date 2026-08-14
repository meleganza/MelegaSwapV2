import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const WEB = path.resolve(__dirname, '../../../')
const load = (relative: string) => readFileSync(path.join(WEB, relative), 'utf8')

describe('mobile wallet payment funnel', () => {
  const walletConfig = load('config/wallet.ts')
  const wagmi = load('utils/wagmi.ts')
  const paymentSurfaces = [
    load('views/shared/monetization/CommercialCheckoutModal.tsx'),
    load('views/ListStudio/ListFeaturedCheckout.tsx'),
    load('views/ListStudio/ListTrendBoostCheckout.tsx'),
  ]

  it('exposes WalletConnect and Melega-specific mobile deep links', () => {
    expect(walletConfig).toContain("id: 'walletconnect'")
    expect(walletConfig).toContain('ConnectorNames.WalletConnect')
    expect(walletConfig).toContain('metamask.app.link/dapp/${currentDappUrl}')
    expect(walletConfig).toContain('link.trustwallet.com/open_url')
    expect(walletConfig).not.toContain('pancakeswap.finance')
    expect(wagmi).toMatch(/connectors:[\s\S]*walletConnectConnector/)
  })

  it('uses the connected Wagmi signer on every commercial payment surface', () => {
    for (const surface of paymentSurfaces) {
      expect(surface).toContain('useSigner')
      expect(surface).toContain('signer.sendTransaction')
      expect(surface).not.toContain('window as unknown as')
      expect(surface).not.toContain("method: 'eth_sendTransaction'")
    }
  })

  it('keeps Liquidity Builder network switching connector-agnostic', () => {
    const liquidityBuilder = load('views/LiquidityStudio/onePage/LiquidityBuildingCard.tsx')
    expect(liquidityBuilder).toContain('useWagmiSwitchNetwork')
    expect(liquidityBuilder).toContain('switchNetworkAsync(56)')
    expect(liquidityBuilder).not.toContain('window.ethereum')
    expect(liquidityBuilder).not.toContain("method: 'wallet_switchEthereumChain'")
  })

  it('enables commercial activation only behind receipt verification and durable order storage', () => {
    const capabilities = load('config/constants/recoveryCapabilities.ts')
    const trendApi = load('pages/api/trend-boost/orders.ts')
    const featuredApi = load('pages/api/featured/orders/index.ts')
    expect(capabilities).toContain('commercialPaymentActivation: true')
    expect(trendApi).toContain("action === 'confirm-receipt'")
    expect(trendApi).toContain('verifyBscPaymentReceipt')
    expect(trendApi).toContain('RECEIPT_VERIFICATION_REQUIRED')
    expect(trendApi).toContain('persistTrendBoostOrderDurably')
    expect(featuredApi).toContain('persistFeaturedOrderDurably')
  })
})
