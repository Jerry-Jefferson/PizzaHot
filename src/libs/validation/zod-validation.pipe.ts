import { BadRequestException, PipeTransform } from "@nestjs/common";
import { z, ZodType } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown): unknown {
    const parsedValue = this.schema.safeParse(value);
    if (parsedValue.success) {
      return parsedValue.data;
    }

    throw new BadRequestException(z.flattenError(parsedValue.error));
  }
}
