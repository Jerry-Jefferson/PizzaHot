import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { GatewayModule } from "./../src/apps/api-gateway/gateway.module.ts";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/api (GET)", () => {
    return request(app.getHttpServer()).get("/api").expect(200).expect("Hello World!");
  });

  afterEach(async () => {
    await app.close();
  });
});
