"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  BaseCurrency: () => BaseCurrency,
  CurrencyAmount: () => CurrencyAmount,
  FIVE: () => FIVE,
  Fraction: () => Fraction,
  InsufficientInputAmountError: () => InsufficientInputAmountError,
  InsufficientReservesError: () => InsufficientReservesError,
  JSBI: () => import_jsbi7.default,
  MINIMUM_LIQUIDITY: () => MINIMUM_LIQUIDITY,
  MaxUint256: () => MaxUint256,
  NativeCurrency: () => NativeCurrency,
  ONE: () => ONE,
  Percent: () => Percent,
  Price: () => Price,
  Rounding: () => Rounding,
  TEN: () => TEN,
  THREE: () => THREE,
  TWO: () => TWO,
  Token: () => Token,
  TradeType: () => TradeType,
  VMType: () => VMType,
  VM_TYPE_MAXIMA: () => VM_TYPE_MAXIMA,
  ZERO: () => ZERO,
  _100: () => _100,
  _10000: () => _10000,
  _9975: () => _9975,
  computePriceImpact: () => computePriceImpact,
  getTokenComparator: () => getTokenComparator,
  sortedInsert: () => sortedInsert,
  sqrt: () => sqrt,
  validateVMTypeInstance: () => validateVMTypeInstance
});
module.exports = __toCommonJS(src_exports);
var import_jsbi7 = __toESM(require("jsbi"));

// src/constants.ts
var import_jsbi = __toESM(require("jsbi"));
var TradeType = /* @__PURE__ */ ((TradeType2) => {
  TradeType2[TradeType2["EXACT_INPUT"] = 0] = "EXACT_INPUT";
  TradeType2[TradeType2["EXACT_OUTPUT"] = 1] = "EXACT_OUTPUT";
  return TradeType2;
})(TradeType || {});
var Rounding = /* @__PURE__ */ ((Rounding2) => {
  Rounding2[Rounding2["ROUND_DOWN"] = 0] = "ROUND_DOWN";
  Rounding2[Rounding2["ROUND_HALF_UP"] = 1] = "ROUND_HALF_UP";
  Rounding2[Rounding2["ROUND_UP"] = 2] = "ROUND_UP";
  return Rounding2;
})(Rounding || {});
var MINIMUM_LIQUIDITY = import_jsbi.default.BigInt(1e3);
var ZERO = import_jsbi.default.BigInt(0);
var ONE = import_jsbi.default.BigInt(1);
var TWO = import_jsbi.default.BigInt(2);
var THREE = import_jsbi.default.BigInt(3);
var FIVE = import_jsbi.default.BigInt(5);
var TEN = import_jsbi.default.BigInt(10);
var _100 = import_jsbi.default.BigInt(100);
var _9975 = import_jsbi.default.BigInt(9975);
var _10000 = import_jsbi.default.BigInt(1e4);
var MaxUint256 = import_jsbi.default.BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
var VMType = /* @__PURE__ */ ((VMType2) => {
  VMType2["uint8"] = "uint8";
  VMType2["uint256"] = "uint256";
  return VMType2;
})(VMType || {});
var VM_TYPE_MAXIMA = {
  ["uint8" /* uint8 */]: import_jsbi.default.BigInt("0xff"),
  ["uint256" /* uint256 */]: import_jsbi.default.BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
};

// src/baseCurrency.ts
var import_tiny_invariant = __toESM(require("tiny-invariant"));
var BaseCurrency = class {
  constructor(chainId, decimals, symbol, name) {
    (0, import_tiny_invariant.default)(Number.isSafeInteger(chainId), "CHAIN_ID");
    (0, import_tiny_invariant.default)(decimals >= 0 && decimals < 255 && Number.isInteger(decimals), "DECIMALS");
    this.chainId = chainId;
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
  }
};

// src/fractions/fraction.ts
var import_jsbi2 = __toESM(require("jsbi"));
var import_tiny_invariant2 = __toESM(require("tiny-invariant"));
var import_decimal = __toESM(require("decimal.js-light"));
var import_big = __toESM(require("big.js"));
var import_toformat = __toESM(require("toformat"));
var Decimal = (0, import_toformat.default)(import_decimal.default);
var Big = (0, import_toformat.default)(import_big.default);
var toSignificantRounding = {
  [0 /* ROUND_DOWN */]: Decimal.ROUND_DOWN,
  [1 /* ROUND_HALF_UP */]: Decimal.ROUND_HALF_UP,
  [2 /* ROUND_UP */]: Decimal.ROUND_UP
};
var toFixedRounding = {
  [0 /* ROUND_DOWN */]: 0 /* RoundDown */,
  [1 /* ROUND_HALF_UP */]: 1 /* RoundHalfUp */,
  [2 /* ROUND_UP */]: 3 /* RoundUp */
};
var Fraction = class {
  constructor(numerator, denominator = import_jsbi2.default.BigInt(1)) {
    this.numerator = import_jsbi2.default.BigInt(numerator);
    this.denominator = import_jsbi2.default.BigInt(denominator);
  }
  static tryParseFraction(fractionish) {
    if (fractionish instanceof import_jsbi2.default || typeof fractionish === "number" || typeof fractionish === "string")
      return new Fraction(fractionish);
    if ("numerator" in fractionish && "denominator" in fractionish)
      return fractionish;
    throw new Error("Could not parse fraction");
  }
  get quotient() {
    return import_jsbi2.default.divide(this.numerator, this.denominator);
  }
  get remainder() {
    return new Fraction(import_jsbi2.default.remainder(this.numerator, this.denominator), this.denominator);
  }
  invert() {
    return new Fraction(this.denominator, this.numerator);
  }
  add(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    if (import_jsbi2.default.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(import_jsbi2.default.add(this.numerator, otherParsed.numerator), this.denominator);
    }
    return new Fraction(import_jsbi2.default.add(import_jsbi2.default.multiply(this.numerator, otherParsed.denominator), import_jsbi2.default.multiply(otherParsed.numerator, this.denominator)), import_jsbi2.default.multiply(this.denominator, otherParsed.denominator));
  }
  subtract(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    if (import_jsbi2.default.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(import_jsbi2.default.subtract(this.numerator, otherParsed.numerator), this.denominator);
    }
    return new Fraction(import_jsbi2.default.subtract(import_jsbi2.default.multiply(this.numerator, otherParsed.denominator), import_jsbi2.default.multiply(otherParsed.numerator, this.denominator)), import_jsbi2.default.multiply(this.denominator, otherParsed.denominator));
  }
  lessThan(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return import_jsbi2.default.lessThan(import_jsbi2.default.multiply(this.numerator, otherParsed.denominator), import_jsbi2.default.multiply(otherParsed.numerator, this.denominator));
  }
  equalTo(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return import_jsbi2.default.equal(import_jsbi2.default.multiply(this.numerator, otherParsed.denominator), import_jsbi2.default.multiply(otherParsed.numerator, this.denominator));
  }
  greaterThan(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return import_jsbi2.default.greaterThan(import_jsbi2.default.multiply(this.numerator, otherParsed.denominator), import_jsbi2.default.multiply(otherParsed.numerator, this.denominator));
  }
  multiply(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(import_jsbi2.default.multiply(this.numerator, otherParsed.numerator), import_jsbi2.default.multiply(this.denominator, otherParsed.denominator));
  }
  divide(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(import_jsbi2.default.multiply(this.numerator, otherParsed.denominator), import_jsbi2.default.multiply(this.denominator, otherParsed.numerator));
  }
  toSignificant(significantDigits, format = { groupSeparator: "" }, rounding = 1 /* ROUND_HALF_UP */) {
    (0, import_tiny_invariant2.default)(Number.isInteger(significantDigits), `${significantDigits} is not an integer.`);
    (0, import_tiny_invariant2.default)(significantDigits > 0, `${significantDigits} is not positive.`);
    Decimal.set({ precision: significantDigits + 1, rounding: toSignificantRounding[rounding] });
    const quotient = new Decimal(this.numerator.toString()).div(this.denominator.toString()).toSignificantDigits(significantDigits);
    return quotient.toFormat(quotient.decimalPlaces(), format);
  }
  toFixed(decimalPlaces, format = { groupSeparator: "" }, rounding = 1 /* ROUND_HALF_UP */) {
    (0, import_tiny_invariant2.default)(Number.isInteger(decimalPlaces), `${decimalPlaces} is not an integer.`);
    (0, import_tiny_invariant2.default)(decimalPlaces >= 0, `${decimalPlaces} is negative.`);
    Big.DP = decimalPlaces;
    Big.RM = toFixedRounding[rounding];
    return new Big(this.numerator.toString()).div(this.denominator.toString()).toFormat(decimalPlaces, format);
  }
  get asFraction() {
    return new Fraction(this.numerator, this.denominator);
  }
};

// src/fractions/percent.ts
var import_jsbi3 = __toESM(require("jsbi"));
var ONE_HUNDRED = new Fraction(import_jsbi3.default.BigInt(100));
function toPercent(fraction) {
  return new Percent(fraction.numerator, fraction.denominator);
}
var Percent = class extends Fraction {
  constructor() {
    super(...arguments);
    this.isPercent = true;
  }
  add(other) {
    return toPercent(super.add(other));
  }
  subtract(other) {
    return toPercent(super.subtract(other));
  }
  multiply(other) {
    return toPercent(super.multiply(other));
  }
  divide(other) {
    return toPercent(super.divide(other));
  }
  toSignificant(significantDigits = 5, format, rounding) {
    return super.multiply(ONE_HUNDRED).toSignificant(significantDigits, format, rounding);
  }
  toFixed(decimalPlaces = 2, format, rounding) {
    return super.multiply(ONE_HUNDRED).toFixed(decimalPlaces, format, rounding);
  }
};

// src/fractions/currencyAmount.ts
var import_tiny_invariant3 = __toESM(require("tiny-invariant"));
var import_jsbi4 = __toESM(require("jsbi"));
var import_big2 = __toESM(require("big.js"));
var import_toformat2 = __toESM(require("toformat"));
var Big2 = (0, import_toformat2.default)(import_big2.default);
var CurrencyAmount = class extends Fraction {
  constructor(currency, numerator, denominator) {
    super(numerator, denominator);
    (0, import_tiny_invariant3.default)(import_jsbi4.default.lessThanOrEqual(this.quotient, MaxUint256), "AMOUNT");
    this.currency = currency;
    this.decimalScale = import_jsbi4.default.exponentiate(import_jsbi4.default.BigInt(10), import_jsbi4.default.BigInt(currency.decimals));
  }
  static fromRawAmount(currency, rawAmount) {
    return new CurrencyAmount(currency, rawAmount);
  }
  static fromFractionalAmount(currency, numerator, denominator) {
    return new CurrencyAmount(currency, numerator, denominator);
  }
  add(other) {
    (0, import_tiny_invariant3.default)(this.currency.equals(other.currency), "CURRENCY");
    const added = super.add(other);
    return CurrencyAmount.fromFractionalAmount(this.currency, added.numerator, added.denominator);
  }
  subtract(other) {
    (0, import_tiny_invariant3.default)(this.currency.equals(other.currency), "CURRENCY");
    const subtracted = super.subtract(other);
    return CurrencyAmount.fromFractionalAmount(this.currency, subtracted.numerator, subtracted.denominator);
  }
  multiply(other) {
    const multiplied = super.multiply(other);
    return CurrencyAmount.fromFractionalAmount(this.currency, multiplied.numerator, multiplied.denominator);
  }
  divide(other) {
    const divided = super.divide(other);
    return CurrencyAmount.fromFractionalAmount(this.currency, divided.numerator, divided.denominator);
  }
  toSignificant(significantDigits = 6, format, rounding = 0 /* ROUND_DOWN */) {
    return super.divide(this.decimalScale).toSignificant(significantDigits, format, rounding);
  }
  toFixed(decimalPlaces = this.currency.decimals, format, rounding = 0 /* ROUND_DOWN */) {
    (0, import_tiny_invariant3.default)(decimalPlaces <= this.currency.decimals, "DECIMALS");
    return super.divide(this.decimalScale).toFixed(decimalPlaces, format, rounding);
  }
  toExact(format = { groupSeparator: "" }) {
    Big2.DP = this.currency.decimals;
    return new Big2(this.quotient.toString()).div(this.decimalScale.toString()).toFormat(format);
  }
  get wrapped() {
    if (this.currency.isToken)
      return this;
    return CurrencyAmount.fromFractionalAmount(this.currency.wrapped, this.numerator, this.denominator);
  }
};

// src/fractions/price.ts
var import_jsbi5 = __toESM(require("jsbi"));
var import_tiny_invariant4 = __toESM(require("tiny-invariant"));
var Price = class extends Fraction {
  constructor(...args) {
    let baseCurrency;
    let quoteCurrency;
    let denominator;
    let numerator;
    if (args.length === 4) {
      ;
      [baseCurrency, quoteCurrency, denominator, numerator] = args;
    } else {
      const result = args[0].quoteAmount.divide(args[0].baseAmount);
      [baseCurrency, quoteCurrency, denominator, numerator] = [
        args[0].baseAmount.currency,
        args[0].quoteAmount.currency,
        result.denominator,
        result.numerator
      ];
    }
    super(numerator, denominator);
    this.baseCurrency = baseCurrency;
    this.quoteCurrency = quoteCurrency;
    this.scalar = new Fraction(import_jsbi5.default.exponentiate(import_jsbi5.default.BigInt(10), import_jsbi5.default.BigInt(baseCurrency.decimals)), import_jsbi5.default.exponentiate(import_jsbi5.default.BigInt(10), import_jsbi5.default.BigInt(quoteCurrency.decimals)));
  }
  invert() {
    return new Price(this.quoteCurrency, this.baseCurrency, this.numerator, this.denominator);
  }
  multiply(other) {
    (0, import_tiny_invariant4.default)(this.quoteCurrency.equals(other.baseCurrency), "TOKEN");
    const fraction = super.multiply(other);
    return new Price(this.baseCurrency, other.quoteCurrency, fraction.denominator, fraction.numerator);
  }
  quote(currencyAmount) {
    (0, import_tiny_invariant4.default)(currencyAmount.currency.equals(this.baseCurrency), "TOKEN");
    const result = super.multiply(currencyAmount);
    return CurrencyAmount.fromFractionalAmount(this.quoteCurrency, result.numerator, result.denominator);
  }
  get adjustedForDecimals() {
    return super.multiply(this.scalar);
  }
  toSignificant(significantDigits = 6, format, rounding) {
    return this.adjustedForDecimals.toSignificant(significantDigits, format, rounding);
  }
  toFixed(decimalPlaces = 4, format, rounding) {
    return this.adjustedForDecimals.toFixed(decimalPlaces, format, rounding);
  }
};

// src/nativeCurrency.ts
var NativeCurrency = class extends BaseCurrency {
  constructor() {
    super(...arguments);
    this.isNative = true;
    this.isToken = false;
  }
};

// src/token.ts
var import_tiny_invariant5 = __toESM(require("tiny-invariant"));
var Token = class extends BaseCurrency {
  constructor(chainId, address, decimals, symbol, name, projectLink) {
    super(chainId, decimals, symbol, name);
    this.isNative = false;
    this.isToken = true;
    this.address = address;
    this.projectLink = projectLink;
  }
  equals(other) {
    return other.isToken && this.chainId === other.chainId && this.address === other.address;
  }
  sortsBefore(other) {
    (0, import_tiny_invariant5.default)(this.chainId === other.chainId, "CHAIN_IDS");
    (0, import_tiny_invariant5.default)(this.address !== other.address, "ADDRESSES");
    return this.address.toLowerCase() < other.address.toLowerCase();
  }
  get wrapped() {
    return this;
  }
  get serialize() {
    return {
      address: this.address,
      chainId: this.chainId,
      decimals: this.decimals,
      symbol: this.symbol,
      name: this.name,
      projectLink: this.projectLink
    };
  }
};

// src/errors.ts
var CAN_SET_PROTOTYPE = "setPrototypeOf" in Object;
var InsufficientReservesError = class extends Error {
  constructor() {
    super();
    this.isInsufficientReservesError = true;
    this.name = this.constructor.name;
    if (CAN_SET_PROTOTYPE)
      Object.setPrototypeOf(this, new.target.prototype);
  }
};
var InsufficientInputAmountError = class extends Error {
  constructor() {
    super();
    this.isInsufficientInputAmountError = true;
    this.name = this.constructor.name;
    if (CAN_SET_PROTOTYPE)
      Object.setPrototypeOf(this, new.target.prototype);
  }
};

// src/utils.ts
var import_jsbi6 = __toESM(require("jsbi"));
var import_tiny_invariant6 = __toESM(require("tiny-invariant"));
function validateVMTypeInstance(value, vmType) {
  (0, import_tiny_invariant6.default)(import_jsbi6.default.greaterThanOrEqual(value, ZERO), `${value} is not a ${vmType}.`);
  (0, import_tiny_invariant6.default)(import_jsbi6.default.lessThanOrEqual(value, VM_TYPE_MAXIMA[vmType]), `${value} is not a ${vmType}.`);
}
function sqrt(y) {
  validateVMTypeInstance(y, "uint256" /* uint256 */);
  let z = ZERO;
  let x;
  if (import_jsbi6.default.greaterThan(y, THREE)) {
    z = y;
    x = import_jsbi6.default.add(import_jsbi6.default.divide(y, TWO), ONE);
    while (import_jsbi6.default.lessThan(x, z)) {
      z = x;
      x = import_jsbi6.default.divide(import_jsbi6.default.add(import_jsbi6.default.divide(y, x), x), TWO);
    }
  } else if (import_jsbi6.default.notEqual(y, ZERO)) {
    z = ONE;
  }
  return z;
}
function sortedInsert(items, add, maxSize, comparator) {
  (0, import_tiny_invariant6.default)(maxSize > 0, "MAX_SIZE_ZERO");
  (0, import_tiny_invariant6.default)(items.length <= maxSize, "ITEMS_SIZE");
  if (items.length === 0) {
    items.push(add);
    return null;
  } else {
    const isFull = items.length === maxSize;
    if (isFull && comparator(items[items.length - 1], add) <= 0) {
      return add;
    }
    let lo = 0, hi = items.length;
    while (lo < hi) {
      const mid = lo + hi >>> 1;
      if (comparator(items[mid], add) <= 0) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    items.splice(lo, 0, add);
    return isFull ? items.pop() : null;
  }
}
function computePriceImpact(midPrice, inputAmount, outputAmount) {
  const quotedOutputAmount = midPrice.quote(inputAmount);
  const priceImpact = quotedOutputAmount.subtract(outputAmount).divide(quotedOutputAmount);
  return new Percent(priceImpact.numerator, priceImpact.denominator);
}
function balanceComparator(balanceA, balanceB) {
  if (balanceA && balanceB) {
    return balanceA.greaterThan(balanceB) ? -1 : balanceA.equalTo(balanceB) ? 0 : 1;
  }
  if (balanceA && balanceA.greaterThan("0")) {
    return -1;
  }
  if (balanceB && balanceB.greaterThan("0")) {
    return 1;
  }
  return 0;
}
function getTokenComparator(balances) {
  return function sortTokens(tokenA, tokenB) {
    const balanceA = balances[tokenA.address];
    const balanceB = balances[tokenB.address];
    const balanceComp = balanceComparator(balanceA, balanceB);
    if (balanceComp !== 0)
      return balanceComp;
    if (tokenA.symbol && tokenB.symbol) {
      return tokenA.symbol.toLowerCase() < tokenB.symbol.toLowerCase() ? -1 : 1;
    }
    return tokenA.symbol ? -1 : tokenB.symbol ? -1 : 0;
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseCurrency,
  CurrencyAmount,
  FIVE,
  Fraction,
  InsufficientInputAmountError,
  InsufficientReservesError,
  JSBI,
  MINIMUM_LIQUIDITY,
  MaxUint256,
  NativeCurrency,
  ONE,
  Percent,
  Price,
  Rounding,
  TEN,
  THREE,
  TWO,
  Token,
  TradeType,
  VMType,
  VM_TYPE_MAXIMA,
  ZERO,
  _100,
  _10000,
  _9975,
  computePriceImpact,
  getTokenComparator,
  sortedInsert,
  sqrt,
  validateVMTypeInstance
});
