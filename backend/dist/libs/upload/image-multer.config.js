import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { extname } from "path";
import { mkdirSync } from "fs";
import { randomUUID } from "crypto";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, categoryDir } from "./upload.constant.js";
export function imageMulterOptions(category) {
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
        fileFilter(_req, file, cb) {
            if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                cb(null, true);
                return;
            }
            cb(new BadRequestException(`Invalid file type '${file.mimetype}'. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`), false);
        },
    };
}
//# sourceMappingURL=image-multer.config.js.map