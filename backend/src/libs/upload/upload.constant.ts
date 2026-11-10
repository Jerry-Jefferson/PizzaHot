import { join } from "path";

export const ImageCategory = {
  PIZZAS: "pizzas",
  USERS: "users",
} as const;

export type ImageCategory = (typeof ImageCategory)[keyof typeof ImageCategory];

export const IMAGE_CATEGORIES = [ImageCategory.PIZZAS, ImageCategory.USERS] as const;

export const UPLOADS_DIR = join(process.cwd(), "uploads");

export const UPLOADS_URL_PREFIX = "/uploads";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export function categoryDir(category: ImageCategory): string {
  return join(UPLOADS_DIR, category);
}

export const IMAGE_STORAGE = Symbol("IMAGE_STORAGE");
