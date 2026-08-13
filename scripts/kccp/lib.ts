/**
 * KCCP local producer library — repository-state-contract.v1 (dry-run / submit).
 * Protocol contract: Founder integration package (kiri:kccp/v1).
 */
import { createHash, createHmac, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

export const KCCP_PROTOCOL_VERSION = "kiri:kccp/v1" as const;
export const KCCP_STATE_SCHEMA = "kiri:kccp/v1/repository-state-contract.v1" as const;
export const KCCP_MISSION_RESULT_SCHEMA = "kiri:kccp/v1/mission-result.v1" as const;
export const KCCP_STATE_PATH = "/api/public/build/kccp/v1/state" as const;
export const KCCP_MISSION_RESULT_PATH = "/api/public/build/kccp/v1/mission-results" as const;
export const KCCP_BASE_URL = "https://melega.ai" as const;
export const KCCP_MISSION_CODE = "ACT-CONNECT-MelegaSwapV2" as const;

export const KCCP_IDENTITY = {
  repository_code: "MelegaSwapV2",
  product_code: "DEX",
  organ_code: "dex",
  producer_type: "repository",
} as const;

export type CredentialEnv = {
  token?: string;
  hmacSecret?: string;
  baseUrl: string;
  authMode: "kccp_hmac" | "build_observer_bootstrap" | "bearer_only";
};

export type GitFacts = {
  repositoryRoot: string;
  repositoryName: string;
  repositoryUrl: string;
  defaultBranch: string;
  reportedBranch: string;
  commitSha: string;
  commitMessage: string;
  commitTimestamp: string;
  workingTreeState: "clean" | "dirty";
  dirtyEntryCount: number;
};

export type RepositoryStateContract = Record<string, unknown>;

export const KCCP_DIGEST_ALGORITHM = "KCCP-CANONICAL-JSON-SHA256/v1" as const;
export const KCCP_DIGEST_EXCLUDED_TOP_LEVEL_FIELDS = ["digest_sha256", "signature"] as const;
export const KCCP_SDK_VERSION = "kccp-typescript-producer/v1.1.0" as const;

type CanonicalJson = null | boolean | number | string | CanonicalJson[] | { [k: string]: CanonicalJson };

const OPTIONAL_OMIT_WHEN_ABSENT = new Set(["correlation_id", "expires_at", "signature"]);

function stripUndefinedDeep(value: unknown): CanonicalJson | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("non_finite_number_in_payload");
    return value;
  }
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    const out: CanonicalJson[] = [];
    for (const item of value) {
      const stripped = stripUndefinedDeep(item);
      if (stripped !== undefined) out.push(stripped);
    }
    return out;
  }
  if (typeof value === "object") {
    const source = value as Record<string, unknown>;
    const out: Record<string, CanonicalJson> = {};
    for (const key of Object.keys(source)) {
      const stripped = stripUndefinedDeep(source[key]);
      if (stripped !== undefined) out[key] = stripped;
    }
    return out;
  }
  return undefined;
}

function canonicalStringify(value: CanonicalJson): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return JSON.stringify(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalStringify).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalStringify(value[key]!)}`).join(",")}}`;
}

export function canonicalizeKccpPayload(payload: RepositoryStateContract): string {
  const filtered: Record<string, unknown> = {};
  for (const key of Object.keys(payload)) {
    if ((KCCP_DIGEST_EXCLUDED_TOP_LEVEL_FIELDS as readonly string[]).includes(key)) continue;
    filtered[key] = payload[key];
  }
  const stripped = stripUndefinedDeep(filtered) as CanonicalJson;
  return canonicalStringify(stripped);
}

export function computeKccpDigest(payload: RepositoryStateContract): string {
  return createHash("sha256").update(canonicalizeKccpPayload(payload), "utf8").digest("hex");
}

export function stripOptionalAbsentFields(payload: RepositoryStateContract): RepositoryStateContract {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (value === null && OPTIONAL_OMIT_WHEN_ABSENT.has(key)) continue;
    out[key] = value;
  }
  return out;
}

export function finalizeStateContractPayload(raw: RepositoryStateContract): {
  payload: RepositoryStateContract;
  payloadDigest: string;
  wireDigest: string;
  canonicalInput: string;
} {
  const cleaned = stripOptionalAbsentFields(raw);
  const payloadDigest = computeKccpDigest(cleaned);
  const payload: RepositoryStateContract = { ...cleaned, digest_sha256: payloadDigest };
  return {
    payload,
    payloadDigest,
    wireDigest: payloadDigest,
    canonicalInput: canonicalizeKccpPayload(cleaned),
  };
}

export function scanNullStringViolations(payload: RepositoryStateContract): { ok: boolean; hits: string[] } {
  const hits: string[] = [];
  const inspect = (value: unknown, path: string) => {
    if (value === null) {
      hits.push(path);
      return;
    }
    if (Array.isArray(value)) value.forEach((item, i) => inspect(item, `${path}[${i}]`));
    else if (value && typeof value === "object") {
      for (const [key, nested] of Object.entries(value)) inspect(nested, `${path}.${key}`);
    }
  };
  inspect(payload, "payload");
  return { ok: hits.length === 0, hits };
}

const PLACEHOLDER_PATTERNS = [
  /REPLACE/i,
  /example\.com/i,
  /^0{40}$/,
  /MISSION-CODE/,
  /melega-build/,
];

const REQUIRED_STRING_FIELDS = [
  "schema",
  "protocol_version",
  "state_contract_id",
  "producer",
  "producer_type",
  "product_code",
  "organ_code",
  "repository_code",
  "repository_name",
  "repository_url",
  "default_branch",
  "reported_branch",
  "commit_sha",
  "commit_message",
  "commit_timestamp",
  "working_tree_state",
  "current_mission",
  "generated_at",
  "valid_from",
  "confidence",
  "verification_mode",
  "idempotency_key",
] as const;

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

export function readGitFacts(repoRoot = process.cwd()): GitFacts {
  const repositoryUrl = git(repoRoot, ["remote", "get-url", "origin"]);
  const defaultBranch = git(repoRoot, ["symbolic-ref", "--short", "refs/remotes/origin/HEAD"]).replace(
    "origin/",
    "",
  );
  const reportedBranch = git(repoRoot, ["branch", "--show-current"]);
  const commitSha = git(repoRoot, ["rev-parse", "HEAD"]);
  const commitMessage = git(repoRoot, ["log", "-1", "--format=%s"]);
  const commitTimestamp = git(repoRoot, ["log", "-1", "--format=%cI"]);
  const dirtyEntryCount = Number(git(repoRoot, ["status", "--porcelain"]).split("\n").filter(Boolean).length);
  return {
    repositoryRoot: resolve(repoRoot),
    repositoryName: basename(repoRoot),
    repositoryUrl,
    defaultBranch,
    reportedBranch,
    commitSha,
    commitMessage,
    commitTimestamp,
    workingTreeState: dirtyEntryCount === 0 ? "clean" : "dirty",
    dirtyEntryCount,
  };
}

export function buildStableIdempotencyKey(input: {
  repositoryCode: string;
  missionCode: string;
  commitSha: string;
  dirtyEntryCount: number;
  reportedBranch: string;
}): string {
  const material = [
    input.repositoryCode,
    "state",
    input.missionCode,
    input.commitSha,
    input.reportedBranch,
    String(input.dirtyEntryCount),
  ].join(":");
  return createHash("sha256").update(material).digest("hex").slice(0, 32);
}

export function buildMissionResultIdempotencyKey(input: {
  repositoryCode: string;
  missionCode: string;
  stateContractId: string;
  commitSha: string;
}): string {
  const material = [
    input.repositoryCode,
    "mission-result",
    input.missionCode,
    input.stateContractId,
    input.commitSha,
  ].join(":");
  return createHash("sha256").update(material).digest("hex").slice(0, 32);
}

export function buildRepositoryStateContract(input: {
  facts: GitFacts;
  missionCode: string;
  stateContractId?: string;
  generatedAt?: string;
}): RepositoryStateContract {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const stateContractId = input.stateContractId ?? randomUUID();
  const idempotencyKey = buildStableIdempotencyKey({
    repositoryCode: KCCP_IDENTITY.repository_code,
    missionCode: input.missionCode,
    commitSha: input.facts.commitSha,
    dirtyEntryCount: input.facts.dirtyEntryCount,
    reportedBranch: input.facts.reportedBranch,
  });

  return {
    schema: KCCP_STATE_SCHEMA,
    protocol_version: KCCP_PROTOCOL_VERSION,
    state_contract_id: stateContractId,
    producer: KCCP_IDENTITY.repository_code,
    producer_type: KCCP_IDENTITY.producer_type,
    product_code: KCCP_IDENTITY.product_code,
    organ_code: KCCP_IDENTITY.organ_code,
    repository_code: KCCP_IDENTITY.repository_code,
    repository_name: input.facts.repositoryName,
    repository_url: input.facts.repositoryUrl,
    repository_local_identifier: input.facts.repositoryName,
    default_branch: input.facts.defaultBranch,
    reported_branch: input.facts.reportedBranch,
    commit_sha: input.facts.commitSha,
    commit_message: input.facts.commitMessage,
    commit_timestamp: input.facts.commitTimestamp,
    working_tree_state: input.facts.workingTreeState,
    dirty_entry_count: input.facts.dirtyEntryCount,
    runtime_environment: "local",
    deployment_state: "unknown",
    deployment_urls: [],
    runtime_endpoints: [],
    health_endpoints: [],
    current_mission: input.missionCode,
    active_missions: [input.missionCode],
    recent_completed_missions: [],
    implementation_changes: [],
    capability_changes: [],
    dependency_changes: [],
    authority_changes: [],
    contract_changes: [],
    open_blockers: [],
    open_drifts: [],
    known_duplications: [],
    performance_signals: [],
    test_results: {},
    deployment_results: {},
    evidence_refs: [
      `git:remote:${input.facts.repositoryUrl}`,
      `git:branch:${input.facts.reportedBranch}`,
      `git:commit:${input.facts.commitSha}`,
      `git:dirty_count:${input.facts.dirtyEntryCount}`,
    ],
    generated_at: generatedAt,
    valid_from: generatedAt,
    confidence: "REPORTED_UNVERIFIED",
    verification_mode: "reported",
    idempotency_key: idempotencyKey,
    extensions: {
      mission_phase: "canonical_digest_v1",
      starting_head: input.facts.commitSha,
    },
  };
}

export function buildMissionResultPayload(input: {
  facts: GitFacts;
  stateContractId: string;
  stateDigest: string;
  resultId?: string;
  generatedAt?: string;
}): RepositoryStateContract {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const resultId = input.resultId ?? randomUUID();
  const idempotencyKey = buildMissionResultIdempotencyKey({
    repositoryCode: KCCP_IDENTITY.repository_code,
    missionCode: KCCP_MISSION_CODE,
    stateContractId: input.stateContractId,
    commitSha: input.facts.commitSha,
  });

  return {
    schema: KCCP_MISSION_RESULT_SCHEMA,
    protocol_version: KCCP_PROTOCOL_VERSION,
    result_id: resultId,
    mission_code: KCCP_MISSION_CODE,
    mission_title: "Connect melega-dex to Melega Build via KCCP",
    destination_tool: "cursor",
    destination_chat: "MELEGA_DEX",
    repository_code: KCCP_IDENTITY.repository_code,
    branch: input.facts.reportedBranch,
    starting_commit: input.facts.commitSha,
    ending_commit: input.facts.commitSha,
    working_tree_state: input.facts.workingTreeState,
    objective:
      "Complete first authenticated KCCP producer registration by submitting repository-state and mission-result to Melega Build",
    status: "COMPLETED",
    completed_steps: [
      "local KCCP producer installed for repository-state-contract.v1",
      "repository-state-contract.v1 submitted to Build",
      `state_contract_id ${input.stateContractId} referenced by mission-result`,
      "HEAD commit verified from live git evidence",
    ],
    incomplete_steps: [],
    files_changed: [
      "scripts/kccp/lib.ts",
      "scripts/kccp/generate-state-contract.ts",
      "scripts/kccp/submit-mission-result.ts",
      "scripts/kccp/run.ts",
      "scripts/kccp/schema/digest-contract.v1.json",
      "scripts/kccp/schema/repository-state-contract.v1.json",
    ],
    evidence_refs: [
      `build:state_contract_id:${input.stateContractId}`,
      `build:digest_sha256:${input.stateDigest}`,
      `git:commit:${input.facts.commitSha}`,
      `git:branch:${input.facts.reportedBranch}`,
      `git:dirty_count:${input.facts.dirtyEntryCount}`,
    ],
    known_limitations: [
      "Founder connection approval remains manual",
      "No deployment or runtime probes reported — repository-state submission only",
    ],
    final_verdict: "KCCP_MELEGASWAPV2_CONNECTION_SUBMITTED_FOR_FOUNDER_REVIEW",
    producer: KCCP_IDENTITY.repository_code,
    producer_type: KCCP_IDENTITY.producer_type,
    idempotency_key: idempotencyKey,
    causation_id: input.stateContractId,
    generated_at: generatedAt,
    extensions: {
      referenced_state_contract_id: input.stateContractId,
      repository_state_outcome: "submitted_successfully",
      credential_rotated: false,
      repository_state_regenerated: false,
    },
  };
}

export function canonicalPayloadString(payload: RepositoryStateContract): string {
  return JSON.stringify(payload);
}

export function signRequest(input: {
  secret: string;
  method: string;
  path: string;
  timestamp: string;
  idempotencyKey: string;
  contentDigest: string;
}): string {
  const signing = [
    input.method.toUpperCase(),
    input.path,
    input.timestamp,
    input.idempotencyKey,
    input.contentDigest,
  ].join("\n");
  return createHmac("sha256", input.secret).update(signing).digest("hex");
}

export function validateMandatoryFields(payload: RepositoryStateContract): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const field of REQUIRED_STRING_FIELDS) {
    const value = payload[field];
    if (value === undefined || value === null || value === "") {
      errors.push(`missing:${field}`);
    }
  }
  if (typeof payload.dirty_entry_count !== "number") errors.push("missing:dirty_entry_count");
  if (!Array.isArray(payload.evidence_refs)) errors.push("missing:evidence_refs");
  if (payload.repository_code !== KCCP_IDENTITY.repository_code) errors.push("identity:repository_code");
  if (payload.product_code !== KCCP_IDENTITY.product_code) errors.push("identity:product_code");
  if (payload.organ_code !== KCCP_IDENTITY.organ_code) errors.push("identity:organ_code");
  if (payload.producer !== KCCP_IDENTITY.repository_code) errors.push("identity:producer");
  return { ok: errors.length === 0, errors };
}

export function validateBuildStateSchema(payload: RepositoryStateContract): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const mandatory = validateMandatoryFields(payload);
  errors.push(...mandatory.errors);
  if (typeof payload.digest_sha256 !== "string" || !/^[a-f0-9]{64}$/.test(String(payload.digest_sha256))) {
    errors.push("invalid:digest_sha256");
  }
  const nullScan = scanNullStringViolations(payload);
  if (!nullScan.ok) errors.push(...nullScan.hits.map((path) => `null:${path}`));
  for (const key of Array.from(OPTIONAL_OMIT_WHEN_ABSENT)) {
    if (payload[key] === null) errors.push(`null_optional:${key}`);
  }
  return { ok: errors.length === 0, errors };
}

export function scanPlaceholders(payload: RepositoryStateContract): { ok: boolean; hits: string[] } {
  const hits: string[] = [];
  const inspect = (value: unknown, path: string) => {
    if (typeof value === "string") {
      for (const pattern of PLACEHOLDER_PATTERNS) {
        if (pattern.test(value)) hits.push(`${path}=${value}`);
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => inspect(item, `${path}[${index}]`));
    } else if (value && typeof value === "object") {
      for (const [key, nested] of Object.entries(value)) inspect(nested, `${path}.${key}`);
    }
  };
  inspect(payload, "payload");
  return { ok: hits.length === 0, hits };
}

export function scanSecretPatterns(text: string): { ok: boolean; hits: string[] } {
  const patterns = [
    /kccp_[A-Za-z0-9+/=_-]{20,}/,
    /kccph_[A-Za-z0-9+/=_-]{20,}/,
    /Bearer\s+[A-Za-z0-9._-]+/i,
    /KCCP_HMAC_SECRET\s*=\s*\S+/,
    /KCCP_TOKEN\s*=\s*\S+/,
  ];
  const hits = patterns.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
  return { ok: hits.length === 0, hits };
}

export function writeDryRunArtifacts(input: {
  outputDir: string;
  payload: RepositoryStateContract;
  digest: string;
  validation: { ok: boolean; errors: string[] };
  placeholderScan: { ok: boolean; hits: string[] };
}): { payloadPath: string; metaPath: string } {
  mkdirSync(input.outputDir, { recursive: true });
  const payloadPath = resolve(input.outputDir, "repository-state-contract.json");
  const metaPath = resolve(input.outputDir, "repository-state-contract.meta.json");
  writeFileSync(payloadPath, `${JSON.stringify(input.payload, null, 2)}\n`, "utf8");
  writeFileSync(
    metaPath,
    `${JSON.stringify(
      {
        schema: input.payload.schema,
        protocol_version: input.payload.protocol_version,
        state_contract_id: input.payload.state_contract_id,
        idempotency_key: input.payload.idempotency_key,
        digest_sha256: input.digest,
        generated_at: input.payload.generated_at,
        validation: input.validation,
        placeholder_scan: input.placeholderScan,
        mode: "dry_run",
        submit_path: KCCP_STATE_PATH,
        base_url: KCCP_BASE_URL,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  return { payloadPath, metaPath };
}

export function sanitizeResponseHeaders(headers: Headers): Record<string, string> {
  const allowed = ["content-type", "x-request-id", "cf-ray", "date", "location"];
  const out: Record<string, string> = {};
  for (const key of allowed) {
    const value = headers.get(key);
    if (value) out[key] = value;
  }
  return out;
}

export async function submitKccpPayload(input: {
  baseUrl: string;
  path: string;
  token: string;
  hmacSecret?: string;
  authMode: CredentialEnv["authMode"];
  producer: string;
  idempotencyKey: string;
  payload: RepositoryStateContract;
  digest: string;
}): Promise<{ status: number; body: unknown; headers: Record<string, string> }> {
  const raw = canonicalPayloadString(input.payload);
  const timestamp = new Date().toISOString();
  const headers: Record<string, string> = {
    "content-type": "application/json",
    authorization: `Bearer ${input.token}`,
    "user-agent": KCCP_SDK_VERSION,
    "x-kccp-producer": input.producer,
    "x-kccp-repository": KCCP_IDENTITY.repository_code,
  };

  if (input.authMode === "kccp_hmac") {
    if (!input.hmacSecret) throw new Error("missing_hmac_secret_for_kccp_hmac_mode");
    const signature = signRequest({
      secret: input.hmacSecret,
      method: "POST",
      path: input.path,
      timestamp,
      idempotencyKey: input.idempotencyKey,
      contentDigest: input.digest,
    });
    headers["x-kccp-sdk"] = KCCP_SDK_VERSION;
    headers["x-kccp-digest-algorithm"] = KCCP_DIGEST_ALGORITHM;
    headers["x-kccp-timestamp"] = timestamp;
    headers["x-kccp-idempotency-key"] = input.idempotencyKey;
    headers["x-kccp-content-digest"] = input.digest;
    headers["x-kccp-signature"] = signature;
  } else if (input.authMode === "build_observer_bootstrap") {
    headers["x-kccp-digest-algorithm"] = KCCP_DIGEST_ALGORITHM;
    headers["x-kccp-content-digest"] = input.digest;
    headers["x-kccp-idempotency-key"] = input.idempotencyKey;
    headers["x-kccp-timestamp"] = timestamp;
  }

  const url = `${input.baseUrl.replace(/\/+$/, "")}${input.path}`;
  const response = await fetch(url, {
    method: "POST",
    redirect: "manual",
    headers,
    body: raw,
  });
  const body = await response.json().catch(() => ({}));
  return {
    status: response.status,
    body,
    headers: sanitizeResponseHeaders(response.headers),
  };
}

export async function readRepositoryRecord(input: {
  baseUrl: string;
  token?: string;
}): Promise<{ status: number; body: unknown }> {
  const path = `/api/public/build/kccp/v1/repositories/${KCCP_IDENTITY.repository_code}`;
  const headers: Record<string, string> = {
    accept: "application/json",
    "x-kccp-producer": KCCP_IDENTITY.repository_code,
  };
  if (input.token) headers.authorization = `Bearer ${input.token}`;
  const response = await fetch(`${input.baseUrl.replace(/\/+$/, "")}${path}`, { headers });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

export function writeSubmissionArtifacts(input: {
  outputDir: string;
  name: string;
  submission: { status: number; body: unknown; headers: Record<string, string> };
  contractId: string;
  idempotencyKey: string;
  digest: string;
  generatedAt: string;
}): { responsePath: string; metaPath: string } {
  mkdirSync(input.outputDir, { recursive: true });
  const responsePath = resolve(input.outputDir, `${input.name}-response.json`);
  const metaPath = resolve(input.outputDir, `${input.name}-response.meta.json`);
  writeFileSync(responsePath, `${JSON.stringify(input.submission.body, null, 2)}\n`, "utf8");
  writeFileSync(
    metaPath,
    `${JSON.stringify(
      {
        http_status: input.submission.status,
        headers: input.submission.headers,
        contract_id: input.contractId,
        idempotency_key: input.idempotencyKey,
        digest_sha256: input.digest,
        generated_at: input.generatedAt,
        submitted_at: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  return { responsePath, metaPath };
}

export function resolveIntegrationPackagePaths(): string[] {
  return [
    resolve(process.cwd(), "scripts/kccp/integration-package.local.json"),
    resolve(process.env.HOME ?? "", "Downloads/kccp-package-MelegaSwapV2.json"),
    resolve(process.env.HOME ?? "", ".config/melega-kccp/MelegaSwapV2.env"),
    resolve(process.env.HOME ?? "", ".config/melega-kccp/melega-dex.env"),
  ];
}

function parseEnvFile(path: string): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

export function loadCredentialEnv(): CredentialEnv {
  const envPaths = [
    resolve(process.env.HOME ?? "", ".config/melega-kccp/MelegaSwapV2.env"),
    resolve(process.cwd(), ".kccp-local/credentials.env"),
  ];
  for (const path of envPaths) parseEnvFile(path);

  const baseUrl = (process.env.KCCP_BUILD_BASE_URL ?? KCCP_BASE_URL).replace(/\/+$/, "");
  let token = process.env.KCCP_TOKEN?.trim();
  let hmacSecret = process.env.KCCP_HMAC_SECRET?.trim();
  let authMode: CredentialEnv["authMode"] = "kccp_hmac";

  if (!token && process.env.BUILD_OBSERVER_TOKEN?.trim()) {
    token = process.env.BUILD_OBSERVER_TOKEN.trim();
    authMode = "build_observer_bootstrap";
  }

  if (token && !hmacSecret && authMode === "kccp_hmac") {
    authMode = "bearer_only";
  }

  if (token && hmacSecret) {
    authMode = "kccp_hmac";
  }

  return { token, hmacSecret, baseUrl, authMode };
}
