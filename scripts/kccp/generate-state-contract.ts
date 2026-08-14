#!/usr/bin/env npx tsx
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildRepositoryStateContract,
  computeKccpDigest,
  finalizeStateContractPayload,
  KCCP_BASE_URL,
  KCCP_DIGEST_ALGORITHM,
  KCCP_IDENTITY,
  KCCP_MISSION_CODE,
  KCCP_STATE_PATH,
  loadCredentialEnv,
  readGitFacts,
  scanNullStringViolations,
  scanPlaceholders,
  scanSecretPatterns,
  stripOptionalAbsentFields,
  submitKccpPayload,
  validateBuildStateSchema,
  writeDryRunArtifacts,
  writeSubmissionArtifacts,
} from "./lib";

function parseArgs(argv: string[]) {
  const args = new Set(argv);
  const outputFlagIndex = argv.indexOf("--output-dir");
  return {
    submit: args.has("--submit"),
    outputDir: outputFlagIndex >= 0 ? argv[outputFlagIndex + 1] : ".kccp-local",
  };
}

async function main() {
  const { submit, outputDir } = parseArgs(process.argv.slice(2));
  const facts = readGitFacts(process.cwd());
  const rawPayload = buildRepositoryStateContract({ facts, missionCode: KCCP_MISSION_CODE });
  const { payload, payloadDigest, wireDigest, canonicalInput } = finalizeStateContractPayload(rawPayload);
  const validation = validateBuildStateSchema(payload);
  const placeholderScan = scanPlaceholders(payload);
  const nullScan = scanNullStringViolations(payload);

  if (!validation.ok || !placeholderScan.ok || !nullScan.ok) {
    console.error(JSON.stringify({ ok: false, validation, placeholder_scan: placeholderScan, null_scan: nullScan }, null, 2));
    process.exit(1);
  }

  const { payloadPath, metaPath } = writeDryRunArtifacts({
    outputDir: resolve(outputDir),
    payload,
    digest: wireDigest,
    validation,
    placeholderScan,
  });

  const secretScan = scanSecretPatterns(`${readFileSync(payloadPath, "utf8")}\n${readFileSync(metaPath, "utf8")}`);
  if (!secretScan.ok) {
    console.error(JSON.stringify({ ok: false, secret_scan: secretScan }, null, 2));
    process.exit(1);
  }

  if (!submit) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          mode: "dry_run",
          identity: KCCP_IDENTITY,
          state_contract_id: payload.state_contract_id,
          digest_sha256: payload.digest_sha256,
          digest_algorithm: KCCP_DIGEST_ALGORITHM,
          canonical_input_bytes: Buffer.byteLength(canonicalInput, "utf8"),
          validation,
          artifacts: { payload: payloadPath, meta: metaPath },
          submit_target: `${KCCP_BASE_URL}${KCCP_STATE_PATH}`,
        },
        null,
        2,
      ),
    );
    return;
  }

  const creds = loadCredentialEnv();
  if (!creds.token || !creds.hmacSecret) {
    console.error(JSON.stringify({ ok: false, error: "missing_env:KCCP_TOKEN_or_KCCP_HMAC_SECRET" }, null, 2));
    process.exit(1);
  }

  const submission = await submitKccpPayload({
    baseUrl: creds.baseUrl,
    path: KCCP_STATE_PATH,
    token: creds.token,
    hmacSecret: creds.hmacSecret,
    authMode: creds.authMode,
    producer: KCCP_IDENTITY.repository_code,
    idempotencyKey: String(payload.idempotency_key),
    payload,
    digest: wireDigest,
  });

  writeSubmissionArtifacts({
    outputDir: resolve(outputDir),
    name: "repository-state",
    submission,
    contractId: String(payload.state_contract_id),
    idempotencyKey: String(payload.idempotency_key),
    digest: wireDigest,
    generatedAt: String(payload.generated_at),
  });

  const accepted = submission.status >= 200 && submission.status < 300;
  console.log(
    JSON.stringify(
      {
        ok: accepted,
        mode: "submit",
        http_status: submission.status,
        acknowledgement: submission.body,
        state_contract_id: payload.state_contract_id,
        digest_sha256: payload.digest_sha256,
        payload_digest_sha256: payloadDigest,
      },
      null,
      2,
    ),
  );
  process.exit(accepted ? 0 : 1);
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: String(error instanceof Error ? error.message : error) }, null, 2));
  process.exit(1);
});
