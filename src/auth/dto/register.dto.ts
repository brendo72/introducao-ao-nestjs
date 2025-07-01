
import {
    IsEmail, IsString, MinLength
} from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'
 
export class RegisterUserDto {

    @ApiProperty({
        description: "Nome do Usuário.",
        example: "Jonas Fortes"
    })
    @IsString( )
    name: string

    @ApiProperty({
        description: "Email do Usuário.",
        example: "jonas@gmail.com"
    })
    @IsEmail()
    email: string

    @ApiProperty({
        description: "Senha do Usuário.",
        example: "senha123"
    })
    @IsString()
    @MinLength(6)
    password: string

}