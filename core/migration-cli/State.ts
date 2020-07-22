import { AbstractClient } from "./AbstractClient.ts";
import { ClientMySQL } from "./ClientMySQL.ts";
import { ClientI } from "./types.ts";
import { fs } from "../../deps.ts";

const nessieOptions = {
  migrationFolder: `${Deno.cwd()}/migrations`,
  seedFolder: `${Deno.cwd()}/seeds`,
};

const connectionOptions = {
  database: "deno_commerce",
  hostname: "localhost",
  port: 3306,
  user: "piyush",
  password: "diehard4",
};

/** The main state for the application.
 *
 * Contains the client, and handles the communication to the database.
 */
export class MigrationCli {
  client?: ClientI;

  /** Initializes the state with a client */
  async init() {
    console.log("Using standard config");

    this.client = new ClientMySQL(nessieOptions, connectionOptions);

    return this;
  }

  /** Makes the migration */
  async makeMigration(migrationName: string = "migration") {
    if (migrationName.length > AbstractClient.MAX_FILE_NAME_LENGTH - 13) {
      throw new Error(
        `Migration name can't be longer than ${AbstractClient
          .MAX_FILE_NAME_LENGTH - 13}`,
      );
    }

    const fileName = `${Date.now()}-${migrationName}.ts`;

    console.log(fileName, "Migration file name");

    await Deno.mkdir(this.client!.migrationFolder, { recursive: true });

    const responseFile = fs.readFileStrSync("./templates/migration.txt");

    await Deno.writeTextFile(
      `${this.client!.migrationFolder}/${fileName}`,
      responseFile,
    );

    console.info(
      `Created migration ${fileName} at ${this.client!.migrationFolder}`,
    );
  }

  /** Makes the seed */
  async makeSeed(seedName: string = "seed") {
    const fileName = `${seedName}.ts`;
    if (this.client?.seedFiles.find((el) => el.name === seedName)) {
      console.info(`Seed with name '${seedName}' already exists.`);
    }

    console.log(fileName, "Seed file name");

    await Deno.mkdir(this.client!.seedFolder, { recursive: true });

    const responseFile = fs.readFileStrSync("./templates/seed.txt");

    await Deno.writeTextFile(
      `${this.client!.seedFolder}/${fileName}`,
      responseFile,
    );

    console.info(`Created seed ${fileName} at ${this.client!.seedFolder}`);
  }
}
