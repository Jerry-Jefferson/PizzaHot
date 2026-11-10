import { identityDataSource } from "./data-source.ts";

async function main(): Promise<void> {
  const revert = process.argv.includes("--revert");

  await identityDataSource.initialize();

  try {
    if (revert) {
      await identityDataSource.undoLastMigration();
      console.log("Reverted the last migration");
      return;
    }

    const applied = await identityDataSource.runMigrations();
    console.log(
      applied.length === 0
        ? "No pending migrations"
        : `Applied: ${applied.map((migration) => migration.name).join(", ")}`
    );
  } finally {
    await identityDataSource.destroy();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
