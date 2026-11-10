import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getApiInfo(): string {
    return "PizzaHot API is running. See /api-docs for the interactive documentation.";
  }
}
