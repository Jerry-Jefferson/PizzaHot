import { Module } from "@nestjs/common";
import { LocalImageStorage } from "./image-storage.service.ts";
import { IMAGE_STORAGE } from "./upload.constant.ts";

@Module({
  providers: [LocalImageStorage, { provide: IMAGE_STORAGE, useExisting: LocalImageStorage }],
  exports: [IMAGE_STORAGE],
})
export class UploadModule {}
