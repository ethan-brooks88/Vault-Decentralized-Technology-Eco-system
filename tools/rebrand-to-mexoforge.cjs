#!/usr/bin/env node
/** Replace Mexoforge branding with Mexoforge across source (not node_modules). */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", "dist", "cache", "out", "broadcast"]);
const TEXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".sol",
  ".bat",
  ".txt",
  ".html",
  ".example",
  ".toml",
  ".yml",
  ".yaml",
]);

const REPS = [
  ["MEXOFORGE VAULT", "MEXOFORGE VAULT"],
  ["Mexoforge Vault", "Mexoforge Vault"],
  ["MexoforgeVault", "MexoforgeVault"],
  ["Mexoforge", "Mexoforge"],
  ["mexoforge-vault", "mexoforge-vault"],
  ["@mexoforge/", "@mexoforge/"],
  ["mexoforge.com", "mexoforge.com"],
  ["mxfVault", "mxfVault"],
  ["npx mexoforge", "npx mexoforge"],
  ["mexoforge sim", "mexoforge sim"],
  ["mexoforge doctor", "mexoforge doctor"],
  ["mexoforge —", "mexoforge —"],
  ['"mexoforge":', '"mexoforge":'],
  ["mexoforge.js", "mexoforge.js"],
  ["mexoforge.ts", "mexoforge.ts"],
  ["(`mexoforge sim run`)", "(`mexoforge sim run`)"],
  ["mexoforge", "mexoforge"],
  ["MEXOFORGE", "MEXOFORGE"],
];

const RENAMES = [
  ["contracts/src/core/MexoforgeVault.sol", "contracts/src/core/MexoforgeVault.sol"],
  ["contracts/test/MexoforgeVault.t.sol", "contracts/test/MexoforgeVault.t.sol"],
  ["packages/cli/src/bin/mexoforge.ts", "packages/cli/src/bin/mexoforge.ts"],
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP.has(e.name)) continue;
      walk(path.join(dir, e.name), out);
    } else out.push(path.join(dir, e.name));
  }
  return out;
}

let n = 0;
for (const f of walk(ROOT)) {
  const base = path.basename(f);
  if (base.startsWith("rebrand-to-")) continue;
  if (!TEXT.has(path.extname(f).toLowerCase()) && !f.endsWith(".env.example")) continue;
  let t = fs.readFileSync(f, "utf8");
  const o = t;
  for (const [a, b] of REPS) t = t.split(a).join(b);
  if (t !== o) {
    fs.writeFileSync(f, t);
    console.log("  ", path.relative(ROOT, f));
    n++;
  }
}

for (const [from, to] of RENAMES) {
  const src = path.join(ROOT, from);
  const dst = path.join(ROOT, to);
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.renameSync(src, dst);
    console.log("  rename", from, "→", to);
    n++;
  }
}

// Update old rebrand helper in place if present
const oldRebrand = path.join(ROOT, "tools", "rebrand-to-mexoforge.cjs");
if (fs.existsSync(oldRebrand)) {
  let t = fs.readFileSync(oldRebrand, "utf8");
  for (const [a, b] of REPS) t = t.split(a).join(b);
  const neu = path.join(ROOT, "tools", "rebrand-to-mexoforge-from-chainnextgen.cjs");
  fs.writeFileSync(neu, t);
  fs.unlinkSync(oldRebrand);
  console.log("  replaced tools/rebrand-to-mexoforge.cjs");
  n++;
}

for (const rel of [
  "packages/api/dist",
  "packages/cli/dist",
  "packages/console/dist",
  "packages/shared/dist",
  "packages/simulator/dist",
]) {
  const p = path.join(ROOT, rel);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log("  removed", rel);
  }
}

console.log(`\nRebrand complete — ${n} changes.`);
