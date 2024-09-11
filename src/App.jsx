import React, { useEffect } from "react";
import AllLaunches from "./container/AllLaunches";
import CreateBlack from "./container/CreateBlack.tsx";
import NotFound from "./container/NotFound";
import BuyPage from "./container/BuyPage";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params';
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { avalancheFuji, mainnet, sepolia, bscTestnet } from 'wagmi/chains'
import Profile from "./container/Profile.tsx";
import EditProfile from "./container/EditProfile";
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from "@web3modal/react";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import './index.css';
import Moralis from "moralis";
import AboutUs from "./container/AboutUs";
import Faq from "./container/Faq";

const projectId = '4807d388fe495226b7fc14743af2e1d9'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    sepolia,
    avalancheFuji,
    bscTestnet
  ],
  [w3mProvider({ projectId })],
)

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: projectId,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains);

Moralis.start({
  apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjAyYzVmMzNlLWVhNGYtNGI3MS04NGJmLWI3NDA3NmZmNGQwMCIsIm9yZ0lkIjoiODQ0OTIiLCJ1c2VySWQiOiI4NDEzNiIsInR5cGVJZCI6IjFmODc0MGZjLWY4NTUtNDllNy05MzRmLTI5NGVkMTdkNDczOSIsInR5cGUiOiJQUk9KRUNUIiwiaWF0IjoxNjg1NjExOTc3LCJleHAiOjQ4NDEzNzE5Nzd9.6OCU80IyNiCz1MqXoDDeyLTvCkQ0lFP6wFDkpsqX8zg"
});

const App = () => {
  return (
    <Router>
      <QueryParamProvider>
        <div>
          <WagmiConfig config={config}>
            <Toaster
              position="top-right"
              reverseOrder={true}
              toastOptions={{ duration: 5000 }}
            >
              {(t) => (
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => toast.dismiss(t.id)}
                >
                  <ToastBar onClick={() => alert(1)} toast={t} />
                </div>
              )}
            </Toaster>
            <Switch>
              <Route exact path="/">
                <AllLaunches />
              </Route>
              {/* <Route exact path="/MyContributions">
                <MyContributions />
              </Route> */}
              <Route exact path="/AllLaunches">
                <AllLaunches />
              </Route>
              <Route exact path="/CreateBlack">
                <CreateBlack />
              </Route>
              <Route exact path="/Buy">
                <BuyPage />
              </Route>
              <Route exact path="/Profile">
                <Profile />
              </Route>
              <Route exact path="/EditProfile">
                <EditProfile />
              </Route>
              <Route exact path="/about-us">
              <AboutUs />
            </Route>
            <Route exact path="/FAQ">
              <Faq />
            </Route>
              <Route exact path="/NotFound">
                <NotFound />
              </Route>
            </Switch>
          </WagmiConfig>
          <Web3Modal
            projectId={projectId}
            ethereumClient={ethereumClient}
          />
        </div>
      </QueryParamProvider>
    </Router>
  );
};

export default App;
