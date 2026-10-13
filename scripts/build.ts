/** Bundles the extension into dist/, ready for "Load unpacked". */
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'dist');

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
await build({
  entryPoints: [path.join(root, 'src/content/main.ts')],
  outfile: path.join(output, 'content.js'),
  bundle: true,
  format: 'iife',
  target: 'chrome111',
  minify: true,
  charset: 'utf8',
  legalComments: 'none',
});
copyFileSync(path.join(root, 'extension/manifest.json'), path.join(output, 'manifest.json'));
console.info(`Extension built in ${output}`);
