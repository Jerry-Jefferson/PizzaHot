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
import { Roles } from "../../../libs/auth/decorators/roles.decorator.ts";
import { Role } from "../../../libs/common/constants/role.constant.ts";
import { ZodValidationPipe } from "../../../libs/common/pipes/zod-validation.pipe.ts";
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
import { ApiAdminOnly } from "../../../libs/common/swagger/api-responses.decorator.ts";

@ApiTags("Promocodes")
@ApiBearerAuth()
@Roles(Role.ADMIN)
@ApiAdminOnly()
@Controller("promocodes")
export class PromocodesController {
  constructor(private readonly promocodesService: PromocodeClient) {}

  @Post()
  @ApiCreatePromocode()
  async create(
    @Body(new ZodValidationPipe(createPromocodeSchema)) dto: CreatePromocodeDto
  ): Promise<PromocodeResponseDto> {
    return this.promocodesService.create(dto);
  }

  @Get()
  @ApiFindAllPromocode()
  async findAll(): Promise<PromocodeResponseDto[]> {
    return this.promocodesService.findAll();
  }

  @Get(":id")
  @ApiFindOnePromocode()
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<PromocodeResponseDto> {
    return this.promocodesService.findById(id);
  }

  @Patch(":id")
  @ApiUpdatePromocode()
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updatePromocodeSchema)) dto: UpdatePromocodeDto
  ): Promise<PromocodeResponseDto> {
    return this.promocodesService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRemovePromocode()
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.promocodesService.remove(id);
  }

  @Patch(":id/restore")
  @ApiRestorePromocode()
  async restore(@Param("id", ParseUUIDPipe) id: string): Promise<PromocodeResponseDto> {
    return this.promocodesService.restore(id);
  }
}
