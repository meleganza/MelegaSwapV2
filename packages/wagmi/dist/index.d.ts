import { Web3Provider } from '@ethersproject/providers';
import React from 'react';
import { WagmiConfigProps } from 'wagmi';
import { Provider, WebSocketProvider, SignMessageArgs } from '@wagmi/core';
import * as _wagmi_connectors_dist_base_6b5431a5 from '@wagmi/connectors/dist/base-6b5431a5';
import * as _wagmi_chains from '@wagmi/chains';

declare function WagmiProvider<TProvider extends Provider, TWebSocketProvider extends WebSocketProvider>(props: React.PropsWithChildren<WagmiConfigProps<TProvider, TWebSocketProvider>>): JSX.Element;
declare const useWeb3LibraryContext: () => Web3Provider | undefined;

declare function useWeb3React(): {
    chainId: number | undefined;
    account: `0x${string}` | null | undefined;
    isConnected: boolean;
    isConnecting: boolean;
    chain: (_wagmi_chains.Chain & {
        unsupported?: boolean | undefined;
    }) | undefined;
    connector: _wagmi_connectors_dist_base_6b5431a5.C<any, any, any> | undefined;
};

declare function useSignMessage(): {
    signMessageAsync: (args: SignMessageArgs) => Promise<string | null>;
};

export { WagmiProvider, useSignMessage, useWeb3LibraryContext, useWeb3React };
