import { AbstractClient } from "./AbstractClient.ts";
import { ClientMySQL } from "./ClientMySQL.ts";
import { fs, flags } from "../../deps.ts";
import { dbConfig } from "../../config/site.ts";

const clientOptions = {
  migrationFolder: `${Deno.cwd()}/migrations`,
  seedFolder: `${Deno.cwd()}/seeds`,
};

/** Makes the migration */
async function makeMigration(client: ClientMySQL, migrationName: string = "migration") {
  if (migrationName.length > AbstractClient.MAX_FILE_NAME_LENGTH - 13) {
    throw new Error(
      `Migration name can't be longer than ${AbstractClient
        .MAX_FILE_NAME_LENGTH - 13}`,
    );
  }

  const fileName = `${Date.now()}-${migrationName}.ts`;

  console.log(fileName, "Migration file name");

  await Deno.mkdir(client!.migrationFolder, { recursive: true });

  const responseFile = fs.readFileStrSync(
    `${Deno.cwd()}/core/migration-cli/templates/migration.txt`,
  );

  await Deno.writeTextFile(
    `${client!.migrationFolder}/${fileName}`,
    responseFile,
  );

  console.info(`Created migration ${fileName} at ${client!.migrationFolder}`);
}

/** Makes the seed */
async function makeSeed(client: ClientMySQL, seedName: string = "seed") {
  const fileName = `${seedName}.ts`;

  if (client?.seedFiles.find((el) => el.name === seedName)) {
    console.info(`Seed with name '${seedName}' already exists.`);
  }

  console.log(fileName, "Seed file name");

  await Deno.mkdir(client!.seedFolder, { recursive: true });

  const responseFile = fs.readFileStrSync(
    `${Deno.cwd()}/core/migration-cli/templates/seed.txt`,
  );

  await Deno.writeTextFile(`${client!.seedFolder}/${fileName}`, responseFile);

  console.info(`Created seed ${fileName} at ${client!.seedFolder}`);
}

/**
  Available Flags

  -h, --help: display help message
  -c, --create: create a migration file with given name
  -cs, --create-seed: create a seed file with given name
  -m, --migrate: migrate by amount
  -r, --rollback: rollback by amount
  -s, --seed: seed with files in seeds folder
 */
if (import.meta.main) {
  const { parse } = flags;
  const { args } = Deno;
  const parsedArgs = parse(args);

  const client = new ClientMySQL(clientOptions, dbConfig);
  try {
    await client.prepare();

    if (parsedArgs.migrate || parsedArgs.m) {
      await client.migrate(1);
    } else if (parsedArgs.rollback || parsedArgs.r) {
      await client.rollback(1);
    } else if (parsedArgs.seed || parsedArgs.s) {
      await client.seed();
    } else if (parsedArgs.create || parsedArgs.c) {
      const migrationName = Deno.env.get("name");
      await makeMigration(client, migrationName);
    }else if (parsedArgs["create-seed"] || parsedArgs.cs) {
      const seedName = Deno.env.get("name");
      await makeSeed(client, seedName);
    }else if (parsedArgs.help || parsedArgs.h) {
      console.log(`
  Available Migration Options

  # display help message
  make migration.help

  # create a migration file
  make generate.migration name=<name>

  # create a seed file
  make generate.seed name=<name>

  # apply migrations
  make db.migrate

  # revert migrations
  make db.rollback

  # apply seed files
  make db.seed
      `);
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.close();
  }
}
