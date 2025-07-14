import { ApiProperty } from "@nestjs/swagger";
import { placeType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";


export class CreatePlaceDto {

    @ApiProperty({example: 'Bom de Prato'})
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({example: 'RESTAURANTE'})
    @IsEnum(placeType)
    type: placeType;

    @ApiProperty({example: '(88) 98804-5421'})
    @IsString()
    phone: string;

    @ApiProperty({example: -3.7327})
    @IsNumber()
    @Type(()=>Number)
    latitude: number;

    @ApiProperty({example: -38.5267})
    @IsNumber()
    @Type(()=>Number)
    longitude: number;
}