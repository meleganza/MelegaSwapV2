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

// index.ts
var multicall_exports = {};
__export(multicall_exports, {
  createMulticall: () => createMulticall,
  getMulticallContract: () => getMulticallContract,
  multicallAddresses: () => multicallAddresses
});
module.exports = __toCommonJS(multicall_exports);
var import_abi = require("@ethersproject/abi");
var import_contracts = require("@ethersproject/contracts");
var import_sdk = require("@pancakeswap/sdk");

// Multicall.json
var Multicall_default = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "target", type: "address" },
          { internalType: "bytes", name: "callData", type: "bytes" }
        ],
        internalType: "struct Multicall3.Call[]",
        name: "calls",
        type: "tuple[]"
      }
    ],
    name: "aggregate",
    outputs: [
      { internalType: "uint256", name: "blockNumber", type: "uint256" },
      { internalType: "bytes[]", name: "returnData", type: "bytes[]" }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "target", type: "address" },
          { internalType: "bool", name: "allowFailure", type: "bool" },
          { internalType: "bytes", name: "callData", type: "bytes" }
        ],
        internalType: "struct Multicall3.Call3[]",
        name: "calls",
        type: "tuple[]"
      }
    ],
    name: "aggregate3",
    outputs: [
      {
        components: [
          { internalType: "bool", name: "success", type: "bool" },
          { internalType: "bytes", name: "returnData", type: "bytes" }
        ],
        internalType: "struct Multicall3.Result[]",
        name: "returnData",
        type: "tuple[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "target", type: "address" },
          { internalType: "bool", name: "allowFailure", type: "bool" },
          { internalType: "uint256", name: "value", type: "uint256" },
          { internalType: "bytes", name: "callData", type: "bytes" }
        ],
        internalType: "struct Multicall3.Call3Value[]",
        name: "calls",
        type: "tuple[]"
      }
    ],
    name: "aggregate3Value",
    outputs: [
      {
        components: [
          { internalType: "bool", name: "success", type: "bool" },
          { internalType: "bytes", name: "returnData", type: "bytes" }
        ],
        internalType: "struct Multicall3.Result[]",
        name: "returnData",
        type: "tuple[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "target", type: "address" },
          { internalType: "bytes", name: "callData", type: "bytes" }
        ],
        internalType: "struct Multicall3.Call[]",
        name: "calls",
        type: "tuple[]"
      }
    ],
    name: "blockAndAggregate",
    outputs: [
      { internalType: "uint256", name: "blockNumber", type: "uint256" },
      { internalType: "bytes32", name: "blockHash", type: "bytes32" },
      {
        components: [
          { internalType: "bool", name: "success", type: "bool" },
          { internalType: "bytes", name: "returnData", type: "bytes" }
        ],
        internalType: "struct Multicall3.Result[]",
        name: "returnData",
        type: "tuple[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "getBasefee",
    outputs: [{ internalType: "uint256", name: "basefee", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "blockNumber", type: "uint256" }],
    name: "getBlockHash",
    outputs: [{ internalType: "bytes32", name: "blockHash", type: "bytes32" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getBlockNumber",
    outputs: [{ internalType: "uint256", name: "blockNumber", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getChainId",
    outputs: [{ internalType: "uint256", name: "chainid", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getCurrentBlockCoinbase",
    outputs: [{ internalType: "address", name: "coinbase", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getCurrentBlockDifficulty",
    outputs: [{ internalType: "uint256", name: "difficulty", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getCurrentBlockGasLimit",
    outputs: [{ internalType: "uint256", name: "gaslimit", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getCurrentBlockTimestamp",
    outputs: [{ internalType: "uint256", name: "timestamp", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "addr", type: "address" }],
    name: "getEthBalance",
    outputs: [{ internalType: "uint256", name: "balance", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getLastBlockHash",
    outputs: [{ internalType: "bytes32", name: "blockHash", type: "bytes32" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "bool", name: "requireSuccess", type: "bool" },
      {
        components: [
          { internalType: "address", name: "target", type: "address" },
          { internalType: "bytes", name: "callData", type: "bytes" }
        ],
        internalType: "struct Multicall3.Call[]",
        name: "calls",
        type: "tuple[]"
      }
    ],
    name: "tryAggregate",
    outputs: [
      {
        components: [
          { internalType: "bool", name: "success", type: "bool" },
          { internalType: "bytes", name: "returnData", type: "bytes" }
        ],
        internalType: "struct Multicall3.Result[]",
        name: "returnData",
        type: "tuple[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "bool", name: "requireSuccess", type: "bool" },
      {
        components: [
          { internalType: "address", name: "target", type: "address" },
          { internalType: "bytes", name: "callData", type: "bytes" }
        ],
        internalType: "struct Multicall3.Call[]",
        name: "calls",
        type: "tuple[]"
      }
    ],
    name: "tryBlockAndAggregate",
    outputs: [
      { internalType: "uint256", name: "blockNumber", type: "uint256" },
      { internalType: "bytes32", name: "blockHash", type: "bytes32" },
      {
        components: [
          { internalType: "bool", name: "success", type: "bool" },
          { internalType: "bytes", name: "returnData", type: "bytes" }
        ],
        internalType: "struct Multicall3.Result[]",
        name: "returnData",
        type: "tuple[]"
      }
    ],
    stateMutability: "payable",
    type: "function"
  }
];

// index.ts
var multicallAddresses = {
  1: "0xcA11bde05977b3631167028862bE2a173976CA11",
  56: "0xcA11bde05977b3631167028862bE2a173976CA11",
  8453: "0x4fe5CBf4658d6Ca76431dD05D2D7aD6BbCD20891",
  137: "0xcA11bde05977b3631167028862bE2a173976CA11",
  42161: "0xcA11bde05977b3631167028862bE2a173976CA11",
  43114: "0xcA11bde05977b3631167028862bE2a173976CA11",
  250: "0xcA11bde05977b3631167028862bE2a173976CA11",
  25: "0xcA11bde05977b3631167028862bE2a173976CA11",
  369: "0xcA11bde05977b3631167028862bE2a173976CA11",
  10: "0xcA11bde05977b3631167028862bE2a173976CA11",
  324: "0xcA11bde05977b3631167028862bE2a173976CA11",
  148: "0x272219571f9E6104960BE987f2462804fBD12551",
  97: "0xcA11bde05977b3631167028862bE2a173976CA11"
};
var getMulticallContract = (chainId, provider) => {
  if (multicallAddresses[chainId]) {
    return new import_contracts.Contract(multicallAddresses[chainId], Multicall_default, provider);
  }
  return null;
};
function createMulticall(provider) {
  const multicall = async (abi, calls, chainId = import_sdk.ChainId.BSC) => {
    const multi = getMulticallContract(chainId, provider({ chainId }));
    if (!multi)
      throw new Error(`Multicall Provider missing for ${chainId}`);
    const itf = new import_abi.Interface(abi);
    const calldata = calls.map((call) => ({
      target: call.address.toLowerCase(),
      callData: itf.encodeFunctionData(call.name, call.params)
    }));
    const { returnData } = await multi.callStatic.aggregate(calldata);
    const res = returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call));
    return res;
  };
  const multicallv2 = async ({ abi, calls, chainId = import_sdk.ChainId.BSC, options, provider: _provider }) => {
    const { requireSuccess = true, ...overrides } = options || {};
    const multi = getMulticallContract(chainId, _provider || provider({ chainId }));
    if (!multi)
      throw new Error(`Multicall Provider missing for ${chainId}`);
    const itf = new import_abi.Interface(abi);
    const calldata = calls.map((call) => ({
      target: call.address.toLowerCase(),
      callData: itf.encodeFunctionData(call.name, call.params)
    }));
    const returnData = await multi.callStatic.tryAggregate(requireSuccess, calldata, overrides);
    const res = returnData.map((call, i) => {
      const [result, data] = call;
      return result && data !== "0x" ? itf.decodeFunctionResult(calls[i].name, data) : null;
    });
    return res;
  };
  const multicallv3 = async ({ calls, chainId = import_sdk.ChainId.BSC, allowFailure, overrides }) => {
    const multi = getMulticallContract(chainId, provider({ chainId }));
    if (!multi)
      throw new Error(`Multicall Provider missing for ${chainId}`);
    const interfaceCache = /* @__PURE__ */ new WeakMap();
    const _calls = calls.map(({ abi, address, name, params, allowFailure: _allowFailure }) => {
      let itf = interfaceCache.get(abi);
      if (!itf) {
        itf = new import_abi.Interface(abi);
        interfaceCache.set(abi, itf);
      }
      if (!itf.fragments.some((fragment) => fragment.name === name))
        console.error(`${name} missing on ${address}`);
      const callData = itf.encodeFunctionData(name, params != null ? params : []);
      return {
        target: address.toLowerCase(),
        allowFailure: allowFailure || _allowFailure,
        callData
      };
    });
    const result = await multi.callStatic.aggregate3(_calls, ...overrides ? [overrides] : []);
    return result.map((call, i) => {
      const { returnData, success } = call;
      if (!success || returnData === "0x")
        return null;
      const { abi, name } = calls[i];
      const itf = interfaceCache.get(abi);
      const decoded = itf == null ? void 0 : itf.decodeFunctionResult(name, returnData);
      return decoded;
    });
  };
  return {
    multicall,
    multicallv2,
    multicallv3
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createMulticall,
  getMulticallContract,
  multicallAddresses
});
