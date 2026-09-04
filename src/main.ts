import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import express from "express";
import { AppModule } from "./app.module.ts";
import { UPLOADS_URL_PREFIX, UPLOADS_DIR } from "./shared/constants/upload.constants.ts";
import { existsSync, mkdirSync } from "fs";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.use(cookieParser());
  app.enableCors();

  if (!existsSync(UPLOADS_DIR)) {
    mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  app.use(UPLOADS_URL_PREFIX, express.static(UPLOADS_DIR));

  const swaggerConfig = new DocumentBuilder()
    .setTitle("PizzaHot API")
    .setDescription("PizzaHot REST API documentation")
    .setVersion("0.0.1")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api-docs", app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
