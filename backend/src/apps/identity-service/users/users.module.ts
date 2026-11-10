import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity.ts";
import { UsersRepository } from "./users.repository.ts";
import { UsersService } from "./users.service.ts";
import { USERS_REPOSITORY } from "../../../libs/database/tokens.ts";
import { UploadModule } from "../../../libs/upload/index.ts";

@Module({
  imports: [TypeOrmModule.forFeature([User]), UploadModule],
  providers: [
    UsersRepository,
    { provide: USERS_REPOSITORY, useExisting: UsersRepository },
    UsersService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
