/**
 * deno_commerce cli have following functions:
 *  1. create a new project
 *  2. update an existing project
 */
import { parse } from "https://deno.land/std@0.61.0/flags/mod.ts";
import { sh } from "https://deno.land/x/drake@v1.2.5/lib.ts";

// TODO: Cli will need a lot of refactoring!!!

/**
 * Args
 * --from=$HOME/.../<deno-commerce> | <deno-commerce-git-url>
 * --to=$HOME/.../<project-name>
 */
if (import.meta.main) {
  const { args } = Deno;

  const parsedArgs = parse(args);

  const cloneLocation =
    parsedArgs.from || "https://github.com/oozou/deno-commerce.git";
  const projectLocation = parsedArgs.to;

  // clone project
  const cloneCmd = Deno.run({
    cmd: [
      "git",
      "clone",
      "--single-branch",
      "--branch",
      "feature/deno-commerce-cli",
      cloneLocation,
      projectLocation,
    ],
  });
  const cloneCmdResult = await cloneCmd.status();
  if (cloneCmdResult.code) {
    console.error("clone not succeeded");
  }
  console.error("clone succeeded");
  cloneCmd.close();

  // Exclude development files and folders
  await sh(`
    rm -rf \
      ${projectLocation}/.git \
      ${projectLocation}/.github \
      ${projectLocation}/.vscode \
      ${projectLocation}/.gitignore \
      ${projectLocation}/bin \
      ${projectLocation}/LICENSE \
      ${projectLocation}/README.md
  `);

  // copy env and git with init
  await sh([
    `git init ${projectLocation}`,
    `cp ${projectLocation}/.env.example ${projectLocation}/.env`,
    `cp ${projectLocation}/.gitignore.example ${projectLocation}/.gitignore`,
    `echo "# Project" > ${projectLocation}/README.md`,
  ]);

  // remove example configs
  const removeExampleConfigs = Deno.run({
    cmd: [
      "rm",
      `${projectLocation}/.env.example`,
      `${projectLocation}/.gitignore.example`,
    ],
  });
  await removeExampleConfigs.status();
  removeExampleConfigs.close();
}
