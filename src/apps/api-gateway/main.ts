import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import express from "express";
import { existsSync, mkdirSync } from "fs";
import { GatewayModule } from "./gateway.module.ts";
import { RmqLoggerService } from "../../libs/logging/rmq-logger.service.ts";
import { UPLOADS_URL_PREFIX, UPLOADS_DIR } from "../../libs/upload/index.ts";

const API_PREFIX = "api";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(GatewayModule, { bufferLogs: true });

  app.useLogger(app.get(RmqLoggerService));
  app.setGlobalPrefix(API_PREFIX);
  app.use(cookieParser());
  app.enableCors();
  app.enableShutdownHooks();

  if (!existsSync(UPLOADS_DIR)) {
    mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  app.use(UPLOADS_URL_PREFIX, express.static(UPLOADS_DIR));

  const swaggerConfig = new DocumentBuilder()
    .setTitle("PizzaHot API")
    .setDescription("PizzaHot REST API documentation — served by the gateway")
    .setVersion("3.0.0")
    .addServer(`/${API_PREFIX}`)
    .addBearerAuth()
    .build();

  SwaggerModule.setup(
    "api-docs",
    app,
    SwaggerModule.createDocument(app, swaggerConfig, { ignoreGlobalPrefix: true })
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => console.error(err));
