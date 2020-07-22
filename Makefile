# Development commands

start:
	deno run --unstable --allow-read --allow-net mod.ts

start-with-reload:
	deno run --reload --unstable --allow-read --allow-net mod.ts

fmt:
	deno fmt --check admin config core migrations plugins scripts seeds deps.ts mod.ts mod_test.ts

test:
	deno test --allow-read --allow-write
