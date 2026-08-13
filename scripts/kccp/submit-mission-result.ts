#!/usr/bin/env npx tsx
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildMissionResultPayload,
  finalizeStateContractPayload,
  KCCP_BASE_URL,
  KCCP_DIGEST_ALGORITHM,
  KCCP_IDENTITY,
  KCCP_MISSION_RESULT_PATH,
  loadCredentialEnv,
  readGitFacts,
  scanSecretPatterns,
  submitKccpPayload,
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
  const stateContractId = process.env.KCCP_ACCEPTED_STATE_CONTRACT_ID?.trim();
  const stateDigest = process.env.KCCP_ACCEPTED_STATE_DIGEST?.trim() ?? "";
  if (!stateContractId) {
    console.error(JSON.stringify({ ok: false, error: "missing_env:KCCP_ACCEPTED_STATE_CONTRACT_ID" }, null, 2));
    process.exit(1);
  }

  const facts = readGitFacts(process.cwd());
  const rawPayload = buildMissionResultPayload({ facts, stateContractId, stateDigest });
  const { payload, wireDigest } = finalizeStateContractPayload(rawPayload);
  mkdirSync(resolve(outputDir), { recursive: true });
  const payloadPath = resolve(outputDir, "mission-result.v1.json");
  writeFileSync(payloadPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  const secretScan = scanSecretPatterns(readFileSync(payloadPath, "utf8"));
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
          result_id: payload.result_id,
          digest_sha256: payload.digest_sha256,
          digest_algorithm: KCCP_DIGEST_ALGORITHM,
          referenced_state_contract_id: stateContractId,
          artifact: payloadPath,
          submit_target: `${KCCP_BASE_URL}${KCCP_MISSION_RESULT_PATH}`,
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
    path: KCCP_MISSION_RESULT_PATH,
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
    name: "mission-result",
    submission,
    contractId: stateContractId,
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
        result_id: payload.result_id,
        digest_sha256: payload.digest_sha256,
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
