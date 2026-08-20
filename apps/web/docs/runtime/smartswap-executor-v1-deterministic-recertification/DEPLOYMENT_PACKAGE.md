# DEPLOYMENT_PACKAGE

Unsigned. Not signed. Not broadcast.

Machine-readable: `deployments/mainnet/smartswap-executor-v1-unsigned-deployment.json`

| | |
|--|--|
| chainId | 56 |
| deployer | `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` |
| to | `null` (CREATE) |
| value | 0 |
| creation bytecode | 8584 bytes, keccak `0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791` |
| constructor | `(treasury, intentSigner, wrappedNative, owner)` |
| treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` (frozen) |
| wrappedNative | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` (frozen) |
| intentSigner / owner | `SET_AT_AUTHORIZED_DEPLOY` |
| full data | `creationBytecode \|\| abi.encode(...)` once signer and owner are chosen |
| gas estimate | 1,862,961 units (`eth_estimateGas` with owner=signer=deployer placeholders only) |
| observed gas price | 50,000,000 wei (0.05 gwei) |
| nonce | **not frozen**; observed 3193 at block 117072549 |
| CREATE address | `keccak256(rlp([deployer, nonce]))[12:]`. If nonce stayed 3193: `0x8A591dbA8532f71Ba3A503BC42F1CFbDF2e645F4`. **Do not freeze.** |

## Post-deploy configuration (do not execute in this mission)

1. `setRouter(0x10ED43C718714eb63d5aA57B78B54704E256024E, keccak256("pancakeswap"), true)`
2. Leave paused = false unless founder pauses.
3. Fee cap is immutable `MAX_PROTOCOL_FEE_BPS = 25`.
4. Intent trust is constructor `intentSigner` (eth_sign of `abi.encode` intent, not EIP-712).

No other init transactions are required for the certified canary path.
