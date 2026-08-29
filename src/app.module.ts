import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller.ts";
import { AppService } from "./app.service.ts";
import { UsersModule } from "./users/users.module.ts";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("POSTGRES_HOST"),
        port: configService.get<number>("POSTGRES_PORT"),
        username: configService.get<string>("POSTGRES_USER"),
        password: configService.get<string>("POSTGRES_PASSWORD"),
        database: configService.get<string>("POSTGRES_DB"),
        autoLoadEntities: true,
        synchronize: configService.get<string>("NODE_ENV") !== "production",
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const user = configService.get<string>("MONGO_INITDB_ROOT_USERNAME");
        const password = configService.get<string>("MONGO_INITDB_ROOT_PASSWORD");
        const host = configService.get<string>("MONGO_HOST");
        const port = configService.get<number>("MONGO_PORT");
        const db = configService.get<string>("MONGO_INITDB_DATABASE");

        return {
          uri: `mongodb://${user}:${password}@${host}:${port}/${db}?authSource=admin`,
        };
      },
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
