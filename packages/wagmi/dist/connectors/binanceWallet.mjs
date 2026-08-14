// connectors/binanceWallet/binanceWallet.ts
import {
  ConnectorNotFoundError,
  ResourceUnavailableError,
  UserRejectedRequestError,
  SwitchChainNotSupportedError
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { hexValue } from "@ethersproject/bytes";
var mappingNetwork = {
  137: "polygon-pos",
  56: "bsc-mainnet",
  97: "bsc-testnet"
};
var _binanceChainListener = async () => new Promise(
  (resolve) => Object.defineProperty(window, "BinanceChain", {
    get() {
      return this.bsc;
    },
    set(bsc) {
      this.bsc = bsc;
      resolve();
    }
  })
);
var BinanceWalletConnector = class extends InjectedConnector {
  constructor({
    chains: _chains
  } = {}) {
    const options = {
      name: "Binance",
      shimDisconnect: false,
      shimChainChangedDisconnect: true
    };
    const chains = _chains == null ? void 0 : _chains.filter((c) => !!mappingNetwork[c.id]);
    super({
      chains,
      options
    });
    this.id = "bsc";
    this.ready = typeof window !== "undefined";
  }
  async connect({ chainId } = {}) {
    try {
      const provider = await this.getProvider();
      if (!provider)
        throw new ConnectorNotFoundError();
      if (provider.on) {
        provider.on("accountsChanged", this.onAccountsChanged);
        provider.on("chainChanged", this.onChainChanged);
        provider.on("disconnect", this.onDisconnect);
      }
      this.emit("message", { type: "connecting" });
      const account = await this.getAccount();
      let id = await this.getChainId();
      let unsupported = this.isChainUnsupported(id);
      if (chainId && id !== chainId) {
        const chain = await this.switchChain(chainId);
        id = chain.id;
        unsupported = this.isChainUnsupported(id);
      }
      return { account, chain: { id, unsupported }, provider };
    } catch (error) {
      if (this.isUserRejectedRequestError(error))
        throw new UserRejectedRequestError(error);
      if (error.code === -32002)
        throw new ResourceUnavailableError(error);
      throw error;
    }
  }
  async getProvider() {
    if (typeof window !== "undefined") {
      if (window.BinanceChain) {
        this.provider = window.BinanceChain;
      } else {
        await _binanceChainListener();
        this.provider = window.BinanceChain;
      }
    }
    return this.provider;
  }
  async switchChain(chainId) {
    var _a;
    const provider = await this.getProvider();
    if (!provider)
      throw new ConnectorNotFoundError();
    const id = hexValue(chainId);
    if (mappingNetwork[chainId]) {
      try {
        await ((_a = provider.switchNetwork) == null ? void 0 : _a.call(provider, mappingNetwork[chainId]));
        return this.chains.find((x) => x.id === chainId) || {
          id: chainId,
          name: `Chain ${id}`,
          network: `${id}`,
          nativeCurrency: { decimals: 18, name: "BNB", symbol: "BNB" },
          rpcUrls: { default: { http: [""] } }
        };
      } catch (error) {
        if (error.error === "user rejected") {
          throw new UserRejectedRequestError(error);
        }
      }
    }
    throw new SwitchChainNotSupportedError({ connector: this });
  }
};
export {
  BinanceWalletConnector
};
