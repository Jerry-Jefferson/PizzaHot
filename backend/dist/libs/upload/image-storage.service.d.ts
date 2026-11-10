import type { ImageCategory } from "./upload.constant.ts";
import type { IImageStorage } from "./image-storage.types.ts";
export declare class LocalImageStorage implements IImageStorage {
    private readonly logger;
    urlPathFor(category: ImageCategory, filename: string): string;
    remove(urlPath: string | null): Promise<boolean>;
    private toAbsolutePath;
}
