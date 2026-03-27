import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
  let serviceAccount;
  try {
    serviceAccount = require('../../firebase-key.json');
  } catch (err) {
    throw new Error('firebase-key.json not found in server directory.');
  }
  
  // Use project ID from env if service account lacks it
  const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id;

  if (!projectId) {
    throw new Error('Firebase project ID is missing in both .env and service account JSON.');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId,
    });
    console.log('✅  Firebase Admin initialized successfully');
  }
} catch (error) {
  console.error('❌  CRITICAL: Firebase Admin initialization failed:');
  console.error('    ', error.message);
  console.error('    SERVER ABORTED due to faulty Firebase configuration.');
  process.exit(1);
}

export default admin;
