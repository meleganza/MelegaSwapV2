/**
 * Pure builder for Passport Assets (Module 003).
 * No full wallet inventory, M-Credits ledger, or multi-wallet registry today.
 */
import {
  ASSETS_NOT_AVAILABLE,
  ASSETS_UNAVAILABLE,
  type PassportAssetsViewModel,
  type PassportQuickAction,
} from './passportAssetsTypes'

export type PassportAssetsInput = {
  address?: string | null
  loading?: boolean
  connectorName?: string | null
  chainName?: string | null
  fixture?: Partial<PassportAssetsViewModel> | null
}

function shorten(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function supportedActions(walletConnected: boolean): PassportQuickAction[] {
  return [
    {
      id: 'manage-wallets',
      label: 'Manage Wallets',
      href: null,
      supported: false,
      reason: 'No dedicated wallet-management route',
    },
    {
      id: 'receive',
      label: 'Receive',
      href: null,
      supported: false,
      reason: 'Receive flow lives in the global wallet menu',
    },
    {
      id: 'send',
      label: 'Send',
      href: walletConnected ? '/swap' : null,
      supported: walletConnected,
      reason: walletConnected ? undefined : 'Connect a wallet to send via Trade',
    },
    {
      id: 'top-up-mcredits',
      label: 'Top Up M-Credits',
      href: null,
      supported: false,
      reason: 'Treasury top-up surface not available',
    },
    {
      id: 'asset-history',
      label: 'Asset History',
      href: null,
      supported: false,
      reason: 'Passport asset history feed not available',
    },
  ]
}

export function buildPassportAssetsViewModel(input: PassportAssetsInput = {}): PassportAssetsViewModel {
  if (input.fixture) {
    const base = buildLive(input)
    return {
      ...base,
      ...input.fixture,
      crypto: input.fixture.crypto ?? base.crypto,
      mCredits: input.fixture.mCredits ?? base.mCredits,
      wallets: input.fixture.wallets ?? base.wallets,
      actions: input.fixture.actions ?? base.actions,
    }
  }
  return buildLive(input)
}

function buildLive(input: PassportAssetsInput): PassportAssetsViewModel {
  const loading = Boolean(input.loading)
  const address = input.address ?? null
  const walletConnected = Boolean(address)
  const actions = supportedActions(walletConnected)

  if (!walletConnected) {
    return {
      loading,
      walletConnected: false,
      crypto: {
        availability: 'wallet_not_connected',
        rows: [],
        status: 'Connect an external wallet to load crypto assets',
      },
      mCredits: {
        availability: 'unavailable',
        balance: ASSETS_UNAVAILABLE,
        status: ASSETS_NOT_AVAILABLE,
        receivingAccount: ASSETS_UNAVAILABLE,
        topUpSupported: false,
        spendSupported: false,
        historySupported: false,
      },
      wallets: {
        availability: 'wallet_not_connected',
        rows: [],
        status: '0 wallets connected',
      },
      actions: {
        availability: 'partial',
        items: actions,
        status: 'Only supported actions are enabled',
      },
    }
  }

  const chain = input.chainName?.trim() || 'Chain unavailable'
  const name = input.connectorName?.trim() || 'Connected wallet'

  return {
    loading,
    walletConnected: true,
    crypto: {
      availability: 'unavailable',
      rows: [],
      status: 'Full crypto inventory unavailable',
    },
    mCredits: {
      availability: 'unavailable',
      balance: ASSETS_UNAVAILABLE,
      status: 'Separate service account — not an ERC-20 token',
      receivingAccount: ASSETS_UNAVAILABLE,
      topUpSupported: false,
      spendSupported: false,
      historySupported: false,
    },
    wallets: {
      availability: 'ready',
      rows: [
        {
          name,
          chain,
          addressShort: shorten(address as string),
          connection: 'Connected',
          primary: true,
        },
      ],
      status: '1 wallet connected',
    },
    actions: {
      availability: 'partial',
      items: actions,
      status: 'Only supported actions are enabled',
    },
  }
}
