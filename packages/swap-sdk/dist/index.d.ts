export { default as JSBI } from 'jsbi';
import { Token, Percent, CurrencyAmount, Price, BigintIsh, Currency, TradeType, NativeCurrency } from '@pancakeswap/swap-sdk-core';
export * from '@pancakeswap/swap-sdk-core';

declare class ERC20Token extends Token {
    constructor(chainId: number, address: string, decimals: number, symbol: string, name?: string, projectLink?: string);
}

declare enum ChainId {
    ETHEREUM = 1,
    BSC = 56,
    BSC_TESTNET = 97,
    BASE = 8453,
    POLYGON = 137,
    ARBITRUM = 42161,
    SHIMMER2 = 148,
    AVAX = 43114,
    FANTOM = 250,
    CRONOS = 25,
    PULSE = 369,
    OPTIMISM = 10,
    ZKSYNC = 324
}
declare const ZERO_PERCENT: Percent;
declare const ONE_HUNDRED_PERCENT: Percent;
declare const FACTORY_ADDRESS = "0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C";
declare const FACTORY_ADDRESS_MAP: Record<number, string>;
declare const INIT_CODE_HASH = "0x5547397b1a1ae1e97b89728e7a77fdc2a6b167647566f81793b3b72fb8fde0f5";
declare const INIT_CODE_HASH_MAP: Record<number, string>;
declare const WETH9: {
    1: ERC20Token;
    56: ERC20Token;
    97: ERC20Token;
    8453: ERC20Token;
    137: ERC20Token;
    42161: ERC20Token;
    324: ERC20Token;
    10: ERC20Token;
    250: ERC20Token;
    43114: ERC20Token;
    25: ERC20Token;
    369: ERC20Token;
    148: ERC20Token;
};
declare const WBNB: {
    1: ERC20Token;
    56: ERC20Token;
    8453: ERC20Token;
    137: ERC20Token;
};
declare const WNATIVE: Record<number, ERC20Token>;
declare const NATIVE: Record<number, {
    name: string;
    symbol: string;
    decimals: number;
}>;

declare const computePairAddress: ({ factoryAddress, tokenA, tokenB, }: {
    factoryAddress: string;
    tokenA: ERC20Token;
    tokenB: ERC20Token;
}) => string;
declare class Pair {
    readonly liquidityToken: ERC20Token;
    private readonly tokenAmounts;
    static getAddress(tokenA: ERC20Token, tokenB: ERC20Token): string;
    constructor(currencyAmountA: CurrencyAmount<ERC20Token>, tokenAmountB: CurrencyAmount<ERC20Token>);
    /**
     * Returns true if the token is either token0 or token1
     * @param token to check
     */
    involvesToken(token: ERC20Token): boolean;
    /**
     * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
     */
    get token0Price(): Price<ERC20Token, ERC20Token>;
    /**
     * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
     */
    get token1Price(): Price<ERC20Token, ERC20Token>;
    /**
     * Return the price of the given token in terms of the other token in the pair.
     * @param token token to return price of
     */
    priceOf(token: ERC20Token): Price<ERC20Token, ERC20Token>;
    /**
     * Returns the chain ID of the tokens in the pair.
     */
    get chainId(): number;
    get token0(): ERC20Token;
    get token1(): ERC20Token;
    get reserve0(): CurrencyAmount<ERC20Token>;
    get reserve1(): CurrencyAmount<ERC20Token>;
    reserveOf(token: ERC20Token): CurrencyAmount<ERC20Token>;
    getOutputAmount(inputAmount: CurrencyAmount<ERC20Token>): [CurrencyAmount<ERC20Token>, Pair];
    getInputAmount(outputAmount: CurrencyAmount<ERC20Token>): [CurrencyAmount<ERC20Token>, Pair];
    getLiquidityMinted(totalSupply: CurrencyAmount<ERC20Token>, tokenAmountA: CurrencyAmount<ERC20Token>, tokenAmountB: CurrencyAmount<ERC20Token>): CurrencyAmount<ERC20Token>;
    getLiquidityValue(token: ERC20Token, totalSupply: CurrencyAmount<ERC20Token>, liquidity: CurrencyAmount<ERC20Token>, feeOn?: boolean, kLast?: BigintIsh): CurrencyAmount<ERC20Token>;
}

declare class Route<TInput extends Currency, TOutput extends Currency> {
    readonly pairs: Pair[];
    readonly path: Token[];
    readonly input: TInput;
    readonly output: TOutput;
    constructor(pairs: Pair[], input: TInput, output: TOutput);
    private _midPrice;
    get midPrice(): Price<TInput, TOutput>;
    get chainId(): number;
}

interface InputOutput<TInput extends Currency, TOutput extends Currency> {
    readonly inputAmount: CurrencyAmount<TInput>;
    readonly outputAmount: CurrencyAmount<TOutput>;
}
declare function inputOutputComparator<TInput extends Currency, TOutput extends Currency>(a: InputOutput<TInput, TOutput>, b: InputOutput<TInput, TOutput>): number;
declare function tradeComparator<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType>(a: Trade<TInput, TOutput, TTradeType>, b: Trade<TInput, TOutput, TTradeType>): number;
interface BestTradeOptions {
    maxNumResults?: number;
    maxHops?: number;
}
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
declare class Trade<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType> {
    /**
     * The route of the trade, i.e. which pairs the trade goes through and the input/output currencies.
     */
    readonly route: Route<TInput, TOutput>;
    /**
     * The type of the trade, either exact in or exact out.
     */
    readonly tradeType: TTradeType;
    /**
     * The input amount for the trade assuming no slippage.
     */
    readonly inputAmount: CurrencyAmount<TInput>;
    /**
     * The output amount for the trade assuming no slippage.
     */
    readonly outputAmount: CurrencyAmount<TOutput>;
    /**
     * The price expressed in terms of output amount/input amount.
     */
    readonly executionPrice: Price<TInput, TOutput>;
    /**
     * The percent difference between the mid price before the trade and the trade execution price.
     */
    readonly priceImpact: Percent;
    /**
     * Constructs an exact in trade with the given amount in and route
     * @param route route of the exact in trade
     * @param amountIn the amount being passed in
     */
    static exactIn<TInput extends Currency, TOutput extends Currency>(route: Route<TInput, TOutput>, amountIn: CurrencyAmount<TInput>): Trade<TInput, TOutput, TradeType.EXACT_INPUT>;
    /**
     * Constructs an exact out trade with the given amount out and route
     * @param route route of the exact out trade
     * @param amountOut the amount returned by the trade
     */
    static exactOut<TInput extends Currency, TOutput extends Currency>(route: Route<TInput, TOutput>, amountOut: CurrencyAmount<TOutput>): Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>;
    constructor(route: Route<TInput, TOutput>, amount: TTradeType extends TradeType.EXACT_INPUT ? CurrencyAmount<TInput> : CurrencyAmount<TOutput>, tradeType: TTradeType);
    /**
     * Get the minimum amount that must be received from this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    minimumAmountOut(slippageTolerance: Percent): CurrencyAmount<TOutput>;
    /**
     * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    maximumAmountIn(slippageTolerance: Percent): CurrencyAmount<TInput>;
    /**
     * Given a list of pairs, and a fixed amount in, returns the top `maxNumResults` trades that go from an input token
     * amount to an output token, making at most `maxHops` hops.
     * Note this does not consider aggregation, as routes are linear. It's possible a better route exists by splitting
     * the amount in among multiple routes.
     * @param pairs the pairs to consider in finding the best trade
     * @param nextAmountIn exact amount of input currency to spend
     * @param currencyOut the desired currency out
     * @param maxNumResults maximum number of results to return
     * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
     * @param currentPairs used in recursion; the current list of pairs
     * @param currencyAmountIn used in recursion; the original value of the currencyAmountIn parameter
     * @param bestTrades used in recursion; the current list of best trades
     */
    static bestTradeExactIn<TInput extends Currency, TOutput extends Currency>(pairs: Pair[], currencyAmountIn: CurrencyAmount<TInput>, currencyOut: TOutput, { maxNumResults, maxHops }?: BestTradeOptions, currentPairs?: Pair[], nextAmountIn?: CurrencyAmount<Currency>, bestTrades?: Trade<TInput, TOutput, TradeType.EXACT_INPUT>[]): Trade<TInput, TOutput, TradeType.EXACT_INPUT>[];
    /**
     * Return the execution price after accounting for slippage tolerance
     * @param slippageTolerance the allowed tolerated slippage
     */
    worstExecutionPrice(slippageTolerance: Percent): Price<TInput, TOutput>;
    /**
     * similar to the above method but instead targets a fixed output amount
     * given a list of pairs, and a fixed amount out, returns the top `maxNumResults` trades that go from an input token
     * to an output token amount, making at most `maxHops` hops
     * note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
     * the amount in among multiple routes.
     * @param pairs the pairs to consider in finding the best trade
     * @param currencyIn the currency to spend
     * @param nextAmountOut the exact amount of currency out
     * @param maxNumResults maximum number of results to return
     * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
     * @param currentPairs used in recursion; the current list of pairs
     * @param currencyAmountOut used in recursion; the original value of the currencyAmountOut parameter
     * @param bestTrades used in recursion; the current list of best trades
     */
    static bestTradeExactOut<TInput extends Currency, TOutput extends Currency>(pairs: Pair[], currencyIn: TInput, currencyAmountOut: CurrencyAmount<TOutput>, { maxNumResults, maxHops }?: BestTradeOptions, currentPairs?: Pair[], nextAmountOut?: CurrencyAmount<Currency>, bestTrades?: Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>[]): Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>[];
}

/**
 *
 * Native is the main usage of a 'native' currency, i.e. for BSC mainnet and all testnets
 */
declare class Native extends NativeCurrency {
    protected constructor({ chainId, decimals, name, symbol, }: {
        chainId: number;
        decimals: number;
        symbol: string;
        name: string;
    });
    get wrapped(): Token;
    private static cache;
    static onChain(chainId: number): Native;
    equals(other: Currency): boolean;
}

declare function isTradeBetter(tradeA: Trade<Currency, Currency, TradeType> | undefined | null, tradeB: Trade<Currency, Currency, TradeType> | undefined | null, minimumDelta?: Percent): boolean | undefined;

/**
 * Options for producing the arguments to send call to the router.
 */
interface TradeOptions {
    /**
     * How much the execution price is allowed to move unfavorably from the trade execution price.
     */
    allowedSlippage: Percent;
    /**
     * How long the swap is valid until it expires, in seconds.
     * This will be used to produce a `deadline` parameter which is computed from when the swap call parameters
     * are generated.
     */
    ttl: number;
    /**
     * The account that should receive the output of the swap.
     */
    recipient: string;
    /**
     * Whether any of the tokens in the path are fee on transfer tokens, which should be handled with special methods
     */
    feeOnTransfer?: boolean;
}
interface TradeOptionsDeadline extends Omit<TradeOptions, 'ttl'> {
    /**
     * When the transaction expires.
     * This is an atlernate to specifying the ttl, for when you do not want to use local time.
     */
    deadline: number;
}
/**
 * The parameters to use in the call to the Pancake Router to execute a trade.
 */
interface SwapParameters {
    /**
     * The method to call on the Pancake Router.
     */
    methodName: string;
    /**
     * The arguments to pass to the method, all hex encoded.
     */
    args: (string | string[])[];
    /**
     * The amount of wei to send in hex.
     */
    value: string;
}
/**
 * Represents the Pancake Router, and has static methods for helping execute trades.
 */
declare abstract class Router {
    /**
     * Cannot be constructed.
     */
    private constructor();
    /**
     * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
     * @param trade to produce call parameters for
     * @param options options for the call parameters
     */
    static swapCallParameters(trade: Trade<Currency, Currency, TradeType>, options: TradeOptions | TradeOptionsDeadline): SwapParameters;
}

export { BestTradeOptions, ChainId, ERC20Token, FACTORY_ADDRESS, FACTORY_ADDRESS_MAP, INIT_CODE_HASH, INIT_CODE_HASH_MAP, NATIVE, Native, ONE_HUNDRED_PERCENT, Pair, Route, Router, SwapParameters, Trade, TradeOptions, TradeOptionsDeadline, WBNB, WETH9, WNATIVE, ZERO_PERCENT, computePairAddress, inputOutputComparator, isTradeBetter, tradeComparator };
