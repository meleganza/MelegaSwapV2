// src/index.ts
import JSBI7 from "jsbi";

// src/constants.ts
import JSBI from "jsbi";
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
var MINIMUM_LIQUIDITY = JSBI.BigInt(1e3);
var ZERO = JSBI.BigInt(0);
var ONE = JSBI.BigInt(1);
var TWO = JSBI.BigInt(2);
var THREE = JSBI.BigInt(3);
var FIVE = JSBI.BigInt(5);
var TEN = JSBI.BigInt(10);
var _100 = JSBI.BigInt(100);
var _9975 = JSBI.BigInt(9975);
var _10000 = JSBI.BigInt(1e4);
var MaxUint256 = JSBI.BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
var VMType = /* @__PURE__ */ ((VMType2) => {
  VMType2["uint8"] = "uint8";
  VMType2["uint256"] = "uint256";
  return VMType2;
})(VMType || {});
var VM_TYPE_MAXIMA = {
  ["uint8" /* uint8 */]: JSBI.BigInt("0xff"),
  ["uint256" /* uint256 */]: JSBI.BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
};

// src/baseCurrency.ts
import invariant from "tiny-invariant";
var BaseCurrency = class {
  constructor(chainId, decimals, symbol, name) {
    invariant(Number.isSafeInteger(chainId), "CHAIN_ID");
    invariant(decimals >= 0 && decimals < 255 && Number.isInteger(decimals), "DECIMALS");
    this.chainId = chainId;
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
  }
};

// src/fractions/fraction.ts
import JSBI2 from "jsbi";
import invariant2 from "tiny-invariant";
import _Decimal from "decimal.js-light";
import _Big from "big.js";
import toFormat from "toformat";
var Decimal = toFormat(_Decimal);
var Big = toFormat(_Big);
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
  constructor(numerator, denominator = JSBI2.BigInt(1)) {
    this.numerator = JSBI2.BigInt(numerator);
    this.denominator = JSBI2.BigInt(denominator);
  }
  static tryParseFraction(fractionish) {
    if (fractionish instanceof JSBI2 || typeof fractionish === "number" || typeof fractionish === "string")
      return new Fraction(fractionish);
    if ("numerator" in fractionish && "denominator" in fractionish)
      return fractionish;
    throw new Error("Could not parse fraction");
  }
  get quotient() {
    return JSBI2.divide(this.numerator, this.denominator);
  }
  get remainder() {
    return new Fraction(JSBI2.remainder(this.numerator, this.denominator), this.denominator);
  }
  invert() {
    return new Fraction(this.denominator, this.numerator);
  }
  add(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    if (JSBI2.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI2.add(this.numerator, otherParsed.numerator), this.denominator);
    }
    return new Fraction(JSBI2.add(JSBI2.multiply(this.numerator, otherParsed.denominator), JSBI2.multiply(otherParsed.numerator, this.denominator)), JSBI2.multiply(this.denominator, otherParsed.denominator));
  }
  subtract(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    if (JSBI2.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI2.subtract(this.numerator, otherParsed.numerator), this.denominator);
    }
    return new Fraction(JSBI2.subtract(JSBI2.multiply(this.numerator, otherParsed.denominator), JSBI2.multiply(otherParsed.numerator, this.denominator)), JSBI2.multiply(this.denominator, otherParsed.denominator));
  }
  lessThan(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return JSBI2.lessThan(JSBI2.multiply(this.numerator, otherParsed.denominator), JSBI2.multiply(otherParsed.numerator, this.denominator));
  }
  equalTo(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return JSBI2.equal(JSBI2.multiply(this.numerator, otherParsed.denominator), JSBI2.multiply(otherParsed.numerator, this.denominator));
  }
  greaterThan(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return JSBI2.greaterThan(JSBI2.multiply(this.numerator, otherParsed.denominator), JSBI2.multiply(otherParsed.numerator, this.denominator));
  }
  multiply(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(JSBI2.multiply(this.numerator, otherParsed.numerator), JSBI2.multiply(this.denominator, otherParsed.denominator));
  }
  divide(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(JSBI2.multiply(this.numerator, otherParsed.denominator), JSBI2.multiply(this.denominator, otherParsed.numerator));
  }
  toSignificant(significantDigits, format = { groupSeparator: "" }, rounding = 1 /* ROUND_HALF_UP */) {
    invariant2(Number.isInteger(significantDigits), `${significantDigits} is not an integer.`);
    invariant2(significantDigits > 0, `${significantDigits} is not positive.`);
    Decimal.set({ precision: significantDigits + 1, rounding: toSignificantRounding[rounding] });
    const quotient = new Decimal(this.numerator.toString()).div(this.denominator.toString()).toSignificantDigits(significantDigits);
    return quotient.toFormat(quotient.decimalPlaces(), format);
  }
  toFixed(decimalPlaces, format = { groupSeparator: "" }, rounding = 1 /* ROUND_HALF_UP */) {
    invariant2(Number.isInteger(decimalPlaces), `${decimalPlaces} is not an integer.`);
    invariant2(decimalPlaces >= 0, `${decimalPlaces} is negative.`);
    Big.DP = decimalPlaces;
    Big.RM = toFixedRounding[rounding];
    return new Big(this.numerator.toString()).div(this.denominator.toString()).toFormat(decimalPlaces, format);
  }
  get asFraction() {
    return new Fraction(this.numerator, this.denominator);
  }
};

// src/fractions/percent.ts
import JSBI3 from "jsbi";
var ONE_HUNDRED = new Fraction(JSBI3.BigInt(100));
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
import invariant3 from "tiny-invariant";
import JSBI4 from "jsbi";
import _Big2 from "big.js";
import toFormat2 from "toformat";
var Big2 = toFormat2(_Big2);
var CurrencyAmount = class extends Fraction {
  constructor(currency, numerator, denominator) {
    super(numerator, denominator);
    invariant3(JSBI4.lessThanOrEqual(this.quotient, MaxUint256), "AMOUNT");
    this.currency = currency;
    this.decimalScale = JSBI4.exponentiate(JSBI4.BigInt(10), JSBI4.BigInt(currency.decimals));
  }
  static fromRawAmount(currency, rawAmount) {
    return new CurrencyAmount(currency, rawAmount);
  }
  static fromFractionalAmount(currency, numerator, denominator) {
    return new CurrencyAmount(currency, numerator, denominator);
  }
  add(other) {
    invariant3(this.currency.equals(other.currency), "CURRENCY");
    const added = super.add(other);
    return CurrencyAmount.fromFractionalAmount(this.currency, added.numerator, added.denominator);
  }
  subtract(other) {
    invariant3(this.currency.equals(other.currency), "CURRENCY");
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
    invariant3(decimalPlaces <= this.currency.decimals, "DECIMALS");
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
import JSBI5 from "jsbi";
import invariant4 from "tiny-invariant";
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
    this.scalar = new Fraction(JSBI5.exponentiate(JSBI5.BigInt(10), JSBI5.BigInt(baseCurrency.decimals)), JSBI5.exponentiate(JSBI5.BigInt(10), JSBI5.BigInt(quoteCurrency.decimals)));
  }
  invert() {
    return new Price(this.quoteCurrency, this.baseCurrency, this.numerator, this.denominator);
  }
  multiply(other) {
    invariant4(this.quoteCurrency.equals(other.baseCurrency), "TOKEN");
    const fraction = super.multiply(other);
    return new Price(this.baseCurrency, other.quoteCurrency, fraction.denominator, fraction.numerator);
  }
  quote(currencyAmount) {
    invariant4(currencyAmount.currency.equals(this.baseCurrency), "TOKEN");
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
import invariant5 from "tiny-invariant";
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
    invariant5(this.chainId === other.chainId, "CHAIN_IDS");
    invariant5(this.address !== other.address, "ADDRESSES");
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
import JSBI6 from "jsbi";
import invariant6 from "tiny-invariant";
function validateVMTypeInstance(value, vmType) {
  invariant6(JSBI6.greaterThanOrEqual(value, ZERO), `${value} is not a ${vmType}.`);
  invariant6(JSBI6.lessThanOrEqual(value, VM_TYPE_MAXIMA[vmType]), `${value} is not a ${vmType}.`);
}
function sqrt(y) {
  validateVMTypeInstance(y, "uint256" /* uint256 */);
  let z = ZERO;
  let x;
  if (JSBI6.greaterThan(y, THREE)) {
    z = y;
    x = JSBI6.add(JSBI6.divide(y, TWO), ONE);
    while (JSBI6.lessThan(x, z)) {
      z = x;
      x = JSBI6.divide(JSBI6.add(JSBI6.divide(y, x), x), TWO);
    }
  } else if (JSBI6.notEqual(y, ZERO)) {
    z = ONE;
  }
  return z;
}
function sortedInsert(items, add, maxSize, comparator) {
  invariant6(maxSize > 0, "MAX_SIZE_ZERO");
  invariant6(items.length <= maxSize, "ITEMS_SIZE");
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
export {
  BaseCurrency,
  CurrencyAmount,
  FIVE,
  Fraction,
  InsufficientInputAmountError,
  InsufficientReservesError,
  JSBI7 as JSBI,
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
};
