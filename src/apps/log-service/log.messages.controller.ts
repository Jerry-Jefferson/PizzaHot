import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { EVENTS, RPC } from "../../libs/contracts/patterns.ts";
import type { LogWrittenEvent } from "../../libs/contracts/events.ts";
import { LogsService } from "./logs/logs.service.ts";
import type { ListLogsQuery } from "./logs/schemas/log-query.schema.ts";
import type { LogLevel } from "../../libs/logging/log-level.enum.ts";
import { ack } from "../../libs/messaging/ack.ts";

@Controller()
export class LogMessagesController {
  private readonly logger = new Logger(LogMessagesController.name);

  constructor(private readonly logsService: LogsService) {}

  @EventPattern(EVENTS.logWritten)
  async onLogWritten(@Payload() event: LogWrittenEvent, @Ctx() context: RmqContext): Promise<void> {
    await ack(context, this.logger, EVENTS.logWritten, async () => {
      await this.logsService.create({
        level: event.level as LogLevel,
        message: event.message,
        context: event.context,
        trace: event.trace,
        metadata: { ...(event.metadata ?? {}), service: event.service },
        timestamp: event.timestamp ? new Date(event.timestamp) : undefined,
      });
    });
  }

  @MessagePattern(RPC.log.query)
  findAll(@Payload() query: ListLogsQuery): Promise<unknown> {
    return this.logsService.findAll(query);
  }
}
