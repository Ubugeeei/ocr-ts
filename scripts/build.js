import fs from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";
import { rimraf } from "rimraf";

/** @type {(str: string) => string} */
const blue = str => `\x1b[34m${str}\x1b[0m`;

/** @type {(str: string) => string} */
const green = str => `\x1b[32m${str}\x1b[0m`;

/** @type {(dir: string) => void} */
const finishedBuild = dir => console.log(`${green("✔︎")} build: ${blue(dir)}`);

const CLI_OUT_DIR = `packages/tools/bin`;

/**
 * @type {() => PromiseLike<void>}
 */
export const buildCli = async () => {
  /**
   * @type {import('esbuild').BuildOptions}
   */
  await esbuild.build({
    entryPoints: [path.resolve("packages/tools/src/bin")],
    bundle: true,
    outdir: CLI_OUT_DIR,
    target: "node18",
    platform: "node",
  });
  finishedBuild(CLI_OUT_DIR);

  // copy jTegaki.zip
  fs.copyFileSync(
    path.resolve("packages/tools/src/cmd/jTegaki/jTegaki.zip"),
    path.resolve(`${CLI_OUT_DIR}/jTegaki.zip`),
  );
  finishedBuild(`${CLI_OUT_DIR}/jTegaki.zip)`);
};

/**
 * @type {() => void}
 */
export const clearCliSync = () => {
  rimraf.sync(CLI_OUT_DIR);
};

const PACKAGES = ["tecack", "frontend", "backend", "dataset", "shared"];

/**
 * @type {() => PromiseLike<import('esbuild').BuildResult<{ entryPoints: string, outdir: string }>>[]}
 */
export const buildTecack = () =>
  PACKAGES.map(pkg => {
    /**
     * @type {import('esbuild').BuildOptions}
     */
    const res = esbuild.build({
      entryPoints: [path.resolve(`packages/${pkg}/src/index`)],
      bundle: true,
      outdir: `packages/${pkg}/dist`,
      format: "esm",
    });
    res.then(() => finishedBuild(`packages/${pkg}/dist`));
    return res;
  });

/**
 * @type {function(): void}
 */
export const clearTecackSync = () => {
  PACKAGES.map(pkg => `packages/${pkg}/dist`).forEach(dir => rimraf.sync(dir));
};

(async function main() {
  console.log("clear dist...");
  await Promise.allSettled([clearCliSync(), clearTecackSync()]);
  console.log(`${green("✔︎")} finished clearing dist`);
  console.log("building tecack...");
  const buildingTecack = buildTecack();
  const buildingCli = buildCli();
  await Promise.all([...buildingTecack, buildingCli]);
})();
