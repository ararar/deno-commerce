/**
 * deno_commerce cli have following functions:
 *  1. create a new project
 *  2. update an existing project
 */
import { parse } from "https://deno.land/std@0.61.0/flags/mod.ts";
import { sh } from "https://deno.land/x/drake@v1.2.5/lib.ts";

// TODO: Cli will need a lot of refactoring!!!

if (import.meta.main) {
  const { args } = Deno;

  const parsedArgs = parse(args);
  const commandName = parsedArgs._[0];

  if (commandName === "create") {
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
      throw new Error("clone not succeeded");
    }
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
        `${projectLocation}/.gitignore.example`,
      ],
    });
    await removeExampleConfigs.status();
    removeExampleConfigs.close();
  } else if (commandName === "update") {
    // TODO:
    throw new Error("Not implemented!!!")
  } else {
    console.log(`
  Deno Commerce Cli

  Examples
    $HOME/.deno/bin/deno_commerce create --from=https://github.com/oozou/deno-commerce.git --to=$HOME/Documents/project1
    $HOME/.deno/bin/deno_commerce update --location=$HOME/Documents/project1

  Args
    (create|update)

  create
    --from=$HOME/.../<deno-commerce> | <deno-commerce-git-url>
    --to=$HOME/.../<project-name>
  update
    --location=$HOME/.../<project-name>
    `);
  }
}
