import type { TypeOrmModuleOptions } from "@nestjs/typeorm";

export function typeOrmConfig(database: string, entities: unknown[]): TypeOrmModuleOptions {
  return {
    type: "postgres",
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database,
    entities: entities as TypeOrmModuleOptions["entities"],
    synchronize: process.env.NODE_ENV !== "production",
    retryAttempts: 10,
    retryDelay: 3000,
  };
}
