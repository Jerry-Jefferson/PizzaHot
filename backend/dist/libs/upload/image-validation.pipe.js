var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, BadRequestException } from "@nestjs/common";
import { extname } from "path";
import { ALLOWED_EXTENSIONS } from "./upload.constant.js";
let ImageValidationPipe = class ImageValidationPipe {
    transform(file) {
        if (!file) {
            throw new BadRequestException("Image file is required");
        }
        const ext = extname(file.originalname).toLowerCase();
        const extAllowed = ALLOWED_EXTENSIONS.includes(ext);
        if (!extAllowed) {
            throw new BadRequestException(`Invalid file extension '${ext}'. Allowed extensions: ${ALLOWED_EXTENSIONS.join(", ")}`);
        }
        return file;
    }
};
ImageValidationPipe = __decorate([
    Injectable()
], ImageValidationPipe);
export { ImageValidationPipe };
//# sourceMappingURL=image-validation.pipe.js.map