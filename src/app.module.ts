import { Module } from '@nestjs/common';
import { UserModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PlaceModule } from './place/place.module';

@Module({
  imports: [UserModule, PrismaModule, AuthModule, PlaceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
