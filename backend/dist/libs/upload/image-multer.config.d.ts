import type { ImageCategory } from "./upload.constant.ts";
export declare function imageMulterOptions(category: ImageCategory): {
    storage: import("multer").StorageEngine;
    limits: {
        fileSize: number;
    };
    fileFilter(_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void): void;
};
