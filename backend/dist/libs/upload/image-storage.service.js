var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LocalImageStorage_1;
import { Injectable, Logger } from "@nestjs/common";
import { unlink } from "fs/promises";
import { resolve, sep } from "path";
import { UPLOADS_DIR, UPLOADS_URL_PREFIX } from "./upload.constant.js";
function isMissingFile(error) {
    return error?.code === "ENOENT";
}
let LocalImageStorage = LocalImageStorage_1 = class LocalImageStorage {
    logger = new Logger(LocalImageStorage_1.name);
    urlPathFor(category, filename) {
        return `${UPLOADS_URL_PREFIX}/${category}/${filename}`;
    }
    async remove(urlPath) {
        if (!urlPath)
            return false;
        const absolutePath = this.toAbsolutePath(urlPath);
        if (!absolutePath) {
            this.logger.error(`Refusing to delete "${urlPath}": it points outside the uploads folder`);
            return false;
        }
        try {
            await unlink(absolutePath);
            return true;
        }
        catch (error) {
            if (isMissingFile(error)) {
                this.logger.warn(`Nothing to delete at ${absolutePath}, it is already gone`);
                return false;
            }
            throw error;
        }
    }
    toAbsolutePath(urlPath) {
        const prefix = `${UPLOADS_URL_PREFIX}/`;
        const relative = urlPath.startsWith(prefix) ? urlPath.slice(prefix.length) : urlPath;
        const absolutePath = resolve(UPLOADS_DIR, relative);
        return absolutePath.startsWith(`${UPLOADS_DIR}${sep}`) ? absolutePath : null;
    }
};
LocalImageStorage = LocalImageStorage_1 = __decorate([
    Injectable()
], LocalImageStorage);
export { LocalImageStorage };
//# sourceMappingURL=image-storage.service.js.map