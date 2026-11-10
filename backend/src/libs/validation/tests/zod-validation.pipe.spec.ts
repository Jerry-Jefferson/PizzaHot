import { describe, it, expect } from "@jest/globals";
import { BadRequestException } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../zod-validation.pipe.ts";

const schema = z.object({
  name: z.string({ error: "Name must be a string" }).min(1, { message: "Name cannot be empty" }),
  age: z.coerce.number().int().min(0).default(0),
});

describe("ZodValidationPipe", () => {
  const pipe = new ZodValidationPipe(schema);

  it("returns the parsed value, not the input", () => {
    expect(pipe.transform({ name: "Anna", age: "31" })).toEqual({ name: "Anna", age: 31 });
  });

  it("fills in defaults for absent fields", () => {
    expect(pipe.transform({ name: "Anna" })).toEqual({ name: "Anna", age: 0 });
  });

  it("drops keys the schema does not declare", () => {
    expect(pipe.transform({ name: "Anna", role: "admin" })).toEqual({ name: "Anna", age: 0 });
  });

  it("throws BadRequest naming the failing field", () => {
    expect.assertions(2);

    try {
      pipe.transform({ name: "" });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse();
      expect(response).toMatchObject({ fieldErrors: { name: ["Name cannot be empty"] } });
    }
  });

  it("throws when the value is not an object at all", () => {
    expect(() => pipe.transform(undefined)).toThrow(BadRequestException);
    expect(() => pipe.transform("a string")).toThrow(BadRequestException);
  });
});
