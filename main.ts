import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Saturday 21 November 2026 front page.
// Copies entry.png into the output directory. The output directory is
// created only when it does not already exist; it is never removed,
// recreated, or emptied by this program.

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");

const outputDir = resolve(
  process.env.OUTPUT_DIR ?? process.env.MAKEFUN_OUTPUT_DIR ?? "/output",
);
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

const destination = join(outputDir, "entry.png");
copyFileSync(source, destination);

const bytes = readFileSync(destination);
const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!bytes.subarray(0, 8).equals(pngMagic)) {
  throw new Error("entry.png failed PNG magic-byte verification");
}

const sourceSize = statSync(source).size;
const size = statSync(destination).size;
if (size !== bytes.length || size !== sourceSize) {
  throw new Error(
    `entry.png size mismatch: source ${sourceSize}, stat ${size}, read ${bytes.length}`,
  );
}

const digest = createHash("sha256").update(bytes).digest("hex");
console.log(`wrote ${destination} (${size} bytes, sha256 ${digest})`);
