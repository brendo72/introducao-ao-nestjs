import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Put,
  Post,
  Get,
  UploadedFiles,
  UseInterceptors,
  Param,
  Query,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { File as MulterFile } from 'multer';
import { CloudinaryService } from './cloudinary.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UpdatePlaceDto } from './dto/update-place.dto';

@Controller('place')
export class PlaceController {
  constructor(
    private readonly placeService: PlaceService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll() {
    return this.placeService.findAll();
  }

  @Get('pagineted')
  @ApiOperation({summary: "Listar locais paginados"})
  @ApiQuery({name: 'page', required: false, type: Number, example: 1})
  @ApiQuery({name: 'limit', required: false, type: Number, example: 10})
  async findPaginated(@Query('page') page = 1, @Query('limit') limit = 10) {
    const parsePage = Math.max(1, Number(page))
    const parseLimit = Math.min(50, Math.max(1, Number(limit))) // Limmite de segurança
    return this.placeService.findPaginated(parsePage, parseLimit)
  }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 3 }]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cadastrar um novo local' })
  @ApiResponse({ status: 201, description: 'Place criado com sucesso!' })
  @ApiBody({
    description: 'Formulário criação de Local',
    schema: {
      type: 'object',
      required: ['name', 'type', 'phone', 'latitude', 'longitude', 'images'],
      properties: {
        name: { type: 'string', example: 'Praça Central' },
        type: { type: 'string', enum: ['RESTAURANTE', 'BAR', 'HOTEL'] },
        phone: { type: 'string', example: '(88) 99999-9999' },
        latitude: { type: 'number', example: -3.7327 },
        longitude: { type: 'number', example: -38.5267 },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Máximo de 3 imagens',
        },
      },
    },
  })
  async createPlace(
    @Body() data: CreatePlaceDto,
    @UploadedFiles() files: { images?: MulterFile[] },
  ) {
    if (!files.images || files.images.length === 0) {
      throw new BadRequestException('Pelo menos uma imagem deve ser enviada');
    }

    const imagesUrls = await Promise.all(
      files.images.map((file) =>
        this.cloudinaryService.uploadImage(file.buffer),
      ),
    );

    return this.placeService.create({
      ...data,
      images: imagesUrls,
    });
  }

  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 3 }]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Atualizar um Local' })
  @ApiResponse({ status: 200, description: 'Place atualizado com sucesso!' })
  @ApiBody({
    description: 'Formulário com dados opcionais para atualizar um local',
    schema: {
      type: 'object',
      required: ['name', 'type', 'phone', 'latitude', 'longitude', 'images'],
      properties: {
        name: { type: 'string', example: 'Praça Central' },
        type: { type: 'string', enum: ['RESTAURANTE', 'BAR', 'HOTEL'] },
        phone: { type: 'string', example: '(88) 99999-9999' },
        latitude: { type: 'number', example: -3.7327 },
        longitude: { type: 'number', example: -38.5267 },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description:
            'As novas imagens substituem as anteriores (Máximo 3 imagens)',
        },
      },
    },
  })
  async updatePlace(
    @Param('id') id: string,
    @Body() data: UpdatePlaceDto,
    @UploadedFiles() files: { images?: MulterFile[] },
  ) {
    const newImages = files.images?.map((img) => img.buffer);

    return this.placeService.update(id, data, newImages);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um local e suas imagens no Cloudinary' })
  @ApiResponse({ status: 200, description: 'Local deletado com sucesso!' })
  async deletePlace(@Param('id') id: string) {
    return this.placeService.delete(id);
  }
}
