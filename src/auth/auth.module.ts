import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [],
  providers: [AuthService, PrismaService],
  controllers: [AuthController]
})
export class AuthModule {}
