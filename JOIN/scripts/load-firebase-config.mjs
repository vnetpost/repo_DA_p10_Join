import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

export async function loadFirebaseConfig() {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const environmentPath = resolve(currentDir, '../src/environments/environment.ts');
  const source = await readFile(environmentPath, 'utf8');

  const transformed = source
    .replace(/export\s+const\s+environment\s*=\s*/, 'return ')
    .replace(/;\s*$/, '');

  const environment = Function(`"use strict"; ${transformed}`)();
  const firebaseConfig = environment?.my_firebase;

  if (!firebaseConfig || typeof firebaseConfig !== 'object') {
    throw new Error('my_firebase config was not found in src/environments/environment.ts');
  }

  for (const key of requiredKeys) {
    if (!firebaseConfig[key]) {
      throw new Error(`Missing firebase config key: ${key}`);
    }
  }

  return firebaseConfig;
}
