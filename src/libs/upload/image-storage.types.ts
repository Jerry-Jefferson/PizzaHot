import type { ImageCategory } from "./upload.constant.ts";

export interface IImageStorage {
  urlPathFor(category: ImageCategory, filename: string): string;
  remove(urlPath: string | null): Promise<boolean>;
}
