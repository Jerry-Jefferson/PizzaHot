import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsModule } from "../notifications/notifications.module.ts";
import { User } from "./entities/user.entity.ts";
import { UsersController } from "./users.controller.ts";
import { UsersRepository } from "./users.repository.ts";
import { UsersService } from "./users.service.ts";

@Module({
  imports: [TypeOrmModule.forFeature([User]), NotificationsModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
