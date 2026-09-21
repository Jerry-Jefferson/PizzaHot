import type { ImageCategory } from "./upload.constant.ts";

export interface IImageStorage {
  urlPathFor(category: ImageCategory, filename: string): string;
  /** true when a file was actually deleted, false when there was nothing at that path. */
  remove(urlPath: string | null): Promise<boolean>;
}
