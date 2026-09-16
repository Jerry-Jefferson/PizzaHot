import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity.ts";
import { UsersRepository } from "./users.repository.ts";
import { UsersService } from "./users.service.ts";
import { USERS_REPOSITORY } from "../../../libs/common/database/tokens.ts";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UsersRepository,
    { provide: USERS_REPOSITORY, useExisting: UsersRepository },
    UsersService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
