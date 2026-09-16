import { Controller, Get } from "@nestjs/common";
import { Public } from "../../../libs/auth/decorators/public.decorator.ts";
import { AppService } from "../app.service.ts";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
