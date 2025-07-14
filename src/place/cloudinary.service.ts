
// Baixar o pacote do Cloudinary
// npm i cloudinary

import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary'
import { ImageObject } from './types/image-object';
import { Readable } from 'stream';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


@Injectable()
export class CloudinaryService {


    async uploadImage(buffer: Buffer): Promise<ImageObject> {

        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'places' }, (error, result) => {
                    if (error || !result) return reject(error || new Error("Upload Falhou!"))
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id
                    })
                }
            )

            const readable = new Readable();
            readable.push(buffer);
            readable.push(null);
            readable.pipe(stream);
        })
    }



    async deleteImage(public_id: string): Promise<void> {
        await cloudinary.uploader.destroy(public_id)
    }


}
