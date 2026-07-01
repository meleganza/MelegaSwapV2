# Pools Visibility Audit

Read-only audit for missing staking pools on `/pools` (BSC default chain). No pool logic was changed.

## Executive summary

| Metric | Count |
| --- | ---: |
| Total configured pools (all chains) | 267 |
| Config `isFinished: false` (live flag) | 189 |
| Config `isFinished: true` | 78 |
| BSC pools in default export (`livePools56` + `finishedPools`) | 241 |
| ETH live pools (`livePools1`) | 2 |
| Polygon live pools (`livePools137`) | 12 |
| Base live pools (`livePools8453`) | 12 |

**Observed UI (~2 visible pools):** Expected under current filters. The Pools page shows only **open** pools (`!pool.isFinished`). At runtime, `fetchPoolsPublicDataAsync` marks a pool finished when `currentBlock > bonusEndBlock` on-chain (`state/pools/index.ts`). Most legacy MelegaSwap pools have ended their bonus period; only pools still within their on-chain end block appear as open.

**Homepage earn strip** shows at most 3 pools via `useHomeTradeData` → `pools.slice(0, 3)` — presentation limit on homepage only, not the Pools page.

**No safe presentation fix applied** on `/pools`: there is no erroneous `.slice(0,2)`, MARCO-only filter, or DS regression hiding active pools. Missing pools are overwhelmingly **finished by on-chain end block**, not removed from config.

## Filter chain (BSC / chainId 56)

1. **Config source:** `poolsConfig = [...livePools56, ...finishedPools]` (`pools.tsx` default export).
2. **Fetch scope:** `fetchPools.ts` multicalls `bonusEndBlock` only for `!isFinished` pools with `sousId !== 0`.
3. **Runtime status:** `isPoolFinished = pool.isFinished || currentBlock > endBlock` (`state/pools/index.ts`).
4. **Pools page UI:** `PoolControls` partitions into `openPools` vs `finishedPools`; default route shows `openPoolsWithStartBlockFilter` only (`showFinishedPools` only on `/pools/history`).
5. **Pagination:** Initial `NUMBER_OF_POOLS_VISIBLE = 12` with intersection observer — not a 2-pool cap.
6. **Homepage:** `useGetTopPoolsByApr` excludes `sousId === 0`; `useHomeTradeData` slices top 3 for earn rows.

## Suspected regression

**None identified in Melega theme / Home V2 work.** Behavior matches legacy Pancake/Melega pool lifecycle: ended campaigns move to finished state. Venue registry ticker label `MARCO Stake Pool (sousId 0)` is a **homepage presentation** issue (fixed via ribbon sanitization in `useHomeTradeData.ts`), not a pool count regression.

## Safe fix recommendation

- **Do not** re-enable ended pools in the open list without product decision — contracts may still hold funds but rewards ended.
- Users with stake in finished pools: use **Staked only** toggle or `/pools/history`.
- Optional future: separate "Ended pools" tab or archive view (out of scope; would be product change).
- Homepage: ribbon label sanitization applied (presentation only).

## Full pool inventory

| Pool | sousId | staking token | earning token | chain | config status | visible? | reason if hidden |
| --- | ---: | --- | --- | ---: | --- | --- | --- |
| cake / cake | 0 | cake | cake | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / mxmx | 14 | cake | mxmx | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / zoloto | 4 | cake | zoloto | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / m01 | 6 | cake | m01 | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / bear | 20 | cake | bear | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / gcc2 | 22 | cake | gcc2 | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / lira | 34 | cake | lira | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / borz | 42 | cake | borz | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / poop | 46 | cake | poop | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / luck | 47 | cake | luck | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / ggtkn | 52 | cake | ggtkn | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / XPHX | 62 | cake | XPHX | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / alt | 66 | cake | alt | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / befx | 71 | cake | befx | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / RFX | 80 | cake | RFX | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / MIR | 81 | cake | MIR | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / LMCSWAP | 83 | cake | LMCSWAP | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / FRTC | 86 | cake | FRTC | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / PHDAO | 88 | cake | PHDAO | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / CDIG | 91 | cake | CDIG | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / SVR | 94 | cake | SVR | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / BACD2 | 96 | cake | BACD2 | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / RZ4 | 99 | cake | RZ4 | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / MongBNB | 100 | cake | MongBNB | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / EYED | 102 | cake | EYED | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / PORN | 103 | cake | PORN | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / EDENX | 104 | cake | EDENX | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / PRP | 105 | cake | PRP | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / HUGO | 106 | cake | HUGO | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / GOGU | 107 | cake | GOGU | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / POP | 108 | cake | POP | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / SUP | 109 | cake | SUP | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / jaba | 110 | cake | jaba | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / lsphere | 111 | cake | lsphere | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / cuby | 112 | cake | cuby | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / rocket | 113 | cake | rocket | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / skid | 114 | cake | skid | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / axpe | 115 | cake | axpe | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / fly | 116 | cake | fly | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / vibra | 117 | cake | vibra | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / boai | 118 | cake | boai | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / aaron | 119 | cake | aaron | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / pco | 120 | cake | pco | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / mong2 | 121 | cake | mong2 | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / teeny | 122 | cake | teeny | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / chame | 123 | cake | chame | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / ptc | 124 | cake | ptc | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / bode | 125 | cake | bode | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / wdt | 126 | cake | wdt | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / yatinu | 127 | cake | yatinu | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / raky | 128 | cake | raky | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / mob | 129 | cake | mob | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / yd | 130 | cake | yd | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / cock | 131 | cake | cock | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / alter | 132 | cake | alter | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / rdrs | 133 | cake | rdrs | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / trt | 134 | cake | trt | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / apemax | 135 | cake | apemax | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / pepecb | 136 | cake | pepecb | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / choco | 137 | cake | choco | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / agape | 138 | cake | agape | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / cat | 139 | cake | cat | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / icn | 140 | cake | icn | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / docswap | 141 | cake | docswap | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / agapeai | 142 | cake | agapeai | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / safo | 143 | cake | safo | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / m420 | 144 | cake | m420 | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / clan | 145 | cake | clan | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / rari | 146 | cake | rari | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / shifo | 147 | cake | shifo | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / mix2 | 148 | cake | mix2 | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / chc | 149 | cake | chc | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / crystals | 150 | cake | crystals | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / drai | 151 | cake | drai | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / deencoin | 152 | cake | deencoin | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / pspay | 153 | cake | pspay | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / clowns | 154 | cake | clowns | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / hada | 155 | cake | hada | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / cavea | 156 | cake | cavea | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / cbnb | 157 | cake | cbnb | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / geck | 158 | cake | geck | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / ngd | 159 | cake | ngd | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / cmc | 160 | cake | cmc | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / wfx | 161 | cake | wfx | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / bgcat | 162 | cake | bgcat | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / voc | 163 | cake | voc | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / xrpgrow | 164 | cake | xrpgrow | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / rickinu | 165 | cake | rickinu | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / fugc | 166 | cake | fugc | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / cpepe | 167 | cake | cpepe | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / esso | 168 | cake | esso | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / cusdt | 169 | cake | cusdt | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / cxrp | 170 | cake | cxrp | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / pipi | 171 | cake | pipi | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / toto | 172 | cake | toto | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / pepeburnv2 | 173 | cake | pepeburnv2 | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / chonky | 174 | cake | chonky | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / bkp | 175 | cake | bkp | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / dxr | 176 | cake | dxr | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / dbu | 177 | cake | dbu | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / lone | 178 | cake | lone | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / slafac | 179 | cake | slafac | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / otl | 180 | cake | otl | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / gxm | 181 | cake | gxm | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / nodes7 | 182 | cake | nodes7 | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / haaga420 | 183 | cake | haaga420 | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / efcr | 184 | cake | efcr | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / tah | 185 | cake | tah | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / bbuck | 186 | cake | bbuck | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / groklabs | 187 | cake | groklabs | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / wzm | 188 | cake | wzm | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / mememint | 189 | cake | mememint | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / mlb | 190 | cake | mlb | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / nbd | 191 | cake | nbd | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / tor | 192 | cake | tor | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / sgrok | 193 | cake | sgrok | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / love69 | 194 | cake | love69 | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / groklabs2 | 195 | cake | groklabs2 | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / rao | 196 | cake | rao | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / dc4 | 197 | cake | dc4 | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / xex | 198 | cake | xex | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / msoc | 199 | cake | msoc | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / nynyc | 200 | cake | nynyc | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / fr | 201 | cake | fr | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / farm | 202 | cake | farm | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / bullstar | 203 | cake | bullstar | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / plz | 204 | cake | plz | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / butt | 205 | cake | butt | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / babyfox | 206 | cake | babyfox | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / mgc | 207 | cake | mgc | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / jimbo | 208 | cake | jimbo | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / wkfx | 209 | cake | wkfx | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / arct | 210 | cake | arct | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / aivold | 211 | cake | aivold | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / ifnet | 212 | cake | ifnet | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / trump | 213 | cake | trump | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / goden | 214 | cake | goden | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / csol | 215 | cake | csol | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / aivnew | 216 | cake | aivnew | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / tongue | 217 | cake | tongue | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / babymarco | 218 | cake | babymarco | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / wax | 219 | cake | wax | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / nesg | 220 | cake | nesg | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / usdcg | 221 | cake | usdcg | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / deencoin | 222 | cake | deencoin | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / mogul | 223 | cake | mogul | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / mel | 224 | cake | mel | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / cbs | 225 | cake | cbs | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / gamext | 226 | cake | gamext | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / bcx | 227 | cake | bcx | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / traff | 228 | cake | traff | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / saita | 229 | cake | saita | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / tenco | 230 | cake | tenco | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / thepug | 231 | cake | thepug | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / rtime | 232 | cake | rtime | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / ggft | 233 | cake | ggft | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / bnbdog | 234 | cake | bnbdog | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / wmn | 235 | cake | wmn | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / qwrx | 236 | cake | qwrx | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / qlm | 237 | cake | qlm | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / blion | 238 | cake | blion | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / orbe | 239 | cake | orbe | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / zanna | 240 | cake | zanna | 56 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| ? / ethereumTokens | 0 | ? | ethereumTokens | 1 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| ? / ethereumTokens | 1 | ? | ethereumTokens | 1 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / cake | 0 | cake | cake | 137 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / xoxo | 1 | cake | xoxo | 137 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / dc4 | 2 | cake | dc4 | 137 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / teddy | 3 | cake | teddy | 137 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / enj | 4 | cake | enj | 137 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / trump | 5 | cake | trump | 137 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / melania | 6 | cake | melania | 137 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / jonky | 7 | cake | jonky | 137 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / mega | 8 | cake | mega | 137 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / pm | 9 | cake | pm | 137 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / csn | 10 | cake | csn | 137 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / vtr | 11 | cake | vtr | 137 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / cake | 0 | cake | cake | 8453 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / yup | 1 | cake | yup | 8453 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / clonereth | 2 | cake | clonereth | 8453 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / clonezro | 3 | cake | clonezro | 8453 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / hoe | 4 | cake | hoe | 8453 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / pepe1 | 5 | cake | pepe1 | 8453 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / mxmxbase | 6 | cake | mxmxbase | 8453 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / mojo | 7 | cake | mojo | 8453 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / hanc | 8 | cake | hanc | 8453 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / farmbase | 9 | cake | farmbase | 8453 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / aetx | 10 | cake | aetx | 8453 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / fork | 11 | cake | fork | 8453 | live | Only if endBlock > currentBlock | Runtime: PoolControls openPools filter marks finished when currentBlock > bonusEndBlock (state/pools/index.ts) |
| cake / mxmx | 1 | cake | mxmx | 56 | finished | No | isFinished: true in pools config |
| cake / gitto | 2 | cake | gitto | 56 | finished | No | isFinished: true in pools config |
| cake / gitto | 15 | cake | gitto | 56 | finished | No | isFinished: true in pools config |
| cake / gcc2 | 3 | cake | gcc2 | 56 | finished | No | isFinished: true in pools config |
| cake / gcc2 | 16 | cake | gcc2 | 56 | finished | No | isFinished: true in pools config |
| cake / rmbr | 5 | cake | rmbr | 56 | finished | No | isFinished: true in pools config |
| mxmx / cake | 7 | mxmx | cake | 56 | finished | No | isFinished: true in pools config |
| mxmx / cake | 17 | mxmx | cake | 56 | finished | No | isFinished: true in pools config |
| gitto / cake | 8 | gitto | cake | 56 | finished | No | isFinished: true in pools config |
| gitto / cake | 18 | gitto | cake | 56 | finished | No | isFinished: true in pools config |
| gcc2 / cake | 9 | gcc2 | cake | 56 | finished | No | isFinished: true in pools config |
| gcc2 / cake | 19 | gcc2 | cake | 56 | finished | No | isFinished: true in pools config |
| mm72 / cake | 10 | mm72 | cake | 56 | finished | No | isFinished: true in pools config |
| marcobnb / cake | 11 | marcobnb | cake | 56 | finished | No | isFinished: true in pools config |
| mxmxbnb / mxmx | 12 | mxmxbnb | mxmx | 56 | finished | No | isFinished: true in pools config |
| mm72bnb / mm72 | 13 | mm72bnb | mm72 | 56 | finished | No | isFinished: true in pools config |
| cake / volt | 21 | cake | volt | 56 | finished | No | isFinished: true in pools config |
| cake / mxmx | 23 | cake | mxmx | 56 | finished | No | isFinished: true in pools config |
| cake / fbtc | 24 | cake | fbtc | 56 | finished | No | isFinished: true in pools config |
| cake / gwt | 25 | cake | gwt | 56 | finished | No | isFinished: true in pools config |
| cake / qcwc | 26 | cake | qcwc | 56 | finished | No | isFinished: true in pools config |
| cake / ostrich | 27 | cake | ostrich | 56 | finished | No | isFinished: true in pools config |
| cake / koala | 28 | cake | koala | 56 | finished | No | isFinished: true in pools config |
| cake / froge | 29 | cake | froge | 56 | finished | No | isFinished: true in pools config |
| cake / rotto | 30 | cake | rotto | 56 | finished | No | isFinished: true in pools config |
| cake / gpay | 31 | cake | gpay | 56 | finished | No | isFinished: true in pools config |
| cake / ggw | 32 | cake | ggw | 56 | finished | No | isFinished: true in pools config |
| cake / hbit | 33 | cake | hbit | 56 | finished | No | isFinished: true in pools config |
| cake / spx | 35 | cake | spx | 56 | finished | No | isFinished: true in pools config |
| cake / lois | 36 | cake | lois | 56 | finished | No | isFinished: true in pools config |
| cake / dogebit | 37 | cake | dogebit | 56 | finished | No | isFinished: true in pools config |
| cake / C4Cv2 | 38 | cake | C4Cv2 | 56 | finished | No | isFinished: true in pools config |
| cake / sfe | 39 | cake | sfe | 56 | finished | No | isFinished: true in pools config |
| cake / befxold | 40 | cake | befxold | 56 | finished | No | isFinished: true in pools config |
| cake / fwc | 41 | cake | fwc | 56 | finished | No | isFinished: true in pools config |
| cake / fas | 43 | cake | fas | 56 | finished | No | isFinished: true in pools config |
| cake / cti | 44 | cake | cti | 56 | finished | No | isFinished: true in pools config |
| cake / cvl | 45 | cake | cvl | 56 | finished | No | isFinished: true in pools config |
| cake / hse | 48 | cake | hse | 56 | finished | No | isFinished: true in pools config |
| cake / tpcv3 | 49 | cake | tpcv3 | 56 | finished | No | isFinished: true in pools config |
| cake / spaceape | 50 | cake | spaceape | 56 | finished | No | isFinished: true in pools config |
| cake / sfea | 51 | cake | sfea | 56 | finished | No | isFinished: true in pools config |
| cake / sbdex | 53 | cake | sbdex | 56 | finished | No | isFinished: true in pools config |
| cake / rug | 54 | cake | rug | 56 | finished | No | isFinished: true in pools config |
| cake / lcsc | 55 | cake | lcsc | 56 | finished | No | isFinished: true in pools config |
| cake / dyn | 56 | cake | dyn | 56 | finished | No | isFinished: true in pools config |
| cake / ipl | 57 | cake | ipl | 56 | finished | No | isFinished: true in pools config |
| cake / susu | 58 | cake | susu | 56 | finished | No | isFinished: true in pools config |
| cake / WHEXDAO | 59 | cake | WHEXDAO | 56 | finished | No | isFinished: true in pools config |
| cake / diga | 60 | cake | diga | 56 | finished | No | isFinished: true in pools config |
| cake / sweep | 61 | cake | sweep | 56 | finished | No | isFinished: true in pools config |
| cake / HYPEC | 63 | cake | HYPEC | 56 | finished | No | isFinished: true in pools config |
| cake / DOGEUM | 64 | cake | DOGEUM | 56 | finished | No | isFinished: true in pools config |
| cake / help | 65 | cake | help | 56 | finished | No | isFinished: true in pools config |
| cake / BEP40 | 67 | cake | BEP40 | 56 | finished | No | isFinished: true in pools config |
| cake / WHEX | 68 | cake | WHEX | 56 | finished | No | isFinished: true in pools config |
| cake / BTCF | 69 | cake | BTCF | 56 | finished | No | isFinished: true in pools config |
| cake / DOWA | 70 | cake | DOWA | 56 | finished | No | isFinished: true in pools config |
| cake / MRABBIT | 72 | cake | MRABBIT | 56 | finished | No | isFinished: true in pools config |
| cake / FNT | 73 | cake | FNT | 56 | finished | No | isFinished: true in pools config |
| cake / wCHK | 74 | cake | wCHK | 56 | finished | No | isFinished: true in pools config |
| cake / YKS | 75 | cake | YKS | 56 | finished | No | isFinished: true in pools config |
| cake / Bera | 76 | cake | Bera | 56 | finished | No | isFinished: true in pools config |
| cake / REAL | 77 | cake | REAL | 56 | finished | No | isFinished: true in pools config |
| cake / TREE | 78 | cake | TREE | 56 | finished | No | isFinished: true in pools config |
| cake / FLOSHIDO | 79 | cake | FLOSHIDO | 56 | finished | No | isFinished: true in pools config |
| cake / TFT | 82 | cake | TFT | 56 | finished | No | isFinished: true in pools config |
| cake / bytc | 84 | cake | bytc | 56 | finished | No | isFinished: true in pools config |
| cake / KUSH | 85 | cake | KUSH | 56 | finished | No | isFinished: true in pools config |
| cake / EBTC | 87 | cake | EBTC | 56 | finished | No | isFinished: true in pools config |
| cake / UFCB | 89 | cake | UFCB | 56 | finished | No | isFinished: true in pools config |
| cake / NERVE | 90 | cake | NERVE | 56 | finished | No | isFinished: true in pools config |
| cake / Dsun | 92 | cake | Dsun | 56 | finished | No | isFinished: true in pools config |
| cake / SLR | 93 | cake | SLR | 56 | finished | No | isFinished: true in pools config |
| cake / IFRIT | 95 | cake | IFRIT | 56 | finished | No | isFinished: true in pools config |
| cake / SHAUN | 97 | cake | SHAUN | 56 | finished | No | isFinished: true in pools config |
| cake / XCEO | 98 | cake | XCEO | 56 | finished | No | isFinished: true in pools config |
| cake / BART | 101 | cake | BART | 56 | finished | No | isFinished: true in pools config |
