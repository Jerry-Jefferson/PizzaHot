import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { EVENTS, RPC } from "../../libs/contracts/patterns.ts";
import type { OrderCreatedEvent, OrderFailedEvent } from "../../libs/contracts/events.ts";
import { ack } from "../../libs/messaging/ack.ts";
import { PromocodesService } from "./promocodes/promocodes.service.ts";
import { RedemptionsService } from "./redemptions/redemptions.service.ts";
import type { CreatePromocodeDto } from "./promocodes/dto/create-promocode.dto.ts";
import type { UpdatePromocodeDto } from "./promocodes/dto/update-promocode.dto.ts";
import type { Promocode } from "./promocodes/entities/promocode.entity.ts";

@Controller()
export class PromocodeMessagesController {
  private readonly logger = new Logger(PromocodeMessagesController.name);

  constructor(
    private readonly promocodes: PromocodesService,
    private readonly redemptions: RedemptionsService
  ) {}

  @MessagePattern(RPC.promocode.list)
  list(): Promise<Promocode[]> {
    return this.promocodes.findAll();
  }

  @MessagePattern(RPC.promocode.findById)
  findById(@Payload() payload: { id: string }): Promise<Promocode> {
    return this.promocodes.findById(payload.id);
  }

  @MessagePattern(RPC.promocode.findByCode)
  findByCode(@Payload() payload: { code: string }): Promise<Promocode | null> {
    return this.promocodes.findByCode(payload.code);
  }

  @MessagePattern(RPC.promocode.create)
  create(@Payload() payload: CreatePromocodeDto): Promise<Promocode> {
    return this.promocodes.create(payload);
  }

  @MessagePattern(RPC.promocode.update)
  update(@Payload() payload: { id: string; dto: UpdatePromocodeDto }): Promise<Promocode> {
    return this.promocodes.update(payload.id, payload.dto);
  }

  @MessagePattern(RPC.promocode.remove)
  async remove(@Payload() payload: { id: string }): Promise<{ ok: true }> {
    await this.promocodes.remove(payload.id);
    return { ok: true };
  }

  @MessagePattern(RPC.promocode.restore)
  restore(@Payload() payload: { id: string }): Promise<Promocode> {
    return this.promocodes.restore(payload.id);
  }

  @MessagePattern(RPC.promocode.checkAvailable)
  async checkAvailable(@Payload() payload: { userId: string; code: string }): Promise<Promocode> {
    const promocode = await this.promocodes.findByCodeOrFail(payload.code);
    this.promocodes.assertNotExpired(promocode);
    await this.redemptions.assertAvailableFor(payload.userId, promocode.id);
    return promocode;
  }

  @MessagePattern(RPC.promocode.reserve)
  async reserve(
    @Payload() payload: { userId: string; promocodeId: string }
  ): Promise<{ promocode: Promocode }> {
    const promocode = await this.promocodes.findById(payload.promocodeId);
    this.promocodes.assertNotExpired(promocode);
    await this.redemptions.reserve(payload.userId, payload.promocodeId);
    return { promocode };
  }

  @EventPattern(EVENTS.orderCreated)
  async onOrderCreated(
    @Payload() event: OrderCreatedEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.orderCreated, async () => {
      if (event.promocodeId) {
        await this.redemptions.confirm(event.userId, event.promocodeId, event.orderId);
      }
    });
  }

  @EventPattern(EVENTS.orderFailed)
  async onOrderFailed(
    @Payload() event: OrderFailedEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.orderFailed, async () => {
      if (event.promocodeId) {
        await this.redemptions.release(event.userId, event.promocodeId);
        this.logger.warn(`Released promocode ${event.promocodeId} after failed order`);
      }
    });
  }
}
