#!/usr/bin/env node
/**
 * Liquidity Building V1 — production deployment-input validator (LB008).
 *
 * Binary results:
 *   DEPLOYMENT_INPUTS_VALID
 *   DEPLOYMENT_INPUTS_BLOCKED
 *
 * Never reads private keys. Never substitutes placeholders as valid.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CANONICAL = {
  factory: '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'.toLowerCase(),
  router: '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'.toLowerCase(),
};

const ZERO = '0x0000000000000000000000000000000000000000';

function fail(reasons) {
  const out = {
    result: 'DEPLOYMENT_INPUTS_BLOCKED',
    reasons,
    timestamp: new Date().toISOString(),
  };
  console.log(JSON.stringify(out, null, 2));
  process.exit(1);
}

function ok(extra = {}) {
  const out = {
    result: 'DEPLOYMENT_INPUTS_VALID',
    timestamp: new Date().toISOString(),
    ...extra,
  };
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}

function isAddress(v) {
  return typeof v === 'string' && /^0x[0-9a-fA-F]{40}$/.test(v) && v.toLowerCase() !== ZERO;
}

function main() {
  const inputPath =
    process.argv[2] ||
    path.join(__dirname, 'chain-56', 'LiquidityBuildingV1.inputs.json');
  const abs = path.resolve(inputPath);
  if (!fs.existsSync(abs)) {
    fail([`missing artifact: ${abs}`]);
  }

  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(abs, 'utf8'));
  } catch (e) {
    fail([`invalid JSON: ${e.message}`]);
  }

  const reasons = [];

  if (doc.schemaVersion !== 'melega.liquidity-building.v1.deployment-inputs') {
    reasons.push('schemaVersion mismatch');
  }
  if (doc.chainId !== 56) reasons.push('chainId must be 56');
  if (doc.network !== 'bsc-mainnet') reasons.push('network must be bsc-mainnet');

  const factory = (doc.canonicalMelega?.factory || '').toLowerCase();
  const router = (doc.canonicalMelega?.router || '').toLowerCase();
  if (factory !== CANONICAL.factory) reasons.push('canonical Melega Factory mismatch');
  if (router !== CANONICAL.router) reasons.push('canonical Melega Router mismatch');

  if (!doc.compiler || doc.compiler.solc !== '0.8.20') {
    reasons.push('compiler.solc must be 0.8.20');
  }
  if (!doc.compiler?.viaIR) reasons.push('compiler.viaIR required');
  if (doc.compiler?.optimizerRuns !== 200) reasons.push('optimizerRuns must be 200');

  if (doc.protocolParameters?.successFeeBps !== 500) {
    reasons.push('successFeeBps must be 500');
  }
  if (!doc.protocolParameters?.initialFinalityDepth || doc.protocolParameters.initialFinalityDepth < 1) {
    reasons.push('initialFinalityDepth must be non-zero');
  }

  const auth = doc.productionAuthority || {};
  if (!isAddress(auth.address)) {
    reasons.push('productionAuthority.address missing or invalid (BLOCKER LB-G03B)');
  }
  if (auth.verdict !== 'AUTONOMOUS_AUTHORITY_PRODUCTION_READY') {
    reasons.push(`productionAuthority.verdict=${auth.verdict} (need PRODUCTION_READY)`);
  }
  if (auth.nonExportable !== true) {
    reasons.push('productionAuthority.nonExportable must be true');
  }

  if (!isAddress(doc.authorizer?.address)) {
    reasons.push('authorizer.address missing (not deployed / not bound)');
  }
  if (!isAddress(doc.treasury?.feeSinkAddress)) {
    reasons.push('treasury.feeSinkAddress missing');
  }
  if (!isAddress(doc.treasury?.receiverAddress)) {
    reasons.push('treasury.receiverAddress missing (BLOCKER LB-G04B)');
  }
  if (doc.treasury?.receiverVerdict !== 'PRODUCTION_BINDING_IDENTIFIED') {
    reasons.push(`treasury.receiverVerdict=${doc.treasury?.receiverVerdict}`);
  }

  const policies = Array.isArray(doc.quotePolicies) ? doc.quotePolicies : [];
  if (policies.length === 0) {
    reasons.push('quotePolicies empty (BLOCKER LB-G08)');
  } else {
    let anyActiveRatified = false;
    for (const p of policies) {
      if (!isAddress(p.address)) reasons.push(`quote policy address invalid: ${p.symbol}`);
      if (!p.decimals || p.decimals < 1) reasons.push(`quote decimals invalid: ${p.symbol}`);
      if (p.enabled) {
        if (!p.minimumGrossQuoteFloor || p.minimumGrossQuoteFloor === '0') {
          reasons.push(`enabled quote floor zero: ${p.symbol}`);
        }
        if (!p.minimumQuoteReserve || p.minimumQuoteReserve === '0') {
          reasons.push(`enabled reserve floor zero: ${p.symbol}`);
        }
        if (p.ratificationStatus !== 'RATIFIED' && p.ratificationStatus !== 'DEPLOYED') {
          reasons.push(`enabled quote not ratified: ${p.symbol} (${p.ratificationStatus})`);
        } else {
          anyActiveRatified = true;
        }
        if (
          (p.symbol === 'USDT' || p.symbol === 'USDC') &&
          p.gasConversionMode !== 'PinnedOnChainPair' &&
          p.gasConversionMode !== 'PinnedTreasurySource'
        ) {
          reasons.push(`stable gas path not verified: ${p.symbol} (LB-G09)`);
        }
      }
    }
    if (!anyActiveRatified) {
      reasons.push('no ratified active quote policy');
    }
  }

  const raw = JSON.stringify(doc);
  for (const f of ['TODO_MAINNET', 'testnetFallback', 'PRIVATE_KEY', 'privateKey', 'mnemonic', 'keystore']) {
    if (raw.includes(f)) reasons.push(`forbidden label present: ${f}`);
  }
  if (/"placeholder"/i.test(raw)) {
    reasons.push('forbidden placeholder label');
  }
  if (/0x[0-9a-fA-F]{64}/.test(raw) && /privateKey|PRIVATE_KEY|mnemonic/.test(raw)) {
    reasons.push('secret material suspected in artifact');
  }

  const blockers = Array.isArray(doc.unresolvedBlockers) ? doc.unresolvedBlockers : [];
  const blockingForDeploy = ['LB-G03B', 'LB-G04B', 'LB-G04C', 'LB-G08', 'LB-G11', 'LB-G12'];
  for (const b of blockingForDeploy) {
    if (blockers.includes(b)) reasons.push(`unresolved BLOCKER ${b}`);
  }

  if (doc.deploymentReadinessState === 'BLOCKED') {
    reasons.push('deploymentReadinessState is BLOCKED');
  }

  if (doc.runtimeIngestion?.status !== 'OPERATIONAL') {
    reasons.push(`runtimeIngestion.status=${doc.runtimeIngestion?.status} (need OPERATIONAL)`);
  }
  if (doc.signatureNormalization?.status !== 'VERIFIED') {
    reasons.push(`signatureNormalization.status=${doc.signatureNormalization?.status}`);
  }

  if (reasons.length) {
    fail(reasons);
  }
  ok({ artifact: abs });
}

main();
