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
import { CreatePromocodeDto } from "../../promocode-service/promocodes/dto/create-promocode.dto.ts";
import { UpdatePromocodeDto } from "../../promocode-service/promocodes/dto/update-promocode.dto.ts";
import { PromocodeResponseDto } from "../../promocode-service/promocodes/dto/promocode-response.dto.ts";
import { Roles } from "../../../libs/auth/decorators/roles.decorator.ts";
import { Role } from "../../../libs/common/constants/role.enum.ts";
import { ZodValidationPipe } from "../../../libs/common/pipes/zod-validation.pipe.ts";
import {
  createPromocodeSchema,
  updatePromocodeSchema,
} from "../../promocode-service/promocodes/schemas/promocode.schema.ts";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("Promocodes")
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller("promocodes")
export class PromocodesController {
  constructor(private readonly promocodesService: PromocodeClient) {}

  @Post()
  @ApiOperation({ summary: "Create a new promocode (Admin only)" })
  @ApiBody({ type: CreatePromocodeDto })
  @ApiResponse({
    status: 201,
    description: "Promocode successfully created",
    type: PromocodeResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  @ApiResponse({ status: 409, description: "Promocode with this code already exists" })
  async create(
    @Body(new ZodValidationPipe(createPromocodeSchema)) dto: CreatePromocodeDto
  ): Promise<PromocodeResponseDto> {
    const promocode = await this.promocodesService.create(dto);
    return PromocodeResponseDto.fromEntity(promocode);
  }

  @Get()
  @ApiOperation({ summary: "Get all promocodes (Admin only)" })
  @ApiResponse({
    status: 200,
    description: "List of promocodes",
    type: [PromocodeResponseDto],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  async findAll(): Promise<PromocodeResponseDto[]> {
    const promocodes = await this.promocodesService.findAll();
    return promocodes.map((promocode) => PromocodeResponseDto.fromEntity(promocode));
  }

  @Get(":id")
  @ApiOperation({ summary: "Get promocode by ID (Admin only)" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiResponse({
    status: 200,
    description: "Promocode found",
    type: PromocodeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  @ApiResponse({ status: 404, description: "Promocode not found" })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<PromocodeResponseDto> {
    const promocode = await this.promocodesService.findById(id);
    return PromocodeResponseDto.fromEntity(promocode);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a promocode by ID (Admin only)" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiBody({ type: UpdatePromocodeDto })
  @ApiResponse({
    status: 200,
    description: "Promocode successfully updated",
    type: PromocodeResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  @ApiResponse({ status: 404, description: "Promocode not found" })
  @ApiResponse({ status: 409, description: "Promocode with this code already exists" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updatePromocodeSchema)) dto: UpdatePromocodeDto
  ): Promise<PromocodeResponseDto> {
    const promocode = await this.promocodesService.update(id, dto);
    return PromocodeResponseDto.fromEntity(promocode);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Soft delete a promocode by ID (Admin only)" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiResponse({ status: 204, description: "Promocode successfully deleted (soft delete)" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  @ApiResponse({ status: 404, description: "Promocode not found" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.promocodesService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted promocode by ID (Admin only)" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiResponse({
    status: 200,
    description: "Promocode successfully restored",
    type: PromocodeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  @ApiResponse({ status: 404, description: "Promocode not found" })
  async restore(@Param("id", ParseUUIDPipe) id: string): Promise<PromocodeResponseDto> {
    const promocode = await this.promocodesService.restore(id);
    return PromocodeResponseDto.fromEntity(promocode);
  }
}
