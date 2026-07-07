# R702B Pools UX Recovery — Validation Report

Generated: 2026-07-06T16:46:10.813Z
Base URL: http://127.0.0.1:3000

## Pages Verified
- /: OK
- /trade: OK
- /liquidity-studio: OK
- /farms: OK
- /pools: OK
- /projects: OK
- /radar: OK
- /collectibles: OK
- /build-studio: OK
- /command-center: OK

## Pool Counts
- Pools detected (machine JSON): 0
- Live pools: 0
- Ended pools: 0
- Pools hidden from grid: 0

## APR Corrected (sample)

## Crashes Fixed
- address.slice TypeError in getContractRef

## Forbidden APR Found
- none

## Error Boundaries
- none

## Console Errors (filtered)
- [home] Warning: %s: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.%s Dropdown 
    at Dropdown (webpack-internal:///../../packages/uikit/src/components/Dropdown/Dropdown.tsx:86:11)
    at LangSelector (webpack-internal:///../../packages/uikit/src/components/LangSelector/LangSelector.tsx:19:11)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaLanguageControl (webpack-internal:///./src/app-shell/MelegaLanguageControl.tsx:57:121)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at header
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaAppHeader (webpack-internal:///./src/design-system/melega/components/AppHeader/MelegaAppHeader.tsx:71:11)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaAppShell (webpack-internal:///./src/app-shell/MelegaAppShell.tsx:111:11)
    at Menu (webpack-internal:///./src/components/Menu/index.tsx:11:25)
    at App (webpack-internal:///./src/pages/_app.tsx:319:11)
    at Router (webpack-internal:///../../node_modules/react-router/esm/react-router.js:81:30)
    at BrowserRouter (webpack-internal:///../../node_modules/react-router-dom/esm/react-router-dom.js:58:35)
    at PersistGate (webpack-internal:///../../node_modules/redux-persist/es/integration/react.js:39:5)
    at Blocklist (webpack-internal:///./src/index.tsx:67:11)
    at ModalProvider (webpack-internal:///../../packages/uikit/src/widgets/Modal/ModalContext.tsx:81:11)
    at HistoryManagerProvider (webpack-internal:///./src/contexts/HistoryContext.tsx:18:11)
    at SWRConfig (webpack-internal:///../../node_modules/swr/_internal/dist/index.mjs:540:13)
    at LanguageProvider (webpack-internal:///../../packages/localization/src/Provider.tsx:46:11)
    at ToastsProvider (webpack-internal:///../../packages/uikit/src/contexts/ToastsContext/Provider.tsx:20:11)
    at MatchBreakpointsProvider (webpack-internal:///../../packages/uikit/src/contexts/MatchBreakpoints/Provider.tsx:71:11)
    at Fe (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:17360)
    at UIKitProvider (webpack-internal:///../../packages/uikit/src/Providers.tsx:15:11)
    at StyledUIKitProvider (webpack-internal:///./src/Providers.tsx:26:11)
    at $ (webpack-internal:///../../node_modules/next-themes/dist/index.module.js:8:578)
    at y (webpack-internal:///../../node_modules/next-themes/dist/index.module.js:8:348)
    at Provider (webpack-internal:///../../node_modules/react-redux/es/components/Provider.js:13:3)
    at Web3LibraryProvider (webpack-internal:///../../packages/wagmi/dist/index.mjs:37:77)
    at QueryClientProvider (webpack-internal:///../../node_modules/wagmi/node_modules/@tanstack/react-query/build/lib/QueryClientProvider.mjs:42:11)
    at WagmiConfig (webpack-internal:///../../node_modules/wagmi/dist/index.js:129:11)
    at WagmiProvider (webpack-internal:///../../packages/wagmi/dist/index.mjs:22:23)
    at Providers (webpack-internal:///./src/Providers.tsx:39:11)
    at MyApp (webpack-internal:///./src/pages/_app.tsx:131:13)
    at PathnameContextProviderAdapter (webpack-internal:///../../node_modules/next/dist/shared/lib/router/adapters.js:62:11)
    at ErrorBoundary (webpack-internal:///../../node_modules/next/dist/compiled/@next/react-dev-overlay/dist/client.js:301:63)
    at ReactDevOverlay (webpack-internal:///../../node_modules/next/dist/compiled/@next/react-dev-overlay/dist/client.js:850:919)
    at Container (webpack-internal:///../../node_modules/next/dist/client/index.js:61:1)
    at AppContainer (webpack-internal:///../../node_modules/next/dist/client/index.js:171:11)
    at Root (webpack-internal:///../../node_modules/next/dist/client/index.js:350:11)
- [home] Warning: %s: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.%s Button 
    at Button (webpack-internal:///../../packages/uikit/src/components/Button/Button.tsx:15:13)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at Dropdown (webpack-internal:///../../packages/uikit/src/components/Dropdown/Dropdown.tsx:86:11)
    at LangSelector (webpack-internal:///../../packages/uikit/src/components/LangSelector/LangSelector.tsx:19:11)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaLanguageControl (webpack-internal:///./src/app-shell/MelegaLanguageControl.tsx:57:121)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at header
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaAppHeader (webpack-internal:///./src/design-system/melega/components/AppHeader/MelegaAppHeader.tsx:71:11)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaAppShell (webpack-internal:///./src/app-shell/MelegaAppShell.tsx:111:11)
    at Menu (webpack-internal:///./src/components/Menu/index.tsx:11:25)
    at App (webpack-internal:///./src/pages/_app.tsx:319:11)
    at Router (webpack-internal:///../../node_modules/react-router/esm/react-router.js:81:30)
    at BrowserRouter (webpack-internal:///../../node_modules/react-router-dom/esm/react-router-dom.js:58:35)
    at PersistGate (webpack-internal:///../../node_modules/redux-persist/es/integration/react.js:39:5)
    at Blocklist (webpack-internal:///./src/index.tsx:67:11)
    at ModalProvider (webpack-internal:///../../packages/uikit/src/widgets/Modal/ModalContext.tsx:81:11)
    at HistoryManagerProvider (webpack-internal:///./src/contexts/HistoryContext.tsx:18:11)
    at SWRConfig (webpack-internal:///../../node_modules/swr/_internal/dist/index.mjs:540:13)
    at LanguageProvider (webpack-internal:///../../packages/localization/src/Provider.tsx:46:11)
    at ToastsProvider (webpack-internal:///../../packages/uikit/src/contexts/ToastsContext/Provider.tsx:20:11)
    at MatchBreakpointsProvider (webpack-internal:///../../packages/uikit/src/contexts/MatchBreakpoints/Provider.tsx:71:11)
    at Fe (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:17360)
    at UIKitProvider (webpack-internal:///../../packages/uikit/src/Providers.tsx:15:11)
    at StyledUIKitProvider (webpack-internal:///./src/Providers.tsx:26:11)
    at $ (webpack-internal:///../../node_modules/next-themes/dist/index.module.js:8:578)
    at y (webpack-internal:///../../node_modules/next-themes/dist/index.module.js:8:348)
    at Provider (webpack-internal:///../../node_modules/react-redux/es/components/Provider.js:13:3)
    at Web3LibraryProvider (webpack-internal:///../../packages/wagmi/dist/index.mjs:37:77)
    at QueryClientProvider (webpack-internal:///../../node_modules/wagmi/node_modules/@tanstack/react-query/build/lib/QueryClientProvider.mjs:42:11)
    at WagmiConfig (webpack-internal:///../../node_modules/wagmi/dist/index.js:129:11)
    at WagmiProvider (webpack-internal:///../../packages/wagmi/dist/index.mjs:22:23)
    at Providers (webpack-internal:///./src/Providers.tsx:39:11)
    at MyApp (webpack-internal:///./src/pages/_app.tsx:131:13)
    at PathnameContextProviderAdapter (webpack-internal:///../../node_modules/next/dist/shared/lib/router/adapters.js:62:11)
    at ErrorBoundary (webpack-internal:///../../node_modules/next/dist/compiled/@next/react-dev-overlay/dist/client.js:301:63)
    at ReactDevOverlay (webpack-internal:///../../node_modules/next/dist/compiled/@next/react-dev-overlay/dist/client.js:850:919)
    at Container (webpack-internal:///../../node_modules/next/dist/client/index.js:61:1)
    at AppContainer (webpack-internal:///../../node_modules/next/dist/client/index.js:171:11)
    at Root (webpack-internal:///../../node_modules/next/dist/client/index.js:350:11)
- [trade] Warning: %s: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.%s Dropdown 
    at Dropdown (webpack-internal:///../../packages/uikit/src/components/Dropdown/Dropdown.tsx:86:11)
    at LangSelector (webpack-internal:///../../packages/uikit/src/components/LangSelector/LangSelector.tsx:19:11)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaLanguageControl (webpack-internal:///./src/app-shell/MelegaLanguageControl.tsx:57:121)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at header
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaAppHeader (webpack-internal:///./src/design-system/melega/components/AppHeader/MelegaAppHeader.tsx:71:11)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaAppShell (webpack-internal:///./src/app-shell/MelegaAppShell.tsx:111:11)
    at Menu (webpack-internal:///./src/components/Menu/index.tsx:11:25)
    at App (webpack-internal:///./src/pages/_app.tsx:319:11)
    at Router (webpack-internal:///../../node_modules/react-router/esm/react-router.js:81:30)
    at BrowserRouter (webpack-internal:///../../node_modules/react-router-dom/esm/react-router-dom.js:58:35)
    at PersistGate (webpack-internal:///../../node_modules/redux-persist/es/integration/react.js:39:5)
    at Blocklist (webpack-internal:///./src/index.tsx:67:11)
    at ModalProvider (webpack-internal:///../../packages/uikit/src/widgets/Modal/ModalContext.tsx:81:11)
    at HistoryManagerProvider (webpack-internal:///./src/contexts/HistoryContext.tsx:18:11)
    at SWRConfig (webpack-internal:///../../node_modules/swr/_internal/dist/index.mjs:540:13)
    at LanguageProvider (webpack-internal:///../../packages/localization/src/Provider.tsx:46:11)
    at ToastsProvider (webpack-internal:///../../packages/uikit/src/contexts/ToastsContext/Provider.tsx:20:11)
    at MatchBreakpointsProvider (webpack-internal:///../../packages/uikit/src/contexts/MatchBreakpoints/Provider.tsx:71:11)
    at Fe (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:17360)
    at UIKitProvider (webpack-internal:///../../packages/uikit/src/Providers.tsx:15:11)
    at StyledUIKitProvider (webpack-internal:///./src/Providers.tsx:26:11)
    at $ (webpack-internal:///../../node_modules/next-themes/dist/index.module.js:8:578)
    at y (webpack-internal:///../../node_modules/next-themes/dist/index.module.js:8:348)
    at Provider (webpack-internal:///../../node_modules/react-redux/es/components/Provider.js:13:3)
    at Web3LibraryProvider (webpack-internal:///../../packages/wagmi/dist/index.mjs:37:77)
    at QueryClientProvider (webpack-internal:///../../node_modules/wagmi/node_modules/@tanstack/react-query/build/lib/QueryClientProvider.mjs:42:11)
    at WagmiConfig (webpack-internal:///../../node_modules/wagmi/dist/index.js:129:11)
    at WagmiProvider (webpack-internal:///../../packages/wagmi/dist/index.mjs:22:23)
    at Providers (webpack-internal:///./src/Providers.tsx:39:11)
    at MyApp (webpack-internal:///./src/pages/_app.tsx:131:13)
    at PathnameContextProviderAdapter (webpack-internal:///../../node_modules/next/dist/shared/lib/router/adapters.js:62:11)
    at ErrorBoundary (webpack-internal:///../../node_modules/next/dist/compiled/@next/react-dev-overlay/dist/client.js:301:63)
    at ReactDevOverlay (webpack-internal:///../../node_modules/next/dist/compiled/@next/react-dev-overlay/dist/client.js:850:919)
    at Container (webpack-internal:///../../node_modules/next/dist/client/index.js:61:1)
    at AppContainer (webpack-internal:///../../node_modules/next/dist/client/index.js:171:11)
    at Root (webpack-internal:///../../node_modules/next/dist/client/index.js:350:11)
- [trade] Warning: %s: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.%s Button 
    at Button (webpack-internal:///../../packages/uikit/src/components/Button/Button.tsx:15:13)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at Dropdown (webpack-internal:///../../packages/uikit/src/components/Dropdown/Dropdown.tsx:86:11)
    at LangSelector (webpack-internal:///../../packages/uikit/src/components/LangSelector/LangSelector.tsx:19:11)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaLanguageControl (webpack-internal:///./src/app-shell/MelegaLanguageControl.tsx:57:121)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at header
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaAppHeader (webpack-internal:///./src/design-system/melega/components/AppHeader/MelegaAppHeader.tsx:71:11)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaAppShell (webpack-internal:///./src/app-shell/MelegaAppShell.tsx:111:11)
    at Menu (webpack-internal:///./src/components/Menu/index.tsx:11:25)
    at App (webpack-internal:///./src/pages/_app.tsx:319:11)
    at Router (webpack-internal:///../../node_modules/react-router/esm/react-router.js:81:30)
    at BrowserRouter (webpack-internal:///../../node_modules/react-router-dom/esm/react-router-dom.js:58:35)
    at PersistGate (webpack-internal:///../../node_modules/redux-persist/es/integration/react.js:39:5)
    at Blocklist (webpack-internal:///./src/index.tsx:67:11)
    at ModalProvider (webpack-internal:///../../packages/uikit/src/widgets/Modal/ModalContext.tsx:81:11)
    at HistoryManagerProvider (webpack-internal:///./src/contexts/HistoryContext.tsx:18:11)
    at SWRConfig (webpack-internal:///../../node_modules/swr/_internal/dist/index.mjs:540:13)
    at LanguageProvider (webpack-internal:///../../packages/localization/src/Provider.tsx:46:11)
    at ToastsProvider (webpack-internal:///../../packages/uikit/src/contexts/ToastsContext/Provider.tsx:20:11)
    at MatchBreakpointsProvider (webpack-internal:///../../packages/uikit/src/contexts/MatchBreakpoints/Provider.tsx:71:11)
    at Fe (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:17360)
    at UIKitProvider (webpack-internal:///../../packages/uikit/src/Providers.tsx:15:11)
    at StyledUIKitProvider (webpack-internal:///./src/Providers.tsx:26:11)
    at $ (webpack-internal:///../../node_modules/next-themes/dist/index.module.js:8:578)
    at y (webpack-internal:///../../node_modules/next-themes/dist/index.module.js:8:348)
    at Provider (webpack-internal:///../../node_modules/react-redux/es/components/Provider.js:13:3)
    at Web3LibraryProvider (webpack-internal:///../../packages/wagmi/dist/index.mjs:37:77)
    at QueryClientProvider (webpack-internal:///../../node_modules/wagmi/node_modules/@tanstack/react-query/build/lib/QueryClientProvider.mjs:42:11)
    at WagmiConfig (webpack-internal:///../../node_modules/wagmi/dist/index.js:129:11)
    at WagmiProvider (webpack-internal:///../../packages/wagmi/dist/index.mjs:22:23)
    at Providers (webpack-internal:///./src/Providers.tsx:39:11)
    at MyApp (webpack-internal:///./src/pages/_app.tsx:131:13)
    at PathnameContextProviderAdapter (webpack-internal:///../../node_modules/next/dist/shared/lib/router/adapters.js:62:11)
    at ErrorBoundary (webpack-internal:///../../node_modules/next/dist/compiled/@next/react-dev-overlay/dist/client.js:301:63)
    at ReactDevOverlay (webpack-internal:///../../node_modules/next/dist/compiled/@next/react-dev-overlay/dist/client.js:850:919)
    at Container (webpack-internal:///../../node_modules/next/dist/client/index.js:61:1)
    at AppContainer (webpack-internal:///../../node_modules/next/dist/client/index.js:171:11)
    at Root (webpack-internal:///../../node_modules/next/dist/client/index.js:350:11)
- [trade] Failed to fetch info data TypeError: Network request failed
    at xhr.onerror (webpack-internal:///../../node_modules/cross-fetch/dist/browser-ponyfill.js:480:16)
- [trade] Failed to fetch price chart data TypeError: Network request failed
    at xhr.onerror (webpack-internal:///../../node_modules/cross-fetch/dist/browser-ponyfill.js:480:16)
- [trade] Failed to fetch info data TypeError: Network request failed
    at xhr.onerror (webpack-internal:///../../node_modules/cross-fetch/dist/browser-ponyfill.js:480:16)
- [trade] Error fetching blocks for timestamps [1782748800, 1782763200, 1782777600, 1782792000, 1782806400, 1782820800, 1782835200, 1782849600, 1782864000, 1782878400, 1782892800, 1782907200, 1782921600, 1782936000, 1782950400, 1782964800, 1782979200, 1782993600, 1783008000, 1783022400, 1783036800, 1783051200, 1783065600, 1783080000, 1783094400, 1783108800, 1783123200, 1783137600, 1783152000, 1783166400, 1783180800, 1783195200, 1783209600, 1783224000, 1783238400, 1783252800, 1783267200, 1783281600, 1783296000, 1783310400, 1783324800, 1783339200, 1783353600]
- [liquidity-studio] Warning: %s: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.%s Dropdown 
    at Dropdown (webpack-internal:///../../packages/uikit/src/components/Dropdown/Dropdown.tsx:86:11)
    at LangSelector (webpack-internal:///../../packages/uikit/src/components/LangSelector/LangSelector.tsx:19:11)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaLanguageControl (webpack-internal:///./src/app-shell/MelegaLanguageControl.tsx:57:121)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at header
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaAppHeader (webpack-internal:///./src/design-system/melega/components/AppHeader/MelegaAppHeader.tsx:71:11)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaAppShell (webpack-internal:///./src/app-shell/MelegaAppShell.tsx:111:11)
    at Menu (webpack-internal:///./src/components/Menu/index.tsx:11:25)
    at App (webpack-internal:///./src/pages/_app.tsx:319:11)
    at Router (webpack-internal:///../../node_modules/react-router/esm/react-router.js:81:30)
    at BrowserRouter (webpack-internal:///../../node_modules/react-router-dom/esm/react-router-dom.js:58:35)
    at PersistGate (webpack-internal:///../../node_modules/redux-persist/es/integration/react.js:39:5)
    at Blocklist (webpack-internal:///./src/index.tsx:67:11)
    at ModalProvider (webpack-internal:///../../packages/uikit/src/widgets/Modal/ModalContext.tsx:81:11)
    at HistoryManagerProvider (webpack-internal:///./src/contexts/HistoryContext.tsx:18:11)
    at SWRConfig (webpack-internal:///../../node_modules/swr/_internal/dist/index.mjs:540:13)
    at LanguageProvider (webpack-internal:///../../packages/localization/src/Provider.tsx:46:11)
    at ToastsProvider (webpack-internal:///../../packages/uikit/src/contexts/ToastsContext/Provider.tsx:20:11)
    at MatchBreakpointsProvider (webpack-internal:///../../packages/uikit/src/contexts/MatchBreakpoints/Provider.tsx:71:11)
    at Fe (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:17360)
    at UIKitProvider (webpack-internal:///../../packages/uikit/src/Providers.tsx:15:11)
    at StyledUIKitProvider (webpack-internal:///./src/Providers.tsx:26:11)
    at $ (webpack-internal:///../../node_modules/next-themes/dist/index.module.js:8:578)
    at y (webpack-internal:///../../node_modules/next-themes/dist/index.module.js:8:348)
    at Provider (webpack-internal:///../../node_modules/react-redux/es/components/Provider.js:13:3)
    at Web3LibraryProvider (webpack-internal:///../../packages/wagmi/dist/index.mjs:37:77)
    at QueryClientProvider (webpack-internal:///../../node_modules/wagmi/node_modules/@tanstack/react-query/build/lib/QueryClientProvider.mjs:42:11)
    at WagmiConfig (webpack-internal:///../../node_modules/wagmi/dist/index.js:129:11)
    at WagmiProvider (webpack-internal:///../../packages/wagmi/dist/index.mjs:22:23)
    at Providers (webpack-internal:///./src/Providers.tsx:39:11)
    at MyApp (webpack-internal:///./src/pages/_app.tsx:131:13)
    at PathnameContextProviderAdapter (webpack-internal:///../../node_modules/next/dist/shared/lib/router/adapters.js:62:11)
    at ErrorBoundary (webpack-internal:///../../node_modules/next/dist/compiled/@next/react-dev-overlay/dist/client.js:301:63)
    at ReactDevOverlay (webpack-internal:///../../node_modules/next/dist/compiled/@next/react-dev-overlay/dist/client.js:850:919)
    at Container (webpack-internal:///../../node_modules/next/dist/client/index.js:61:1)
    at AppContainer (webpack-internal:///../../node_modules/next/dist/client/index.js:171:11)
    at Root (webpack-internal:///../../node_modules/next/dist/client/index.js:350:11)
- [liquidity-studio] Warning: %s: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.%s Button 
    at Button (webpack-internal:///../../packages/uikit/src/components/Button/Button.tsx:15:13)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at Dropdown (webpack-internal:///../../packages/uikit/src/components/Dropdown/Dropdown.tsx:86:11)
    at LangSelector (webpack-internal:///../../packages/uikit/src/components/LangSelector/LangSelector.tsx:19:11)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaLanguageControl (webpack-internal:///./src/app-shell/MelegaLanguageControl.tsx:57:121)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at header
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaAppHeader (webpack-internal:///./src/design-system/melega/components/AppHeader/MelegaAppHeader.tsx:71:11)
    at div
    at O (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:19811)
    at MelegaAppShell (webpack-internal:///./src/app-shell/MelegaAppShell.tsx:111:11)
    at Menu (webpack-internal:///./src/components/Menu/index.tsx:11:25)
    at App (webpack-internal:///./src/pages/_app.tsx:319:11)
    at Router (webpack-internal:///../../node_modules/react-router/esm/react-router.js:81:30)
    at BrowserRouter (webpack-internal:///../../node_modules/react-router-dom/esm/react-router-dom.js:58:35)
    at PersistGate (webpack-internal:///../../node_modules/redux-persist/es/integration/react.js:39:5)
    at Blocklist (webpack-internal:///./src/index.tsx:67:11)
    at ModalProvider (webpack-internal:///../../packages/uikit/src/widgets/Modal/ModalContext.tsx:81:11)
    at HistoryManagerProvider (webpack-internal:///./src/contexts/HistoryContext.tsx:18:11)
    at SWRConfig (webpack-internal:///../../node_modules/swr/_internal/dist/index.mjs:540:13)
    at LanguageProvider (webpack-internal:///../../packages/localization/src/Provider.tsx:46:11)
    at ToastsProvider (webpack-internal:///../../packages/uikit/src/contexts/ToastsContext/Provider.tsx:20:11)
    at MatchBreakpointsProvider (webpack-internal:///../../packages/uikit/src/contexts/MatchBreakpoints/Provider.tsx:71:11)
    at Fe (webpack-internal:///../../node_modules/styled-components/dist/styled-components.browser.esm.js:31:17360)
    at UIKitProvider (webpack-internal:///../../packages/uikit/src/Providers.tsx:15:11)
    at StyledUIKitProvider (webpack-internal:///./src/Providers.tsx:26:11)
    at $ (webpack-internal:///../../node_modules/next-themes/dist/index.module.js:8:578)
    at y (webpack-internal:///../../node_modules/next-themes/dist/index.module.js:8:348)
    at Provider (webpack-internal:///../../node_modules/react-redux/es/components/Provider.js:13:3)
    at Web3LibraryProvider (webpack-internal:///../../packages/wagmi/dist/index.mjs:37:77)
    at QueryClientProvider (webpack-internal:///../../node_modules/wagmi/node_modules/@tanstack/react-query/build/lib/QueryClientProvider.mjs:42:11)
    at WagmiConfig (webpack-internal:///../../node_modules/wagmi/dist/index.js:129:11)
    at WagmiProvider (webpack-internal:///../../packages/wagmi/dist/index.mjs:22:23)
    at Providers (webpack-internal:///./src/Providers.tsx:39:11)
    at MyApp (webpack-internal:///./src/pages/_app.tsx:131:13)
    at PathnameContextProviderAdapter (webpack-internal:///../../node_modules/next/dist/shared/lib/router/adapters.js:62:11)
    at ErrorBoundary (webpack-internal:///../../node_modules/next/dist/compiled/@next/react-dev-overlay/dist/client.js:301:63)
    at ReactDevOverlay (webpack-internal:///../../node_modules/next/dist/compiled/@next/react-dev-overlay/dist/client.js:850:919)
    at Container (webpack-internal:///../../node_modules/next/dist/client/index.js:61:1)
    at AppContainer (webpack-internal:///../../node_modules/next/dist/client/index.js:171:11)
    at Root (webpack-internal:///../../node_modules/next/dist/client/index.js:350:11)
- [liquidity-studio] Failed to fetch info data TypeError: Network request failed
    at xhr.onerror (webpack-internal:///../../node_modules/cross-fetch/dist/browser-ponyfill.js:480:16)
- [liquidity-studio] Failed to fetch top pools TypeError: Network request failed
    at xhr.onerror (webpack-internal:///../../node_modules/cross-fetch/dist/browser-ponyfill.js:480:16)
- [liquidity-studio] Failed to fetch top pools TypeError: Network request failed
    at xhr.onerror (webpack-internal:///../../node_modules/cross-fetch/dist/browser-ponyfill.js:480:16)
- [liquidity-studio] Failed to fetch top pools TypeError: Network request failed
    at xhr.onerror (webpack-internal:///../../node_modules/cross-fetch/dist/browser-ponyfill.js:480:16)
- [liquidity-studio] Failed to fetch top pools TypeError: Network request failed
    at xhr.onerror (webpack-internal:///../../node_modules/cross-fetch/dist/browser-ponyfill.js:480:16)
- [liquidity-studio] Failed to fetch top pools TypeError: Network request failed
    at xhr.onerror (webpack-internal:///../../node_modules/cross-fetch/dist/browser-ponyfill.js:480:16)
- [liquidity-studio] Failed to fetch info data TypeError: Network request failed
    at xhr.onerror (webpack-internal:///../../node_modules/cross-fetch/dist/browser-ponyfill.js:480:16)
- [liquidity-studio] Failed to fetch top pools TypeError: Network request failed
    at xhr.onerror (webpack-internal:///../../node_modules/cross-fetch/dist/browser-ponyfill.js:480:16)
- [liquidity-studio] Failed to fetch top pools TypeError: Network request failed
    at xhr.onerror (webpack-internal:///../../node_modules/cross-fetch/dist/browser-ponyfill.js:480:16)
- [liquidity-studio] Failed to fetch top pools TypeError: Network request failed
    at xhr.onerror (webpack-internal:///../../node_modules/cross-fetch/dist/browser-ponyfill.js:480:16)

## Screenshots
- docs/screenshots/r702b-pools-recovery/route-home-1440.png
- docs/screenshots/r702b-pools-recovery/route-trade-1440.png
- docs/screenshots/r702b-pools-recovery/route-liquidity-studio-1440.png
- docs/screenshots/r702b-pools-recovery/route-farms-1440.png
- docs/screenshots/r702b-pools-recovery/route-pools-1440.png
- docs/screenshots/r702b-pools-recovery/route-projects-1440.png
- docs/screenshots/r702b-pools-recovery/route-radar-1440.png
- docs/screenshots/r702b-pools-recovery/route-collectibles-1440.png
- docs/screenshots/r702b-pools-recovery/route-build-studio-1440.png
- docs/screenshots/r702b-pools-recovery/route-command-center-1440.png
- docs/screenshots/r702b-pools-recovery/pools-analyze-expanded-1440.png
- docs/screenshots/r702b-pools-recovery/pools-mobile-390.png

## RESULT

R702B PASSED