import * as _ethersproject_providers from '@ethersproject/providers';
import { Chain } from 'wagmi';
import { Connector } from '@wagmi/core';
import { EthereumProviderInterface } from '@blocto/sdk';

declare class BloctoConnector extends Connector<EthereumProviderInterface, {
    defaultChainId: number;
    appId?: string;
}> {
    readonly id = "blocto";
    readonly name = "Blocto";
    readonly ready: boolean;
    provider?: EthereumProviderInterface;
    constructor(config?: {
        chains?: Chain[];
        options: {
            defaultChainId: number;
            appId?: string;
        };
    });
    connect({ chainId }?: {
        chainId?: number;
    }): Promise<{
        account: `0x${string}`;
        chain: {
            id: number;
            unsupported: boolean;
        };
        provider: EthereumProviderInterface;
    }>;
    getProvider({ chainId }?: {
        chainId?: number;
    }): Promise<EthereumProviderInterface>;
    isAuthorized(): Promise<boolean>;
    getSigner({ chainId }?: {
        chainId?: number;
    }): Promise<_ethersproject_providers.JsonRpcSigner>;
    getAccount(): Promise<`0x${string}`>;
    getChainId(): Promise<number>;
    protected onAccountsChanged: (accounts: string[]) => void;
    protected onChainChanged: (chainId: number | string) => void;
    protected onDisconnect: () => void;
    disconnect(): Promise<void>;
    protected isUserRejectedRequestError(error: unknown): boolean;
}

export { BloctoConnector };
