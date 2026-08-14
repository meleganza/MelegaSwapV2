import { Chain } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { Ethereum } from '@wagmi/core';

declare global {
    interface Window {
        trustwallet?: Ethereum;
    }
}
declare function getTrustWalletProvider(): Ethereum | undefined;
declare class TrustWalletConnector extends InjectedConnector {
    readonly id = "trustWallet";
    constructor({ chains: _chains, options: _options, }?: {
        chains?: Chain[];
        options?: {
            shimDisconnect?: boolean;
            shimChainChangedDisconnect?: boolean;
        };
    });
    private handleFailedConnect;
    connect({ chainId }?: {
        chainId?: number;
    }): Promise<{
        account: `0x${string}`;
        chain: {
            id: number;
            unsupported: boolean;
        };
        provider: Ethereum;
    }>;
    getProvider(): Promise<Ethereum | undefined>;
}

export { TrustWalletConnector, getTrustWalletProvider };
