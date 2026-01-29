import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { investigate } from "./agent.ts";
import type { Verdict } from "./schema.ts";

async function loadCaseFiles(dir: string): Promise<Record<string, string>> {
  const files: Record<string, string> = {};

  async function walk(currentDir: string, basePath: string) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      const relativePath = join(basePath, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath, relativePath);
      } else if (entry.name.endsWith(".md")) {
        const content = await readFile(fullPath, "utf-8");
        files[`/case-files/${relativePath}`] = content;
      }
    }
  }

  await walk(dir, "");
  return files;
}

function printVerdict(verdict: Verdict) {
  console.log("\n" + "=".repeat(60));
  console.log("           DETECTIVE'S FINAL VERDICT");
  console.log("=".repeat(60) + "\n");

  console.log(`MURDERER: ${verdict.verdict.murderer}`);
  console.log(`CONFIDENCE: ${verdict.verdict.confidence}%`);
  console.log(`MOTIVE: ${verdict.verdict.motive}\n`);

  console.log("-".repeat(60));
  console.log("EVIDENCE CHAIN:");
  console.log("-".repeat(60));
  verdict.evidenceChain.forEach((e, i) => {
    console.log(`\n${i + 1}. ${e.item}`);
    console.log(`   Implicates: ${e.implicates}`);
    console.log(`   Significance: ${e.significance}`);
  });

  console.log("\n" + "-".repeat(60));
  console.log("SUSPECT RANKINGS:");
  console.log("-".repeat(60) + "\n");
  verdict.suspectRankings.forEach((s, i) => {
    console.log(
      `${i + 1}. ${s.name} - Score: ${s.suspicionScore}/100 - Alibi: ${s.alibiStatus}`
    );
    if (s.motive) console.log(`   Motive: ${s.motive}`);
  });

  console.log("\n" + "-".repeat(60));
  console.log("KEY DEDUCTIONS:");
  console.log("-".repeat(60) + "\n");
  verdict.keyDeductions.forEach((d, i) => {
    console.log(`${i + 1}. ${d}`);
  });

  console.log("\n" + "=".repeat(60) + "\n");
}

async function main() {
  console.log("Loading case files...");
  const caseFilesDir = new URL("../case-files", import.meta.url).pathname;
  const files = await loadCaseFiles(caseFilesDir);
  console.log(`Loaded ${Object.keys(files).length} files\n`);

  console.log("Detective is investigating...\n");
  const verdict = await investigate(files);
  printVerdict(verdict);
}

main().catch(console.error);
