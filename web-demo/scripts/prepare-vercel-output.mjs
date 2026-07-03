import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const webDemoDir = resolve(scriptDir, "..");
const projectRoot = resolve(webDemoDir, "..");
const appDist = join(webDemoDir, "dist");
const outputDir = join(webDemoDir, "site-dist");

const homeSource = existsSync(join(projectRoot, "index.html"))
  ? projectRoot
  : join(projectRoot, "website");

const homeFiles = [
  "index.html",
  "styles.css",
  "logo-qolqa.png",
  "hero-smart-lockers.png"
];

rmSync(outputDir, { force: true, recursive: true });
mkdirSync(outputDir, { recursive: true });

for (const file of homeFiles) {
  const source = join(homeSource, file);
  if (existsSync(source)) {
    cpSync(source, join(outputDir, file));
  }
}

const homeAssets = join(homeSource, "assets");
if (existsSync(homeAssets)) {
  cpSync(homeAssets, join(outputDir, "assets"), { recursive: true });
}

const appAssets = join(appDist, "assets");
if (existsSync(appAssets)) {
  cpSync(appAssets, join(outputDir, "assets"), { recursive: true });
}

const appHtml = readFileSync(join(appDist, "index.html"), "utf8");
for (const route of ["residential", "travel", "kiosk"]) {
  const routeDir = join(outputDir, route);
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(join(routeDir, "index.html"), appHtml);
}
