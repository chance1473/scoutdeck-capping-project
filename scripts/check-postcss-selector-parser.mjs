import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const lockPath = join(dirname(fileURLToPath(import.meta.url)), "..", "package-lock.json");
const lock = JSON.parse(readFileSync(lockPath, "utf8"));
const minimum = [7, 1, 6];

function parseVersion(version) {
  const match = String(version).match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function belowMinimum(version) {
  const parts = parseVersion(version);
  if (!parts) return true;
  for (let i = 0; i < minimum.length; i += 1) {
    if (parts[i] !== minimum[i]) return parts[i] < minimum[i];
  }
  return false;
}

const versions = [];

for (const [key, pkg] of Object.entries(lock.packages ?? {})) {
  const name = key.split("node_modules/").at(-1);
  if (name === "postcss-selector-parser" && pkg?.version) {
    versions.push(pkg.version);
  }
}

function walkDependencies(deps) {
  if (!deps || typeof deps !== "object") return;
  for (const [name, meta] of Object.entries(deps)) {
    if (name === "postcss-selector-parser" && meta && typeof meta.version === "string") {
      versions.push(meta.version);
    }
    if (meta && typeof meta === "object") walkDependencies(meta.dependencies);
  }
}

walkDependencies(lock.dependencies);

if (versions.length === 0 || versions.some(belowMinimum)) {
  console.log(
    versions.length === 0
      ? "no postcss-selector-parser versions found in package-lock.json"
      : `postcss-selector-parser below 7.1.6: ${versions.filter(belowMinimum).join(", ")}`,
  );
  process.exit(1);
}

console.log(`postcss-selector-parser ${[...new Set(versions)].join(", ")}`);
process.exit(0);
