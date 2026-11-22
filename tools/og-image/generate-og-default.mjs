#!/usr/bin/env node
// Generates apps/app/public/og/default.png — the destination-level og:image
// (PR #14 review round C). Pure Node (zlib + hand-rolled PNG chunks), no
// external fetch, deterministic output for a given size.
//
// Usage: node tools/og-image/generate-og-default.mjs
//
// A simple vertical gradient between the app's brand blues (the link and
// splash background color, #208AEF): og:image cards are 1200x630 per the
// OpenGraph convention. Re-run only to change the artwork; the PNG is the
// committed artifact, s1-cluster asserts it ships in every export.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const WIDTH = 1200;
const HEIGHT = 630;
const TOP = [0x20, 0x8a, 0xef]; // #208AEF — brand blue (links, splash)
const BOTTOM = [0x16, 0x5d, 0xab]; // darker shade of the same hue

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const outPath = join(repoRoot, "apps/app/public/og/default.png");

function crc32(bytes) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

// Raw RGB scanlines, each prefixed by filter byte 0 (None).
const raw = Buffer.alloc(HEIGHT * (1 + WIDTH * 3));
let offset = 0;
for (let y = 0; y < HEIGHT; y++) {
  raw[offset++] = 0; // filter: None
  const t = y / (HEIGHT - 1);
  for (let x = 0; x < WIDTH; x++) {
    raw[offset++] = Math.round(TOP[0] + (BOTTOM[0] - TOP[0]) * t);
    raw[offset++] = Math.round(TOP[1] + (BOTTOM[1] - TOP[1]) * t);
    raw[offset++] = Math.round(TOP[2] + (BOTTOM[2] - TOP[2]) * t);
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type: truecolor RGB
ihdr[10] = 0; // compression: deflate
ihdr[11] = 0; // filter method
ihdr[12] = 0; // interlace: none

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, png);
console.log(
  `og-image: wrote ${outPath} (${WIDTH}x${HEIGHT}, ${png.length} bytes)`,
);
