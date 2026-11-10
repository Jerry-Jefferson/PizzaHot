import { Injectable, Logger } from "@nestjs/common";
import { unlink } from "fs/promises";
import { resolve, sep } from "path";
import { UPLOADS_DIR, UPLOADS_URL_PREFIX } from "./upload.constant.ts";
import type { ImageCategory } from "./upload.constant.ts";
import type { IImageStorage } from "./image-storage.types.ts";

function isMissingFile(error: unknown): boolean {
  return (error as NodeJS.ErrnoException | undefined)?.code === "ENOENT";
}

@Injectable()
export class LocalImageStorage implements IImageStorage {
  private readonly logger = new Logger(LocalImageStorage.name);

  urlPathFor(category: ImageCategory, filename: string): string {
    return `${UPLOADS_URL_PREFIX}/${category}/${filename}`;
  }

  async remove(urlPath: string | null): Promise<boolean> {
    if (!urlPath) return false;

    const absolutePath = this.toAbsolutePath(urlPath);
    if (!absolutePath) {
      this.logger.error(`Refusing to delete "${urlPath}": it points outside the uploads folder`);
      return false;
    }

    try {
      await unlink(absolutePath);
      return true;
    } catch (error) {
      if (isMissingFile(error)) {
        this.logger.warn(`Nothing to delete at ${absolutePath}, it is already gone`);
        return false;
      }

      throw error;
    }
  }

  private toAbsolutePath(urlPath: string): string | null {
    const prefix = `${UPLOADS_URL_PREFIX}/`;
    const relative = urlPath.startsWith(prefix) ? urlPath.slice(prefix.length) : urlPath;
    const absolutePath = resolve(UPLOADS_DIR, relative);

    return absolutePath.startsWith(`${UPLOADS_DIR}${sep}`) ? absolutePath : null;
  }
}
