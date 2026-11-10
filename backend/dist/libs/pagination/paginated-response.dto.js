var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from "@nestjs/swagger";
export class PaginatedResponseDto {
    data;
    page;
    limit;
    total;
    totalPages;
    constructor(data, page, limit, total) {
        this.data = data;
        this.page = page;
        this.limit = limit;
        this.total = total;
        this.totalPages = Math.ceil(total / limit);
    }
}
__decorate([
    ApiProperty(),
    __metadata("design:type", Array)
], PaginatedResponseDto.prototype, "data", void 0);
__decorate([
    ApiProperty({ example: 1 }),
    __metadata("design:type", Number)
], PaginatedResponseDto.prototype, "page", void 0);
__decorate([
    ApiProperty({ example: 10 }),
    __metadata("design:type", Number)
], PaginatedResponseDto.prototype, "limit", void 0);
__decorate([
    ApiProperty({ example: 42 }),
    __metadata("design:type", Number)
], PaginatedResponseDto.prototype, "total", void 0);
__decorate([
    ApiProperty({ example: 5 }),
    __metadata("design:type", Number)
], PaginatedResponseDto.prototype, "totalPages", void 0);
//# sourceMappingURL=paginated-response.dto.js.map