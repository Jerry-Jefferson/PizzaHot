import { DataSource } from "typeorm";
import { User } from "./users/user.entity.js";
import { SeedAdminUser1790000000000 } from "./migrations/1790000000000-SeedAdminUser.js";
export const identityDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: "identity_db",
    entities: [User],
    migrations: [SeedAdminUser1790000000000],
    migrationsTableName: "migrations",
});
//# sourceMappingURL=data-source.js.map