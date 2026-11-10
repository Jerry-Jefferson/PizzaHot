import { BadRequestException } from "@nestjs/common";
import { z } from "zod";
export class ZodValidationPipe {
    schema;
    constructor(schema) {
        this.schema = schema;
    }
    transform(value) {
        const parsedValue = this.schema.safeParse(value);
        if (parsedValue.success) {
            return parsedValue.data;
        }
        throw new BadRequestException(z.flattenError(parsedValue.error));
    }
}
//# sourceMappingURL=zod-validation.pipe.js.map