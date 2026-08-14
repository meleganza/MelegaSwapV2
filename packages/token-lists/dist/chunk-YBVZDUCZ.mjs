// src/wrappedTokenInfo.ts
import { Token } from "@pancakeswap/swap-sdk-core";
var WrappedTokenInfo = class extends Token {
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
  return new Token(
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

export {
  WrappedTokenInfo,
  deserializeToken,
  VersionUpgrade,
  getVersionUpgrade
};
