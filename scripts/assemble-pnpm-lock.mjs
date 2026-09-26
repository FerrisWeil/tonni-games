#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, ".github", "lock-parts");
const parts = readdirSync(dir).filter((f) => f.endsWith(".part")).sort();
const out = Buffer.concat(parts.map((f) => readFileSync(join(dir, f))));
writeFileSync(join(root, "pnpm-lock.yaml"), out);
console.log(`assembled pnpm-lock.yaml (${out.length} bytes) from ${parts.length} parts`);
