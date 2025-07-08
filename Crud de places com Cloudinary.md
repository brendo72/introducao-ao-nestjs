## Implementando o CRUD de Places com Cloudinary

### Introdução
Neste guia, vamos implementar um CRUD (Create, Read, Update, Delete) para gerenciar "Places" utilizando o Cloudinary para o armazenamento de imagens. O Cloudinary é uma plataforma de gerenciamento de mídia que facilita o upload, armazenamento e entrega de imagens e vídeos.

### 1. Atualizando o banco de dados com a tabela de Places
Primeiro, precisamos garantir que temos uma tabela para armazenar os dados dos "Places". Vamos atualizar o arquivo `prisma/schema.prisma` para incluir a tabela `Place`:

```prisma
model Place {
  id       String    @id @default(uuid())
  name     String
  type    placeType
  phone    String
  latitude Float
  longitude Float
  images    Json[]
}

enum placeType {
  RESTAURANTE
  BAR
  HOTEL
}
```
 - 1.1 Após atualizar o modelo, execute os seguintes comandos para aplicar as alterações no banco de dados:
```bash
npx prisma migrate dev --name add_place_table
npx prisma generate
``` 

### 2. Criando o módulo Place
Vamos criar um módulo, controlador e serviço para gerenciar os "Places". Execute o seguinte comando para gerar o módulo:
```bash
nest generate module place
nest generate controller place
nest generate service place
```
- Após o módulo ser criado, vamos implementar as rotas e serviçoes necessários.

### 3. Crindo os DTOs para Place
Vamos criar os DTOs (Data Transfer Objects) para definir a estrutura dos dados que serão enviados nas requisições. 

 - Crie o arquivo `src/place/dto/create-place.dto.ts`:
```typescript
import {
IsEnum, IsNotEmpty, IsNumber, IsString, IsArray,
ArrayMaxSize, IsUrl, ArrayNotEmpty,
} from 'class-validator';
import { placeType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePlaceDto {
@ApiProperty({ example: 'Praça Central' })
@IsString()
@IsNotEmpty()
name: string;

@ApiProperty({ enum: placeType, example: 'RESTAURANTE' })
@IsEnum(placeType)
type: placeType;

@ApiProperty({ example: '(88) 99999-9999' })
@IsString()
phone: string;

@ApiProperty({ example: -3.7327 })
@IsNumber()
@Type(() => Number)
latitude: number;

@ApiProperty({ example: -38.5267 })
@IsNumber()
@Type(() => Number)
longitude: number;

}
```

 - Crie o arquivo `src/place/dto/update-place.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaceDto } from './create-place.dto';


export class UpdatePlaceDto extends PartialType(CreatePlaceDto) {}
```

### 4. Crie um tipo para as informações da imagem a serem recebidas do Cloudinary e armazenadas no banco de dados
 - Crie o arquivo `src/place/types/image-object.ts`:
```typescript
export type ImageObject = {
  url: string;
  public_id: string;
};
```

### 5. Configurando o Cloudinary
Primeiro, precisamos instalar o pacote do Cloudinary:
```bash
npm install cloudinary
```
Ao criar uma conta no [Cloudinary](https://cloudinary.com/), você poderá ver as credenciais necessárias (cloud_name, api_key, api_secret) para configurar o serviço.

 - Atualize o arquivo `.env` na raiz do projeto adicionando as seguintes variáveis de ambiente:
```plaintext
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

 - Em seguida, crie o arquivo `src/place/cloudinary.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { ImageObject } from './types/image-object';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class CloudinaryService {

  async uploadImage(buffer: Buffer): Promise<ImageObject> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'places' }, (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));
        resolve({ url: result.secure_url, public_id: result.public_id });
      });
      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(stream);
    });
  }

  async deleteImage(public_id: string): Promise<void> {
    await cloudinary.uploader.destroy(public_id);
  }

}
```
### 6. Implementando o serviço Place
Agora, vamos implementar o serviço `PlaceService` para gerenciar as operações CRUD. Abra o arquivo `src/place/place.service.ts` e implemente o seguinte código:
```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { Place } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImageObject } from './types/image-object';
import { CloudinaryService } from './cloudinary.service';


@Injectable()
export class PlaceService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) { }

  async findAll() {
    return this.prisma.place.findMany();
  }

  async create(data: { name: string, type: any, phone: string, latitude: number, longitude: number, images: ImageObject[] }) {
    return this.prisma.place.create({ data });
  }

  async update(id: string, data: Partial<Place>, newImages?: Buffer[]): Promise<Place> {
    const place = await this.prisma.place.findUnique({ where: { id } });
    if (!place) throw new BadRequestException('Local não encontrado');

    let images = place.images as ImageObject[];
    
    // Se forem enviadas novas imagens
    if (newImages && newImages.length > 0) {
      // Deletar imagens antigas
      await Promise.all(images.map(img => this.cloudinaryService.deleteImage(img.public_id)));
      // Upload das novas imagens
      images = await Promise.all(newImages.map(file => this.cloudinaryService.uploadImage(file)));
    }

    return this.prisma.place.update({
      where: { id },
      data: {
        ...data,
        ...(newImages ? { images: JSON.parse(JSON.stringify(images)) } : {}),
      },
    });
  }

  async delete(id: string): Promise<void> {
    const place = await this.prisma.place.findUnique({ where: { id } });
    if (!place) throw new BadRequestException('Local não encontrado');
    const images = place.images as ImageObject[];
    await Promise.all(images.map(img => this.cloudinaryService.deleteImage(img.public_id)));
    await this.prisma.place.delete({ where: { id } });
  }

}
```
### 7. Implementando o controlador Place
Agora, vamos implementar o controlador `PlaceController` para lidar com as rotas. Abra o arquivo `src/place/place.controller.ts` e implemente o seguinte código:
```typescript
import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Delete,
    Body,
    UploadedFiles,
    UseInterceptors,
    BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PlaceService } from './place.service';
import { CloudinaryService } from './cloudinary.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { File as MulterFile } from 'multer';
import { ApiBody, ApiConsumes, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UpdatePlaceDto } from './dto/update-place.dto';

@Controller('places')
export class PlaceController {
    constructor(
        private placeService: PlaceService,
        private cloudinaryService: CloudinaryService,
    ) { }

    @Get()
    findAll() {
        return this.placeService.findAll();
    }

    @Post()
    @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 3 }]))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Cadastrar novo local com imagens' })
    @ApiBody({
        description: 'Formulário com os dados do local + imagens',
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
    @ApiResponse({ status: 201, description: 'Place criado com sucesso' })
    async createPlace(
        @Body() data: CreatePlaceDto,
        @UploadedFiles() files: { images?: MulterFile[] },
    ) {
        if (!files.images || files.images.length === 0) {
            throw new BadRequestException('Pelo menos uma imagem deve ser enviada.');
        }

        const imageUrls = await Promise.all(
            files.images.map((file) => this.cloudinaryService.uploadImage(file.buffer)),
        );

        return this.placeService.create({
            ...data,
            images: imageUrls, // Aqui você injeta as URLs para salvar
        });
    }

    @Put(':id')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 3 }]))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Atualizar local com ou sem novas imagens' })
    @ApiBody({
        description: 'Formulário com dados opcionais do local a serem atualizados. Se enviar imagens, elas substituirão as anteriores.',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Novo nome da Praça' },
                type: { type: 'string', enum: ['RESTAURANTE', 'BAR', 'HOTEL'], example: 'RESTAURANTE' },
                phone: { type: 'string', example: '(85) 91234-5678' },
                latitude: { type: 'number', example: -3.7325 },
                longitude: { type: 'number', example: -38.5259 },
                images: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                    description: 'Novas imagens que substituirão as anteriores (máximo de 3)',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Place atualizado com sucesso' })
    async updatePlace(
        @Param('id') id: string,
        @Body() data: UpdatePlaceDto,
        @UploadedFiles() files: { images?: MulterFile[] },
    ) {
        const newImages = files.images?.map(file => file.buffer);
        return this.placeService.update(id, data, newImages);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deletar local e imagens no Cloudinary' })
     @ApiResponse({ status: 200, description: 'Place deletado com sucesso' })
    async deletePlace(@Param('id') id: string) {
        return this.placeService.delete(id);
    }
}
```
### 8. Atualizando o módulo Place
Agora, precisamos atualizar o módulo `PlaceModule` para incluir o `CloudinaryService` e o `PlaceService`. Abra o arquivo `src/place/place.module.ts` e implemente o seguinte código:
```typescript
import { Module } from '@nestjs/common';
import { PlaceController } from './place.controller';
import { PlaceService } from './place.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryService } from './cloudinary.service';

@Module({
    imports: [PrismaModule],
    controllers: [PlaceController],
    providers: [PlaceService, CloudinaryService],
    exports: [],
})
export class PlaceModule {}
```

