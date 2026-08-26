#!/usr/bin/env node
/** Remove Mexoforge branding — rebrand to Entry Vault / entry-vault scope. */
const fs = require("fs");
const path = require("path");

const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", "dist", "cache", "out", "broadcast"]);
const TEXT = new Set([
  ".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".md", ".sol",
  ".html", ".example", ".toml", ".yml", ".yaml", ".txt",
]);

const REPS = [
  ["MEXOFORGE VAULT", "ENTRY VAULT"],
  ["MexoforgeVault", "EntryVault"],
  ["Mexoforge Vault", "Entry Vault"],
  ["mexoforge-vault", "entry-vault"],
  ["@mexoforge/", "@entry-vault/"],
  ["mxfVault", "evShare"],
  ["security@mexoforge.com", "security@entryvault.dev"],
  ["mexoforge.com", "entryvault.dev"],
  ["npx mexoforge", "npx entryvault"],
  ["mexoforge sim", "entryvault sim"],
  ["mexoforge doctor", "entryvault doctor"],
  ["mexoforge —", "entryvault —"],
  ['"mexoforge":', '"entryvault":'],
  ["mexoforge.js", "entryvault.js"],
  ["mexoforge.ts", "entryvault.ts"],
  ["(`mexoforge sim run`)", "(`entryvault sim run`)"],
  ["mexoforge Vault", "Entry Vault"],
  ["**Mexoforge**", "**Entry Vault Labs**"],
  ["Mexoforge", "Entry Vault Labs"],
  ["mexoforge", "entryvault"],
  ["MEXOFORGE", "ENTRYVAULT"],
];

const RENAMES = [
  ["contracts/src/core/MexoforgeVault.sol", "contracts/src/core/EntryVault.sol"],
  ["contracts/test/MexoforgeVault.t.sol", "contracts/test/EntryVault.t.sol"],
  ["packages/cli/src/bin/mexoforge.ts", "packages/cli/src/bin/entryvault.ts"],
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
  if (base.startsWith("rebrand-to-mexoforge") || base === "rebrand-from-mexoforge.cjs") continue;
  const ext = path.extname(f).toLowerCase();
  if (!TEXT.has(ext) && !f.endsWith(".env.example")) continue;
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

for (const rel of [
  "tools/rebrand-to-mexoforge.cjs",
  "tools/rebrand-to-mexoforge-from-chainnextgen.cjs",
]) {
  const p = path.join(ROOT, rel);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log("  removed", rel);
    n++;
  }
}

for (const rel of [
  "packages/api/dist", "packages/cli/dist", "packages/console/dist",
  "packages/shared/dist", "packages/simulator/dist",
]) {
  const p = path.join(ROOT, rel);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log("  removed", rel);
  }
}

console.log(`\nRebrand complete — ${n} changes in ${ROOT}`);
