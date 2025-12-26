import {
  mkdirSync,
  copyFileSync,
  writeFileSync,
  watch,
  watchFile,
  unwatchFile,
} from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';

const rootDir = path.resolve(import.meta.dirname, '..');
const inputFile = path.join(rootDir, 'src', 'styles', 'library.css');
const presetFile = path.join(rootDir, 'src', 'styles', 'preset.css');
const outDir = path.join(rootDir, 'dist');
const outputFile = path.join(outDir, 'styles.css');

const args = new Set(process.argv.slice(2));
const watchMode = args.has('--watch');
const checkMode = args.has('--check');

async function buildOnce() {
  mkdirSync(outDir, { recursive: true });

  const inputCss = await readFile(inputFile, 'utf8');
  const result = await postcss([tailwind(), autoprefixer]).process(inputCss, {
    from: inputFile,
    to: outputFile,
    map: { inline: false },
  });

  writeFileSync(outputFile, result.css, 'utf8');
  if (result.map) writeFileSync(`${outputFile}.map`, result.map.toString(), 'utf8');

  copyFileSync(presetFile, path.join(outDir, 'preset.css'));

  if (checkMode) {
    if (!result.css || result.css.trim().length === 0) {
      throw new Error('Tailwind build produced empty CSS output.');
    }
  }

  return result.css.length;
}

async function main() {
  const bytes = await buildOnce();
  if (!watchMode) return;

  const watchRoot = path.join(rootDir, 'src');
  let pending = false;
  let timer = null;

  const watchFiles = [inputFile, presetFile];
  const onWatchedFileChanged = () => schedule();

  const schedule = () => {
    if (pending) return;
    pending = true;
    timer = setTimeout(async () => {
      pending = false;
      try {
        const outBytes = await buildOnce();
        // eslint-disable-next-line no-console
        console.log(`[haiku-ui] styles rebuilt (${outBytes} bytes)`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[haiku-ui] styles rebuild failed');
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }, 50);
  };

  // Keep process alive in watch mode.
  // eslint-disable-next-line no-console
  console.log(`[haiku-ui] watching ${watchRoot}`);

  for (const file of watchFiles) {
    watchFile(file, { interval: 200 }, onWatchedFileChanged);
  }
  process.on('exit', () => {
    for (const file of watchFiles) unwatchFile(file, onWatchedFileChanged);
  });

  watch(watchRoot, { recursive: true }, (_event, filename) => {
    if (!filename) return schedule();
    const ext = path.extname(filename).toLowerCase();
    if (!['.css', '.ts', '.tsx', '.js', '.jsx'].includes(ext)) return;
    schedule();
  });
}

await main();
