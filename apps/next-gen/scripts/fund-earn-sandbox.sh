#!/usr/bin/env bash
set -euo pipefail

rpc=http://127.0.0.1:8545
account=${1:?Usage: fund-earn-sandbox.sh TEST_WALLET_ADDRESS}
[[ "$account" =~ ^0x[[:xdigit:]]{40}$ ]]
[[ "$(cast chain-id --rpc-url "$rpc")" == 31337 ]]
cast rpc --rpc-url "$rpc" anvil_nodeInfo >/dev/null

amount=10000000000000000000
value=$(cast abi-encode 'f(uint256)' "$amount")
cast rpc --rpc-url "$rpc" anvil_setBalance "$account" "$(cast to-hex "$amount")" >/dev/null
fund_token() {
  local token=$1 mapping=$2
  local slot
  slot=$(cast index address "$account" "$mapping")
  cast rpc --rpc-url "$rpc" anvil_setStorageAt "$token" "$slot" "$value" >/dev/null
  [[ "$(cast call --rpc-url "$rpc" "$token" 'balanceOf(address)(uint256)' "$account" | cut -d' ' -f1)" == "$amount" ]]
}
fund_token 0x963556de0eb8138E97A85F0A86eE0acD159D210b 1
fund_token 0xcE033c748aBd4B5e9aE16efFdb0b0c91fB0c99F1 51
printf 'Sandbox wallet funded: %s\n' "$account"
