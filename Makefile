# Development commands

start:
	deno run --unstable --allow-read --allow-net --allow-write mod.ts

start.reload:
	deno run --reload --unstable --allow-read --allow-net --allow-write mod.ts

fmt:
	deno fmt admin config core migrations plugins scripts seeds deps.ts mod.ts mod_test.ts

fmt.check:
	deno fmt --check admin config core migrations plugins scripts seeds deps.ts mod.ts mod_test.ts

test:
	deno test --allow-read --allow-write

generate.migration:
	deno run --unstable --allow-read --allow-write --allow-net --allow-env core/migration-cli/mod.ts --create

generate.seed:
	deno run --unstable --allow-read --allow-write --allow-net --allow-env core/migration-cli/mod.ts --create-seed

db.migrate:
	deno run --unstable --allow-read --allow-write --allow-net core/migration-cli/mod.ts --migrate

db.rollback:
	deno run --unstable --allow-read --allow-write --allow-net core/migration-cli/mod.ts --rollback

db.seed:
	deno run --unstable --allow-read --allow-write --allow-net core/migration-cli/mod.ts --seed

migration.help:
	deno run --unstable --allow-read --allow-write --allow-net core/migration-cli/mod.ts --help

install:
	deno install --allow-env --allow-net --allow-read --allow-write --allow-run -f -n deno_commerce bin/deno_commerce.ts
