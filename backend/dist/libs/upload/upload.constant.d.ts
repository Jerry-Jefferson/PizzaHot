export declare const ImageCategory: {
    readonly PIZZAS: "pizzas";
    readonly USERS: "users";
};
export type ImageCategory = (typeof ImageCategory)[keyof typeof ImageCategory];
export declare const IMAGE_CATEGORIES: readonly ["pizzas", "users"];
export declare const UPLOADS_DIR: string;
export declare const UPLOADS_URL_PREFIX = "/uploads";
export declare const MAX_FILE_SIZE: number;
export declare const ALLOWED_MIME_TYPES: readonly ["image/jpeg", "image/png", "image/webp"];
export declare const ALLOWED_EXTENSIONS: readonly [".jpg", ".jpeg", ".png", ".webp"];
export declare function categoryDir(category: ImageCategory): string;
export declare const IMAGE_STORAGE: unique symbol;
