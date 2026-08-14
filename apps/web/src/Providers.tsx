import { UIKitProvider } from '@pancakeswap/uikit/src/Providers'
import ModalProvider from '@pancakeswap/uikit/src/widgets/Modal/ModalContext'
import { Provider } from 'react-redux'
import { SWRConfig } from 'swr'
import { LanguageProvider } from '@pancakeswap/localization'
import { fetchStatusMiddleware } from 'hooks/useSWRContract'
import { Store } from '@reduxjs/toolkit'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { WagmiProvider } from '@pancakeswap/wagmi'
import { client } from 'utils/wagmi'
import { HistoryManagerProvider } from 'contexts/HistoryContext'

import { melegaDarkTheme } from 'style/melega-theme'

const StyledUIKitProvider: React.FC<React.PropsWithChildren> = ({ children, ...props }) => {
  return (
    <UIKitProvider theme={melegaDarkTheme} {...props}>
      {children}
    </UIKitProvider>
  )
}

const Providers: React.FC<React.PropsWithChildren<{ store: Store; children: React.ReactNode }>> = ({
  children,
  store,
}) => {
  return (
    <WagmiProvider client={client}>
      <Provider store={store}>
        <NextThemeProvider>
          <StyledUIKitProvider>
            <LanguageProvider>
              <SWRConfig
                value={{
                  use: [fetchStatusMiddleware],
                  // Shared reads are mounted by several DEX surfaces. Reuse a
                  // recent response instead of starting duplicate RPC/API work
                  // during route changes and wallet reconnection.
                  dedupingInterval: 10_000,
                  focusThrottleInterval: 60_000,
                  refreshWhenHidden: false,
                  refreshWhenOffline: false,
                  keepPreviousData: true,
                }}
              >
                <HistoryManagerProvider>
                  <ModalProvider>{children}</ModalProvider>
                </HistoryManagerProvider>
              </SWRConfig>
            </LanguageProvider>
          </StyledUIKitProvider>
        </NextThemeProvider>
      </Provider>
    </WagmiProvider>
  )
}

export default Providers
