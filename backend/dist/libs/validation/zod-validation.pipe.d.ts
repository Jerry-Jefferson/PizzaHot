import { PipeTransform } from "@nestjs/common";
import { ZodType } from "zod";
export declare class ZodValidationPipe implements PipeTransform {
    private schema;
    constructor(schema: ZodType);
    transform(value: unknown): unknown;
}
