import { describe, it, expect, jest } from "@jest/globals";
import { imageMulterOptions } from "../image-multer.config.ts";
import { ImageCategory, MAX_FILE_SIZE } from "../index.ts";

/** diskStorage's own type hides getFilename, which is the part worth testing. */
interface NamingStorage {
  getFilename(
    req: unknown,
    file: { originalname: string },
    cb: (error: Error | null, filename: string) => void
  ): void;
}

describe("imageMulterOptions", () => {
  const options = imageMulterOptions(ImageCategory.PIZZAS);
  const storage = options.storage as unknown as NamingStorage;

  it("limits the file size", () => {
    expect(options.limits.fileSize).toBe(MAX_FILE_SIZE);
  });

  it.each([
    ["image/jpeg", true],
    ["image/png", true],
    ["image/webp", true],
    ["text/plain", false],
    ["application/pdf", false],
    ["image/svg+xml", false],
  ])("accepts %s: %s", (mimetype, accepted) => {
    const cb = jest.fn<(error: Error | null, accept: boolean) => void>();

    options.fileFilter({}, { mimetype } as Express.Multer.File, cb);

    expect(cb).toHaveBeenCalledWith(accepted ? null : expect.anything(), accepted);
  });

  // The original name never reaches the filesystem: a generated uuid keeps two uploads from
  // colliding and keeps a hostile filename out of the path.
  it("renames the file to a uuid and keeps only the extension", () => {
    const cb = jest.fn<(error: Error | null, filename: string) => void>();

    storage.getFilename({}, { originalname: "My Holiday Photo.PNG" }, cb);

    expect(cb.mock.calls[0][1]).toMatch(/^[0-9a-f-]{36}\.png$/);
  });
});
