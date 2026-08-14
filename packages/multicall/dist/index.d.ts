import { Contract, CallOverrides } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/providers';
import { ChainId } from '@pancakeswap/sdk';

declare const multicallAddresses: {
    1: string;
    56: string;
    8453: string;
    137: string;
    42161: string;
    43114: string;
    250: string;
    25: string;
    369: string;
    10: string;
    324: string;
    148: string;
    97: string;
};
declare const getMulticallContract: (chainId: ChainId, provider: Provider) => Contract | null;
interface Call {
    address: string;
    name: string;
    params?: any[];
}
interface MulticallOptions extends CallOverrides {
    requireSuccess?: boolean;
}
/**
 * Multicall V2 uses the new "tryAggregate" function. It is different in 2 ways
 *
 * 1. If "requireSuccess" is false multicall will not bail out if one of the calls fails
 * 2. The return includes a boolean whether the call was successful e.g. [wasSuccessful, callResult]
 */
interface MulticallV2Params {
    abi: any[];
    calls: Call[];
    chainId?: ChainId;
    options?: MulticallOptions;
    provider?: Provider;
}
interface CallV3 extends Call {
    abi: any[];
    allowFailure?: boolean;
}
interface MulticallV3Params {
    calls: CallV3[];
    chainId?: ChainId;
    allowFailure?: boolean;
    overrides?: CallOverrides;
}
type MultiCallV2 = <T = any>(params: MulticallV2Params) => Promise<T>;
type MultiCall = <T = any>(abi: any[], calls: Call[], chainId?: ChainId) => Promise<T>;
declare function createMulticall<TProvider extends Provider>(provider: ({ chainId }: {
    chainId?: number | undefined;
}) => TProvider): {
    multicall: MultiCall;
    multicallv2: MultiCallV2;
    multicallv3: ({ calls, chainId, allowFailure, overrides }: MulticallV3Params) => Promise<any>;
};

export { Call, CallV3, MultiCall, MultiCallV2, MulticallOptions, createMulticall, getMulticallContract, multicallAddresses };
