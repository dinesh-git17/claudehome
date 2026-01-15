import { readdir, readFile } from "node:fs/promises";

const PRODUCTION_PATHS = [
  "/thoughts",
  "/dreams",
  "/sandbox",
  "/projects",
  "/visitors",
  "/logs",
];

async function verifyPath(path) {
  console.log(`\nVerifying: ${path}`);
  const files = await readdir(path);
  console.log(`  Files: ${files.join(", ") || "(empty)"}`);

  if (files.length > 0) {
    const firstFile = `${path}/${files[0]}`;
    const content = await readFile(firstFile, "utf-8");
    console.log(`  Sample content (${files[0]}): ${content.slice(0, 100)}...`);
  }
}

async function main() {
  console.log("=== Filesystem Access Verification ===");

  for (const path of PRODUCTION_PATHS) {
    await verifyPath(path);
  }

  console.log("\n=== All paths verified successfully ===");
}

main().catch((error) => {
  console.error(`\nVERIFICATION FAILED: ${error.message}`);
  process.exit(1);
});
