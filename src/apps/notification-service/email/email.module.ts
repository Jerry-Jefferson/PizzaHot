import { Module } from "@nestjs/common";
import { EmailService } from "./email.service.ts";
import { EmailChannel } from "./email.channel.ts";

@Module({
  providers: [EmailService, EmailChannel],
  exports: [EmailService, EmailChannel],
})
export class EmailModule {}
