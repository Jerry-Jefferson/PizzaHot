import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { extname } from "path";
import { existsSync, mkdirSync } from "fs";
import { randomUUID } from "crypto";
import {
  PIZZA_IMAGES_DIR,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
} from "../../shared/constants/upload.constants.ts";

function ensureUploadDir(): void {
  if (!existsSync(PIZZA_IMAGES_DIR)) {
    mkdirSync(PIZZA_IMAGES_DIR, { recursive: true });
  }
}

export const pizzaImageMulterOptions = {
  storage: diskStorage({
    destination(_req, _file, cb) {
      ensureUploadDir();
      cb(null, PIZZA_IMAGES_DIR);
    },
    filename(_req, file, cb) {
      const ext = extname(file.originalname).toLowerCase();
      const uniqueName = `${randomUUID()}${ext}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter(
    _req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void
  ) {
    if ((ALLOWED_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          `Invalid file type '${file.mimetype}'. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`
        ),
        false
      );
    }
  },
};
