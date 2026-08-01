#!/usr/bin/env node
/**
 * Shrinks oversized images in place (PNG/JPEG/WebP), keeping aspect ratio
 * and transparency — never crops, just scales down + recompresses.
 *
 * Usage:
 *   node scripts/shrink-images.js <file-or-directory> [options]
 *
 * Options:
 *   --max-mb=<n>       Target size ceiling in MB. Default: 10
 *   --dimension=<n>    Starting cap on the longest side, in px. Default: 2600
 *   --dry-run          Report what would change without writing anything
 *
 * Examples:
 *   node scripts/shrink-images.js public/jammerz.png
 *   node scripts/shrink-images.js public/nugs
 *   node scripts/shrink-images.js public/nugs --max-mb=5 --dimension=2000
 *
 * Files already under the size ceiling are left untouched. Anything still
 * over the ceiling after the starting dimension gets shrunk further in a
 * few steps (90% at a time) rather than failing outright.
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const MAX_SHRINK_STEPS = 6;

function parseArgs(argv) {
  const [target, ...rest] = argv;
  if (!target) {
    console.error("Usage: node scripts/shrink-images.js <file-or-directory> [--max-mb=10] [--dimension=2600] [--dry-run]");
    process.exit(1);
  }

  const opts = { maxMb: 10, dimension: 2600, dryRun: false };
  for (const arg of rest) {
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg.startsWith("--max-mb=")) opts.maxMb = Number(arg.split("=")[1]);
    else if (arg.startsWith("--dimension=")) opts.dimension = Number(arg.split("=")[1]);
    else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
  }
  return { target, opts };
}

function collectImageFiles(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    return EXTENSIONS.has(path.extname(target).toLowerCase()) ? [target] : [];
  }

  const files = [];
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) files.push(...collectImageFiles(full));
    else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

function formatMb(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + "MB";
}

async function encodeAt(filePath, dimension) {
  const ext = path.extname(filePath).toLowerCase();
  const pipeline = sharp(filePath).resize({
    width: dimension,
    height: dimension,
    fit: "inside",
    withoutEnlargement: true,
  });

  if (ext === ".png") return pipeline.png({ compressionLevel: 9 }).toBuffer();
  if (ext === ".webp") return pipeline.webp({ quality: 90 }).toBuffer();
  return pipeline.jpeg({ quality: 88, mozjpeg: true }).toBuffer();
}

async function shrinkFile(filePath, opts) {
  const maxBytes = opts.maxMb * 1024 * 1024;
  const before = fs.statSync(filePath).size;

  if (before <= maxBytes) {
    console.log(`skip   ${filePath}  (${formatMb(before)}, already under ${opts.maxMb}MB)`);
    return;
  }

  let dimension = opts.dimension;
  let buffer = await encodeAt(filePath, dimension);

  let step = 0;
  while (buffer.length > maxBytes && step < MAX_SHRINK_STEPS) {
    dimension = Math.round(dimension * 0.9);
    buffer = await encodeAt(filePath, dimension);
    step++;
  }

  if (buffer.length > maxBytes) {
    console.warn(
      `warn   ${filePath}  still ${formatMb(buffer.length)} after ${step} extra step(s) — ` +
        `image is unusually dense; try a lower --dimension or --max-mb.`
    );
  }

  if (opts.dryRun) {
    console.log(`dry-run ${filePath}  ${formatMb(before)} -> ${formatMb(buffer.length)} (dimension ${dimension}px)`);
    return;
  }

  fs.writeFileSync(filePath, buffer);
  console.log(`shrunk ${filePath}  ${formatMb(before)} -> ${formatMb(buffer.length)} (dimension ${dimension}px)`);
}

async function main() {
  const { target, opts } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(target)) {
    console.error(`No such file or directory: ${target}`);
    process.exit(1);
  }

  const files = collectImageFiles(target);
  if (files.length === 0) {
    console.log("No PNG/JPEG/WebP images found.");
    return;
  }

  console.log(
    `Processing ${files.length} image(s), target <= ${opts.maxMb}MB, starting dimension ${opts.dimension}px${opts.dryRun ? " (dry run)" : ""}\n`
  );

  for (const file of files) {
    await shrinkFile(file, opts);
  }
}

main();
