#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Get build information
const buildTime = new Date().toISOString();
const gitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
const gitShortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
const gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

console.log(`🔨 Injecting build info: ${gitShortHash} (${gitBranch}) at ${buildTime}`);

// Update health endpoint
const healthPath = join(projectRoot, 'public', 'health');
const healthData = {
  "status": "ok",
  "service": "android-device-catalog",
  "uptime": true,
  "version": "1.0.0",
  "build": {
    "time": buildTime,
    "commit": gitHash,
    "shortCommit": gitShortHash,
    "branch": gitBranch
  }
};
writeFileSync(healthPath, JSON.stringify(healthData, null, 2));

// Update ping.json
const pingPath = join(projectRoot, 'public', 'ping.json');
const pingData = {
  "ping": "pong",
  "site": "android-device.gohk.xyz",
  "status": "alive",
  "build": {
    "time": buildTime,
    "commit": gitShortHash,
    "branch": gitBranch
  }
};
writeFileSync(pingPath, JSON.stringify(pingData, null, 2));

// Update status.html
const statusPath = join(projectRoot, 'public', 'status.html');
let statusHtml = readFileSync(statusPath, 'utf8');

// Replace placeholders with actual build info
statusHtml = statusHtml.replace('{{BUILD_TIME}}', buildTime);
statusHtml = statusHtml.replace('{{GIT_HASH}}', gitShortHash);
statusHtml = statusHtml.replace('{{GIT_BRANCH}}', gitBranch);
statusHtml = statusHtml.replace('{{FULL_GIT_HASH}}', gitHash);

writeFileSync(statusPath, statusHtml);

console.log('✅ Build information injected successfully');
