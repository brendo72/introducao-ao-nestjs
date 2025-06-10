import { Module } from '@nestjs/common';
import { userModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';




@Module({
  imports: [userModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
