import { Chain } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { Ethereum } from '@wagmi/core';

declare global {
    interface Window {
        BinanceChain?: {
            bnbSign?: (address: string, message: string) => Promise<{
                publicKey: string;
                signature: string;
            }>;
            switchNetwork?: (networkId: string) => Promise<string>;
        } & Ethereum;
    }
}
declare class BinanceWalletConnector extends InjectedConnector {
    readonly id = "bsc";
    readonly ready: boolean;
    provider?: Window['BinanceChain'];
    constructor({ chains: _chains, }?: {
        chains?: Chain[];
    });
    connect({ chainId }?: {
        chainId?: number;
    }): Promise<{
        account: `0x${string}`;
        chain: {
            id: number;
            unsupported: boolean;
        };
        provider: {
            bnbSign?: ((address: string, message: string) => Promise<{
                publicKey: string;
                signature: string;
            }>) | undefined;
            switchNetwork?: ((networkId: string) => Promise<string>) | undefined;
        } & Ethereum;
    }>;
    getProvider(): Promise<({
        bnbSign?: ((address: string, message: string) => Promise<{
            publicKey: string;
            signature: string;
        }>) | undefined;
        switchNetwork?: ((networkId: string) => Promise<string>) | undefined;
    } & Ethereum) | undefined>;
    switchChain(chainId: number): Promise<Chain>;
}

export { BinanceWalletConnector };
