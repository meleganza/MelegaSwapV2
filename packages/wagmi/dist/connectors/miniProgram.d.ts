import { Chain } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

declare global {
    interface Window {
        bn?: any;
    }
}
declare class MiniProgramConnector extends InjectedConnector {
    readonly id = "miniprogram";
    readonly ready: boolean;
    provider?: any;
    getWeb3Provider?: any;
    constructor({ chains, getWeb3Provider }: {
        getWeb3Provider: () => any;
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
        provider: any;
    }>;
    getAccount(): Promise<`0x${string}`>;
    getChainId(): Promise<number>;
    getProvider(): Promise<any>;
}

export { MiniProgramConnector };
