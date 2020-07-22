import { resolve } from "https://deno.land/std@0.61.0/path/mod.ts";
import {
  QueryWithString,
  ClientOptions,
  AmountMigrateT,
  QueryHandler,
  MigrationFile,
  AmountRollbackT,
  Info,
} from "./types.ts";

/** Helper function for path parsing.
 *
 * If the first element starts with `http` or `https` it will return the first element.
 * Else, the path will be prefixed by `file://` and resolved.
 */
export const parsePath = (...path: string[]): string => {
  if (
    path.length === 1 &&
    (path[0]?.startsWith("http://") || path[0]?.startsWith("https://"))
  ) {
    return path[0];
  }
  return "file://" + resolve(...path);
};

/** The abstract client which handles most of the logic related to database communication. */
export class AbstractClient {
  static readonly MAX_FILE_NAME_LENGTH = 100;

  protected readonly TABLE_MIGRATIONS = "auth_migrations";
  protected readonly COL_FILE_NAME = "file_name";
  protected readonly COL_CREATED_AT = "created_at";
  protected readonly REGEX_MIGRATION_FILE_NAME = /^\d{10,14}-.+.ts$/;
  protected readonly regexFileName = new RegExp(this.REGEX_MIGRATION_FILE_NAME);

  migrationFiles: Deno.DirEntry[];
  seedFiles: Deno.DirEntry[];
  migrationFolder: string;
  seedFolder: string;

  protected readonly QUERY_GET_LATEST =
    `SELECT ${this.COL_FILE_NAME} FROM ${this.TABLE_MIGRATIONS} ORDER BY ${this.COL_FILE_NAME} DESC LIMIT 1;`;
  protected readonly QUERY_GET_ALL =
    `SELECT ${this.COL_FILE_NAME} FROM ${this.TABLE_MIGRATIONS} ORDER BY ${this.COL_FILE_NAME} DESC;`;

  protected QUERY_MIGRATION_INSERT: QueryWithString = (fileName) =>
    `INSERT INTO ${this.TABLE_MIGRATIONS} (${this.COL_FILE_NAME}) VALUES ('${fileName}');`;
  protected QUERY_MIGRATION_DELETE: QueryWithString = (fileName) =>
    `DELETE FROM ${this.TABLE_MIGRATIONS} WHERE ${this.COL_FILE_NAME} = '${fileName}';`;

  constructor(options: ClientOptions) {
    this.migrationFolder = resolve(options.migrationFolder);
    this.seedFolder = resolve(options.seedFolder);

    try {
      this.migrationFiles = Array.from(Deno.readDirSync(this.migrationFolder));
    } catch {
      console.log(`Migration folder not found at '${this.migrationFolder}'`);
      this.migrationFiles = [];
    }

    try {
      this.seedFiles = Array.from(Deno.readDirSync(this.seedFolder));
    } catch {
      console.log(`Seed folder not found at '${this.seedFolder}'`);
      this.seedFiles = [];
    }
  }

  /** Runs the `up` method on all available migrations after filtering and sorting. */
  protected async migrate(
    amount: AmountMigrateT,
    latestMigration: string | undefined,
    queryHandler: QueryHandler,
  ) {
    console.log(amount, "Amount pre");

    this._filterAndSortFiles(latestMigration);
    amount = typeof amount === "number" ? amount : this.migrationFiles.length;

    console.log(latestMigration, "Latest migrations");

    if (this.migrationFiles.length > 0) {
      console.log(
        this.migrationFiles.map((el) => el.name),
        "Filtered and sorted migration files",
      );

      amount = Math.min(this.migrationFiles.length, amount);

      for (let i = 0; i < amount; i++) {
        const file = this.migrationFiles[i];

        await this._migrationHandler(file.name, queryHandler);

        console.info(`Migrated ${file.name}`);
      }
      console.info("Migration complete");
    } else {
      console.info("Nothing to migrate");
    }
  }

  /** Runs the `down` method on defined number of migrations after retrieving them from the DB. */
  async rollback(
    amount: AmountRollbackT,
    allMigrations: string[] | undefined,
    queryHandler: QueryHandler,
  ) {
    console.log(amount, "Amount pre");

    amount = typeof amount === "number"
      ? amount
      : amount === "all"
      ? allMigrations?.length ? allMigrations.length : 0
      : 1;

    console.log(amount, "Received amount to rollback");
    console.log(allMigrations, "Files to rollback");

    if (allMigrations && allMigrations.length > 0) {
      amount = Math.min(allMigrations.length, amount);

      for (let i = 0; i < amount; i++) {
        const fileName = allMigrations[i];

        await this._migrationHandler(fileName, queryHandler, true);

        console.info(`Rolled back ${fileName}`);
      }
    } else {
      console.info("Nothing to rollback");
    }
  }

  /** Runs the `run` method on seed files. Filters on the matcher. */
  async seed(matcher: string = ".+.ts", queryHandler: QueryHandler) {
    const files = this.seedFiles.filter(
      (el) =>
        el.isFile && (el.name === matcher || new RegExp(matcher).test(el.name)),
    );

    if (!files) {
      console.info(
        `No seed file found at '${this.seedFolder}' with matcher '${matcher}'`,
      );
      return;
    } else {
      for await (const file of files) {
        const filePath = parsePath(this.seedFolder, file.name);

        const { run } = await import(filePath);
        const sql = await run();

        await queryHandler(sql);
      }

      console.info("Seeding complete");
    }
  }

  /** Splits and trims queries. */
  protected splitAndTrimQueries(query: string) {
    return query.split(";").filter((el) => el.trim() !== "");
  }

  /** Filters and sort files in ascending order. */
  private _filterAndSortFiles(queryResult: string | undefined): void {
    this.migrationFiles = this.migrationFiles
      .filter((file: Deno.DirEntry): boolean => {
        if (!this.regexFileName.test(file.name)) return false;
        if (queryResult === undefined) return true;
        return file.name > queryResult;
      })
      .sort((a, b) => parseInt(a?.name ?? "0") - parseInt(b?.name ?? "0"));
  }

  /** Handles migration files. */
  private async _migrationHandler(
    fileName: string,
    queryHandler: QueryHandler,
    isDown: boolean = false,
  ) {
    let { up, down }: MigrationFile = await import(
      parsePath(this.migrationFolder, fileName)
    );

    const exposedObject: Info<any> = {
      connection: queryHandler,
      queryBuilder: undefined,
    };

    let query: string | string[];

    if (isDown) {
      query = await down(exposedObject);
    } else {
      query = await up(exposedObject);
    }

    if (!query) query = [];
    else if (typeof query === "string") query = [query];

    if (isDown) {
      query.push(this.QUERY_MIGRATION_DELETE(fileName));
    } else {
      query.push(this.QUERY_MIGRATION_INSERT(fileName));
    }

    await queryHandler(query);
  }
}
