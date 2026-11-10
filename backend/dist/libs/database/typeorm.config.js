export function typeOrmConfig(database, entities) {
    return {
        type: "postgres",
        host: process.env.POSTGRES_HOST ?? "localhost",
        port: Number(process.env.POSTGRES_PORT ?? 5432),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database,
        entities: entities,
        synchronize: process.env.NODE_ENV !== "production",
        retryAttempts: 10,
        retryDelay: 3000,
    };
}
//# sourceMappingURL=typeorm.config.js.map