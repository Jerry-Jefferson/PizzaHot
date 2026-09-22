import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "../app.controller.ts";
import { AppService } from "../app.service.ts";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it("should report that the API is running and point at the docs", () => {
      expect(appController.getApiInfo()).toBe(
        "PizzaHot API is running. See /api-docs for the interactive documentation."
      );
    });
  });
});
