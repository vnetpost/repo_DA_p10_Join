import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Copies the Apache rewrite config into each build output folder
 * so SPA routes continue to work after deployment.
 */
const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const sourceFile = resolve(projectRoot, 'public/.htaccess');
const buildTargets = [
  resolve(projectRoot, 'dist/join/.htaccess'),
  resolve(projectRoot, 'dist/join/browser/.htaccess'),
];

for (const targetFile of buildTargets) {
  await mkdir(dirname(targetFile), { recursive: true });
  await copyFile(sourceFile, targetFile);
}
