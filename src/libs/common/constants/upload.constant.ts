import { join } from "path";

export const UPLOADS_DIR = join(process.cwd(), "uploads");

export const PIZZA_IMAGES_DIR = join(UPLOADS_DIR, "pizzas");

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export const UPLOADS_URL_PREFIX = "/uploads";
