import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { extname } from "path";
import { mkdirSync } from "fs";
import { randomUUID } from "crypto";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, categoryDir } from "./upload.constant.ts";
import type { ImageCategory } from "./upload.constant.ts";

export function imageMulterOptions(category: ImageCategory) {
  const destination = categoryDir(category);

  return {
    storage: diskStorage({
      destination(_req, _file, cb) {
        mkdirSync(destination, { recursive: true });
        cb(null, destination);
      },
      filename(_req, file, cb) {
        cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
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
        return;
      }

      cb(
        new BadRequestException(
          `Invalid file type '${file.mimetype}'. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`
        ),
        false
      );
    },
  };
}
