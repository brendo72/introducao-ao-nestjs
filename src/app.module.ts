import { Module } from '@nestjs/common';
import { userModule } from './users/users.module';


@Module({
  imports: [userModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
