import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, type JwtModuleOptions } from "@nestjs/jwt";
import { UsersModule } from "../users/users.module.ts";
import { NotificationsModule } from "../notifications/notifications.module.ts";
import { AuthController } from "./auth.controller.ts";
import { AuthService } from "./auth.service.ts";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.ts";
import { RolesGuard } from "./guards/roles.guard.ts";

@Module({
  imports: [
    UsersModule,
    NotificationsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ({
          secret: configService.getOrThrow<string>("JWT_SECRET"),
          signOptions: {
            expiresIn: configService.get<string>("JWT_EXPIRATION") ?? "1d",
          },
        }) as JwtModuleOptions,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
