import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_PORT = process.env.PORT || 5000;
const VITE_PORT = 5173;
const ROOT_DIR = path.join(__dirname, '..');

console.log('🔍 Starting ZeroWaste AI Diagnostics...\n');

// 1. Check Environments
const checkEnvs = () => {
  let passed = true;
  console.log('--- Checking Environments ---');
  
  const serverEnvPath = path.join(ROOT_DIR, 'server', '.env');
  if (!fs.existsSync(serverEnvPath)) {
    console.error('❌ Server .env file is MISSING!');
    passed = false;
  } else {
    console.log('✅ Server .env file found.');
  }

  const clientEnvPath = path.join(ROOT_DIR, 'client', '.env');
  if (!fs.existsSync(clientEnvPath)) {
    console.warn('⚠️ Client .env file is MISSING (Not always strictly required but recommended for custom URLs).');
  } else {
    console.log('✅ Client .env file found.');
  }

  return passed;
};

// 2. Check Backend Health
const checkBackend = () => {
  return new Promise((resolve) => {
    console.log(`\n--- Checking Backend API on Port ${BACKEND_PORT} ---`);
    const req = http.get(`http://localhost:${BACKEND_PORT}/health`, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Backend API is RUNNING and connected.');
        resolve(true);
      } else {
        console.error(`❌ Backend API responded with status ${res.statusCode}.`);
        resolve(false);
      }
    });

    req.on('error', (e) => {
      console.error(`❌ Backend is unreachable: ${e.message}`);
      console.error('   Make sure you started the backend server.');
      resolve(false);
    });

    req.end();
  });
};

const run = async () => {
  const envPassed = checkEnvs();
  const backendPassed = await checkBackend();

  console.log('\n=============================================');
  if (envPassed && backendPassed) {
    console.log('🎉 Diagnostic Passed! Everything looks good.');
  } else {
    console.log('⚠️ Diagnostic found issues. Please fix the above errors.');
  }
  console.log('=============================================\n');
  process.exit();
};

run();
