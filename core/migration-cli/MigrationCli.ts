import { AbstractClient } from "./AbstractClient.ts";
import { ClientMySQL } from "./ClientMySQL.ts";
import { fs } from "../../deps.ts";
import { dbConfig } from "../../config/site.ts";

const clientOptions = {
  migrationFolder: `${Deno.cwd()}/migrations`,
  seedFolder: `${Deno.cwd()}/seeds`,
};

/** Makes the migration */
async function makeMigration(migrationName: string = "migration") {
  const client = new ClientMySQL(clientOptions, dbConfig);

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
async function makeSeed(seedName: string = "seed") {
  const client = new ClientMySQL(clientOptions, dbConfig);

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

if (import.meta.main) {
  // TODO: Cli should receive options and do the following
  /**
   * 1. makeMigration
   * 2. makeSeed
   * 3. migrate up and down
   * 4. rollback
   * 5. seed
   */

  const client = new ClientMySQL(clientOptions, dbConfig);
  try {
    await client.prepare();
    // const result = await client.migrate(1);
    // const result = await client.rollback(1);
    const result = await client.seed();
    console.log(result);
  } catch (err) {
    console.error(err);
  } finally {
    client.close();
  }
}
