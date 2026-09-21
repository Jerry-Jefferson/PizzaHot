import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import type { Server } from "node:http";
import request from "supertest";
import { GatewayModule } from "./../src/apps/api-gateway/gateway.module.ts";

describe("AppController (e2e)", () => {
  let app: INestApplication<Server>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  it("/api (GET) reports that the API is running", () => {
    return request(app.getHttpServer())
      .get("/api")
      .expect(200)
      .expect("PizzaHot API is running. See /api-docs for the interactive documentation.");
  });

  afterEach(async () => {
    await app.close();
  });
});
