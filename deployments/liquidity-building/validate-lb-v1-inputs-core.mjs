/**
 * Liquidity Building V1 — pure deployment-input validator (LB008/LB013-B).
 *
 * Binary results:
 *   DEPLOYMENT_INPUTS_VALID
 *   DEPLOYMENT_INPUTS_BLOCKED
 *
 * No filesystem / url imports — safe to load from Vitest.
 */
const CANONICAL = {
  factory: '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'.toLowerCase(),
  router: '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'.toLowerCase(),
};

const ZERO = '0x0000000000000000000000000000000000000000';

/** Explicitly rejected as LB fee receivers (LB006/LB008 discovery). */
const FORBIDDEN_TREASURY_RECEIVERS = new Set([
  '0xb5a8707ffa045e0fc7db6efc63161e853c80139a', // EOA fee collector
  '0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b', // EIP-7702 designator
  ZERO,
]);

function isAddress(v) {
  return typeof v === 'string' && /^0x[0-9a-fA-F]{40}$/.test(v) && v.toLowerCase() !== ZERO;
}

/**
 * Pure validation — returns { result, reasons } without exiting.
 * @param {object} doc
 * @param {{ rpcCodeBytes?: Record<string, number> }} [opts]
 */
export function validateDeploymentInputs(doc, opts = {}) {
  const reasons = [];
  const rpcCode = opts.rpcCodeBytes || {};

  if (doc.schemaVersion !== 'melega.liquidity-building.v1.deployment-inputs') {
    reasons.push('schemaVersion mismatch');
  }
  if (doc.chainId !== 56) reasons.push('chainId must be 56');
  if (doc.network !== 'bsc-mainnet') reasons.push('network must be bsc-mainnet');

  const factory = (doc.canonicalMelega?.factory || '').toLowerCase();
  const router = (doc.canonicalMelega?.router || '').toLowerCase();
  if (factory !== CANONICAL.factory) reasons.push('canonical Melega Factory mismatch');
  if (router !== CANONICAL.router) reasons.push('canonical Melega Router mismatch');

  if (doc.liquidityBuildingFactory?.melegaFactory) {
    if (doc.liquidityBuildingFactory.melegaFactory.toLowerCase() !== CANONICAL.factory) {
      reasons.push('LB Factory melegaFactory binding mismatch');
    }
  }
  if (doc.liquidityBuildingFactory?.melegaRouter) {
    if (doc.liquidityBuildingFactory.melegaRouter.toLowerCase() !== CANONICAL.router) {
      reasons.push('LB Factory melegaRouter binding mismatch');
    }
  }

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

  const sink = doc.treasury?.feeSinkAddress;
  const receiver = doc.treasury?.receiverAddress;
  if (!isAddress(sink)) {
    reasons.push('treasury.feeSinkAddress missing');
  }
  if (!isAddress(receiver)) {
    reasons.push('treasury.receiverAddress missing (BLOCKER LB-G04B)');
  } else {
    const recv = receiver.toLowerCase();
    if (FORBIDDEN_TREASURY_RECEIVERS.has(recv)) {
      reasons.push(`treasury.receiverAddress forbidden (EOA/EIP-7702/zero): ${receiver}`);
    }
    if (doc.treasury?.receiverVerdict !== 'PRODUCTION_BINDING_IDENTIFIED') {
      reasons.push(`treasury.receiverVerdict=${doc.treasury?.receiverVerdict}`);
    }
    const codeBytes =
      typeof doc.treasury?.receiverBytecodeBytes === 'number'
        ? doc.treasury.receiverBytecodeBytes
        : rpcCode[recv];
    if (codeBytes === undefined || codeBytes === null) {
      reasons.push('treasury.receiverBytecodeBytes missing — cannot prove non-EOA');
    } else if (codeBytes <= 0) {
      reasons.push('treasury.receiver is EOA or has no bytecode (forbidden)');
    } else if (codeBytes === 23) {
      reasons.push('treasury.receiver bytecode 23 bytes — EIP-7702 designator rejected');
    }
    if (doc.treasury?.feeSinkBoundReceiver) {
      if (doc.treasury.feeSinkBoundReceiver.toLowerCase() !== recv) {
        reasons.push('Fee Sink bound receiver does not match treasury.receiverAddress');
      }
    }
  }

  if (doc.treasury?.registryIntakeAddress) {
    const ri = String(doc.treasury.registryIntakeAddress).toLowerCase();
    if (ri === ZERO || FORBIDDEN_TREASURY_RECEIVERS.has(ri)) {
      reasons.push('treasury.registryIntakeAddress is not a production LB receiver');
    }
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
  if (
    doc.activationAuthorized === true &&
    doc.deploymentReadinessState !== 'VALID' &&
    doc.deploymentReadinessState !== 'DEPLOYED'
  ) {
    reasons.push('activationAuthorized true while deployment not VALID');
  }
  if (
    doc.productionAuthority?.verdict === 'AUTONOMOUS_AUTHORITY_NOT_READY' ||
    doc.productionAuthority?.verdict === 'AUTONOMOUS_AUTHORITY_NOT_PROVISIONED'
  ) {
    reasons.push(`productionAuthority.verdict=${doc.productionAuthority.verdict} (LB-G03B)`);
  }

  if (doc.testOnly === true || doc.label === 'test-only') {
    reasons.push('test-only dependency forbidden in production inputs');
  }

  return {
    result: reasons.length ? 'DEPLOYMENT_INPUTS_BLOCKED' : 'DEPLOYMENT_INPUTS_VALID',
    reasons,
    timestamp: new Date().toISOString(),
  };
}
