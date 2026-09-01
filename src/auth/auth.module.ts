import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, type JwtModuleOptions } from "@nestjs/jwt";
import { UsersModule } from "../users/users.module.ts";
import { AuthController } from "./auth.controller.ts";
import { AuthService } from "./auth.service.ts";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.ts";
import { RolesGuard } from "./guards/roles.guard.ts";
import { COOKIE_MAX_AGE_MS } from "./constants/auth.constants.ts";

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ({
          secret: configService.getOrThrow<string>("JWT_SECRET"),
          signOptions: {
            expiresIn: configService.get<string>("JWT_EXPIRATION") ?? COOKIE_MAX_AGE_MS,
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
