#!/usr/bin/env node
/**
 * LB008 — BscScan verification input helper (no broadcast, no private keys).
 * Emits the constructor-arg / compiler metadata template once addresses exist.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputsPath = path.join(__dirname, 'chain-56', 'LiquidityBuildingV1.inputs.json');
const doc = JSON.parse(fs.readFileSync(inputsPath, 'utf8'));

const out = {
  schemaVersion: 'melega.liquidity-building.v1.bscscan-verification',
  chainId: 56,
  compiler: doc.compiler,
  sourceCommit: doc.sourceCommit,
  readiness: doc.deploymentReadinessState,
  note: 'Populate addresses only after autonomous mainnet deploy. Do not submit placeholders.',
  contracts: [
    {
      name: 'LiquidityBuildingExecutionAuthorizerV1',
      address: doc.authorizer?.address ?? null,
      constructorArgs: ['signingAuthority (address)'],
      status: doc.authorizer?.address ? 'READY_FOR_VERIFY' : 'BLOCKED_NO_ADDRESS',
    },
    {
      name: 'LiquidityBuildingTreasuryFeeSinkV1',
      address: doc.treasury?.feeSinkAddress ?? null,
      constructorArgs: ['treasuryReceiver (address)'],
      status: doc.treasury?.feeSinkAddress ? 'READY_FOR_VERIFY' : 'BLOCKED_NO_ADDRESS',
    },
    {
      name: 'LiquidityBuildingFactoryV1',
      address: null,
      constructorArgs: [
        'factoryVersion',
        'implementation',
        'melegaFactory',
        'melegaRouter',
        'executionAuthorizer',
        'treasuryFeeSink',
        'ProtocolParameters',
        'QuoteAssetPolicy[]',
      ],
      status: 'BLOCKED_NO_ADDRESS',
    },
  ],
};

console.log(JSON.stringify(out, null, 2));
process.exit(doc.deploymentReadinessState === 'BLOCKED' ? 1 : 0);
