import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { PromocodeClient } from "../clients/promocode.client.ts";
import { CreatePromocodeDto } from "../../promocode-service/dto/create-promocode.dto.ts";
import { UpdatePromocodeDto } from "../../promocode-service/dto/update-promocode.dto.ts";
import { PromocodeResponseDto } from "../../promocode-service/dto/promocode-response.dto.ts";
import { ZodValidationPipe } from "../../../libs/validation/zod-validation.pipe.ts";
import {
  createPromocodeSchema,
  updatePromocodeSchema,
} from "../../promocode-service/promocode.schema.ts";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  ApiCreatePromocode,
  ApiFindAllPromocode,
  ApiFindOnePromocode,
  ApiRemovePromocode,
  ApiRestorePromocode,
  ApiUpdatePromocode,
} from "./promocodes.api-docs.ts";
import { ApiAdminOnly } from "../../../libs/swagger/api-responses.decorator.ts";
import { Can } from "../../../libs/auth/decorators/can.decorator.ts";
import { Permission } from "../../../libs/auth/permission.constant.ts";

@ApiTags("Promocodes")
@ApiBearerAuth()
@ApiAdminOnly()
@Controller("promocodes")
export class PromocodesController {
  constructor(private readonly promocodesService: PromocodeClient) {}

  @Post()
  @Can(Permission.PROMOCODE_WRITE)
  @ApiCreatePromocode()
  async create(
    @Body(new ZodValidationPipe(createPromocodeSchema)) dto: CreatePromocodeDto
  ): Promise<PromocodeResponseDto> {
    return this.promocodesService.create(dto);
  }

  @Get()
  @Can(Permission.PROMOCODE_READ)
  @ApiFindAllPromocode()
  async findAll(): Promise<PromocodeResponseDto[]> {
    return this.promocodesService.findAll();
  }

  @Get(":id")
  @Can(Permission.PROMOCODE_READ)
  @ApiFindOnePromocode()
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<PromocodeResponseDto> {
    return this.promocodesService.findById(id);
  }

  @Patch(":id")
  @Can(Permission.PROMOCODE_WRITE)
  @ApiUpdatePromocode()
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updatePromocodeSchema)) dto: UpdatePromocodeDto
  ): Promise<PromocodeResponseDto> {
    return this.promocodesService.update(id, dto);
  }

  @Delete(":id")
  @Can(Permission.PROMOCODE_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRemovePromocode()
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.promocodesService.remove(id);
  }

  @Patch(":id/restore")
  @Can(Permission.PROMOCODE_WRITE)
  @ApiRestorePromocode()
  async restore(@Param("id", ParseUUIDPipe) id: string): Promise<PromocodeResponseDto> {
    return this.promocodesService.restore(id);
  }
}
