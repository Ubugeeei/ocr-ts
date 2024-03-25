import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

import * as esbuild from "esbuild";
import { rimraf } from "rimraf";
import { bundle } from "dts-bundle";

const blue = (str: string) => `\x1b[34m${str}\x1b[0m`;
const green = (str: string) => `\x1b[32m${str}\x1b[0m`;
const finishedBuild = (dir: string) => console.log(`${green("✔︎")} build: ${blue(dir)}`);

const CLI_OUT_DIR = `packages/tools/bin`;

export const buildCli = async () => {
  await esbuild.build({
    entryPoints: [path.resolve("packages/tools/src/bin")],
    bundle: true,
    outdir: CLI_OUT_DIR,
    target: "node18",
    platform: "node",
  });
  // write shebang
  const shebang = "#!/usr/bin/env node";
  fs.writeFileSync(
    path.resolve(`${CLI_OUT_DIR}/bin.js`),
    `${shebang}\n${fs.readFileSync(path.resolve(`${CLI_OUT_DIR}/bin.js`))}`,
  );
  finishedBuild(CLI_OUT_DIR);

  // copy jTegaki.zip
  fs.copyFileSync(
    path.resolve("packages/tools/src/cmd/jTegaki/jTegaki.zip"),
    path.resolve(`${CLI_OUT_DIR}/jTegaki.zip`),
  );
  finishedBuild(`${CLI_OUT_DIR}/jTegaki.zip)`);
};

export const clearCliSync = () => {
  rimraf.sync(CLI_OUT_DIR);
};

const PACKAGES = ["tecack", "frontend", "backend", "dataset", "shared"];

export const buildTecack = async () => {
  execSync("tsc -p tsconfig.build.json");
  const ps = await Promise.all(
    PACKAGES.map(pkg =>
      esbuild
        .build({
          entryPoints: [path.resolve(`packages/${pkg}/src/index`)],
          bundle: true,
          target: "es2018",
          outdir: `packages/${pkg}/dist`,
          format: "esm",
          sourcemap: true,
        })
        .then(ps => {
          execSync(`cp -r temp/packages/${pkg}/src/* packages/${pkg}/dist/`);
          execSync(`cp -r packages/${pkg}/src/* packages/${pkg}/dist/`);
          finishedBuild(`packages/${pkg}/dist`);
          return ps;
        }),
    ),
  );
  execSync(`rm -rf temp`);
  return ps;
};

export const clearTecackSync = () => {
  PACKAGES.map(pkg => `packages/${pkg}/dist`).forEach(dir => rimraf.sync(dir));
};

await (async function main() {
  console.log("clear dist...");
  await Promise.allSettled([clearCliSync(), clearTecackSync()]);
  console.log(`${green("✔︎")} finished clearing dist`);
  console.log("building tecack...");
  const buildingTecack = buildTecack();
  const buildingCli = buildCli();
  await Promise.all([...(await buildingTecack), buildingCli]);
})();
