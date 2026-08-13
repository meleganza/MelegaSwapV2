// src/provider.tsx
import { Web3Provider } from "@ethersproject/providers";
import React from "react";
import useSWRImmutable from "swr/immutable";
import { useAccount, WagmiConfig, useNetwork } from "wagmi";
import { jsx } from "react/jsx-runtime";
function WagmiProvider(props) {
  return /* @__PURE__ */ jsx(WagmiConfig, {
    client: props.client,
    children: /* @__PURE__ */ jsx(Web3LibraryProvider, {
      children: props.children
    })
  });
}
var Web3LibraryContext = React.createContext(void 0);
var useWeb3LibraryContext = () => {
  return React.useContext(Web3LibraryContext);
};
var Web3LibraryProvider = (props) => {
  const { connector } = useAccount();
  const { chain } = useNetwork();
  const { data: library } = useSWRImmutable(connector && ["web3-library", connector, chain], async () => {
    const provider = await (connector == null ? void 0 : connector.getProvider());
    return new Web3Provider(provider);
  });
  return /* @__PURE__ */ jsx(Web3LibraryContext.Provider, {
    value: library,
    children: props.children
  });
};

// src/useWeb3React.ts
import { useAccount as useAccount2, useNetwork as useNetwork2 } from "wagmi";
function useWeb3React() {
  const { chain } = useNetwork2();
  const { address, connector, isConnected, isConnecting } = useAccount2();
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
import { useCallback } from "react";
import { useAccount as useAccount3, useSignMessage as useSignMessageWagmi } from "wagmi";
function useSignMessage() {
  const { address, connector } = useAccount3();
  const { signMessageAsync: sign } = useSignMessageWagmi();
  return {
    signMessageAsync: useCallback(
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
export {
  WagmiProvider,
  useSignMessage,
  useWeb3LibraryContext,
  useWeb3React
};
