# Token Security Model

Canonical `MelegaFixedSupplyToken`:

- fixed total supply minted once in constructor to `owner`
- decimals 0–18 (default UI 18)
- no post-deploy mint
- no Ownable / admin roles on the token
- no pause, blacklist, tax, transfer hooks, max-wallet, trading gate
- no upgradeability
- standard ERC-20 transfer/approve
- optional logo/metadata is off-chain only

Factory cannot mint into or seize deployed tokens.
