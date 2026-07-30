# Before → After

| Item | Before | After |
| --- | --- | --- |
| Token factory Solidity | Absent | `MelegaTokenFactory` + `MelegaFixedSupplyToken` |
| Foundry tests | None | 16 PASS incl. 3-token E2E |
| Mainnet deploy script | None | Fail-closed Foundry script |
| Frontend bind | null readiness only | Canonical deployment SSOT + readiness API + review UX |
| Factory address | null | still null (honest) |
| LIST_CREATE_TOKEN_AVAILABLE | false | false until mainnet bind |
| Creation fee on-chain | unset | immutable at deploy; wei pending Founder approval |
| LB / certified products | untouched | untouched |
