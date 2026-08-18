#!/usr/bin/env node
/**
 * Update the self-hosted Sveltia CMS bundle in public/_edit/.
 *
 * Usage:
 *   npm run update:cms          # fetch the latest release from npm
 *   npm run update:cms -- 0.193.0  # fetch a specific version
 *
 * Downloads the pinned bundle from unpkg (not the floating "latest"
 * URL) and records the version in public/_edit/sveltia-cms.version.
 */

import { writeFile } from "node:fs/promises";
import { readFileSync, existsSync } from "node:fs";

const BUNDLE = "public/_edit/sveltia-cms.js";
const VERSION_FILE = "public/_edit/sveltia-cms.version";

const current = existsSync(VERSION_FILE)
  ? readFileSync(VERSION_FILE, "utf8").trim()
  : "(none)";

const version = process.argv[2];

async function main() {
  let target = version;

  if (!target) {
    process.stdout.write("Checking npm registry for latest @sveltia/cms ... ");
    const res = await fetch("https://registry.npmjs.org/@sveltia/cms/latest");
    if (!res.ok) throw new Error(`registry responded ${res.status}`);
    const json = await res.json();
    console.log(json.version);
    target = json.version;
  }

  if (target === current) {
    console.log(`Already up to date (${current}). Nothing to do.`);
    return;
  }

  const url = `https://unpkg.com/@sveltia/cms@${target}/dist/sveltia-cms.js`;
  process.stdout.write(`Downloading ${url} ... `);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`unpkg responded ${res.status}`);
  const code = await res.text();

  // Sanity check: the bundle should be JS, not an HTML error page.
  if (!code.startsWith("(") && !code.includes("sveltia")) {
    throw new Error("downloaded file does not look like the CMS bundle");
  }

  await writeFile(BUNDLE, code);
  await writeFile(VERSION_FILE, `${target}\n`);

  console.log(`done.`);
  console.log(`Updated ${BUNDLE}: ${current} -> ${target}`);
  console.log("Commit both files to deploy.");
}

main().catch((err) => {
  console.error(`\nUpdate failed: ${err.message}`);
  process.exit(1);
});
