#!/usr/bin/env python3
"""Deterministic SmartSwapExecutorV1 artifact certification / verification.

Does not deploy, broadcast, sign, wrap, approve, or swap.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[2]
CONTRACT_REL = "contracts/smartswap/SmartSwapExecutorV1.sol"
CONTRACT = REPO / CONTRACT_REL
PROFILE = "smartswap_executor_release"
OUT_DIR = REPO / "out-smartswap-executor-release"
CACHE_DIR = REPO / "cache-smartswap-executor-release"
DEPLOY_DIR = REPO / "deployments" / "smartswap-executor-v1"
MAINNET_DIR = REPO / "deployments" / "mainnet"
COMPILER_INPUT_PATH = DEPLOY_DIR / "compiler-input.json"
ARTIFACT_PATH = DEPLOY_DIR / "smart-swap-executor-v1-artifact.json"
MAINNET_ARTIFACT_PATH = MAINNET_DIR / "smartswap-executor-v1-artifact.json"
COMPILER_OUTPUT_PATH = DEPLOY_DIR / "compiler-output.json"
CREATION_HEX_PATH = DEPLOY_DIR / "creation.hex"
DEPLOYED_HEX_PATH = DEPLOY_DIR / "deployed.hex"
REPRODUCTION_PATH = DEPLOY_DIR / "reproduction-runs.json"
LOCK_PATH = DEPLOY_DIR / "compiler-lock.json"

REMAPPINGS = [
    ("@openzeppelin/contracts/", "lib/openzeppelin-contracts/contracts/"),
    ("forge-std/", "lib/forge-std/src/"),
]
IMPORT_RE = re.compile(r'import\s+(?:\{[^}]*\}\s+from\s+)?["\']([^"\']+)["\']')
EXPECTED_SOURCE_BLOB = "7869980ca19ce62bebc99e17670c99cc7e637172"
EXPECTED_SOURCE_SHA256 = "5ecdeb832ad0990a1ed7a6a024b8a60bbf1b683afc2738adceadefa5150b8cee"
SOLC_SEMVER = "0.8.20"


def die(msg: str, code: int = 1) -> None:
    print(msg, file=sys.stderr)
    raise SystemExit(code)


def run(cmd: list[str], **kwargs: Any) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, cwd=REPO, text=True, capture_output=True, check=False, **kwargs)


def must_run(cmd: list[str], **kwargs: Any) -> str:
    proc = run(cmd, **kwargs)
    if proc.returncode != 0:
        die(f"command failed ({proc.returncode}): {' '.join(cmd)}\n{proc.stdout}\n{proc.stderr}")
    return proc.stdout


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def keccak_hex(data: bytes) -> str:
    proc = subprocess.run(
        ["cast", "keccak", "0x" + data.hex()],
        cwd=REPO,
        text=True,
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0:
        die(f"cast keccak failed: {proc.stderr}")
    return proc.stdout.strip().lower()


def git_blob(path: Path) -> str:
    return must_run(["git", "hash-object", str(path)]).strip()


def git_rev() -> str:
    return must_run(["git", "rev-parse", "HEAD"]).strip()


def git_submodule_head(rel: str) -> str:
    path = REPO / rel
    if (path / ".git").exists() or (REPO / ".git").exists():
        proc = run(["git", "-C", str(path), "rev-parse", "HEAD"])
        if proc.returncode == 0:
            return proc.stdout.strip()
    return ""


def strip0x(value: str) -> str:
    value = value.strip().lower()
    return value[2:] if value.startswith("0x") else value


def add0x(value: str) -> str:
    value = strip0x(value)
    return "0x" + value


def resolve_import(current: Path, spec: str) -> Path:
    for prefix, dest in REMAPPINGS:
        if spec.startswith(prefix):
            return (REPO / dest / spec[len(prefix) :]).resolve()
    return (current.parent / spec).resolve()


def collect_sources() -> dict[str, str]:
    pending = [CONTRACT.resolve()]
    seen: dict[str, str] = {}
    while pending:
        path = pending.pop()
        if not path.exists():
            die(f"missing source: {path}")
        rel = path.relative_to(REPO).as_posix()
        if rel in seen:
            continue
        text = path.read_text(encoding="utf-8")
        seen[rel] = text
        for match in IMPORT_RE.finditer(text):
            imported = resolve_import(path, match.group(1))
            imported_rel = imported.relative_to(REPO).as_posix()
            if imported_rel not in seen:
                pending.append(imported)
    return dict(sorted(seen.items()))


def compiler_settings() -> dict[str, Any]:
    return {
        "optimizer": {"enabled": True, "runs": 200},
        "viaIR": True,
        "evmVersion": "shanghai",
        "libraries": {},
        "metadata": {"bytecodeHash": "none", "appendCBOR": False, "useLiteralContent": True},
        "remappings": [f"{prefix}={dest}" for prefix, dest in REMAPPINGS],
        "outputSelection": {
            "*": {
                "*": [
                    "abi",
                    "evm.bytecode.object",
                    "evm.deployedBytecode.object",
                    "evm.bytecode.linkReferences",
                    "evm.deployedBytecode.linkReferences",
                    "metadata",
                ]
            }
        },
    }


def build_compiler_input(sources: dict[str, str]) -> dict[str, Any]:
    source_entries: dict[str, Any] = {}
    for rel, content in sources.items():
        source_entries[rel] = {
            "content": content,
            "keccak256": keccak_hex(content.encode("utf-8")),
        }
    return {
        "language": "Solidity",
        "sources": source_entries,
        "settings": compiler_settings(),
    }


def dump_json(path: Path, payload: Any) -> bytes:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = json.dumps(payload, indent=2, sort_keys=True, ensure_ascii=True) + "\n"
    encoded = data.encode("utf-8")
    path.write_bytes(encoded)
    return encoded


SOLC_RELEASES = {
    ("darwin", "any"): {
        "url": "https://binaries.soliditylang.org/macosx-amd64/solc-macosx-amd64-v0.8.20+commit.a1b79de6",
        "sha256": "fc329945e0068e4e955d0a7b583776dc8d25e72ab657a044618a7ce7dd0519aa",
        "longVersion": "0.8.20+commit.a1b79de6",
    },
    ("linux", "x86_64"): {
        "url": "https://binaries.soliditylang.org/linux-amd64/solc-linux-amd64-v0.8.20+commit.a1b79de6",
        "sha256": "0479d44fdf9c501c25337fdc540419f1593b884a87b47f023da4f1c700fda782",
        "longVersion": "0.8.20+commit.a1b79de6",
    },
}


def find_solc() -> Path | None:
    env = os.environ.get("SOLC_PATH")
    if env and Path(env).exists():
        return Path(env)
    version_dirs = [
        Path.home() / ".svm" / SOLC_SEMVER,
        Path.home() / "Library" / "Caches" / "svm" / SOLC_SEMVER,
        Path.home() / ".foundry" / "svm" / SOLC_SEMVER,
        Path.home() / ".local" / "share" / "svm" / SOLC_SEMVER,
    ]
    names = [f"solc-{SOLC_SEMVER}", "solc", f"solc-macosx-amd64-v{SOLC_SEMVER}+commit.a1b79de6"]
    for directory in version_dirs:
        if not directory.exists():
            continue
        for name in names:
            candidate = directory / name
            if candidate.is_file() and os.access(candidate, os.X_OK):
                return candidate
        for candidate in sorted(directory.iterdir()):
            if candidate.is_file() and os.access(candidate, os.X_OK) and "solc" in candidate.name:
                return candidate
    which = shutil.which("solc")
    return Path(which) if which else None


def ensure_pinned_solc() -> Path | None:
    existing = find_solc()
    if existing is not None:
        return existing
    import platform

    system = platform.system().lower()
    machine = platform.machine().lower()
    spec = SOLC_RELEASES.get((system, "any")) or SOLC_RELEASES.get((system, machine))
    if spec is None:
        print(f"no pinned solc download mapping for {system}/{machine}")
        return None
    dest_dir = Path.home() / ".svm" / SOLC_SEMVER
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f"solc-{SOLC_SEMVER}"
    print(f"downloading pinned solc {spec['longVersion']} -> {dest}")
    curl = shutil.which("curl")
    if not curl:
        print("curl not available; cannot download pinned solc")
        return None
    proc = subprocess.run(
        [
            curl,
            "-L",
            "--fail",
            "-A",
            "MelegaSwapV2-smartswap-executor-recertification",
            "-o",
            str(dest),
            spec["url"],
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0:
        print(f"solc download failed: {proc.stderr}")
        dest.unlink(missing_ok=True)
        return None
    digest = sha256_file(dest)
    if digest != spec["sha256"]:
        dest.unlink(missing_ok=True)
        print(f"solc sha256 mismatch: {digest} != {spec['sha256']}")
        return None
    dest.chmod(0o755)
    return dest


def solc_version_text(solc: Path) -> str:
    proc = subprocess.run([str(solc), "--version"], text=True, capture_output=True, check=False)
    if proc.returncode != 0:
        die(f"solc --version failed: {proc.stderr}")
    return (proc.stdout + proc.stderr).strip()


def parse_solc_long_version(text: str) -> tuple[str, str]:
    # Version: 0.8.20+commit.a1b79de6
    match = re.search(r"(0\.8\.20\+commit\.[0-9a-f]+)", text)
    long_version = match.group(1) if match else SOLC_SEMVER
    commit_match = re.search(r"commit\.([0-9a-f]+)", long_version)
    return long_version, commit_match.group(1) if commit_match else ""


def clean_release_artifacts() -> None:
    shutil.rmtree(OUT_DIR, ignore_errors=True)
    shutil.rmtree(CACHE_DIR, ignore_errors=True)


def forge_env() -> dict[str, str]:
    env = os.environ.copy()
    env["FOUNDRY_PROFILE"] = PROFILE
    return env


FORGE_BUILD_CMD = [
    "forge",
    "build",
    "--skip",
    "test",
    "--skip",
    "script",
    "--skip",
    "**/mocks/**",
    "--force",
]


def forge_build_clean() -> None:
    clean_release_artifacts()
    proc = subprocess.run(
        FORGE_BUILD_CMD,
        cwd=REPO,
        text=True,
        capture_output=True,
        check=False,
        env=forge_env(),
    )
    if proc.returncode != 0:
        die(f"forge build failed\n{proc.stdout}\n{proc.stderr}")


def forge_artifact_path() -> Path:
    path = OUT_DIR / "SmartSwapExecutorV1.sol" / "SmartSwapExecutorV1.json"
    if not path.exists():
        die(f"missing forge artifact: {path}")
    return path


def load_forge_bytecodes() -> tuple[str, str, list[Any]]:
    artifact = json.loads(forge_artifact_path().read_text(encoding="utf-8"))
    creation = add0x(artifact["bytecode"]["object"])
    deployed = add0x(artifact["deployedBytecode"]["object"])
    abi = artifact["abi"]
    return creation, deployed, abi


def measure(creation: str, deployed: str, abi: list[Any], compiler_input_sha256: str) -> dict[str, Any]:
    creation_bytes = bytes.fromhex(strip0x(creation))
    deployed_bytes = bytes.fromhex(strip0x(deployed))
    abi_bytes = json.dumps(abi, separators=(",", ":"), sort_keys=True).encode("utf-8")
    return {
        "creationBytecode": creation,
        "creationBytecodeLength": len(creation_bytes),
        "creationBytecodeKeccak": keccak_hex(creation_bytes),
        "deployedBytecode": deployed,
        "deployedBytecodeLength": len(deployed_bytes),
        "deployedBytecodeKeccak": keccak_hex(deployed_bytes),
        "abiSha256": sha256_bytes(abi_bytes),
        "compilerInputSha256": compiler_input_sha256,
    }


def compile_solc(solc: Path, compiler_input: dict[str, Any]) -> dict[str, Any]:
    payload = json.dumps(compiler_input, separators=(",", ":"), ensure_ascii=True)
    proc = subprocess.run(
        [
            str(solc),
            "--standard-json",
            "--base-path",
            str(REPO),
            "--allow-paths",
            f"{REPO},{REPO / 'lib'}",
        ],
        cwd=REPO,
        input=payload,
        text=True,
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0:
        die(f"solc --standard-json failed\n{proc.stdout}\n{proc.stderr}")
    output = json.loads(proc.stdout)
    errors = [
        err
        for err in output.get("errors", [])
        if err.get("severity") == "error"
    ]
    if errors:
        die("solc reported errors:\n" + json.dumps(errors, indent=2))
    contracts = output["contracts"][CONTRACT_REL]["SmartSwapExecutorV1"]
    creation = add0x(contracts["evm"]["bytecode"]["object"])
    deployed = add0x(contracts["evm"]["deployedBytecode"]["object"])
    return {
        "creation": creation,
        "deployed": deployed,
        "abi": contracts["abi"],
        "raw": {
            "contracts": {
                CONTRACT_REL: {
                    "SmartSwapExecutorV1": {
                        "abi": contracts["abi"],
                        "evm": {
                            "bytecode": {"object": creation},
                            "deployedBytecode": {"object": deployed},
                        },
                    }
                }
            }
        },
    }


def platform_info() -> dict[str, str]:
    uname = must_run(["uname", "-a"]).strip()
    return {
        "uname": uname,
        "python": sys.version.split()[0],
        "cwd": str(REPO),
    }


def forge_version() -> tuple[str, str]:
    text = must_run(["forge", "--version"])
    version_match = re.search(r"Version:\s*([0-9.]+)", text)
    commit_match = re.search(r"Commit SHA:\s*([0-9a-f]+)", text)
    return (
        version_match.group(1) if version_match else text.strip(),
        commit_match.group(1) if commit_match else "",
    )


def assert_source_unchanged() -> tuple[str, str]:
    blob = git_blob(CONTRACT)
    digest = sha256_file(CONTRACT)
    if blob != EXPECTED_SOURCE_BLOB or digest != EXPECTED_SOURCE_SHA256:
        die(
            "SMARTSWAP_EXECUTOR_RECERTIFICATION_BLOCKED_SOURCE_CHANGE_REQUIRED\n"
            f"blob={blob} expected={EXPECTED_SOURCE_BLOB}\n"
            f"sha256={digest} expected={EXPECTED_SOURCE_SHA256}"
        )
    return blob, digest


def write_artifacts(
    *,
    compiler_input: dict[str, Any],
    compiler_input_sha256: str,
    creation: str,
    deployed: str,
    abi: list[Any],
    solc_long: str,
    solc_commit: str,
    solc_version_output: str,
    solc_path: str,
    forge_ver: str,
    forge_commit: str,
    runs: list[dict[str, Any]],
    independent: dict[str, Any],
) -> dict[str, Any]:
    measured = measure(creation, deployed, abi, compiler_input_sha256)
    git_commit = git_rev()
    created_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    source_hashes = {
        rel: {
            "sha256": sha256_bytes(entry["content"].encode("utf-8")),
            "keccak256": entry["keccak256"],
        }
        for rel, entry in compiler_input["sources"].items()
    }
    artifact = {
        "artifactVersion": "SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_ARTIFACT_V1",
        "status": "SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_ARTIFACT_CERTIFIED",
        "contractName": "SmartSwapExecutorV1",
        "sourcePath": CONTRACT_REL,
        "sourceGitBlob": EXPECTED_SOURCE_BLOB,
        "sourceSha256": EXPECTED_SOURCE_SHA256,
        "solcVersion": SOLC_SEMVER,
        "solcLongVersion": solc_long,
        "solcCommit": solc_commit,
        "solcVersionOutput": solc_version_output,
        "solcPath": solc_path,
        "forgeVersion": forge_ver,
        "forgeCommit": forge_commit,
        "compilerProfile": PROFILE,
        "compilerInputPath": str(COMPILER_INPUT_PATH.relative_to(REPO).as_posix()),
        "compilerInputSha256": compiler_input_sha256,
        "creationBytecode": creation,
        "creationBytecodeLength": measured["creationBytecodeLength"],
        "creationBytecodeKeccak": measured["creationBytecodeKeccak"],
        "deployedBytecode": deployed,
        "deployedBytecodeLength": measured["deployedBytecodeLength"],
        "deployedBytecodeKeccak": measured["deployedBytecodeKeccak"],
        "abi": abi,
        "abiSha256": measured["abiSha256"],
        "constructorInputs": {
            "types": ["address", "address", "address", "address"],
            "names": ["treasury_", "intentSigner_", "wrappedNative_", "owner_"],
            "mainnet": {
                "treasury": "0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b",
                "intentSigner": "SET_AT_AUTHORIZED_DEPLOY",
                "wrappedNative": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "owner": "SET_AT_AUTHORIZED_DEPLOY",
            },
        },
        "metadataMode": {
            "bytecodeHash": "none",
            "appendCBOR": False,
            "useLiteralContent": True,
        },
        "optimizer": True,
        "optimizerRuns": 200,
        "viaIR": True,
        "evmVersion": "shanghai",
        "libraries": {},
        "createdAt": created_at,
        "gitCommit": git_commit,
        "baselineGitCommit": "76c54eadfbd54a1285ac9cca3f8d28a3aa5e0bc7",
        "immutableReferences": json.loads(forge_artifact_path().read_text(encoding="utf-8"))
        .get("deployedBytecode", {})
        .get("immutableReferences", {}),
        "m5Artifact": {
            "status": "SUPERSEDED_UNREPRODUCIBLE_ARTIFACT",
            "reason": "M5 stored hashes only; solc metadata bytecodeHash=ipfs embedded a compiler-input CID; exact bytes were not preserved.",
            "creationBytecodeKeccak": "0x044040c2af494c8d1e34f1de7e3dd3071ae9cdf39df0fdfec908b9d4d261510c",
            "deployedBytecodeKeccak": "0x0f0b418f1b3f1a7a0897864c271eacedd6ebeb4bf226fcfc3c23aa2153b74fa3",
            "securityCertification": "M4/M5 source and fork behavior remain valid; only deployment-artifact reproducibility is superseded.",
        },
        "broadcast": False,
        "deployed": False,
        "feeState": "FEE_ENFORCEABLE",
        "sourceHashes": source_hashes,
        "openzeppelinCommit": git_submodule_head("lib/openzeppelin-contracts"),
        "forgeStdCommit": git_submodule_head("lib/forge-std"),
        "platform": platform_info(),
        "independentReproduction": {
            k: v for k, v in independent.items() if k != "solcOutputSubset"
        },
    }
    dump_json(ARTIFACT_PATH, artifact)
    dump_json(MAINNET_ARTIFACT_PATH, artifact)
    dump_json(COMPILER_OUTPUT_PATH, independent.get("solcOutputSubset") or {
        "creationBytecode": creation,
        "deployedBytecode": deployed,
        "abi": abi,
    })
    CREATION_HEX_PATH.write_text(creation + "\n", encoding="utf-8")
    DEPLOYED_HEX_PATH.write_text(deployed + "\n", encoding="utf-8")
    dump_json(
        REPRODUCTION_PATH,
        {
            "profile": PROFILE,
            "compilerInputSha256": compiler_input_sha256,
            "runs": runs,
            "independent": independent,
            "identical": True,
        },
    )
    dump_json(
        LOCK_PATH,
        {
            "solcVersion": SOLC_SEMVER,
            "solcLongVersion": solc_long,
            "solcCommit": solc_commit,
            "forgeVersion": forge_ver,
            "forgeCommit": forge_commit,
            "profile": PROFILE,
            "bytecodeHash": "none",
            "cborMetadata": False,
            "optimizer": True,
            "optimizerRuns": 200,
            "viaIR": True,
            "evmVersion": "shanghai",
            "compilerInputSha256": compiler_input_sha256,
            "sourceGitBlob": EXPECTED_SOURCE_BLOB,
            "sourceSha256": EXPECTED_SOURCE_SHA256,
            "creationBytecodeKeccak": measured["creationBytecodeKeccak"],
            "deployedBytecodeKeccak": measured["deployedBytecodeKeccak"],
        },
    )
    return artifact


def runs_identical(runs: list[dict[str, Any]]) -> bool:
    keys = (
        "creationBytecode",
        "deployedBytecode",
        "creationBytecodeKeccak",
        "deployedBytecodeKeccak",
        "abiSha256",
        "compilerInputSha256",
        "creationBytecodeLength",
        "deployedBytecodeLength",
    )
    first = runs[0]
    return all(all(run[k] == first[k] for k in keys) for run in runs[1:])


def verify_against_stored(compiler_input_bytes: bytes, creation: str, deployed: str, abi: list[Any]) -> None:
    if not ARTIFACT_PATH.exists():
        die(f"missing canonical artifact: {ARTIFACT_PATH}")
    stored = json.loads(ARTIFACT_PATH.read_text(encoding="utf-8"))
    compiler_input_sha256 = sha256_bytes(compiler_input_bytes)
    measured = measure(creation, deployed, abi, compiler_input_sha256)
    stored_input_hash = sha256_file(COMPILER_INPUT_PATH)
    mismatches: list[str] = []
    if compiler_input_sha256 != stored_input_hash:
        mismatches.append(f"regenerated compiler-input sha256 {compiler_input_sha256} != stored file {stored_input_hash}")
    if compiler_input_sha256 != stored["compilerInputSha256"]:
        mismatches.append("compilerInputSha256")
    for field in (
        "creationBytecode",
        "deployedBytecode",
        "creationBytecodeKeccak",
        "deployedBytecodeKeccak",
        "creationBytecodeLength",
        "deployedBytecodeLength",
        "abiSha256",
        "sourceGitBlob",
        "sourceSha256",
    ):
        left = measured.get(field, EXPECTED_SOURCE_BLOB if field == "sourceGitBlob" else EXPECTED_SOURCE_SHA256 if field == "sourceSha256" else None)
        if field in ("sourceGitBlob",):
            left = EXPECTED_SOURCE_BLOB
        if field == "sourceSha256":
            left = EXPECTED_SOURCE_SHA256
        if left != stored.get(field):
            mismatches.append(field)
    if stored["abi"] != abi:
        mismatches.append("abi")
    if mismatches:
        die("SMARTSWAP_EXECUTOR_ARTIFACT_MISMATCH: " + ", ".join(mismatches))
    print("SMARTSWAP_EXECUTOR_V1_ARTIFACT_VERIFIED")
    print(f"creationBytecodeKeccak={stored['creationBytecodeKeccak']}")
    print(f"deployedBytecodeKeccak={stored['deployedBytecodeKeccak']}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--verify", action="store_true", help="recompile and compare against the stored artifact")
    parser.add_argument("--runs", type=int, default=3)
    args = parser.parse_args()

    os.chdir(REPO)
    blob, digest = assert_source_unchanged()
    sources = collect_sources()
    compiler_input = build_compiler_input(sources)
    compiler_input_bytes = dump_json(COMPILER_INPUT_PATH, compiler_input)
    compiler_input_sha256 = sha256_bytes(compiler_input_bytes)

    forge_ver, forge_commit = forge_version()
    print(f"sourceGitBlob={blob}")
    print(f"sourceSha256={digest}")
    print(f"compilerInputSha256={compiler_input_sha256}")
    print(f"sources={len(sources)}")
    print(f"forge={forge_ver} commit={forge_commit}")

    run_count = 1 if args.verify else max(args.runs, 3)
    runs: list[dict[str, Any]] = []
    for index in range(1, run_count + 1):
        print(f"forge clean compile {index}/{run_count}")
        forge_build_clean()
        creation, deployed, abi = load_forge_bytecodes()
        measured = measure(creation, deployed, abi, compiler_input_sha256)
        runs.append({"run": index, "path": "forge", **measured})
        print(
            f"  creation len={measured['creationBytecodeLength']} keccak={measured['creationBytecodeKeccak']}"
        )
        print(
            f"  deployed  len={measured['deployedBytecodeLength']} keccak={measured['deployedBytecodeKeccak']}"
        )

    if not runs_identical(runs):
        dump_json(REPRODUCTION_PATH, {"identical": False, "runs": runs})
        die("SMARTSWAP_EXECUTOR_RECERTIFICATION_BLOCKED_NONDETERMINISTIC_BUILD")

    solc = ensure_pinned_solc()
    independent: dict[str, Any]
    solc_long = SOLC_SEMVER
    solc_commit = ""
    solc_version_output = ""
    solc_path = ""
    if solc is None:
        independent = {
            "supported": False,
            "limitation": "Pinned solc 0.8.20 binary was not found on this machine after forge build; independent solc --standard-json path was not claimed.",
        }
        print("WARNING: solc binary not found; independent path skipped")
    else:
        solc_path = str(solc)
        solc_version_output = solc_version_text(solc)
        solc_long, solc_commit = parse_solc_long_version(solc_version_output)
        print(f"solc={solc} {solc_long}")
        solc_result = compile_solc(solc, compiler_input)
        forge_creation = runs[0]["creationBytecode"]
        forge_deployed = runs[0]["deployedBytecode"]
        match = (
            solc_result["creation"] == forge_creation
            and solc_result["deployed"] == forge_deployed
        )
        independent = {
            "supported": True,
            "pathA": f"FOUNDRY_PROFILE={PROFILE} {' '.join(FORGE_BUILD_CMD)}",
            "pathB": (
                f"{solc} --standard-json --base-path {REPO} --allow-paths {REPO},{REPO / 'lib'} "
                f"< {COMPILER_INPUT_PATH.relative_to(REPO).as_posix()}"
            ),
            "solcPath": solc_path,
            "solcLongVersion": solc_long,
            "creationMatch": solc_result["creation"] == forge_creation,
            "deployedMatch": solc_result["deployed"] == forge_deployed,
            "identical": match,
            "solcCreationKeccak": keccak_hex(bytes.fromhex(strip0x(solc_result["creation"]))),
            "solcDeployedKeccak": keccak_hex(bytes.fromhex(strip0x(solc_result["deployed"]))),
            "solcOutputSubset": solc_result["raw"],
        }
        if not match:
            dump_json(REPRODUCTION_PATH, {"identicalForgeRuns": True, "independent": independent, "runs": runs})
            die(
                "SMARTSWAP_EXECUTOR_RECERTIFICATION_BLOCKED_NONDETERMINISTIC_BUILD\n"
                "forge profile bytecode != solc --standard-json bytecode"
            )

    if args.verify:
        verify_against_stored(compiler_input_bytes, runs[0]["creationBytecode"], runs[0]["deployedBytecode"], json.loads(forge_artifact_path().read_text())["abi"])
        return

    artifact = write_artifacts(
        compiler_input=compiler_input,
        compiler_input_sha256=compiler_input_sha256,
        creation=runs[0]["creationBytecode"],
        deployed=runs[0]["deployedBytecode"],
        abi=json.loads(forge_artifact_path().read_text(encoding="utf-8"))["abi"],
        solc_long=solc_long,
        solc_commit=solc_commit,
        solc_version_output=solc_version_output,
        solc_path=solc_path,
        forge_ver=forge_ver,
        forge_commit=forge_commit,
        runs=[{k: v for k, v in item.items() if k not in {"creationBytecode", "deployedBytecode"}} for item in runs],
        independent={k: v for k, v in independent.items() if k != "solcOutputSubset"} | {
            "solcOutputSubset": independent.get("solcOutputSubset")
        },
    )
    print("SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_ARTIFACT_CERTIFIED")
    print(f"creationBytecodeKeccak={artifact['creationBytecodeKeccak']}")
    print(f"deployedBytecodeKeccak={artifact['deployedBytecodeKeccak']}")
    print(f"artifact={ARTIFACT_PATH.relative_to(REPO)}")


if __name__ == "__main__":
    main()
