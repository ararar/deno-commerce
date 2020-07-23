// deno_commerce cli tool for scaffold and updates to project
import { parse } from "https://deno.land/std@0.61.0/flags/mod.ts";

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

  const cloneCmd = Deno.run({
    cmd: ["git", "clone", cloneLocation, projectLocation],
  });

  const cloneCmdResult = await cloneCmd.status();

  if (cloneCmdResult.code) {
    // handle error
    console.error("clone not succeeded");
  }

  console.error("clone succeeded");

  cloneCmd.close();

  console.log("hello");

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
    ],
  });

  Deno.run({
    cmd: ["cp", `${projectLocation}/.env.example`, `${projectLocation}/.env`],
  });

  Deno.run({
    cmd: [
      "cp",
      `${projectLocation}/.gitignore.example`,
      `${projectLocation}/.gitignore`,
    ],
  });

  Deno.run({
    cmd: [
      "rm",
      `${projectLocation}/.env.example`,
      `${projectLocation}/.gitignore.example`,
    ],
  });

  const excludeResourceCmdResult = await excludeResourceCmd.status();

  if (excludeResourceCmdResult.code) {
    // handle error
    console.error("exclude not succeeded");
  }

  console.log("exclude succeeded");

  excludeResourceCmd.close();
}
