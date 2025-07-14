import { Module } from '@nestjs/common';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { CloudinaryService } from './cloudinary.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlaceController],
  providers: [PlaceService, CloudinaryService],
})
export class PlaceModule {}
