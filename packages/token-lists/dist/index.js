"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  VersionUpgrade: () => VersionUpgrade,
  WrappedTokenInfo: () => WrappedTokenInfo,
  deserializeToken: () => deserializeToken,
  getVersionUpgrade: () => getVersionUpgrade
});
module.exports = __toCommonJS(src_exports);

// src/wrappedTokenInfo.ts
var import_swap_sdk_core = require("@pancakeswap/swap-sdk-core");
var WrappedTokenInfo = class extends import_swap_sdk_core.Token {
  constructor(tokenInfo) {
    super(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name);
    this.logoURI = tokenInfo.logoURI;
  }
  get serialize() {
    return {
      address: this.address,
      chainId: this.chainId,
      decimals: this.decimals,
      symbol: this.symbol,
      name: this.name,
      projectLink: this.projectLink,
      logoURI: this.logoURI
    };
  }
};
function deserializeToken(serializedToken) {
  if (serializedToken.logoURI) {
    return new WrappedTokenInfo({
      chainId: serializedToken.chainId,
      address: serializedToken.address,
      decimals: serializedToken.decimals,
      symbol: serializedToken.symbol || "Unknown",
      name: serializedToken.name || "Unknown",
      logoURI: serializedToken.logoURI
    });
  }
  return new import_swap_sdk_core.Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
    serializedToken.projectLink
  );
}

// src/getVersionUpgrade.ts
var VersionUpgrade = /* @__PURE__ */ ((VersionUpgrade2) => {
  VersionUpgrade2[VersionUpgrade2["NONE"] = 0] = "NONE";
  VersionUpgrade2[VersionUpgrade2["PATCH"] = 1] = "PATCH";
  VersionUpgrade2[VersionUpgrade2["MINOR"] = 2] = "MINOR";
  VersionUpgrade2[VersionUpgrade2["MAJOR"] = 3] = "MAJOR";
  return VersionUpgrade2;
})(VersionUpgrade || {});
function getVersionUpgrade(base, update) {
  if (update.major > base.major) {
    return 3 /* MAJOR */;
  }
  if (update.major < base.major) {
    return 0 /* NONE */;
  }
  if (update.minor > base.minor) {
    return 2 /* MINOR */;
  }
  if (update.minor < base.minor) {
    return 0 /* NONE */;
  }
  return update.patch > base.patch ? 1 /* PATCH */ : 0 /* NONE */;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  VersionUpgrade,
  WrappedTokenInfo,
  deserializeToken,
  getVersionUpgrade
});
