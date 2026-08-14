"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  WagmiProvider: () => WagmiProvider,
  useSignMessage: () => useSignMessage,
  useWeb3LibraryContext: () => useWeb3LibraryContext,
  useWeb3React: () => useWeb3React
});
module.exports = __toCommonJS(src_exports);

// src/provider.tsx
var import_providers = require("@ethersproject/providers");
var import_react = __toESM(require("react"));
var import_immutable = __toESM(require("swr/immutable"));
var import_wagmi = require("wagmi");
var import_jsx_runtime = require("react/jsx-runtime");
function WagmiProvider(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_wagmi.WagmiConfig, {
    client: props.client,
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Web3LibraryProvider, {
      children: props.children
    })
  });
}
var Web3LibraryContext = import_react.default.createContext(void 0);
var useWeb3LibraryContext = () => {
  return import_react.default.useContext(Web3LibraryContext);
};
var Web3LibraryProvider = (props) => {
  const { connector } = (0, import_wagmi.useAccount)();
  const { chain } = (0, import_wagmi.useNetwork)();
  const { data: library } = (0, import_immutable.default)(connector && ["web3-library", connector, chain], async () => {
    const provider = await (connector == null ? void 0 : connector.getProvider());
    return new import_providers.Web3Provider(provider);
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Web3LibraryContext.Provider, {
    value: library,
    children: props.children
  });
};

// src/useWeb3React.ts
var import_wagmi2 = require("wagmi");
function useWeb3React() {
  const { chain } = (0, import_wagmi2.useNetwork)();
  const { address, connector, isConnected, isConnecting } = (0, import_wagmi2.useAccount)();
  return {
    chainId: chain == null ? void 0 : chain.id,
    account: isConnected ? address : null,
    isConnected,
    isConnecting,
    chain,
    connector
  };
}

// src/hooks/useSignMessage.ts
var import_react2 = require("react");
var import_wagmi3 = require("wagmi");
function useSignMessage() {
  const { address, connector } = (0, import_wagmi3.useAccount)();
  const { signMessageAsync: sign } = (0, import_wagmi3.useSignMessage)();
  return {
    signMessageAsync: (0, import_react2.useCallback)(
      async (args) => {
        var _a, _b;
        if ((connector == null ? void 0 : connector.id) === "bsc" && window.BinanceChain && address) {
          const res = await ((_b = (_a = window.BinanceChain).bnbSign) == null ? void 0 : _b.call(_a, address, args.message));
          if (res) {
            return res.signature;
          }
          return null;
        }
        return sign(args);
      },
      [address, connector == null ? void 0 : connector.id, sign]
    )
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WagmiProvider,
  useSignMessage,
  useWeb3LibraryContext,
  useWeb3React
});
