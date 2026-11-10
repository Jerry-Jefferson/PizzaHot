import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { mkdir, writeFile, rm, access } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { LocalImageStorage } from "../image-storage.service.ts";
import { ImageCategory, UPLOADS_DIR, UPLOADS_URL_PREFIX } from "../upload.constant.ts";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

describe("LocalImageStorage", () => {
  let storage: LocalImageStorage;

  beforeEach(() => {
    storage = new LocalImageStorage();
  });

  describe("urlPathFor", () => {
    it("builds the path that goes into the database", () => {
      expect(storage.urlPathFor(ImageCategory.PIZZAS, "abc.png")).toBe("/uploads/pizzas/abc.png");
      expect(storage.urlPathFor(ImageCategory.USERS, "abc.webp")).toBe("/uploads/users/abc.webp");
    });
  });

  describe("remove", () => {
    const category = ImageCategory.PIZZAS;
    const dir = join(UPLOADS_DIR, category);

    afterEach(async () => {
      await rm(join(dir, "storage-spec.png"), { force: true });
    });

    it("deletes a file that is there", async () => {
      await mkdir(dir, { recursive: true });
      const absolutePath = join(dir, "storage-spec.png");
      await writeFile(absolutePath, "x");

      const removed = await storage.remove(storage.urlPathFor(category, "storage-spec.png"));

      expect(removed).toBe(true);
      expect(await exists(absolutePath)).toBe(false);
    });

    it("reports false instead of throwing when the file is already gone", async () => {
      await expect(storage.remove(storage.urlPathFor(category, "never-existed.png"))).resolves.toBe(
        false
      );
    });

    it("reports false when there is no path", async () => {
      await expect(storage.remove(null)).resolves.toBe(false);
    });

    it("refuses a path that climbs out of the uploads folder", async () => {
      const outside = join(tmpdir(), "pizzahot-escape-target.txt");
      await writeFile(outside, "must survive");

      const relativeToUploads = join("..", "..", "..").split("\\").join("/");
      const removed = await storage.remove(`${UPLOADS_URL_PREFIX}/${relativeToUploads}${outside}`);

      expect(removed).toBe(false);
      expect(await exists(outside)).toBe(true);
      await rm(outside, { force: true });
    });
  });
});
