import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { UserModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PlaceModule } from './place/place.module';

@Module({
  imports: [UserModule, PrismaModule, AuthModule, PlaceModule],
=======
import { userModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';




@Module({
  imports: [userModule, PrismaModule],
>>>>>>> 3b3fb707fe826aa3a47985a4a3567715679fdbf2
  controllers: [],
  providers: [],
})
export class AppModule {}
