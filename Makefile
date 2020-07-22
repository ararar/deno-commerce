# Development commands

start:
	deno run --unstable --allow-read --allow-net mod.ts

start.reload:
	deno run --reload --unstable --allow-read --allow-net mod.ts

fmt:
	deno fmt admin config core migrations plugins scripts seeds deps.ts mod.ts mod_test.ts

fmt.check:
	deno fmt --check admin config core migrations plugins scripts seeds deps.ts mod.ts mod_test.ts

test:
	deno test --allow-read --allow-write

generate.migration:
	deno run --unstable --allow-read --allow-write --allow-net --allow-env core/migration-cli/MigrationCli.ts --create

generate.seed:
	deno run --unstable --allow-read --allow-write --allow-net --allow-env core/migration-cli/MigrationCli.ts --create-seed

db.migrate:
	deno run --unstable --allow-read --allow-write --allow-net core/migration-cli/MigrationCli.ts --migrate

db.rollback:
	deno run --unstable --allow-read --allow-write --allow-net core/migration-cli/MigrationCli.ts --rollback

db.seed:
	deno run --unstable --allow-read --allow-write --allow-net core/migration-cli/MigrationCli.ts --seed

migration.help:
	deno run --unstable --allow-read --allow-write --allow-net core/migration-cli/MigrationCli.ts --help
