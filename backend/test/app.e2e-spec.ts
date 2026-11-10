import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Server } from "node:http";
import request from "supertest";
import { GatewayModule } from "../src/apps/api-gateway/gateway.module.ts";
import { Role } from "../src/libs/auth/auth.constant.ts";

describe("api-gateway (e2e)", () => {
  let app: INestApplication<Server>;
  let jwt: JwtService;

  function tokenFor(role: Role): string {
    return jwt.sign({
      sub: "11111111-1111-4111-8111-111111111111",
      email: "e2e@example.com",
      role,
      isEmailVerified: true,
    });
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();

    jwt = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("public routes", () => {
    it("GET /api reports that the API is running", () => {
      return request(app.getHttpServer())
        .get("/api")
        .expect(200)
        .expect("PizzaHot API is running. See /api-docs for the interactive documentation.");
    });
  });

  describe("authentication", () => {
    it.each([
      ["/api/pizzas", "GET"],
      ["/api/carts", "GET"],
      ["/api/users", "GET"],
    ])("refuses %s %s without a token", (path) => {
      return request(app.getHttpServer()).get(path).expect(401);
    });

    it("refuses a token it did not sign", () => {
      return request(app.getHttpServer())
        .get("/api/pizzas")
        .set("Authorization", "Bearer not.a.real.token")
        .expect(401);
    });

    it("refuses a correctly signed token with claims of the wrong shape", () => {
      const malformed = jwt.sign({ sub: "not-a-uuid", email: "nope", role: "wizard" });

      return request(app.getHttpServer())
        .get("/api/pizzas")
        .set("Authorization", `Bearer ${malformed}`)
        .expect(401);
    });
  });

  describe("permissions", () => {
    it("lets a customer reach a route their role covers", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/pizzas")
        .set("Authorization", `Bearer ${tokenFor(Role.USER)}`);

      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    it.each(["/api/logs", "/api/users", "/api/promocodes"])("refuses a customer on %s", (path) => {
      return request(app.getHttpServer())
        .get(path)
        .set("Authorization", `Bearer ${tokenFor(Role.USER)}`)
        .expect(403);
    });

    it.each(["/api/logs", "/api/users", "/api/promocodes"])(
      "lets an admin past the guards on %s",
      async (path) => {
        const response = await request(app.getHttpServer())
          .get(path)
          .set("Authorization", `Bearer ${tokenFor(Role.ADMIN)}`);

        expect(response.status).not.toBe(401);
        expect(response.status).not.toBe(403);
      }
    );
  });

  describe("validation", () => {
    it("refuses a body the schema rejects before any service is asked", () => {
      return request(app.getHttpServer())
        .post("/api/pizzas")
        .set("Authorization", `Bearer ${tokenFor(Role.ADMIN)}`)
        .send({ name: "", description: "", price: -1 })
        .expect(400);
    });

    it("refuses a path parameter that is not a uuid", () => {
      return request(app.getHttpServer())
        .get("/api/pizzas/not-a-uuid")
        .set("Authorization", `Bearer ${tokenFor(Role.USER)}`)
        .expect(400);
    });
  });
});
