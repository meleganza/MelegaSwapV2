#!/usr/bin/env npx tsx
/**
 * KCCP MELEGA_DEX — Full authenticated connection lifecycle.
 * Reuses KCCP-CANONICAL-JSON-SHA256/v1 certified on LABS / RADAR / SPACE / CODEX / AI_GATEWAY.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildMissionResultPayload,
  buildRepositoryStateContract,
  finalizeStateContractPayload,
  KCCP_BASE_URL,
  KCCP_DIGEST_ALGORITHM,
  KCCP_IDENTITY,
  KCCP_MISSION_CODE,
  KCCP_MISSION_RESULT_PATH,
  KCCP_STATE_PATH,
  loadCredentialEnv,
  readGitFacts,
  readRepositoryRecord,
  resolveIntegrationPackagePaths,
  scanNullStringViolations,
  scanPlaceholders,
  scanSecretPatterns,
  submitKccpPayload,
  validateBuildStateSchema,
  writeDryRunArtifacts,
  writeSubmissionArtifacts,
} from "./lib";

const ART_DIR = resolve(process.cwd(), ".kccp-artifacts");

function writeJson(name: string, value: unknown) {
  mkdirSync(ART_DIR, { recursive: true });
  writeFileSync(resolve(ART_DIR, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sanitizeAck(body: unknown): unknown {
  if (!body || typeof body !== "object") return body;
  const record = body as Record<string, unknown>;
  const out: Record<string, unknown> = { ok: record.ok };
  if (record.data && typeof record.data === "object") {
    const data = record.data as Record<string, unknown>;
    out.data = {
      state_contract_id: data.state_contract_id ?? data.last_state_contract_id ?? null,
      result_pk: data.result_pk ?? data.id ?? null,
      lifecycle_state: data.lifecycle_state ?? null,
      connection_health: data.connection_health ?? null,
      verification_level: data.verification_level ?? null,
    };
  }
  if (record.error && typeof record.error === "object") {
    const error = record.error as Record<string, unknown>;
    out.error = { code: error.code, message: error.message };
  }
  return out;
}

async function main() {
  const facts = readGitFacts(process.cwd());
  const identity = {
    repository_root: facts.repositoryRoot,
    repository_code: KCCP_IDENTITY.repository_code,
    product_code: KCCP_IDENTITY.product_code,
    organ_code: KCCP_IDENTITY.organ_code,
    producer: KCCP_IDENTITY.repository_code,
    producer_type: KCCP_IDENTITY.producer_type,
    branch: facts.reportedBranch,
    head: facts.commitSha,
    dirty: facts.workingTreeState === "dirty",
    dirty_entry_count: facts.dirtyEntryCount,
  };
  writeJson("phase1-identity.json", identity);

  const integrationPaths = resolveIntegrationPackagePaths();
  const integrationPackagePath = integrationPaths.find((path) => existsSync(path)) ?? null;
  const creds = loadCredentialEnv();
  const credentialStatus = {
    credential_present: Boolean(creds.token),
    hmac_present: Boolean(creds.hmacSecret),
    auth_mode: creds.authMode,
    integration_package_present: Boolean(integrationPackagePath),
    integration_package_path: integrationPackagePath,
    base_url: creds.baseUrl,
  };
  writeJson("phase2-credential.json", credentialStatus);

  const rawState = buildRepositoryStateContract({ facts, missionCode: KCCP_MISSION_CODE });
  const finalizedState = finalizeStateContractPayload(rawState);
  const validation = validateBuildStateSchema(finalizedState.payload);
  const placeholderScan = scanPlaceholders(finalizedState.payload);
  const nullScan = scanNullStringViolations(finalizedState.payload);
  const localValidation = {
    ok: validation.ok && placeholderScan.ok && nullScan.ok,
    validation,
    placeholder_scan: placeholderScan,
    null_scan: nullScan,
    digest_algorithm: KCCP_DIGEST_ALGORITHM,
    digest_sha256: finalizedState.wireDigest,
    state_contract_id: finalizedState.payload.state_contract_id,
  };
  writeDryRunArtifacts({
    outputDir: ART_DIR,
    payload: finalizedState.payload,
    digest: finalizedState.wireDigest,
    validation,
    placeholderScan,
  });
  writeJson("phase4-local-validation.json", localValidation);

  if (!localValidation.ok) {
    console.error(JSON.stringify({ ok: false, phase: "local_validation", localValidation }, null, 2));
    process.exit(1);
  }

  const artifactText = readFileSync(resolve(ART_DIR, "repository-state-contract.json"), "utf8");
  const secretScan = scanSecretPatterns(artifactText);
  if (!secretScan.ok) {
    console.error(JSON.stringify({ ok: false, secret_scan: secretScan }, null, 2));
    process.exit(1);
  }

  if (!credentialStatus.credential_present) {
    const completion = {
      ok: false,
      blocker: "credential_not_configured",
      next_required_action:
        "Export KCCP_TOKEN (+ KCCP_HMAC_SECRET if enabled) or place ~/.config/melega-kccp/MelegaSwapV2.env; BUILD_OBSERVER_TOKEN bootstrap also accepted for Phase 3",
      identity,
      local_validation: localValidation,
      repository_state_submission: null,
      mission_result_submission: null,
    };
    writeJson("completion.json", completion);
    console.log(JSON.stringify(completion, null, 2));
    process.exit(1);
  }

  const stateSubmission = await submitKccpPayload({
    baseUrl: creds.baseUrl,
    path: KCCP_STATE_PATH,
    token: creds.token!,
    hmacSecret: creds.hmacSecret,
    authMode: creds.authMode,
    producer: KCCP_IDENTITY.repository_code,
    idempotencyKey: String(finalizedState.payload.idempotency_key),
    payload: finalizedState.payload,
    digest: finalizedState.wireDigest,
  });
  writeSubmissionArtifacts({
    outputDir: ART_DIR,
    name: "repository-state",
    submission: stateSubmission,
    contractId: String(finalizedState.payload.state_contract_id),
    idempotencyKey: String(finalizedState.payload.idempotency_key),
    digest: finalizedState.wireDigest,
    generatedAt: String(finalizedState.payload.generated_at),
  });
  const stateSubmissionSummary = {
    http_status: stateSubmission.status,
    state_contract_id: finalizedState.payload.state_contract_id,
    digest_sha256: finalizedState.wireDigest,
    timestamp: new Date().toISOString(),
    acknowledgement: sanitizeAck(stateSubmission.body),
  };
  writeJson("phase5-state-submission.json", stateSubmissionSummary);

  const readback1 = await readRepositoryRecord({ baseUrl: creds.baseUrl, token: creds.token });
  writeJson("phase6-readback.json", readback1);

  if (stateSubmission.status < 200 || stateSubmission.status >= 300) {
    const completion = {
      ok: false,
      blocker: "repository_state_rejected",
      identity,
      local_validation: localValidation,
      repository_state_submission: stateSubmissionSummary,
      mission_result_submission: null,
      readback: readback1,
    };
    writeJson("completion.json", completion);
    console.log(JSON.stringify(completion, null, 2));
    process.exit(1);
  }

  const rawMission = buildMissionResultPayload({
    facts,
    stateContractId: String(finalizedState.payload.state_contract_id),
    stateDigest: finalizedState.wireDigest,
  });
  const finalizedMission = finalizeStateContractPayload(rawMission);
  writeFileSync(
    resolve(ART_DIR, "mission-result.v1.json"),
    `${JSON.stringify(finalizedMission.payload, null, 2)}\n`,
    "utf8",
  );

  const missionSubmission = await submitKccpPayload({
    baseUrl: creds.baseUrl,
    path: KCCP_MISSION_RESULT_PATH,
    token: creds.token!,
    hmacSecret: creds.hmacSecret,
    authMode: creds.authMode,
    producer: KCCP_IDENTITY.repository_code,
    idempotencyKey: String(finalizedMission.payload.idempotency_key),
    payload: finalizedMission.payload,
    digest: finalizedMission.wireDigest,
  });
  writeSubmissionArtifacts({
    outputDir: ART_DIR,
    name: "mission-result",
    submission: missionSubmission,
    contractId: String(finalizedState.payload.state_contract_id),
    idempotencyKey: String(finalizedMission.payload.idempotency_key),
    digest: finalizedMission.wireDigest,
    generatedAt: String(finalizedMission.payload.generated_at),
  });
  const missionSubmissionSummary = {
    http_status: missionSubmission.status,
    result_pk:
      missionSubmission.body &&
      typeof missionSubmission.body === "object" &&
      (missionSubmission.body as Record<string, unknown>).data &&
      typeof (missionSubmission.body as Record<string, unknown>).data === "object"
        ? ((missionSubmission.body as Record<string, unknown>).data as Record<string, unknown>).result_pk ??
          ((missionSubmission.body as Record<string, unknown>).data as Record<string, unknown>).id ??
          null
        : null,
    digest_sha256: finalizedMission.wireDigest,
    timestamp: new Date().toISOString(),
    acknowledgement: sanitizeAck(missionSubmission.body),
  };
  writeJson("phase8-mission-submission.json", missionSubmissionSummary);

  const readback2 = await readRepositoryRecord({ baseUrl: creds.baseUrl, token: creds.token });
  writeJson("phase9-readback.json", readback2);

  const readbackData =
    readback2.body && typeof readback2.body === "object"
      ? ((readback2.body as Record<string, unknown>).data as Record<string, unknown> | undefined)
      : undefined;

  const completion = {
    ok: missionSubmission.status >= 200 && missionSubmission.status < 300,
    identity,
    credential_status: credentialStatus.credential_present ? "configured" : "not_configured",
    integration_package_status: credentialStatus.integration_package_present ? "present" : "missing",
    repository_state_submission: stateSubmissionSummary,
    mission_result_submission: missionSubmissionSummary,
    readback: {
      lifecycle_state: readbackData?.lifecycle_state ?? null,
      connection_health: readbackData?.connection_health ?? null,
      verification_level: readbackData?.verification_level ?? null,
      last_state_contract_id: readbackData?.last_state_contract_id ?? null,
      last_state_at: readbackData?.last_state_at ?? null,
      last_commit_sha: readbackData?.last_commit_sha ?? null,
      first_submission_at: readbackData?.first_submission_at ?? null,
      last_mission_result_at: readbackData?.last_mission_result_at ?? null,
      current_mission_code: readbackData?.current_mission_code ?? null,
    },
    reconciliation_candidates: [],
    local_validation: localValidation,
    founder_approval_required: true,
    approved_by_agent: false,
  };
  writeJson("completion.json", completion);
  console.log(JSON.stringify(completion, null, 2));
  if (completion.ok) {
    console.log("\nKCCP_MELEGA_DEX_READY_FOR_FOUNDER_CONNECTION_APPROVAL");
  }
  process.exit(completion.ok ? 0 : 1);
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: String(error instanceof Error ? error.message : error) }, null, 2));
  process.exit(1);
});
