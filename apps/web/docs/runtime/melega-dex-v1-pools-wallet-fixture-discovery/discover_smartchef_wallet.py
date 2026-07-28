#!/usr/bin/env python3
"""Discover factual SmartChef holders via Deposit logs + userInfo eth_call."""
from __future__ import annotations

import json
import time
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parent
RPC = open("/tmp/melega-qn-clean.txt").read().splitlines()[0]
MASTERCHEF = "0x41d5487836452d23f2c467070244e5842b412794"
DEPOSIT = "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c"
WITHDRAW = "0x884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a9424364"
EMERGENCY = "0xbb00783f557e9561963bdfd2774003005466ab370fba63e9ab4a3c7da447942a"
USERINFO_SEL = "0x1959a002"
PENDING_SEL = "0xded9382a"  # pendingReward(address) — verify
MARCO = "0x963556de0eb8138e97a85f0a86ee0acd159d210b"
BALANCE_SEL = "0x70a08231"
CHUNK = 5000
TARGET_VERIFIED = 5


def rpc(method, params, retries=6):
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params}).encode()
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                RPC, data=body, headers={"content-type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=60) as r:
                data = json.load(r)
            if data.get("error"):
                last = data["error"]
                time.sleep(0.3 * (attempt + 1))
                continue
            return data["result"]
        except Exception as e:
            last = e
            time.sleep(0.4 * (attempt + 1))
    raise RuntimeError(f"{method} failed: {last}")


def topic_addr(topic: str) -> str:
    return "0x" + topic[-40:]


def user_info(pool: str, wallet: str):
    data = USERINFO_SEL + wallet[2:].lower().rjust(64, "0")
    raw = rpc("eth_call", [{"to": pool, "data": data}, "latest"])
    if not raw or raw == "0x":
        return 0, 0
    amount = int(raw[2:66], 16)
    debt = int(raw[66:130], 16) if len(raw) >= 130 else 0
    return amount, debt


def pending_reward(pool: str, wallet: str):
    # try common selector; ignore failures
    for sel in ("0xded9382a", "0x73a2e912"):  # pendingReward / pending
        try:
            data = sel + wallet[2:].lower().rjust(64, "0")
            raw = rpc("eth_call", [{"to": pool, "data": data}, "latest"])
            if raw and raw != "0x":
                return int(raw[2:66], 16)
        except Exception:
            continue
    return None


def marco_balance(pool: str) -> int:
    data = BALANCE_SEL + pool[2:].lower().rjust(64, "0")
    raw = rpc("eth_call", [{"to": MARCO, "data": data}, "latest"])
    return int(raw, 16) if raw else 0


def get_logs(address, topic, frm, to):
    return (
        rpc(
            "eth_getLogs",
            [
                {
                    "address": address,
                    "fromBlock": hex(frm),
                    "toBlock": hex(to),
                    "topics": [topic],
                }
            ],
        )
        or []
    )


def main():
    registry = json.loads(
        (OUT.parents[2] / "public/registry/onchain/bsc-mainnet.json").read_text()
    )
    pools = [
        p
        for p in registry["smartChef"]["pools"]
        if p["contractAddress"].lower() != MASTERCHEF
        and str(p.get("startBlock", "")).replace("—", "").isdigit()
    ]
    latest = int(rpc("eth_blockNumber", []), 16)

    # Rank by remaining MARCO in contract (proxy for live principal)
    ranked = []
    for p in pools:
        try:
            bal = marco_balance(p["contractAddress"])
        except Exception:
            bal = 0
        if bal > 0:
            ranked.append((bal, p))
    ranked.sort(key=lambda x: x[0], reverse=True)

    scan = {
        "mission": "MELEGA_DEX_V1_POOLS_WALLET_FIXTURE_DISCOVERY_AND_3_CYCLE_UNBLOCK",
        "scannedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "latestBlock": latest,
        "masterChefExcluded": MASTERCHEF,
        "fundedPoolsConsidered": len(ranked),
        "poolsScanned": 0,
        "depositEvents": 0,
        "withdrawEvents": 0,
        "emergencyEvents": 0,
        "walletsChecked": 0,
        "pools": [],
        "failures": [],
    }

    verified = []
    checked = set()

    print(json.dumps({"latest": latest, "fundedPools": len(ranked), "target": TARGET_VERIFIED}))

    for bal, p in ranked:
        if len(verified) >= TARGET_VERIFIED:
            break
        pool = p["contractAddress"]
        start = int(p["startBlock"])
        end = int(p["endBlock"]) if str(p.get("endBlock", "")).isdigit() else latest
        to_scan = min(latest, end + 200_000)
        entry = {
            "contractAddress": pool,
            "sousId": p.get("sousId"),
            "poolName": p.get("poolName"),
            "marcoBalance": str(bal),
            "startBlock": start,
            "endBlock": end,
            "state": p.get("state"),
            "active": p.get("active"),
            "depositsSeen": 0,
            "verifiedHits": 0,
        }
        print("SCAN", p.get("sousId"), p.get("poolName"), pool, "marcoBal", bal)
        frm = start
        chunks = 0
        try:
            while frm <= to_scan and len(verified) < TARGET_VERIFIED:
                to = min(frm + CHUNK - 1, to_scan)
                logs = get_logs(pool, DEPOSIT, frm, to)
                entry["depositsSeen"] += len(logs)
                scan["depositEvents"] += len(logs)
                for log in logs:
                    topics = log.get("topics") or []
                    if len(topics) < 2:
                        continue
                    wallet = topic_addr(topics[1])
                    key = (wallet.lower(), pool.lower())
                    if key in checked:
                        continue
                    checked.add(key)
                    scan["walletsChecked"] += 1
                    amount, debt = user_info(pool, wallet)
                    if amount > 0:
                        pending = pending_reward(pool, wallet)
                        row = {
                            "wallet": wallet,
                            "smartChef": pool,
                            "sousId": p.get("sousId"),
                            "poolName": p.get("poolName"),
                            "stakedToken": p.get("stakedToken"),
                            "rewardToken": p.get("rewardToken"),
                            "active": bool(p.get("active")),
                            "state": p.get("state"),
                            "onChainPrincipal": str(amount),
                            "rewardDebt": str(debt),
                            "claimableReward": None if pending is None else str(pending),
                            "marcoPoolBalance": str(bal),
                            "sourceBlocks": {
                                "depositBlock": int(log["blockNumber"], 16),
                                "scanFrom": start,
                                "scanTo": to_scan,
                            },
                            "verifiedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                            "verification": "eth_call userInfo.amount > 0",
                        }
                        verified.append(row)
                        entry["verifiedHits"] += 1
                        print("VERIFIED", wallet, "principal", amount, "pool", pool)
                        if len(verified) >= TARGET_VERIFIED:
                            break
                chunks += 1
                if chunks % 40 == 0:
                    print("  progress", p.get("sousId"), "block", frm, "checked", len(checked), "verified", len(verified))
                frm = to + 1
        except Exception as e:
            entry["error"] = str(e)
            scan["failures"].append({"pool": pool, "error": str(e)})
            print("FAIL", pool, e)
        scan["pools"].append(entry)
        scan["poolsScanned"] += 1

    # Prefer largest principal
    verified.sort(key=lambda r: int(r["onChainPrincipal"]), reverse=True)
    fixture = {
        "mission": "MELEGA_DEX_V1_POOLS_WALLET_FIXTURE_DISCOVERY_AND_3_CYCLE_UNBLOCK",
        "selectedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "chainId": 56,
        "domainSeparation": {
            "liquidity": "AMM LP token ownership → Liquidity My Positions",
            "farms": "MasterChef/MasterBuilder LP deposit → Farms My Farms",
            "pools": "SmartChef single-token stake → Pools My Positions",
            "masterChefExcludedFromPoolsFixture": MASTERCHEF,
        },
        "emptyFixtureWallet": "0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513",
        "emptyFixtureNote": "AMM LP holder without SmartChef stake — honest Pools SUCCESS_EMPTY.",
        "positiveFixture": verified[0] if verified else None,
        "alternatives": verified[1:5],
        "verifiedCount": len(verified),
        "scanSummary": {
            "fundedPoolsConsidered": scan["fundedPoolsConsidered"],
            "poolsScanned": scan["poolsScanned"],
            "depositEvents": scan["depositEvents"],
            "walletsChecked": scan["walletsChecked"],
            "ethCallVerifiedPositive": len(verified),
        },
    }

    (OUT / "pool-contract-scan.json").write_text(json.dumps(scan, indent=2))
    (OUT / "pools-wallet-fixture.json").write_text(json.dumps(fixture, indent=2))
    print(json.dumps({"verified": len(verified), "positive": fixture["positiveFixture"]}, indent=2, default=str))


if __name__ == "__main__":
    main()
