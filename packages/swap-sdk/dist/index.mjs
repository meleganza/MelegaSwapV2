// src/index.ts
import JSBI2 from "jsbi";

// src/constants.ts
import { Percent } from "@pancakeswap/swap-sdk-core";

// src/entities/token.ts
import { Token } from "@pancakeswap/swap-sdk-core";

// src/utils.ts
import { getAddress } from "@ethersproject/address";
import invariant from "tiny-invariant";
import warning from "tiny-warning";
function validateAndParseAddress(address) {
  try {
    const checksummedAddress = getAddress(address);
    warning(address === checksummedAddress, `${address} is not checksummed.`);
    return checksummedAddress;
  } catch (error) {
    invariant(false, `${address} is not a valid address.`);
  }
}

// src/entities/token.ts
var ERC20Token = class extends Token {
  constructor(chainId, address, decimals, symbol, name, projectLink) {
    super(chainId, validateAndParseAddress(address), decimals, symbol, name, projectLink);
  }
};

// src/constants.ts
var ChainId = /* @__PURE__ */ ((ChainId2) => {
  ChainId2[ChainId2["ETHEREUM"] = 1] = "ETHEREUM";
  ChainId2[ChainId2["BSC"] = 56] = "BSC";
  ChainId2[ChainId2["BSC_TESTNET"] = 97] = "BSC_TESTNET";
  ChainId2[ChainId2["BASE"] = 8453] = "BASE";
  ChainId2[ChainId2["POLYGON"] = 137] = "POLYGON";
  ChainId2[ChainId2["ARBITRUM"] = 42161] = "ARBITRUM";
  ChainId2[ChainId2["SHIMMER2"] = 148] = "SHIMMER2";
  ChainId2[ChainId2["AVAX"] = 43114] = "AVAX";
  ChainId2[ChainId2["FANTOM"] = 250] = "FANTOM";
  ChainId2[ChainId2["CRONOS"] = 25] = "CRONOS";
  ChainId2[ChainId2["PULSE"] = 369] = "PULSE";
  ChainId2[ChainId2["OPTIMISM"] = 10] = "OPTIMISM";
  ChainId2[ChainId2["ZKSYNC"] = 324] = "ZKSYNC";
  return ChainId2;
})(ChainId || {});
var ZERO_PERCENT = new Percent("0");
var ONE_HUNDRED_PERCENT = new Percent("1");
var FACTORY_ADDRESS = "0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C";
var FACTORY_ADDRESS_MAP = {
  [1 /* ETHEREUM */]: "0x149EE9245E5eD52a89Ea777d19AD3A5D87873680",
  [56 /* BSC */]: FACTORY_ADDRESS,
  [97 /* BSC_TESTNET */]: "0x6725F303b657a9451d8BA641348b6761A6CC7a17",
  [8453 /* BASE */]: "0x78fA7Fa39CF6544DD9768A75d8Ad8C45854aE530",
  [137 /* POLYGON */]: "0x2541DBEa199a22501D75EA141627776Bd4EefC80",
  [42161 /* ARBITRUM */]: "0x816ddf4e751dfe6a5e65837f721c5fd971108ede",
  [43114 /* AVAX */]: "0xFF8EBf8edf1C533A02d066f852788773BdCD631C"
};
var INIT_CODE_HASH = "0x5547397b1a1ae1e97b89728e7a77fdc2a6b167647566f81793b3b72fb8fde0f5";
var INIT_CODE_HASH_MAP = {
  [1 /* ETHEREUM */]: "0x70bab120b879463f253c7412d8c12623f1aa971a04d97ba3ffd0e5f5c42e1405",
  [56 /* BSC */]: INIT_CODE_HASH,
  [97 /* BSC_TESTNET */]: "0x57224589c67f3f30a6b0d7ffa1c4d31a992c0afd7db71bd78779ba44415c0fba",
  [8453 /* BASE */]: "0x1e6e24914b2abfdd5ec33609095c9b570a9e1dc137992c0995bb45f57cf1932a",
  [137 /* POLYGON */]: "0x8c114e6d042bd14975f9a4dfbeb0c15c35a0b30acf8e0bd3432b551b131c46b1",
  [42161 /* ARBITRUM */]: "0x123df41ea13c641f83ba2697ca5238ee7c981d281c2b18dd1a5b34c0408c80cc",
  [43114 /* AVAX */]: "0x61d8b54c70e4fa58ec2fa33190002b375d3e6e19d891be1b158ba25e0886eea2"
};
var WETH9 = {
  [1 /* ETHEREUM */]: new ERC20Token(1 /* ETHEREUM */, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18, "WETH", "Wrapped Ether", "https://weth.io"),
  [56 /* BSC */]: new ERC20Token(56 /* BSC */, "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", 18, "WBNB", "Wrapped BNB", "https://binance.com"),
  [97 /* BSC_TESTNET */]: new ERC20Token(97 /* BSC_TESTNET */, "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd", 18, "WBNB", "Wrapped BNB", "https://testnet.binance.org/"),
  [8453 /* BASE */]: new ERC20Token(8453 /* BASE */, "0x4200000000000000000000000000000000000006", 18, "WETH", "Wrapped Ether", "https://weth.io"),
  [137 /* POLYGON */]: new ERC20Token(137 /* POLYGON */, "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", 18, "WMATIC", "Wrapped Matic", "https://polygon.technology/"),
  [42161 /* ARBITRUM */]: new ERC20Token(42161 /* ARBITRUM */, "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", 18, "WETH", "Wrapped Ether", "https://weth.io"),
  [324 /* ZKSYNC */]: new ERC20Token(324 /* ZKSYNC */, "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91", 18, "WETH", "Wrapped Ether", "https://weth.io"),
  [10 /* OPTIMISM */]: new ERC20Token(10 /* OPTIMISM */, "0x4200000000000000000000000000000000000006", 18, "WETH", "Wrapped Ether", "https://weth.io"),
  [250 /* FANTOM */]: new ERC20Token(250 /* FANTOM */, "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", 18, "WFTM", "Wrapped Fantom", ""),
  [43114 /* AVAX */]: new ERC20Token(43114 /* AVAX */, "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", 18, "WAVAX", "Wrapped AVAX", ""),
  [25 /* CRONOS */]: new ERC20Token(25 /* CRONOS */, "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", 18, "WCRO", "Wrapped CRO", ""),
  [369 /* PULSE */]: new ERC20Token(369 /* PULSE */, "0xA1077a294dDE1B09bB078844df40758a5D0f9a27", 18, "WPLS", "Wrapped Pulse", ""),
  [148 /* SHIMMER2 */]: new ERC20Token(148 /* SHIMMER2 */, "0x16bb40487386d83E042968FDDF2e72475eddF837", 18, "WSMR", "Wrapped Shimmer", "")
};
var WBNB = {
  [1 /* ETHEREUM */]: new ERC20Token(1 /* ETHEREUM */, "0x418D75f65a02b3D53B2418FB8E1fe493759c7605", 18, "WBNB", "Wrapped BNB", "https://www.binance.org"),
  [56 /* BSC */]: new ERC20Token(56 /* BSC */, "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", 18, "WBNB", "Wrapped BNB", "https://www.binance.org"),
  [8453 /* BASE */]: new ERC20Token(8453 /* BASE */, "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", 18, "WBNB", "Wrapped BNB", "https://www.binance.org"),
  [137 /* POLYGON */]: new ERC20Token(137 /* POLYGON */, "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", 18, "WBNB", "Wrapped BNB", "https://www.binance.org")
};
var WNATIVE = {
  [1 /* ETHEREUM */]: WETH9[1 /* ETHEREUM */],
  [56 /* BSC */]: WBNB[56 /* BSC */],
  [97 /* BSC_TESTNET */]: WETH9[97 /* BSC_TESTNET */],
  [8453 /* BASE */]: WETH9[8453 /* BASE */],
  [137 /* POLYGON */]: WETH9[137 /* POLYGON */],
  [42161 /* ARBITRUM */]: WETH9[42161 /* ARBITRUM */],
  [148 /* SHIMMER2 */]: WETH9[148 /* SHIMMER2 */],
  [43114 /* AVAX */]: WETH9[43114 /* AVAX */],
  [250 /* FANTOM */]: WETH9[250 /* FANTOM */],
  [25 /* CRONOS */]: WETH9[25 /* CRONOS */],
  [324 /* ZKSYNC */]: WETH9[324 /* ZKSYNC */],
  [10 /* OPTIMISM */]: WETH9[10 /* OPTIMISM */],
  [369 /* PULSE */]: WETH9[369 /* PULSE */]
};
var NATIVE = {
  [1 /* ETHEREUM */]: { name: "Ether", symbol: "ETH", decimals: 18 },
  [56 /* BSC */]: { name: "Binance Chain Native Token", symbol: "BNB", decimals: 18 },
  [97 /* BSC_TESTNET */]: { name: "Binance Chain Native Token", symbol: "tBNB", decimals: 18 },
  [8453 /* BASE */]: { name: "Ether", symbol: "ETH", decimals: 18 },
  [137 /* POLYGON */]: { name: "Matic", symbol: "MATIC", decimals: 18 },
  [42161 /* ARBITRUM */]: { name: "Ether", symbol: "ETH", decimals: 18 },
  [10 /* OPTIMISM */]: { name: "Ether", symbol: "ETH", decimals: 18 },
  [324 /* ZKSYNC */]: { name: "Ether", symbol: "ETH", decimals: 18 },
  [25 /* CRONOS */]: { name: "Cronos", symbol: "CRO", decimals: 18 },
  [250 /* FANTOM */]: { name: "Fantom", symbol: "FTM", decimals: 18 },
  [43114 /* AVAX */]: { name: "Avax", symbol: "AVAX", decimals: 18 },
  [369 /* PULSE */]: { name: "Pulse", symbol: "PLS", decimals: 18 },
  [148 /* SHIMMER2 */]: { name: "Shimmer", symbol: "SMR", decimals: 18 }
};

// src/trade.ts
function isTradeBetter(tradeA, tradeB, minimumDelta = ZERO_PERCENT) {
  if (tradeA && !tradeB)
    return false;
  if (tradeB && !tradeA)
    return true;
  if (!tradeA || !tradeB)
    return void 0;
  if (tradeA.tradeType !== tradeB.tradeType || !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) || !tradeA.outputAmount.currency.equals(tradeB.outputAmount.currency)) {
    throw new Error("Trades are not comparable");
  }
  if (minimumDelta.equalTo(ZERO_PERCENT)) {
    return tradeA.executionPrice.lessThan(tradeB.executionPrice);
  }
  return tradeA.executionPrice.asFraction.multiply(minimumDelta.add(ONE_HUNDRED_PERCENT)).lessThan(tradeB.executionPrice);
}

// src/entities/pair.ts
import {
  InsufficientInputAmountError,
  InsufficientReservesError,
  sqrt,
  CurrencyAmount,
  Price,
  FIVE,
  ONE,
  ZERO,
  _10000,
  _9975,
  MINIMUM_LIQUIDITY
} from "@pancakeswap/swap-sdk-core";
import { getCreate2Address } from "@ethersproject/address";
import { keccak256, pack } from "@ethersproject/solidity";
import JSBI from "jsbi";
import invariant2 from "tiny-invariant";
var PAIR_ADDRESS_CACHE = {};
var composeKey = (token0, token1) => `${token0.chainId}-${token0.address}-${token1.address}`;
var computePairAddress = ({
  factoryAddress,
  tokenA,
  tokenB
}) => {
  const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
  const key = composeKey(token0, token1);
  if ((PAIR_ADDRESS_CACHE == null ? void 0 : PAIR_ADDRESS_CACHE[key]) === void 0) {
    PAIR_ADDRESS_CACHE = {
      ...PAIR_ADDRESS_CACHE,
      [key]: getCreate2Address(factoryAddress, keccak256(["bytes"], [pack(["address", "address"], [token0.address, token1.address])]), INIT_CODE_HASH_MAP[token0.chainId])
    };
  }
  return PAIR_ADDRESS_CACHE[key];
};
var Pair = class {
  static getAddress(tokenA, tokenB) {
    const factoryAddress = FACTORY_ADDRESS_MAP[tokenA.chainId];
    const initCodeHash = INIT_CODE_HASH_MAP[tokenA.chainId];
    if (!factoryAddress || !initCodeHash) {
      throw new Error(`Pair.getAddress: missing factory/init hash for chain ${tokenA.chainId}`);
    }
    return computePairAddress({ factoryAddress, tokenA, tokenB });
  }
  constructor(currencyAmountA, tokenAmountB) {
    const tokenAmounts = currencyAmountA.currency.sortsBefore(tokenAmountB.currency) ? [currencyAmountA, tokenAmountB] : [tokenAmountB, currencyAmountA];
    this.liquidityToken = new ERC20Token(tokenAmounts[0].currency.chainId, Pair.getAddress(tokenAmounts[0].currency, tokenAmounts[1].currency), 18, tokenAmounts[0].currency.chainId === 1 /* ETHEREUM */ ? "UNI-V2" : "MARCO-LP", tokenAmounts[0].currency.chainId === 1 /* ETHEREUM */ ? "Uniswap V2" : "MARCO LPs");
    this.tokenAmounts = tokenAmounts;
  }
  involvesToken(token) {
    return token.equals(this.token0) || token.equals(this.token1);
  }
  get token0Price() {
    const result = this.tokenAmounts[1].divide(this.tokenAmounts[0]);
    return new Price(this.token0, this.token1, result.denominator, result.numerator);
  }
  get token1Price() {
    const result = this.tokenAmounts[0].divide(this.tokenAmounts[1]);
    return new Price(this.token1, this.token0, result.denominator, result.numerator);
  }
  priceOf(token) {
    invariant2(this.involvesToken(token), "TOKEN");
    return token.equals(this.token0) ? this.token0Price : this.token1Price;
  }
  get chainId() {
    return this.token0.chainId;
  }
  get token0() {
    return this.tokenAmounts[0].currency;
  }
  get token1() {
    return this.tokenAmounts[1].currency;
  }
  get reserve0() {
    return this.tokenAmounts[0];
  }
  get reserve1() {
    return this.tokenAmounts[1];
  }
  reserveOf(token) {
    invariant2(this.involvesToken(token), "TOKEN");
    return token.equals(this.token0) ? this.reserve0 : this.reserve1;
  }
  getOutputAmount(inputAmount) {
    invariant2(this.involvesToken(inputAmount.currency), "TOKEN");
    if (JSBI.equal(this.reserve0.quotient, ZERO) || JSBI.equal(this.reserve1.quotient, ZERO)) {
      throw new InsufficientReservesError();
    }
    const inputReserve = this.reserveOf(inputAmount.currency);
    const outputReserve = this.reserveOf(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
    const inputAmountWithFee = JSBI.multiply(inputAmount.quotient, _9975);
    const numerator = JSBI.multiply(inputAmountWithFee, outputReserve.quotient);
    const denominator = JSBI.add(JSBI.multiply(inputReserve.quotient, _10000), inputAmountWithFee);
    const outputAmount = CurrencyAmount.fromRawAmount(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0, JSBI.divide(numerator, denominator));
    if (JSBI.equal(outputAmount.quotient, ZERO)) {
      throw new InsufficientInputAmountError();
    }
    return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))];
  }
  getInputAmount(outputAmount) {
    invariant2(this.involvesToken(outputAmount.currency), "TOKEN");
    if (JSBI.equal(this.reserve0.quotient, ZERO) || JSBI.equal(this.reserve1.quotient, ZERO) || JSBI.greaterThanOrEqual(outputAmount.quotient, this.reserveOf(outputAmount.currency).quotient)) {
      throw new InsufficientReservesError();
    }
    const outputReserve = this.reserveOf(outputAmount.currency);
    const inputReserve = this.reserveOf(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
    const numerator = JSBI.multiply(JSBI.multiply(inputReserve.quotient, outputAmount.quotient), _10000);
    const denominator = JSBI.multiply(JSBI.subtract(outputReserve.quotient, outputAmount.quotient), _9975);
    const inputAmount = CurrencyAmount.fromRawAmount(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0, JSBI.add(JSBI.divide(numerator, denominator), ONE));
    return [inputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))];
  }
  getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB) {
    invariant2(totalSupply.currency.equals(this.liquidityToken), "LIQUIDITY");
    const tokenAmounts = tokenAmountA.currency.sortsBefore(tokenAmountB.currency) ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
    invariant2(tokenAmounts[0].currency.equals(this.token0) && tokenAmounts[1].currency.equals(this.token1), "TOKEN");
    let liquidity;
    if (JSBI.equal(totalSupply.quotient, ZERO)) {
      liquidity = JSBI.subtract(sqrt(JSBI.multiply(tokenAmounts[0].quotient, tokenAmounts[1].quotient)), MINIMUM_LIQUIDITY);
    } else {
      const amount0 = JSBI.divide(JSBI.multiply(tokenAmounts[0].quotient, totalSupply.quotient), this.reserve0.quotient);
      const amount1 = JSBI.divide(JSBI.multiply(tokenAmounts[1].quotient, totalSupply.quotient), this.reserve1.quotient);
      liquidity = JSBI.lessThanOrEqual(amount0, amount1) ? amount0 : amount1;
    }
    if (!JSBI.greaterThan(liquidity, ZERO)) {
      throw new InsufficientInputAmountError();
    }
    return CurrencyAmount.fromRawAmount(this.liquidityToken, liquidity);
  }
  getLiquidityValue(token, totalSupply, liquidity, feeOn = false, kLast) {
    invariant2(this.involvesToken(token), "TOKEN");
    invariant2(totalSupply.currency.equals(this.liquidityToken), "TOTAL_SUPPLY");
    invariant2(liquidity.currency.equals(this.liquidityToken), "LIQUIDITY");
    invariant2(JSBI.lessThanOrEqual(liquidity.quotient, totalSupply.quotient), "LIQUIDITY");
    let totalSupplyAdjusted;
    if (!feeOn) {
      totalSupplyAdjusted = totalSupply;
    } else {
      invariant2(!!kLast, "K_LAST");
      const kLastParsed = JSBI.BigInt(kLast);
      if (!JSBI.equal(kLastParsed, ZERO)) {
        const rootK = sqrt(JSBI.multiply(this.reserve0.quotient, this.reserve1.quotient));
        const rootKLast = sqrt(kLastParsed);
        if (JSBI.greaterThan(rootK, rootKLast)) {
          const numerator = JSBI.multiply(totalSupply.quotient, JSBI.subtract(rootK, rootKLast));
          const denominator = JSBI.add(JSBI.multiply(rootK, FIVE), rootKLast);
          const feeLiquidity = JSBI.divide(numerator, denominator);
          totalSupplyAdjusted = totalSupply.add(CurrencyAmount.fromRawAmount(this.liquidityToken, feeLiquidity));
        } else {
          totalSupplyAdjusted = totalSupply;
        }
      } else {
        totalSupplyAdjusted = totalSupply;
      }
    }
    return CurrencyAmount.fromRawAmount(token, JSBI.divide(JSBI.multiply(liquidity.quotient, this.reserveOf(token).quotient), totalSupplyAdjusted.quotient));
  }
};

// src/entities/route.ts
import invariant3 from "tiny-invariant";
import { Price as Price2 } from "@pancakeswap/swap-sdk-core";
var Route = class {
  constructor(pairs, input, output) {
    this._midPrice = null;
    invariant3(pairs.length > 0, "PAIRS");
    const chainId = pairs[0].chainId;
    invariant3(pairs.every((pair) => pair.chainId === chainId), "CHAIN_IDS");
    const wrappedInput = input.wrapped;
    invariant3(pairs[0].involvesToken(wrappedInput), "INPUT");
    invariant3(typeof output === "undefined" || pairs[pairs.length - 1].involvesToken(output.wrapped), "OUTPUT");
    const path = [wrappedInput];
    for (const [i, pair] of pairs.entries()) {
      const currentInput = path[i];
      invariant3(currentInput.equals(pair.token0) || currentInput.equals(pair.token1), "PATH");
      const output2 = currentInput.equals(pair.token0) ? pair.token1 : pair.token0;
      path.push(output2);
    }
    this.pairs = pairs;
    this.path = path;
    this.input = input;
    this.output = output;
  }
  get midPrice() {
    if (this._midPrice !== null)
      return this._midPrice;
    const prices = [];
    for (const [i, pair] of this.pairs.entries()) {
      prices.push(this.path[i].equals(pair.token0) ? new Price2(pair.reserve0.currency, pair.reserve1.currency, pair.reserve0.quotient, pair.reserve1.quotient) : new Price2(pair.reserve1.currency, pair.reserve0.currency, pair.reserve1.quotient, pair.reserve0.quotient));
    }
    const reduced = prices.slice(1).reduce((accumulator, currentValue) => accumulator.multiply(currentValue), prices[0]);
    return this._midPrice = new Price2(this.input, this.output, reduced.denominator, reduced.numerator);
  }
  get chainId() {
    return this.pairs[0].chainId;
  }
};

// src/entities/trade.ts
import invariant4 from "tiny-invariant";
import {
  ONE as ONE2,
  TradeType,
  ZERO as ZERO2,
  CurrencyAmount as CurrencyAmount2,
  Fraction,
  Price as Price3,
  sortedInsert,
  computePriceImpact
} from "@pancakeswap/swap-sdk-core";
function inputOutputComparator(a, b) {
  invariant4(a.inputAmount.currency.equals(b.inputAmount.currency), "INPUT_CURRENCY");
  invariant4(a.outputAmount.currency.equals(b.outputAmount.currency), "OUTPUT_CURRENCY");
  if (a.outputAmount.equalTo(b.outputAmount)) {
    if (a.inputAmount.equalTo(b.inputAmount)) {
      return 0;
    }
    if (a.inputAmount.lessThan(b.inputAmount)) {
      return -1;
    }
    return 1;
  }
  if (a.outputAmount.lessThan(b.outputAmount)) {
    return 1;
  }
  return -1;
}
function tradeComparator(a, b) {
  const ioComp = inputOutputComparator(a, b);
  if (ioComp !== 0) {
    return ioComp;
  }
  if (a.priceImpact.lessThan(b.priceImpact)) {
    return -1;
  }
  if (a.priceImpact.greaterThan(b.priceImpact)) {
    return 1;
  }
  return a.route.path.length - b.route.path.length;
}
var Trade = class {
  static exactIn(route, amountIn) {
    return new Trade(route, amountIn, TradeType.EXACT_INPUT);
  }
  static exactOut(route, amountOut) {
    return new Trade(route, amountOut, TradeType.EXACT_OUTPUT);
  }
  constructor(route, amount, tradeType) {
    this.route = route;
    this.tradeType = tradeType;
    const tokenAmounts = new Array(route.path.length);
    if (tradeType === TradeType.EXACT_INPUT) {
      invariant4(amount.currency.equals(route.input), "INPUT");
      tokenAmounts[0] = amount.wrapped;
      for (let i = 0; i < route.path.length - 1; i++) {
        const pair = route.pairs[i];
        const [outputAmount] = pair.getOutputAmount(tokenAmounts[i]);
        tokenAmounts[i + 1] = outputAmount;
      }
      this.inputAmount = CurrencyAmount2.fromFractionalAmount(route.input, amount.numerator, amount.denominator);
      this.outputAmount = CurrencyAmount2.fromFractionalAmount(route.output, tokenAmounts[tokenAmounts.length - 1].numerator, tokenAmounts[tokenAmounts.length - 1].denominator);
    } else {
      invariant4(amount.currency.equals(route.output), "OUTPUT");
      tokenAmounts[tokenAmounts.length - 1] = amount.wrapped;
      for (let i = route.path.length - 1; i > 0; i--) {
        const pair = route.pairs[i - 1];
        const [inputAmount] = pair.getInputAmount(tokenAmounts[i]);
        tokenAmounts[i - 1] = inputAmount;
      }
      this.inputAmount = CurrencyAmount2.fromFractionalAmount(route.input, tokenAmounts[0].numerator, tokenAmounts[0].denominator);
      this.outputAmount = CurrencyAmount2.fromFractionalAmount(route.output, amount.numerator, amount.denominator);
    }
    this.executionPrice = new Price3(this.inputAmount.currency, this.outputAmount.currency, this.inputAmount.quotient, this.outputAmount.quotient);
    this.priceImpact = computePriceImpact(route.midPrice, this.inputAmount, this.outputAmount);
  }
  minimumAmountOut(slippageTolerance) {
    invariant4(!slippageTolerance.lessThan(ZERO2), "SLIPPAGE_TOLERANCE");
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount;
    }
    const slippageAdjustedAmountOut = new Fraction(ONE2).add(slippageTolerance).invert().multiply(this.outputAmount.quotient).quotient;
    return CurrencyAmount2.fromRawAmount(this.outputAmount.currency, slippageAdjustedAmountOut);
  }
  maximumAmountIn(slippageTolerance) {
    invariant4(!slippageTolerance.lessThan(ZERO2), "SLIPPAGE_TOLERANCE");
    if (this.tradeType === TradeType.EXACT_INPUT) {
      return this.inputAmount;
    }
    const slippageAdjustedAmountIn = new Fraction(ONE2).add(slippageTolerance).multiply(this.inputAmount.quotient).quotient;
    return CurrencyAmount2.fromRawAmount(this.inputAmount.currency, slippageAdjustedAmountIn);
  }
  static bestTradeExactIn(pairs, currencyAmountIn, currencyOut, { maxNumResults = 3, maxHops = 3 } = {}, currentPairs = [], nextAmountIn = currencyAmountIn, bestTrades = []) {
    invariant4(pairs.length > 0, "PAIRS");
    invariant4(maxHops > 0, "MAX_HOPS");
    invariant4(currencyAmountIn === nextAmountIn || currentPairs.length > 0, "INVALID_RECURSION");
    const amountIn = nextAmountIn.wrapped;
    const tokenOut = currencyOut.wrapped;
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      if (!pair.token0.equals(amountIn.currency) && !pair.token1.equals(amountIn.currency))
        continue;
      if (pair.reserve0.equalTo(ZERO2) || pair.reserve1.equalTo(ZERO2))
        continue;
      let amountOut;
      try {
        ;
        [amountOut] = pair.getOutputAmount(amountIn);
      } catch (error) {
        if (error.isInsufficientInputAmountError) {
          continue;
        }
        throw error;
      }
      if (amountOut.currency.equals(tokenOut)) {
        sortedInsert(bestTrades, new Trade(new Route([...currentPairs, pair], currencyAmountIn.currency, currencyOut), currencyAmountIn, TradeType.EXACT_INPUT), maxNumResults, tradeComparator);
      } else if (maxHops > 1 && pairs.length > 1) {
        const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length));
        Trade.bestTradeExactIn(pairsExcludingThisPair, currencyAmountIn, currencyOut, {
          maxNumResults,
          maxHops: maxHops - 1
        }, [...currentPairs, pair], amountOut, bestTrades);
      }
    }
    return bestTrades;
  }
  worstExecutionPrice(slippageTolerance) {
    return new Price3(this.inputAmount.currency, this.outputAmount.currency, this.maximumAmountIn(slippageTolerance).quotient, this.minimumAmountOut(slippageTolerance).quotient);
  }
  static bestTradeExactOut(pairs, currencyIn, currencyAmountOut, { maxNumResults = 3, maxHops = 3 } = {}, currentPairs = [], nextAmountOut = currencyAmountOut, bestTrades = []) {
    invariant4(pairs.length > 0, "PAIRS");
    invariant4(maxHops > 0, "MAX_HOPS");
    invariant4(currencyAmountOut === nextAmountOut || currentPairs.length > 0, "INVALID_RECURSION");
    const amountOut = nextAmountOut.wrapped;
    const tokenIn = currencyIn.wrapped;
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      if (!pair.token0.equals(amountOut.currency) && !pair.token1.equals(amountOut.currency))
        continue;
      if (pair.reserve0.equalTo(ZERO2) || pair.reserve1.equalTo(ZERO2))
        continue;
      let amountIn;
      try {
        ;
        [amountIn] = pair.getInputAmount(amountOut);
      } catch (error) {
        if (error.isInsufficientReservesError) {
          continue;
        }
        throw error;
      }
      if (amountIn.currency.equals(tokenIn)) {
        sortedInsert(bestTrades, new Trade(new Route([pair, ...currentPairs], currencyIn, currencyAmountOut.currency), currencyAmountOut, TradeType.EXACT_OUTPUT), maxNumResults, tradeComparator);
      } else if (maxHops > 1 && pairs.length > 1) {
        const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length));
        Trade.bestTradeExactOut(pairsExcludingThisPair, currencyIn, currencyAmountOut, {
          maxNumResults,
          maxHops: maxHops - 1
        }, [pair, ...currentPairs], amountIn, bestTrades);
      }
    }
    return bestTrades;
  }
};

// src/entities/native.ts
import invariant5 from "tiny-invariant";
import { NativeCurrency } from "@pancakeswap/swap-sdk-core";
var _Native = class extends NativeCurrency {
  constructor({
    chainId,
    decimals,
    name,
    symbol
  }) {
    super(chainId, decimals, symbol, name);
  }
  get wrapped() {
    const wnative = WNATIVE[this.chainId];
    invariant5(!!wnative, "WRAPPED");
    return wnative;
  }
  static onChain(chainId) {
    if (chainId in this.cache) {
      return this.cache[chainId];
    }
    invariant5(!!NATIVE[chainId], "NATIVE_CURRENCY");
    const { decimals, name, symbol } = NATIVE[chainId];
    return this.cache[chainId] = new _Native({ chainId, decimals, symbol, name });
  }
  equals(other) {
    return other.isNative && other.chainId === this.chainId;
  }
};
var Native = _Native;
Native.cache = {};

// src/router.ts
import { TradeType as TradeType2 } from "@pancakeswap/swap-sdk-core";
import invariant6 from "tiny-invariant";
function toHex(currencyAmount) {
  return `0x${currencyAmount.quotient.toString(16)}`;
}
var ZERO_HEX = "0x0";
var Router = class {
  constructor() {
  }
  static swapCallParameters(trade, options) {
    const etherIn = trade.inputAmount.currency.isNative;
    const etherOut = trade.outputAmount.currency.isNative;
    invariant6(!(etherIn && etherOut), "ETHER_IN_OUT");
    invariant6(!("ttl" in options) || options.ttl > 0, "TTL");
    const to = validateAndParseAddress(options.recipient);
    const amountIn = toHex(trade.maximumAmountIn(options.allowedSlippage));
    const amountOut = toHex(trade.minimumAmountOut(options.allowedSlippage));
    const path = trade.route.path.map((token) => token.address);
    const deadline = "ttl" in options ? `0x${(Math.floor(new Date().getTime() / 1e3) + options.ttl).toString(16)}` : `0x${options.deadline.toString(16)}`;
    const useFeeOnTransfer = Boolean(options.feeOnTransfer);
    let methodName;
    let args;
    let value;
    switch (trade.tradeType) {
      case TradeType2.EXACT_INPUT:
        if (etherIn) {
          methodName = useFeeOnTransfer ? "swapExactETHForTokensSupportingFeeOnTransferTokens" : "swapExactETHForTokens";
          args = [amountOut, path, to, deadline];
          value = amountIn;
        } else if (etherOut) {
          methodName = useFeeOnTransfer ? "swapExactTokensForETHSupportingFeeOnTransferTokens" : "swapExactTokensForETH";
          args = [amountIn, amountOut, path, to, deadline];
          value = ZERO_HEX;
        } else {
          methodName = useFeeOnTransfer ? "swapExactTokensForTokensSupportingFeeOnTransferTokens" : "swapExactTokensForTokens";
          args = [amountIn, amountOut, path, to, deadline];
          value = ZERO_HEX;
        }
        break;
      case TradeType2.EXACT_OUTPUT:
        invariant6(!useFeeOnTransfer, "EXACT_OUT_FOT");
        if (etherIn) {
          methodName = "swapETHForExactTokens";
          args = [amountOut, path, to, deadline];
          value = amountIn;
        } else if (etherOut) {
          methodName = "swapTokensForExactETH";
          args = [amountOut, amountIn, path, to, deadline];
          value = ZERO_HEX;
        } else {
          methodName = "swapTokensForExactTokens";
          args = [amountOut, amountIn, path, to, deadline];
          value = ZERO_HEX;
        }
        break;
    }
    return {
      methodName,
      args,
      value
    };
  }
};

// src/index.ts
export * from "@pancakeswap/swap-sdk-core";
export {
  ChainId,
  ERC20Token,
  FACTORY_ADDRESS,
  FACTORY_ADDRESS_MAP,
  INIT_CODE_HASH,
  INIT_CODE_HASH_MAP,
  JSBI2 as JSBI,
  NATIVE,
  Native,
  ONE_HUNDRED_PERCENT,
  Pair,
  Route,
  Router,
  Trade,
  WBNB,
  WETH9,
  WNATIVE,
  ZERO_PERCENT,
  computePairAddress,
  inputOutputComparator,
  isTradeBetter,
  tradeComparator
};
