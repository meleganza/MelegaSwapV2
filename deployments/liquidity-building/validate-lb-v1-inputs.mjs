#!/usr/bin/env node
/**
 * Liquidity Building V1 — production deployment-input validator CLI (LB008/LB013-B).
 *
 * Binary results:
 *   DEPLOYMENT_INPUTS_VALID
 *   DEPLOYMENT_INPUTS_BLOCKED
 *
 * Never reads private keys. Never substitutes placeholders as valid.
 * Never binds zero/test/EOA Treasury receivers as production.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { validateDeploymentInputs } from './validate-lb-v1-inputs-core.mjs';

export { validateDeploymentInputs };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function main() {
  const inputPath =
    process.argv[2] || path.join(__dirname, 'chain-56', 'LiquidityBuildingV1.inputs.json');
  const abs = path.resolve(inputPath);
  if (!fs.existsSync(abs)) {
    const out = {
      result: 'DEPLOYMENT_INPUTS_BLOCKED',
      reasons: [`missing artifact: ${abs}`],
      timestamp: new Date().toISOString(),
    };
    console.log(JSON.stringify(out, null, 2));
    process.exit(1);
  }

  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(abs, 'utf8'));
  } catch (e) {
    const out = {
      result: 'DEPLOYMENT_INPUTS_BLOCKED',
      reasons: [`invalid JSON: ${e.message}`],
      timestamp: new Date().toISOString(),
    };
    console.log(JSON.stringify(out, null, 2));
    process.exit(1);
  }

  const out = validateDeploymentInputs(doc);
  if (out.result === 'DEPLOYMENT_INPUTS_VALID') {
    console.log(JSON.stringify({ ...out, artifact: abs }, null, 2));
    process.exit(0);
  }
  console.log(JSON.stringify(out, null, 2));
  process.exit(1);
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  main();
}
