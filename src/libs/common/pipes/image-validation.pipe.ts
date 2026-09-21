import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import { extname } from "path";
import { ALLOWED_EXTENSIONS } from "../constants/upload.constant.ts";

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File | undefined): Express.Multer.File {
    if (!file) {
      throw new BadRequestException("Image file is required");
    }

    const ext = extname(file.originalname).toLowerCase();
    const extAllowed = (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
    if (!extAllowed) {
      throw new BadRequestException(
        `Invalid file extension '${ext}'. Allowed extensions: ${ALLOWED_EXTENSIONS.join(", ")}`
      );
    }

    return file;
  }
}
