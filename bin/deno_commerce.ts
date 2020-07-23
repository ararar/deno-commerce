// deno_commerce cli tool for scaffold and updates to project
import { parse } from "https://deno.land/std@0.61.0/flags/mod.ts";

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
      // "--single-branch",
      // "--branch",
      // "feature/deno-commerce-cli",
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

  // Exclude cmd
  const excludeResourceCmd = Deno.run({
    cmd: [
      "rm",
      "-rf",
      `${projectLocation}/.git`,
      `${projectLocation}/.github`,
      `${projectLocation}/.vscode`,
      `${projectLocation}/.gitignore`,
      `${projectLocation}/bin`,
      `${projectLocation}/LICENSE`,
      `${projectLocation}/README.md`,
    ],
  });
  await excludeResourceCmd.status();
  excludeResourceCmd.close();

  // copy env and git with init
  const gitInit = Deno.run({
    cmd: ["git", "init", `${projectLocation}`],
  });
  const copyEnv = Deno.run({
    cmd: ["cp", `${projectLocation}/.env.example`, `${projectLocation}/.env`],
  });
  const copyGitIgnore = Deno.run({
    cmd: [
      "cp",
      `${projectLocation}/.gitignore.example`,
      `${projectLocation}/.gitignore`,
    ],
  });
  const touchReadme = Deno.run({
    cmd: ["echo", '"# Project"', ">", "README.md"],
  });

  const result = await Promise.all([
    gitInit.status(),
    copyEnv.status(),
    copyGitIgnore.status(),
    touchReadme.status(),
  ]);

  gitInit.close();
  copyEnv.close();
  copyGitIgnore.close();
  touchReadme.close();

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
