// connectors/trustWallet/trustWallet.ts
import { ConnectorNotFoundError, ResourceUnavailableError, UserRejectedRequestError } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { getClient } from "@wagmi/core";
import { getAddress } from "@ethersproject/address";
var mappingNetwork = {
  137: "polygon-pos",
  5: "eth-goerli",
  56: "bsc-mainnet",
  97: "bsc-testnet"
};
function getTrustWalletProvider() {
  var _a;
  const isTrustWallet = (ethereum) => {
    const trustWallet = !!ethereum.isTrust;
    return trustWallet;
  };
  const injectedProviderExist = typeof window !== "undefined" && typeof window.ethereum !== "undefined";
  if (!injectedProviderExist) {
    return;
  }
  if (isTrustWallet(window.ethereum)) {
    return window.ethereum;
  }
  if ((_a = window.ethereum) == null ? void 0 : _a.providers) {
    return window.ethereum.providers.find(isTrustWallet);
  }
  return window.trustwallet;
}
var TrustWalletConnector = class extends InjectedConnector {
  constructor({
    chains: _chains,
    options: _options
  } = {}) {
    const options = {
      name: "Trust Wallet",
      shimDisconnect: (_options == null ? void 0 : _options.shimDisconnect) ?? false,
      shimChainChangedDisconnect: (_options == null ? void 0 : _options.shimChainChangedDisconnect) ?? true
    };
    const chains = _chains == null ? void 0 : _chains.filter((c) => !!mappingNetwork[c.id]);
    super({
      chains,
      options
    });
    this.id = "trustWallet";
  }
  handleFailedConnect(error) {
    if (this.isUserRejectedRequestError(error)) {
      throw new UserRejectedRequestError(error);
    }
    if (error.code === -32002) {
      throw new ResourceUnavailableError(error);
    }
    throw error;
  }
  async connect({ chainId } = {}) {
    var _a, _b, _c, _d;
    try {
      const provider = await this.getProvider();
      if (!provider) {
        throw new ConnectorNotFoundError();
      }
      if (provider.on) {
        provider.on("accountsChanged", this.onAccountsChanged);
        provider.on("chainChanged", this.onChainChanged);
        provider.on("disconnect", this.onDisconnect);
      }
      this.emit("message", { type: "connecting" });
      let account = null;
      if (((_a = this.options) == null ? void 0 : _a.shimDisconnect) && !((_b = getClient().storage) == null ? void 0 : _b.getItem(this.shimDisconnectKey))) {
        account = await this.getAccount().catch(() => null);
        const isConnected = !!account;
        if (isConnected) {
          try {
            await provider.request({
              method: "wallet_requestPermissions",
              params: [{ eth_accounts: {} }]
            });
            account = await this.getAccount();
          } catch (error) {
            if (this.isUserRejectedRequestError(error)) {
              throw new UserRejectedRequestError(error);
            }
          }
        }
      }
      if (!account) {
        const accounts = await provider.request({
          method: "eth_requestAccounts"
        });
        account = getAddress(accounts[0]);
      }
      let id = await this.getChainId();
      let unsupported = this.isChainUnsupported(id);
      if (chainId && id !== chainId) {
        const chain = await this.switchChain(chainId);
        id = chain.id;
        unsupported = this.isChainUnsupported(id);
      }
      if ((_c = this.options) == null ? void 0 : _c.shimDisconnect) {
        (_d = getClient().storage) == null ? void 0 : _d.setItem(this.shimDisconnectKey, true);
      }
      return { account, chain: { id, unsupported }, provider };
    } catch (error) {
      this.handleFailedConnect(error);
    }
  }
  async getProvider() {
    return getTrustWalletProvider();
  }
};
export {
  TrustWalletConnector,
  getTrustWalletProvider
};
