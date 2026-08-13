"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// connectors/binanceWallet/index.ts
var binanceWallet_exports = {};
__export(binanceWallet_exports, {
  BinanceWalletConnector: () => BinanceWalletConnector
});
module.exports = __toCommonJS(binanceWallet_exports);

// connectors/binanceWallet/binanceWallet.ts
var import_wagmi = require("wagmi");
var import_injected = require("wagmi/connectors/injected");
var import_bytes = require("@ethersproject/bytes");
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
var BinanceWalletConnector = class extends import_injected.InjectedConnector {
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
        throw new import_wagmi.ConnectorNotFoundError();
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
        throw new import_wagmi.UserRejectedRequestError(error);
      if (error.code === -32002)
        throw new import_wagmi.ResourceUnavailableError(error);
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
      throw new import_wagmi.ConnectorNotFoundError();
    const id = (0, import_bytes.hexValue)(chainId);
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
          throw new import_wagmi.UserRejectedRequestError(error);
        }
      }
    }
    throw new import_wagmi.SwitchChainNotSupportedError({ connector: this });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BinanceWalletConnector
});
