import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
const version = lock.packages?.["node_modules/next"]?.version;

function parse(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(value ?? "");
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compare(left, right) {
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] - right[i];
  }
  return 0;
}

const parsed = parse(version);
const minimum = [15, 5, 27];
const nextMajor = [16, 0, 0];

if (!parsed || compare(parsed, minimum) < 0 || compare(parsed, nextMajor) >= 0) {
  console.error(`locked next ${version ?? "missing"} is outside >=15.5.27 <16`);
  process.exit(1);
}

console.log(`locked next ${version}`);
