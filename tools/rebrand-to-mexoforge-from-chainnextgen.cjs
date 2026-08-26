#!/usr/bin/env node
/** Replace ChainNextGen branding with Mexoforge across source (not node_modules). */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".git"]);
const TEXT = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".md", ".sol", ".bat", ".txt", ".html", ".example"]);

const REPS = [
  ["CHAINNEXTGEN VAULT", "MEXOFORGE VAULT"],
  ["ChainNextGen Vault", "Mexoforge Vault"],
  ["ChainNextGenVault", "MexoforgeVault"],
  ["ChainNextGen", "Mexoforge"],
  ["chainnextgen-vault", "mexoforge-vault"],
  ["@chainnextgen/", "@mexoforge/"],
  ["chainnextgen.com", "mexoforge.com"],
  ["cngVault", "mxfVault"],
  ["npx chainnextgen", "npx mexoforge"],
  ["chainnextgen sim", "mexoforge sim"],
  ["chainnextgen doctor", "mexoforge doctor"],
  ["chainnextgen —", "mexoforge —"],
  ['"chainnextgen":', '"mexoforge":'],
  ["chainnextgen.js", "mexoforge.js"],
  ["chainnextgen.ts", "mexoforge.ts"],
  ["(`chainnextgen sim run`)", "(`mexoforge sim run`)"],
];

const RENAMES = [
  ["contracts/src/core/ChainNextGenVault.sol", "contracts/src/core/MexoforgeVault.sol"],
  ["contracts/test/ChainNextGenVault.t.sol", "contracts/test/MexoforgeVault.t.sol"],
  ["packages/cli/src/bin/chainnextgen.ts", "packages/cli/src/bin/mexoforge.ts"],
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP.has(e.name)) continue;
      if (e.name === "dist") continue;
      walk(path.join(dir, e.name), out);
    } else out.push(path.join(dir, e.name));
  }
  return out;
}

let n = 0;
for (const f of walk(ROOT)) {
  const base = path.basename(f);
  if (base === "rebrand-to-mexoforge.cjs" || base === "rebrand-chainnextgen.cjs") continue;
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
    fs.renameSync(src, dst);
    console.log("  rename", from, "→", to);
    n++;
  }
}

// Remove stale dist so rebuild is clean
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
