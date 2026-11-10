import { describe, it, expect } from "@jest/globals";
import { BadRequestException } from "@nestjs/common";
import { ImageValidationPipe } from "../image-validation.pipe.ts";
import { ALLOWED_EXTENSIONS } from "../upload.constant.ts";

function fileNamed(originalname: string): Express.Multer.File {
  return { originalname } as Express.Multer.File;
}

describe("ImageValidationPipe", () => {
  const pipe = new ImageValidationPipe();

  it("accepts every allowed extension", () => {
    for (const extension of ALLOWED_EXTENSIONS) {
      const file = fileNamed(`photo${extension}`);
      expect(pipe.transform(file)).toBe(file);
    }
  });

  it("accepts an extension written in capitals", () => {
    const file = fileNamed("PHOTO.PNG");
    expect(pipe.transform(file)).toBe(file);
  });

  it("refuses a missing file", () => {
    expect(() => pipe.transform(undefined)).toThrow(
      new BadRequestException("Image file is required")
    );
  });

  it("refuses a disallowed extension and says which", () => {
    expect(() => pipe.transform(fileNamed("script.exe"))).toThrow(/Invalid file extension '\.exe'/);
  });

  it("refuses a name with no extension", () => {
    expect(() => pipe.transform(fileNamed("photo"))).toThrow(BadRequestException);
  });

  it("refuses a name that disagrees with an image MIME type", () => {
    expect(() => pipe.transform(fileNamed("disguised.txt"))).toThrow(BadRequestException);
  });
});
