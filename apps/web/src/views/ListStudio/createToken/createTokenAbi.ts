/**
 * Minimal ABI for MelegaTokenFactory + post-create ERC-20 reads.
 * Generated from contracts/create-token (Foundry 0.8.20).
 */

export const MELEGA_TOKEN_FACTORY_ABI = [
  {
    type: 'constructor',
    inputs: [
      { name: 'feeRecipient_', type: 'address' },
      { name: 'creationFee_', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createToken',
    inputs: [
      { name: 'name_', type: 'string' },
      { name: 'symbol_', type: 'string' },
      { name: 'totalSupply_', type: 'uint256' },
      { name: 'decimals_', type: 'uint8' },
      { name: 'owner', type: 'address' },
    ],
    outputs: [{ name: 'token', type: 'address' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'creationFee',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'feeRecipient',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'TokenCreated',
    inputs: [
      { name: 'creator', type: 'address', indexed: true },
      { name: 'token', type: 'address', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'symbol', type: 'string', indexed: false },
      { name: 'totalSupply', type: 'uint256', indexed: false },
      { name: 'decimals', type: 'uint8', indexed: false },
      { name: 'owner', type: 'address', indexed: false },
      { name: 'creationFee', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
] as const

export const MELEGA_FIXED_SUPPLY_TOKEN_ABI = [
  { type: 'function', name: 'name', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
  { type: 'function', name: 'symbol', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
  { type: 'function', name: 'decimals', inputs: [], outputs: [{ type: 'uint8' }], stateMutability: 'view' },
  { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
] as const
