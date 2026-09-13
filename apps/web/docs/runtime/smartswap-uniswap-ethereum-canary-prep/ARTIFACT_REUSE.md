# ExecutorV1 reuse on Ethereum

`SmartSwapExecutorV1` is venue-independent and chain-agnostic:

- `wrappedNative` is a constructor immutable.
- `treasury` is a constructor immutable.
- `intent.chainId` must equal `block.chainid`.
- Router allowlist is `setRouter`.
- Exact-in only. Fee is `authorizedFeeBps(structuralRouteCostBps)` from `SMARTSWAP_REVENUE_POLICY_V1`.

No source change is required for Uniswap Ethereum. Constructor/config only:

| field | Ethereum value |
| --- | --- |
| treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| wrappedNative | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` |
| intentSigner / owner | set at authorized deploy |
| setRouter | `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D`, `keccak256("uniswap")`, true |

Compiler-level creation/deployed-template hashes are identical to the certified BSC artifact because they do not embed constructor args. On-chain runtime hash cannot be frozen until signer/owner are chosen.
