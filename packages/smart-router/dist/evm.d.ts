import { ChainId, Token, BestTradeOptions as BestTradeOptions$1, Pair as Pair$1, Currency, CurrencyAmount, Price, Percent, TradeType, BigintIsh, JSBI } from '@pancakeswap/sdk';
import { Provider as Provider$1 } from '@ethersproject/providers';

type ChainMap<T> = {
    readonly [chainId in ChainId]: T;
};
type ChainTokenList = ChainMap<Token[]>;

type Provider = ({ chainId }: {
    chainId?: ChainId;
}) => Provider$1;
interface BestTradeOptions extends BestTradeOptions$1 {
    provider: Provider;
    allCommonPairs?: Pair$1[] | ((one: Currency, another: Currency) => Promise<Pair$1[]> | Pair$1[]);
}
declare enum RouteType {
    V2 = 0,
    STABLE_SWAP = 1,
    MIXED = 2
}

interface BasePair {
    token0: Currency;
    token1: Currency;
    reserve0: CurrencyAmount<Currency>;
    reserve1: CurrencyAmount<Currency>;
    involvesToken: (token: Currency) => boolean;
}

interface BaseRoute<TInput extends Currency, TOutput extends Currency, TPair extends BasePair | Pair$1> {
    pairs: TPair[];
    input: TInput;
    output: TOutput;
    path: Currency[];
}

interface StableSwapPair extends BasePair {
    stableSwapAddress: string;
    price: Price<Currency, Currency>;
    fee: Percent;
    adminFee: Percent;
}
type Pair = Pair$1 | StableSwapPair;
interface RouteWithStableSwap<TInput extends Currency, TOutput extends Currency> extends BaseRoute<TInput, TOutput, Pair> {
    routeType: RouteType;
}
interface TradeWithStableSwap<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType> {
    tradeType: TTradeType;
    route: RouteWithStableSwap<TInput, TOutput>;
    inputAmount: CurrencyAmount<TInput>;
    outputAmount: CurrencyAmount<TOutput>;
}
interface StableSwapFeeRaw {
    fee: CurrencyAmount<Currency>;
    adminFee: CurrencyAmount<Currency>;
}
interface StableSwapFeePercent {
    fee: Percent;
    adminFee: Percent;
}

declare const getBestTradeExactIn: (amountIn: CurrencyAmount<Currency>, output: Currency, options: BestTradeOptions) => Promise<TradeWithStableSwap<Currency, Currency, TradeType> | null>;
declare const getBestTradeExactOut: (amountIn: CurrencyAmount<Currency>, output: Currency, options: BestTradeOptions) => Promise<TradeWithStableSwap<Currency, Currency, TradeType> | null>;

declare const Trade: {
    maximumAmountIn: typeof maximumAmountIn;
    minimumAmountOut: typeof minimumAmountOut;
    executionPrice: typeof executionPrice;
    priceImpact: typeof priceImpact;
};
/**
 * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
 */
declare function maximumAmountIn<TIn extends Currency, TOut extends Currency, TTradeType extends TradeType>(trade: TradeWithStableSwap<TIn, TOut, TTradeType>, slippageTolerance: Percent): CurrencyAmount<TIn>;
/**
 * Get the minimum amount that must be received from this trade for the given slippage tolerance
 */
declare function minimumAmountOut<TIn extends Currency, TOut extends Currency, TTradeType extends TradeType>(trade: TradeWithStableSwap<TIn, TOut, TTradeType>, slippageTolerance: Percent): CurrencyAmount<TOut>;
declare function executionPrice<TIn extends Currency, TOut extends Currency, TTradeType extends TradeType>({ inputAmount, outputAmount, }: TradeWithStableSwap<TIn, TOut, TTradeType>): Price<TIn, TOut>;
declare function priceImpact<TIn extends Currency, TOut extends Currency, TTradeType extends TradeType>({ route, inputAmount, outputAmount, }: TradeWithStableSwap<TIn, TOut, TTradeType>): Percent;

declare function getMidPrice<TIn extends Currency, TOut extends Currency>(route: RouteWithStableSwap<TIn, TOut>): Price<TIn, TOut>;

declare const Route: {
    midPrice: typeof getMidPrice;
};

declare enum PairState {
    LOADING = 0,
    NOT_EXISTS = 1,
    EXISTS = 2,
    INVALID = 3
}
interface Options {
    provider: Provider;
}
declare function getAllCommonPairs(currencyA: Currency, currencyB: Currency, { provider }: Options): Promise<Pair$1[]>;

interface GetLPOutputParams {
    amplifier: BigintIsh;
    balances: CurrencyAmount<Currency>[];
    amounts: CurrencyAmount<Currency>[];
    totalSupply: CurrencyAmount<Currency>;
    fee: Percent;
}
declare function getLPOutput({ amplifier, balances, totalSupply, amounts, fee, }: GetLPOutputParams): CurrencyAmount<Currency>;

declare function getLPOutputWithoutFee(params: Omit<GetLPOutputParams, 'fee'>): CurrencyAmount<Currency>;

interface GetSwapOutputParams {
    amplifier: BigintIsh;
    balances: CurrencyAmount<Currency>[];
    amount: CurrencyAmount<Currency>;
    outputCurrency: Currency;
    fee: Percent;
}
declare function getSwapOutput({ amplifier, balances: balanceAmounts, outputCurrency, amount, fee, }: GetSwapOutputParams): CurrencyAmount<Currency>;
declare function getSwapOutputWithoutFee(params: Omit<GetSwapOutputParams, 'fee'>): CurrencyAmount<Currency>;

interface Params {
    amplifier: BigintIsh;
    balances: BigintIsh[];
}
/**
 * Calculate the constant D of Curve AMM formula
 * @see https://classic.curve.fi/files/stableswap-paper.pdf
 */
declare function getD({ amplifier, balances }: Params): JSBI;

declare function createStableSwapPair(pair: Omit<BasePair, 'involvesToken'>, stableSwapAddress?: string): StableSwapPair;

declare const StableSwap: {
    getSwapOutput: typeof getSwapOutput;
    getSwapOutputWithoutFee: typeof getSwapOutputWithoutFee;
    getLPOutputWithoutFee: typeof getLPOutputWithoutFee;
    getLPOutput: typeof getLPOutput;
    getD: typeof getD;
};

declare function isStableSwapPair(pair: Pair): pair is StableSwapPair;

export { BestTradeOptions, ChainMap, ChainTokenList, Pair, PairState, Provider, Route, RouteType, RouteWithStableSwap, StableSwap, StableSwapFeePercent, StableSwapFeeRaw, StableSwapPair, Trade, TradeWithStableSwap, createStableSwapPair, getAllCommonPairs, getBestTradeExactIn, getBestTradeExactOut, isStableSwapPair };
