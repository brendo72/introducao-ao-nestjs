import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';
import { ImageObject } from './types/image-object';
import { Place } from '@prisma/client';

@Injectable()
export class PlaceService {

    constructor(
        private prisma: PrismaService,
        private cloudinaryService: CloudinaryService
    ) { }

    async findAll() {
        return this.prisma.place.findMany();
    }

    async create(data: {
        name: string,
        type: any,
        phone: string,
        latitude: number,
        longitude: number,
        images: ImageObject[]
    }) {
        return this.prisma.place.create({ data })
    }

    async update(
        id: string,
        data: Partial<Place>,
        newImages?: Buffer[]
    ): Promise<Place> {

        const place = await this.prisma.place.findUnique(
            { where: { id } }
        )
        if (!place) throw new BadRequestException('Local não encontrado!')

        // Se forem enviadas novas imagens:
        let images = place.images as ImageObject[];

        if (newImages && newImages.length > 0) {

            // Deletar as imagens existentes no Cloudinary
            await Promise.all(images.map(img =>
                this.cloudinaryService.deleteImage(img.public_id)
            ))

            // Upload de novas imagens a serem atualizadas
            images = await Promise.all(
                newImages.map(newImg =>
                    this.cloudinaryService.uploadImage(newImg)
                )
            )
        }

        return this.prisma.place.update({
            where: { id },
            data: {
                ...data,
                ...(newImages ?
                    { images: JSON.parse(JSON.stringify(images)) } : {})
            }
        })
    }

    async delete(id: string): Promise<void> {
        const place = await this.prisma.place.findUnique({ where: { id } })

        if (!place) throw new BadRequestException('Local não Encontrado!')
        const images = place.images as ImageObject[]
        
        // Apago as imagens do Cloudinary
        await Promise.all(images.map(
            (image)=>this.cloudinaryService.deleteImage(image.public_id)));
        
        // Apago o registro de place do banco de dados 
        await this.prisma.place.delete({where: {id}})

    }

}
